import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { useStoreUsuarios } from './usuarios'
import { mensajeDeError } from '../utils/formato'

// Solicitudes de mantenimiento: avisos del conductor (o propietario/admin) cuando nota algo raro.
// No se vinculan a mantenimientos; solo alertan al propietario.
// Consultas: devuelven datos (o vacío). Crear: lanza Error con el mensaje del backend.

const numeroConsecutivo = (c) => Number(String(c ?? '').replace(/\D/g, '')) || 0

/** Más reciente primero. fecha_creacion trae hora ('2026-10-11T19:45:03-05:00'), todas en hora Colombia */
const ordenarRecientes = (lista) =>
  [...lista].sort((a, b) => {
    const fa = /^\d{4}-\d{2}-\d{2}/.test(a.fecha_creacion || '') ? a.fecha_creacion : ''
    const fb = /^\d{4}-\d{2}-\d{2}/.test(b.fecha_creacion || '') ? b.fecha_creacion : ''
    return fb.localeCompare(fa) || numeroConsecutivo(b.consecutivo) - numeroConsecutivo(a.consecutivo)
  })

export const useStoreSolicitudes = defineStore('Solicitud', () => {
  const loading = ref(false)

  const headers = () => ({ 'x-token': useStoreUsuarios().token })

  const fallo = (error, porDefecto) =>
    Notify.create({ type: 'negative', message: mensajeDeError(error, porDefecto), position: 'bottom' })

  // ── Consultas ──

  /**
   * Lista para la pantalla, más reciente primero.
   * - Administrador: GET api/solicitudes (todas).
   * - Conductor y propietario: GET resumen-solicitante/placa/:placas (varias placas separadas por coma,
   *   sin espacios; el backend verifica que sean del usuario). GET api/solicitudes es solo del administrador.
   */
  const listarSolicitudes = async ({ esAdmin = false, placas = [] } = {}) => {
    loading.value = true
    try {
      if (esAdmin) {
        const { data } = await axios.get('api/solicitudes/', { headers: headers() })
        return ordenarRecientes(Array.isArray(data) ? data : [])
      }
      if (!placas.length) return []
      const { data } = await axios.get(
        `api/solicitudes/resumen-solicitante/placa/${encodeURIComponent(placas.join(','))}`,
        { headers: headers() },
      )
      return ordenarRecientes(data?.resumen?.total?.consecutivos || [])
    } catch (error) {
      fallo(error, 'No se pudieron cargar las solicitudes')
      return []
    } finally {
      loading.value = false
    }
  }

  /** Una solicitud por consecutivo (p. ej. al abrirla desde una notificación) */
  const obtenerdatodessolicitud = async (consecutivo) => {
    try {
      const { data } = await axios.get(
        `api/solicitudes/obtenerdatossolicitud/${encodeURIComponent(consecutivo)}`,
        { headers: headers() },
      )
      return data
    } catch (error) {
      fallo(error, 'No se pudo abrir la solicitud')
      return null
    }
  }

  // ── Acción (lanza Error) ──

  /**
   * FormData: placa, tipo_mantenimiento, descripcion, odometro?, archivos[] (fotos).
   * Devuelve { mensaje, consecutivo, placa, link, fecha_creacion, odometro_actualizado }.
   * El mensaje de éxito lo arma la página.
   */
  const crearSolicitud = async (formData) => {
    loading.value = true
    try {
      const { data } = await axios.post('api/solicitudes/crear', formData, { headers: headers() })
      return data
    } catch (error) {
      throw new Error(mensajeDeError(error, 'No se pudo enviar la solicitud'))
    } finally {
      loading.value = false
    }
  }

  return { loading, listarSolicitudes, obtenerdatodessolicitud, crearSolicitud }
})
