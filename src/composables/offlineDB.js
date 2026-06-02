import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite'
import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'

const sqlite = new SQLiteConnection(CapacitorSQLite)
let db = null

export async function initDB() {
  if (!Capacitor.isNativePlatform()) return // solo en dispositivo real
  db = await sqlite.createConnection('flota_offline', false, 'no-encryption', 1, false)
  await db.open()
  await db.execute(`
    CREATE TABLE IF NOT EXISTS pendientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL,
      payload TEXT NOT NULL,
      estado TEXT DEFAULT 'pendiente',
      creado_en TEXT DEFAULT (datetime('now'))
    )
  `)
}

export async function guardarArchivosOffline(archivos) {
  const rutas = []

  for (const file of archivos) {
    const base64 = await fileABase64(file)
    const nombre = `offline_${Date.now()}_${file.name}`

    if (esNativo) {
      await Filesystem.writeFile({
        path: nombre,
        data: base64,
        directory: Directory.Data,
      })
      rutas.push({ nombre, tipo: file.type, esNativo: true })
    } else {
      // En navegador, guardar el base64 directo en localStorage
      localStorage.setItem(`archivo_${nombre}`, base64)
      rutas.push({ nombre, tipo: file.type, esNativo: false })
    }
  }

  return rutas
}

export async function leerArchivosOffline(rutas) {
  const blobs = []

  for (const { nombre, tipo, esNativo } of rutas) {
    let base64

    if (esNativo) {
      const resultado = await Filesystem.readFile({
        path: nombre,
        directory: Directory.Data,
      })
      base64 = resultado.data
    } else {
      base64 = localStorage.getItem(`archivo_${nombre}`)
    }

    if (base64) {
      const blob = base64ABlob(base64, tipo)
      blobs.push({ blob, nombre: nombre.replace(/^offline_\d+_/, ''), tipo })
    }
  }

  return blobs
}

function fileABase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
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

const esNativo = Capacitor.isNativePlatform()

export async function guardarPendiente(tipo, payload) {
  if (esNativo) {
    await db.run(`INSERT INTO pendientes (tipo, payload) VALUES (?, ?)`, [tipo, JSON.stringify(payload)])
  } else {
    const pendientes = JSON.parse(localStorage.getItem('pendientes') || '[]')
    pendientes.push({ id: Date.now(), tipo, payload: JSON.stringify(payload), estado: 'pendiente' })
    localStorage.setItem('pendientes', JSON.stringify(pendientes))
  }
}

export async function obtenerPendientes() {
  if (esNativo) {
    const res = await db.query(`SELECT * FROM pendientes WHERE estado = 'pendiente'`)
    return res.values || []
  } else {
    const pendientes = JSON.parse(localStorage.getItem('pendientes') || '[]')
    return pendientes.filter(p => p.estado === 'pendiente')
  }
}

export async function marcarEnviado(id) {
  if (esNativo) {
    await db.run(`UPDATE pendientes SET estado = 'enviado' WHERE id = ?`, [id])
  } else {
    const pendientes = JSON.parse(localStorage.getItem('pendientes') || '[]')
    const actualizados = pendientes.map(p => p.id === id ? { ...p, estado: 'enviado' } : p)
    localStorage.setItem('pendientes', JSON.stringify(actualizados))
  }
}


// se supone con este codigo funciona en dispositivos, pero pondré el de abajo para probar en navegador mientras desarrollo
// export async function guardarPendiente(tipo, payload) {
//   if (!db) return
//   await db.run(
//     `INSERT INTO pendientes (tipo, payload) VALUES (?, ?)`,
//     [tipo, JSON.stringify(payload)]
//   )
// }

// export async function obtenerPendientes() {
//   if (!db) return []
//   const res = await db.query(`SELECT * FROM pendientes WHERE estado = 'pendiente'`)
//   return res.values || []
// }

// export async function marcarEnviado(id) {
//   if (!db) return
//   await db.run(`UPDATE pendientes SET estado = 'enviado' WHERE id = ?`, [id])
// }
