import { ref } from 'vue'
import axios from 'axios'
import { Notify } from 'quasar'
import { useStoreUsuarios } from '../stores/usuarios'
import { abrirConOtraApp } from '../utils/archivosNativos'

// ─────────────────────────────────────────────────────────────
// Estado COMPARTIDO (fuera de la función): hay un solo visor montado en MainLayout
// y cualquier página lo abre con:
//   const { abrirArchivos } = useVisorArchivos()
//   abrirArchivos(link, 'Título', { prefijo: 'C-12 - ' })
//
// Los archivos se piden al backend CON el token (encabezado x-token) y se muestran como blob.
// El backend solo entrega lo que el usuario puede ver.
// ─────────────────────────────────────────────────────────────

const abierto = ref(false)
const titulo = ref('')
const archivos = ref([])
const cargando = ref(false)
const error = ref('')
const indice = ref(-1) // -1 = lista de archivos; >= 0 = viendo ese archivo
let ultimaApertura = null
let versionLista = 0 // si abren otro registro antes de que llegue la lista anterior, esa se descarta

// Caché de archivos descargados (blob + objectURL). Máximo 20; se liberan los más viejos.
const MAX_CACHE = 20
const cacheArchivos = new Map()

const headers = () => ({ 'x-token': useStoreUsuarios().token })
// sinSpinner: el visor tiene su propio indicador; el spinner global de main.js quedaría encima
const opcionesPeticion = (extra = {}) => ({ headers: headers(), sinSpinner: true, ...extra })

/**
 * Acepta lo que guardan las hojas:
 *  - https://drive.google.com/drive/folders/ID   (carpeta del registro)
 *  - https://drive.google.com/file/d/ID/view     (un archivo)
 *  - ...?id=ID
 *  - ID crudo → el backend detecta si es carpeta o archivo
 */
export const resolverReferencia = (referencia) => {
  const texto = String(referencia ?? '').trim()
  if (!texto) return null

  const carpeta = texto.match(/folders\/([a-zA-Z0-9_-]+)/)
  if (carpeta) return { folderId: carpeta[1] }

  const archivo = texto.match(/\/d\/([a-zA-Z0-9_-]+)/) || texto.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (archivo) return { fileId: archivo[1] }

  if (/^[a-zA-Z0-9_-]{10,}$/.test(texto)) return { id: texto }

  return null
}

export const tipoArchivo = (mimeType = '') => {
  if (mimeType.startsWith('image/')) return 'imagen'
  if (mimeType === 'application/pdf') return 'pdf'
  return 'otro'
}

/** Descarga el archivo con el token y devuelve { blob, url }. Usa caché */
export async function obtenerArchivo(fileId) {
  if (cacheArchivos.has(fileId)) {
    // Lo mueve al final para que sea el último en liberarse
    const entrada = cacheArchivos.get(fileId)
    cacheArchivos.delete(fileId)
    cacheArchivos.set(fileId, entrada)
    return entrada
  }

  const { data } = await axios.get(`api/drive/archivo/${encodeURIComponent(fileId)}`, opcionesPeticion({ responseType: 'blob' }))

  const entrada = { blob: data, url: URL.createObjectURL(data) }
  cacheArchivos.set(fileId, entrada)

  if (cacheArchivos.size > MAX_CACHE) {
    const [clave, vieja] = cacheArchivos.entries().next().value
    URL.revokeObjectURL(vieja.url)
    cacheArchivos.delete(clave)
  }

  return entrada
}

/** Llamar al cerrar sesión: lo que vio un usuario no debe quedar para el siguiente */
export function limpiarCacheArchivos() {
  cacheArchivos.forEach((entrada) => URL.revokeObjectURL(entrada.url))
  cacheArchivos.clear()
  archivos.value = []
  abierto.value = false
  indice.value = -1
}

function mensajeDeCarga(e) {
  const estado = e.response?.status
  if (estado === 404) return 'No se encontraron los archivos. Puede que se hayan borrado de Drive o que no tenga permiso para verlos.'
  if (!e.response) return 'Sin conexión. Revise la señal e intente de nuevo.'
  return 'No se pudieron cargar los archivos. Intente de nuevo.'
}

export function useVisorArchivos() {
  /**
   * @param referencia  link o id guardado en la hoja
   * @param tituloVisor título de la barra
   * @param opciones.prefijo  muestra solo los archivos cuyo nombre empieza así (ej. combustible: la
   *                          carpeta es de la placa y cada factura empieza con 'C-12 - ')
   */
  async function abrirArchivos(referencia, tituloVisor = 'Archivos adjuntos', opciones = {}) {
    const params = resolverReferencia(referencia)

    if (!params) {
      Notify.create({ type: 'warning', message: 'Este registro no tiene archivos adjuntos', position: 'bottom' })
      return
    }

    ultimaApertura = { referencia, tituloVisor, opciones }
    const version = ++versionLista
    titulo.value = tituloVisor
    archivos.value = []
    error.value = ''
    indice.value = -1
    cargando.value = true
    abierto.value = true

    try {
      const { data } = await axios.get('api/drive/archivos', opcionesPeticion({ params }))
      if (version !== versionLista) return
      let lista = Array.isArray(data) ? data : data?.archivos || []

      // Si con el prefijo no queda nada (archivos subidos antes con otro nombre), se muestran todos
      const prefijo = String(opciones.prefijo || '').toLowerCase()
      if (prefijo) {
        const filtrados = lista.filter((a) => String(a.name || '').toLowerCase().startsWith(prefijo))
        if (filtrados.length) lista = filtrados
      }

      archivos.value = lista
      // Con un solo archivo, se abre directo sin pasar por la lista
      if (lista.length === 1) indice.value = 0
    } catch (e) {
      if (version === versionLista) error.value = mensajeDeCarga(e)
    } finally {
      if (version === versionLista) cargando.value = false
    }
  }

  function reintentar() {
    if (ultimaApertura) abrirArchivos(ultimaApertura.referencia, ultimaApertura.tituloVisor, ultimaApertura.opciones)
  }

  function cerrar() {
    versionLista++
    cargando.value = false
    abierto.value = false
    indice.value = -1
  }

  const verArchivo = (posicion) => {
    indice.value = posicion
  }

  const volverALista = () => {
    indice.value = -1
  }

  async function abrirExterno(archivo) {
    if (!archivo) return
    let blob
    try {
      ;({ blob } = await obtenerArchivo(archivo.id))
    } catch (e) {
      Notify.create({ type: 'negative', message: mensajeDeCarga(e), position: 'bottom' })
      return
    }
    try {
      await abrirConOtraApp(blob, archivo.name, archivo.mimeType)
    } catch {
      Notify.create({
        type: 'negative',
        message: 'No hay una aplicación instalada que pueda abrir este archivo',
        position: 'bottom',
      })
    }
  }

  return {
    abierto,
    titulo,
    archivos,
    cargando,
    error,
    indice,
    abrirArchivos,
    reintentar,
    cerrar,
    verArchivo,
    volverALista,
    abrirExterno,
    obtenerArchivo,
  }
}
