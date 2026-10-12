import { initDB } from '../composables/offlineDB'
import { sincronizarPendientes } from '../composables/sincronizador'

// Envía lo guardado sin señal:
//  - cuando vuelve la conexión,
//  - al abrir la app (si se cerró sin señal y se abre ya con señal, 'online' nunca se dispara),
//  - al volver a la app desde otra (el celular la deja en segundo plano).
export default async () => {
  try {
    await initDB()
  } catch (error) {
    // Antes un fallo aquí tumbaba el arranque de toda la app
    console.warn('No se pudo abrir la base local del celular', error)
  }

  window.addEventListener('online', () => sincronizarPendientes())

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') sincronizarPendientes()
  })

  // Espera a que la sesión guardada esté cargada
  setTimeout(() => sincronizarPendientes(), 4000)
}
