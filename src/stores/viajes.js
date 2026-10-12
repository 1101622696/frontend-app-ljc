import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { useStoreUsuarios } from './usuarios'
import { mensajeDeError } from '../utils/formato'

// Consultas: devuelven datos (o vacío) y no lanzan.
// Acciones del flujo: lanzan Error con el mensaje del backend, así el diálogo NO se cierra si algo falla.

export const useStoreViajes = defineStore('Viaje', () => {
  const loading = ref(false)

  const headers = () => ({ 'x-token': useStoreUsuarios().token })

  const exito = (mensaje) => Notify.create({ type: 'positive', message: mensaje, position: 'bottom' })

  async function accion(fn, porDefecto) {
    loading.value = true
    try {
      const respuesta = await fn()
      if (respuesta?.data?.mensaje) exito(respuesta.data.mensaje)
      return respuesta?.data
    } catch (error) {
      throw new Error(mensajeDeError(error, porDefecto))
    } finally {
      loading.value = false
    }
  }

  // ── Consultas ──

  /** Lista de la pantalla de viajes. Cada perfil recibe lo suyo. */
  const listarViajes = async ({ estado = '', placa = '', pagina = 1, limite = 100 } = {}) => {
    loading.value = true
    try {
      const { data } = await axios.get('api/viajes/mis-viajes', {
        params: { estado, placa, pagina, limite },
        headers: headers(),
      })
      return data
    } catch (error) {
      Notify.create({ type: 'negative', message: mensajeDeError(error, 'No se pudieron cargar los viajes'), position: 'bottom' })
      return { datos: [], hayMas: false, conteo: {}, total: 0 }
    } finally {
      loading.value = false
    }
  }

  /** Detalle completo del viaje con sus gastos */
  const obtenerdatodeviaje = async (consecutivo) => {
    try {
      const { data } = await axios.get(`api/viajes/obtenerdatosviajes/${encodeURIComponent(consecutivo)}`, {
        headers: headers(),
      })
      return data
    } catch (error) {
      Notify.create({ type: 'negative', message: mensajeDeError(error, 'No se pudo abrir el viaje'), position: 'bottom' })
      return null
    }
  }

  /** Lo usa Preoperacionales: { ok, resumen: { total: { consecutivos } } } */
  const obtenerResumenPorPlaca = async (placa) => {
    try {
      const { data } = await axios.get(`api/viajes/resumen-solicitante/placa/${encodeURIComponent(placa)}`, {
        headers: headers(),
      })
      return data
    } catch (error) {
      console.error('No se pudo obtener el resumen por placa', error)
      return { ok: false, resumen: null }
    }
  }

  /** Clientes activos { codigo, empresa } para el formulario (también para el conductor) */
  const obtenerClientesOpciones = async () => {
    try {
      const { data } = await axios.get('api/viajes/clientes-opciones', { headers: headers() })
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('No se pudieron cargar los clientes', error)
      return []
    }
  }

  const obtenerGastos = async (consecutivo) => {
    try {
      const { data } = await axios.get(`api/viajes/gastos/${encodeURIComponent(consecutivo)}`, { headers: headers() })
      return data
    } catch (error) {
      console.error('No se pudieron obtener los gastos', error)
      return []
    }
  }

  // ── Flujo del viaje (lanzan Error) ──

  const postViaje = (datos) => accion(() => axios.post('api/viajes/crear', datos, { headers: headers() }), 'No se pudo crear el viaje')

  const consignarAnticipo = (consecutivo, formData) =>
    accion(
      () => axios.put(`api/viajes/consignar-anticipo/${consecutivo}`, formData, { headers: headers() }),
      'No se pudo registrar la consignación'
    )

  const putCerrarViajeConductor = (consecutivo, formData) =>
    accion(() => axios.put(`api/viajes/cerrar-conductor/${consecutivo}`, formData, { headers: headers() }), 'No se pudo cerrar el viaje')

  const putAprobarPropietario = (consecutivo, formData) =>
    accion(() => axios.put(`api/viajes/aprobar-propietario/${consecutivo}`, formData, { headers: headers() }), 'No se pudo aprobar el viaje')

  const putFacturarViaje = (consecutivo, datos) =>
    accion(() => axios.put(`api/viajes/facturar/${consecutivo}`, datos, { headers: headers() }), 'No se pudo facturar el viaje')

  const putCompletarSaldo = (consecutivo, datos = {}) =>
    accion(() => axios.put(`api/viajes/completar-saldo/${consecutivo}`, datos, { headers: headers() }), 'No se pudo registrar el pago')

  const putViaje = (consecutivo, formData) =>
    accion(() => axios.put(`api/viajes/editar/${consecutivo}`, formData, { headers: headers() }), 'No se pudo editar el viaje')

  const putLegalizarFactura = (consecutivo, datos) =>
    accion(() => axios.put(`api/viajes/legalizar-factura/${consecutivo}`, datos, { headers: headers() }), 'No se pudo legalizar')

  return {
    loading,
    listarViajes,
    obtenerdatodeviaje,
    obtenerResumenPorPlaca,
    obtenerGastos,
    obtenerClientesOpciones,
    postViaje,
    consignarAnticipo,
    putCerrarViajeConductor,
    putAprobarPropietario,
    putFacturarViaje,
    putCompletarSaldo,
    putViaje,
    putLegalizarFactura,
  }
})
