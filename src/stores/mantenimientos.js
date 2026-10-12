import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { useStoreUsuarios } from './usuarios'
import { mensajeDeError } from '../utils/formato'

// Mantenimientos (solo administrador y propietario; el conductor usa Solicitudes).
// Consultas: devuelven datos (o vacío) y no lanzan.
// Acciones (crear/editar/legalizar): lanzan Error con el mensaje del backend, así el diálogo NO se cierra si algo falla.

/** 'M-12' → 12, para desempatar registros del mismo día */
const numeroConsecutivo = (c) => Number(String(c ?? '').replace(/\D/g, '')) || 0

/** Más reciente primero. fecha_creacion viene 'AAAA-MM-DD' (se compara como texto); empate → consecutivo mayor */
const ordenarRecientes = (lista) =>
  [...lista].sort((a, b) => {
    const fa = /^\d{4}-\d{2}-\d{2}/.test(a.fecha_creacion || '') ? a.fecha_creacion : ''
    const fb = /^\d{4}-\d{2}-\d{2}/.test(b.fecha_creacion || '') ? b.fecha_creacion : ''
    return fb.localeCompare(fa) || numeroConsecutivo(b.consecutivo) - numeroConsecutivo(a.consecutivo)
  })

export const useStoreMantenimiento = defineStore('Mantenimiento', () => {
  const loading = ref(false)

  const headers = () => ({ 'x-token': useStoreUsuarios().token })

  const fallo = (error, porDefecto) =>
    Notify.create({ type: 'negative', message: mensajeDeError(error, porDefecto), position: 'bottom' })

  /** avisar=false cuando la página arma su propio mensaje de éxito (p. ej. al crear) */
  async function accion(fn, porDefecto, avisar = true) {
    loading.value = true
    try {
      const { data } = await fn()
      if (avisar && data?.mensaje) Notify.create({ type: 'positive', message: data.mensaje, position: 'bottom' })
      return data
    } catch (error) {
      throw new Error(mensajeDeError(error, porDefecto))
    } finally {
      loading.value = false
    }
  }

  // ── Consultas ──

  /**
   * Lista para la pantalla, más reciente primero.
   * - Administrador: GET api/mantenimientos (todos).
   * - Propietario: GET resumen-solicitante/placa/:placas (acepta varias placas separadas por coma,
   *   ya normalizadas sin espacios). GET api/mantenimientos es solo para el administrador.
   */
  const listarMantenimientos = async ({ esAdmin = false, placas = [] } = {}) => {
    loading.value = true
    try {
      if (esAdmin) {
        const { data } = await axios.get('api/mantenimientos', { headers: headers() })
        return ordenarRecientes(Array.isArray(data) ? data : [])
      }
      if (!placas.length) return []
      const { data } = await axios.get(
        `api/mantenimientos/resumen-solicitante/placa/${encodeURIComponent(placas.join(','))}`,
        { headers: headers() },
      )
      return ordenarRecientes(data?.resumen?.total?.consecutivos || [])
    } catch (error) {
      fallo(error, 'No se pudieron cargar los mantenimientos')
      return []
    } finally {
      loading.value = false
    }
  }

  /** Registro completo (incluye usuario y correo de quien lo registró) */
  const obtenerdatodemantenimiento = async (consecutivo) => {
    try {
      const { data } = await axios.get(
        `api/mantenimientos/obtenerdatosmantenimiento/${encodeURIComponent(consecutivo)}`,
        { headers: headers() },
      )
      return data
    } catch (error) {
      fallo(error, 'No se pudo abrir el mantenimiento')
      return null
    }
  }

  // ── Acciones (lanzan Error) ──

  /** FormData: placa, tipo_mantenimiento, descripcion, valor_mantenimiento, odometro?, numero_factura?, archivos[] */
  const crearMantenimiento = (formData) =>
    accion(
      () => axios.post('api/mantenimientos/crear', formData, { headers: headers() }),
      'No se pudo registrar el mantenimiento',
      false,
    )

  /** Solo cambia los campos que llegan con valor; archivos nuevos se suman a la carpeta */
  const editarMantenimiento = (consecutivo, formData) =>
    accion(
      () => axios.put(`api/mantenimientos/editar/${encodeURIComponent(consecutivo)}`, formData, { headers: headers() }),
      'No se pudo editar el mantenimiento',
    )

  /** FormData: numero_factura (obligatorio) + archivos (opcionales si el mantenimiento ya tiene soporte) */
  const legalizarMantenimiento = (consecutivo, formData) =>
    accion(
      () => axios.put(`api/mantenimientos/legalizar/${encodeURIComponent(consecutivo)}`, formData, { headers: headers() }),
      'No se pudo legalizar el mantenimiento',
    )

  return {
    loading,
    listarMantenimientos,
    obtenerdatodemantenimiento,
    crearMantenimiento,
    editarMantenimiento,
    legalizarMantenimiento,
  }
})
