import { initDB } from '../composables/offlineDB'
import { sincronizarPendientes } from '../composables/sincronizador'

export default async () => {
  await initDB()
  window.addEventListener('online', () => {
    console.log('🌐 Conexión recuperada — sincronizando...')
    sincronizarPendientes()
  })
}