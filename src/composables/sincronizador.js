import axios from 'axios'
import { Notify } from 'quasar'
import { obtenerPendientes, eliminarPendiente, marcarError, leerArchivosOffline } from './offlineDB'
import { useStoreUsuarios } from '../stores/usuarios'
import { mensajeDeError } from '../utils/formato'

// Envía lo que se guardó en el celular sin señal.
//  - Si el backend lo RECHAZA (4xx con mensaje): se marca con el error y no se reintenta; el usuario lo corrige.
//  - Si no hay señal o el servidor falla (5xx): queda pendiente para el próximo intento.
// Avisa con Notify y dispara el evento EVENTO_PENDIENTES para que las pantallas abiertas se refresquen.

export const EVENTO_PENDIENTES = 'pendientes-actualizados'

const DESTINOS = {
  preoperacional: { ruta: 'api/preoperacionales/crear', nombre: 'preoperacional' },
}

const TIEMPO_MAXIMO = 120000 // con fotos y mala señal puede demorar; sin límite se quedaría colgado
const enviando = new Set() // ids en envío: evita mandar dos veces el mismo (evento 'online' + botón)
let sincronizacion = null

const describir = (item) => {
  const nombre = DESTINOS[item.tipo]?.nombre || item.tipo
  return item.payload?.codigo_viaje ? `${nombre} del viaje ${item.payload.codigo_viaje}` : nombre
}

const avisarCambio = () => window.dispatchEvent(new CustomEvent(EVENTO_PENDIENTES))

/**
 * Envía UN pendiente. Si sale bien lo borra del celular y devuelve la respuesta del backend.
 * Si falla lanza Error con:  rechazado = true (el backend no lo acepta, ya quedó marcado con el error)
 *                            estado = código HTTP (o undefined si no hubo respuesta)
 */
export async function enviarPendiente(item) {
  const destino = DESTINOS[item.tipo]
  if (!destino) throw new Error(`Tipo de registro desconocido: ${item.tipo}`)
  if (enviando.has(item.id)) throw new Error('Este registro ya se está enviando')

  enviando.add(item.id)
  try {
    const { _archivos, ...campos } = item.payload || {}
    const formData = new FormData()
    Object.entries(campos).forEach(([k, v]) => {
      // Los campos que empiezan por _ son de control local (fecha de guardado, etc.)
      if (!k.startsWith('_') && v !== null && v !== undefined && v !== '') formData.append(k, String(v))
    })
    if (_archivos?.length) {
      const blobs = await leerArchivosOffline(_archivos)
      blobs.forEach(({ blob, nombre }) => formData.append('archivos', blob, nombre))
    }

    let respuesta
    try {
      respuesta = await axios.post(destino.ruta, formData, {
        headers: { 'x-token': useStoreUsuarios().token },
        timeout: TIEMPO_MAXIMO,
      })
    } catch (error) {
      const estado = error.response?.status
      const fallo = new Error(error.response ? mensajeDeError(error, 'El servidor no aceptó el registro') : 'Sin conexión con el servidor')
      fallo.estado = estado
      // 401: sesión vencida; 408/429: transitorios. El resto de 4xx es un problema de los datos
      fallo.rechazado = Boolean(estado >= 400 && estado < 500 && ![401, 408, 429].includes(estado))
      if (fallo.rechazado) await marcarError(item.id, fallo.message)
      throw fallo
    }

    await eliminarPendiente(item.id)
    return respuesta.data
  } finally {
    enviando.delete(item.id)
  }
}

/** Envía todos los pendientes. Si ya hay una sincronización en curso, devuelve esa misma */
export function sincronizarPendientes() {
  if (!sincronizacion) {
    sincronizacion = sincronizar().finally(() => {
      sincronizacion = null
    })
  }
  return sincronizacion
}

async function sincronizar() {
  const resultado = { enviados: 0, rechazados: 0, quedan: 0 }
  if (navigator.onLine === false) return resultado
  if (!useStoreUsuarios().token) return resultado // sin sesión no se puede enviar; se intenta al entrar

  let pendientes
  try {
    pendientes = (await obtenerPendientes()).filter((p) => !enviando.has(p.id))
  } catch (error) {
    console.warn('No se pudieron leer los pendientes del celular', error)
    return resultado
  }
  if (!pendientes.length) return resultado

  Notify.create({
    type: 'info',
    message: `Enviando ${pendientes.length} registro(s) guardado(s) sin señal…`,
    position: 'bottom',
    timeout: 2000,
  })

  for (const [i, item] of pendientes.entries()) {
    try {
      const data = await enviarPendiente(item)
      resultado.enviados++
      Notify.create({
        type: 'positive',
        message: `Se envió el ${describir(item)}${data?.consecutivo ? ` (${data.consecutivo})` : ''}`,
        position: 'bottom',
      })
    } catch (error) {
      if (error.rechazado) {
        resultado.rechazados++
        Notify.create({
          type: 'negative',
          message: `No se pudo enviar el ${describir(item)}: ${error.message}`,
          caption: 'Corríjalo en Preoperacionales (sección "Guardados en el celular").',
          position: 'bottom',
          timeout: 0,
          actions: [{ label: 'Entendido', color: 'white' }],
        })
      } else {
        // Sin señal, servidor caído o sesión vencida: no tiene sentido seguir con los demás
        resultado.quedan = pendientes.length - i
        Notify.create({
          type: 'warning',
          message:
            error.estado === 401
              ? 'Su sesión venció. Inicie sesión para enviar lo guardado en el celular.'
              : `No se pudo enviar (${error.message}). Quedan ${resultado.quedan} guardado(s); se reintentará solo.`,
          position: 'bottom',
        })
        break
      }
    }
  }

  avisarCambio()
  return resultado
}
