import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { useStoreUsuarios } from './usuarios'
import { mensajeDeError } from '../utils/formato'

// Consultas: devuelven datos (o vacío) y avisan si fallan; no lanzan.
// Acciones (crear, editar, legalizar): lanzan Error con el mensaje del backend,
// así el diálogo NO se cierra y el usuario no pierde lo que llenó.

export const useStoreCombustible = defineStore('Combustible', () => {
  const loading = ref(false)

  const headers = () => ({ 'x-token': useStoreUsuarios().token })

  const avisarError = (error, porDefecto) =>
    Notify.create({ type: 'negative', message: mensajeDeError(error, porDefecto), position: 'bottom' })

  /**
   * Ejecuta una acción. `notificar`: muestra el mensaje del backend como éxito.
   * Crear y editar no lo usan: el mensaje puede ser una alerta de rendimiento y la página
   * muestra el resultado completo en su propio diálogo.
   */
  async function accion(fn, porDefecto, notificar = true) {
    loading.value = true
    try {
      const { data } = await fn()
      if (notificar && data?.mensaje) Notify.create({ type: 'positive', message: data.mensaje, position: 'bottom' })
      return data
    } catch (error) {
      throw new Error(mensajeDeError(error, porDefecto))
    } finally {
      loading.value = false
    }
  }

  // ── Consultas ──

  /** Solo admin. { datos, pagina, limite, hayMas, total }, más reciente primero */
  const listarCombustibles = async ({ pagina = 1, limite = 25 } = {}) => {
    loading.value = true
    try {
      const { data } = await axios.get('api/combustible', { params: { pagina, limite }, headers: headers() })
      return { datos: Array.isArray(data?.datos) ? data.datos : [], hayMas: Boolean(data?.hayMas), total: data?.total || 0 }
    } catch (error) {
      avisarError(error, 'No se pudieron cargar los tanqueos')
      // fallo: la página puede reintentar la misma página con "Cargar más"
      return { datos: [], hayMas: false, total: 0, fallo: true }
    } finally {
      loading.value = false
    }
  }

  /** Solo admin. Todos los registros con ese estado de factura ('pendiente' | 'legalizado'), sin paginar */
  const listarPorEstadoFactura = async (estado) => {
    loading.value = true
    try {
      const { data } = await axios.get('api/combustible/filtrados', {
        params: { tipo: 'estado_factura', valor: estado },
        headers: headers(),
      })
      return Array.isArray(data) ? data : []
    } catch (error) {
      avisarError(error, 'No se pudieron cargar los tanqueos')
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Índice liviano de los tanqueos de UNA placa (todos los perfiles, solo sus placas).
   * El backend no devuelve la placa en cada fila (ni estado de factura): se la agregamos aquí.
   * Devuelve null si falló (para distinguirlo de "no hay registros").
   */
  const resumenPorPlaca = async (placa) => {
    try {
      const { data } = await axios.get(`api/combustible/resumen-solicitante/placa/${encodeURIComponent(placa)}`, {
        headers: headers(),
      })
      const filas = data?.resumen?.total?.consecutivos
      return (Array.isArray(filas) ? filas : []).map((f) => ({ ...f, placa }))
    } catch (error) {
      avisarError(error, `No se pudieron cargar los tanqueos de ${placa}`)
      return null
    }
  }

  /**
   * Rendimiento acumulado del mes de una placa (mes 'AAAA-MM').
   * { placa, mes, registros, km_recorridos, galones_cargados, galones_rendimiento, valor_pagado,
   *   rendimiento (o null), rendimiento_esperado, alerta, odometro_inicial, odometro_final, tanqueos: [filas completas] }
   */
  const rendimientoMensual = async (placa, mes, { silencioso = false } = {}) => {
    try {
      const { data } = await axios.get(`api/combustible/rendimiento-mensual/${encodeURIComponent(placa)}`, {
        params: { mes },
        headers: headers(),
      })
      return data
    } catch (error) {
      if (!silencioso) avisarError(error, 'No se pudo cargar el rendimiento del mes')
      return null
    }
  }

  /** Registro completo (incluye rendimiento esperado, km/galones desde el lleno, factura) */
  const obtenerCombustible = async (consecutivo) => {
    try {
      const { data } = await axios.get(`api/combustible/obtenerdatoscombustible/${encodeURIComponent(consecutivo)}`, {
        headers: headers(),
      })
      return data
    } catch (error) {
      avisarError(error, 'No se pudo abrir el tanqueo')
      return null
    }
  }

  // ── Acciones (lanzan Error) ──

  /** formData: placa, odometro_actual, galones_cargados, valor_pagado, tanque_lleno, archivos[] */
  const crearCombustible = (formData) =>
    accion(() => axios.post('api/combustible/crear', formData, { headers: headers() }), 'No se pudo registrar el tanqueo', false)

  /** Solo propietario/admin. Mismos campos; los archivos son opcionales */
  const editarCombustible = (consecutivo, formData) =>
    accion(
      () => axios.put(`api/combustible/editar/${encodeURIComponent(consecutivo)}`, formData, { headers: headers() }),
      'No se pudo editar el tanqueo',
      false,
    )

  /** Solo propietario/admin. Número de factura obligatorio */
  const legalizarCombustible = (consecutivo, numero_factura) =>
    accion(
      () => axios.put(`api/combustible/legalizar/${encodeURIComponent(consecutivo)}`, { numero_factura }, { headers: headers() }),
      'No se pudo legalizar la factura',
    )

  return {
    loading,
    listarCombustibles,
    listarPorEstadoFactura,
    resumenPorPlaca,
    rendimientoMensual,
    obtenerCombustible,
    crearCombustible,
    editarCombustible,
    legalizarCombustible,
  }
})
