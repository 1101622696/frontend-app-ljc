import axios from 'axios'
import { obtenerPendientes, marcarEnviado, leerArchivosOffline } from './offlineDB'
import { useStoreUsuarios } from '../stores/usuarios'

export async function sincronizarPendientes() {
  const pendientes = await obtenerPendientes()
  if (!pendientes.length) return

  const useUsuario = useStoreUsuarios()

  for (const item of pendientes) {
    try {
      const payload = JSON.parse(item.payload)
      const { _archivos, ...camposFormulario } = payload

      const formData = new FormData()
      Object.entries(camposFormulario).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') formData.append(k, v)
      })

      if (_archivos?.length) {
        const blobs = await leerArchivosOffline(_archivos)
        blobs.forEach(({ blob, nombre }) => formData.append('archivos', blob, nombre))
      }

      if (item.tipo === 'preoperacional') {
        await axios.post('api/preoperacionales/crear', formData, {
          headers: { 'x-token': useUsuario.token },
        })
      }

      await marcarEnviado(item.id)
      console.log(`✅ Sincronizado: ${item.tipo} #${item.id}`)
    } catch (e) {
      console.warn(`⚠️ No se pudo sincronizar #${item.id}`, e)
    }
  }
}