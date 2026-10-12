import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite'
import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'

// ─────────────────────────────────────────────────────────────
// Registros guardados en el celular cuando no hay señal.
//
//   En el celular (app):  SQLite (tabla pendientes) + archivos en Filesystem.
//   En el navegador:      pendientes en localStorage (JSON pequeño) + archivos en IndexedDB
//                         (antes iban en base64 a localStorage: con 2 o 3 fotos se llenaba el cupo
//                          de ~5 MB y el guardado fallaba).
//
// Estados de un pendiente:
//   'pendiente' → se envía solo cuando vuelva la señal.
//   'error'     → el backend lo RECHAZÓ (odómetro menor, viaje ya con preoperacional...). No se reintenta:
//                 el usuario lo corrige o lo descarta desde la pantalla.
// Al enviarse bien se BORRA (fila y archivos), para no llenar el celular.
// ─────────────────────────────────────────────────────────────

const esNativo = Capacitor.isNativePlatform()
const BASE = 'flota_offline'
const CLAVE_WEB = 'pendientes'

let db = null
let abriendo = null

/** Abre la base local (una sola vez aunque la llamen varios a la vez) */
export function initDB() {
  if (!esNativo) return Promise.resolve()
  if (!abriendo) {
    abriendo = abrirSQLite().catch((error) => {
      abriendo = null // que se pueda volver a intentar
      throw error
    })
  }
  return abriendo
}

async function abrirSQLite() {
  const sqlite = new SQLiteConnection(CapacitorSQLite)
  const existe = (await sqlite.isConnection(BASE, false)).result
  db = existe ? await sqlite.retrieveConnection(BASE, false) : await sqlite.createConnection(BASE, false, 'no-encryption', 1, false)
  if (!(await db.isDBOpen()).result) await db.open()
  await db.execute(`
    CREATE TABLE IF NOT EXISTS pendientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL,
      payload TEXT NOT NULL,
      estado TEXT DEFAULT 'pendiente',
      creado_en TEXT DEFAULT (datetime('now'))
    )
  `)
  // Celulares con la tabla vieja: falta la columna del error (si ya existe, SQLite falla y se ignora)
  try {
    await db.execute(`ALTER TABLE pendientes ADD COLUMN error TEXT`)
  } catch {
    /* ya existe */
  }
}

async function base() {
  await initDB()
  if (!db) throw new Error('No se pudo abrir la base de datos del celular')
  return db
}

// ── Pendientes en el navegador ──

function leerWeb() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_WEB) || '[]')
  } catch {
    return []
  }
}

function escribirWeb(lista) {
  localStorage.setItem(CLAVE_WEB, JSON.stringify(lista))
}

/** Convierte la fila guardada en { id, tipo, estado, error, payload: objeto } */
const aObjeto = (fila) => ({
  id: fila.id,
  tipo: fila.tipo,
  estado: fila.estado || 'pendiente',
  error: fila.error || '',
  payload: typeof fila.payload === 'string' ? JSON.parse(fila.payload) : fila.payload,
})

// ── Pendientes ──

/** Guarda un registro para enviarlo después. Devuelve el id */
export async function guardarPendiente(tipo, payload) {
  if (esNativo) {
    const conexion = await base()
    const r = await conexion.run(`INSERT INTO pendientes (tipo, payload, estado) VALUES (?, ?, 'pendiente')`, [
      tipo,
      JSON.stringify(payload),
    ])
    return r?.changes?.lastId
  }
  const lista = leerWeb()
  const id = Date.now()
  lista.push({ id, tipo, payload: JSON.stringify(payload), estado: 'pendiente', error: '' })
  escribirWeb(lista)
  return id
}

/** Solo los que se deben enviar (los rechazados NO: esperan a que el usuario los corrija) */
export async function obtenerPendientes() {
  if (esNativo) {
    const conexion = await base()
    const res = await conexion.query(`SELECT * FROM pendientes WHERE estado = 'pendiente' ORDER BY id`)
    return (res.values || []).map(aObjeto)
  }
  return leerWeb()
    .filter((p) => p.estado === 'pendiente')
    .map(aObjeto)
}

/** Para mostrar en pantalla: por enviar y rechazados */
export async function listarPendientes(tipo) {
  let filas
  if (esNativo) {
    const conexion = await base()
    const res = await conexion.query(`SELECT * FROM pendientes WHERE estado IN ('pendiente', 'error') ORDER BY id DESC`)
    filas = res.values || []
  } else {
    filas = leerWeb()
      .filter((p) => ['pendiente', 'error'].includes(p.estado))
      .reverse()
  }
  return filas.map(aObjeto).filter((p) => !tipo || p.tipo === tipo)
}

async function buscarPendiente(id) {
  if (esNativo) {
    const conexion = await base()
    const res = await conexion.query(`SELECT * FROM pendientes WHERE id = ?`, [id])
    return res.values?.[0] ? aObjeto(res.values[0]) : null
  }
  const fila = leerWeb().find((p) => p.id === id)
  return fila ? aObjeto(fila) : null
}

