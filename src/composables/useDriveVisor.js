import { ref } from 'vue'
import axios from 'axios'
import { useStoreUsuarios } from '../stores/usuarios'

// Extrae fileId de links tipo: /file/d/XXXX/view
const extraerFileId = (link) => {
  const match = link?.match(/\/d\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

// Extrae folderId de links tipo: /folders/XXXX
// const extraerFolderId = (link) => {
//   const match = link?.match(/folders\/([a-zA-Z0-9_-]+)/)
//   return match ? match[1] : null
// }

const extraerFolderId = (link) => {
  const match = link?.match(/folders\/([a-zA-Z0-9_-]+)/)
  console.log('[extraerFolderId]', link, '->', match?.[1])
  return match ? match[1] : null
}

export function useDriveVisor() {
  const dialogAbierto = ref(false)
  const archivos = ref([])
  const cargando = ref(false)
  const titulo = ref('')
  const error = ref(null)

  const abrirVisor = async (link, tituloVisor = 'Archivos') => {
      console.log('[DriveVisor] link recibido:', link) 
    if (!link) return

    titulo.value = tituloVisor
    archivos.value = []
    error.value = null
    cargando.value = true
    dialogAbierto.value = true

    try {
      const useUsuario = useStoreUsuarios()
      const headers = { 'x-token': useUsuario.token }

      const fileId = extraerFileId(link)
      const folderId = extraerFolderId(link)
//   console.log('[DriveVisor] fileId:', fileId, '| folderId:', folderId)

      const params = fileId ? { fileId } : { folderId }
//   console.log('[DriveVisor] params enviados:', params)

      const response = await axios.get('api/drive/archivos', { params, headers })
// console.log('[DriveVisor] archivos recibidos:', response.data)

      archivos.value = response.data
    } catch (e) {
      console.error('Error al cargar archivos Drive:', e)
      error.value = 'No se pudieron cargar los archivos'
    } finally {
      cargando.value = false
    }
  }

  const cerrarVisor = () => {
    dialogAbierto.value = false
    archivos.value = []
    error.value = null
  }

  // Retorna la URL para mostrar/descargar un archivo a través del backend
//   const urlArchivo = (fileId) => `api/drive/archivo/${fileId}`
// const urlArchivo = (fileId) => `/api/drive/archivo/${fileId}`
  
const urlArchivo = (fileId) => `http://localhost:4000/api/drive/archivo/${fileId}`
// Detecta si el mimeType es imagen
  const esImagen = (mimeType) => mimeType?.startsWith('image/')

  // Detecta si es PDF
  const esPdf = (mimeType) => mimeType === 'application/pdf'

  return {
    dialogAbierto,
    archivos,
    cargando,
    titulo,
    error,
    abrirVisor,
    cerrarVisor,
    urlArchivo,
    esImagen,
    esPdf,
  }
}