/** El backend lo rechazó: se guarda el mensaje y no se vuelve a intentar solo */
export async function marcarError(id, mensaje) {
  if (esNativo) {
    const conexion = await base()
    await conexion.run(`UPDATE pendientes SET estado = 'error', error = ? WHERE id = ?`, [mensaje, id])
    return
  }
  escribirWeb(leerWeb().map((p) => (p.id === id ? { ...p, estado: 'error', error: mensaje } : p)))
}

/** El usuario lo corrigió: nuevos datos y otra vez en cola */
export async function actualizarPendiente(id, payload) {
  if (esNativo) {
    const conexion = await base()
    await conexion.run(`UPDATE pendientes SET payload = ?, estado = 'pendiente', error = NULL WHERE id = ?`, [
      JSON.stringify(payload),
      id,
    ])
    return
  }
  escribirWeb(leerWeb().map((p) => (p.id === id ? { ...p, payload: JSON.stringify(payload), estado: 'pendiente', error: '' } : p)))
}

/** Borra el pendiente y sus archivos (al enviarse bien o cuando el usuario lo descarta) */
export async function eliminarPendiente(id) {
  const item = await buscarPendiente(id)
  if (item?.payload?._archivos?.length) await borrarArchivosOffline(item.payload._archivos)
  if (esNativo) {
    const conexion = await base()
    await conexion.run(`DELETE FROM pendientes WHERE id = ?`, [id])
    return
  }
  escribirWeb(leerWeb().filter((p) => p.id !== id))
}

/** Compatibilidad con el nombre anterior: enviado = ya no hace falta guardarlo */
export const marcarEnviado = eliminarPendiente

// ── Archivos ──

export async function guardarArchivosOffline(archivos = []) {
  const rutas = []
  for (const file of archivos) {
    const nombre = `offline_${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${file.name}`
    if (esNativo) {
      await Filesystem.writeFile({ path: nombre, data: await fileABase64(file), directory: Directory.Data })
      rutas.push({ nombre, tipo: file.type, esNativo: true })
    } else {
      await idb('readwrite', (almacen) => almacen.put(file, nombre))
      rutas.push({ nombre, tipo: file.type, esNativo: false, idb: true })
    }
  }
  return rutas
}

export async function leerArchivosOffline(rutas = []) {
  const blobs = []
  for (const { nombre, tipo, esNativo: nativo, idb: enIdb } of rutas) {
    let blob = null
    if (nativo) {
      const resultado = await Filesystem.readFile({ path: nombre, directory: Directory.Data })
      blob = resultado.data instanceof Blob ? resultado.data : base64ABlob(resultado.data, tipo)
    } else if (enIdb) {
      blob = await idb('readonly', (almacen) => almacen.get(nombre))
    } else {
      // Guardados con la versión anterior (base64 en localStorage)
      const base64 = localStorage.getItem(`archivo_${nombre}`)
      if (base64) blob = base64ABlob(base64, tipo)
    }
    if (blob) blobs.push({ blob, nombre: nombreOriginal(nombre), tipo })
  }
  return blobs
}

export async function borrarArchivosOffline(rutas = []) {
  for (const { nombre, esNativo: nativo, idb: enIdb } of rutas) {
    try {
      if (nativo) await Filesystem.deleteFile({ path: nombre, directory: Directory.Data })
      else if (enIdb) await idb('readwrite', (almacen) => almacen.delete(nombre))
      else localStorage.removeItem(`archivo_${nombre}`)
    } catch {
      /* si ya no existe no importa */
    }
  }
}

const nombreOriginal = (nombre) => nombre.replace(/^offline_\d+_(?:[a-z0-9]{1,5}_)?/, '')

function fileABase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function base64ABlob(base64, tipo) {
  const bytes = atob(base64)
  const buffer = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) buffer[i] = bytes.charCodeAt(i)
  return new Blob([buffer], { type: tipo })
}

// IndexedDB mínimo para los archivos en el navegador
function idb(modo, operacion) {
  return new Promise((resolve, reject) => {
    const apertura = indexedDB.open(BASE, 1)
    apertura.onupgradeneeded = () => apertura.result.createObjectStore('archivos')
    apertura.onerror = () => reject(apertura.error)
    apertura.onsuccess = () => {
      const conexion = apertura.result
      const tx = conexion.transaction('archivos', modo)
      const peticion = operacion(tx.objectStore('archivos'))
      tx.oncomplete = () => {
        conexion.close()
        resolve(peticion?.result)
      }
      tx.onerror = tx.onabort = () => {
        conexion.close()
        reject(tx.error)
      }
    }
  })
}

// ── Copia local de datos de consulta (para llenar formularios sin señal) ──

export function guardarCache(clave, datos) {
  try {
    localStorage.setItem(`cache_${clave}`, JSON.stringify(datos))
  } catch {
    /* sin espacio o almacenamiento bloqueado: no es grave */
  }
}

export function leerCache(clave) {
  try {
    return JSON.parse(localStorage.getItem(`cache_${clave}`) || 'null')
  } catch {
    return null
  }
}
