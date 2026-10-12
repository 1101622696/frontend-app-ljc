import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { useStoreUsuarios } from './usuarios'
import { mensajeDeError } from '../utils/formato'

// GPS de Satrack (administrador y propietario; el propietario solo recibe sus camiones).
// Consultas: devuelven datos (o null si fallan, para distinguir "falló" de "no hay nada") y muestran el error.
// guardarResumen lanza Error con el mensaje del backend.

export const useStoreSatrack = defineStore('Satrack', () => {
  const loading = ref(false)

  const headers = () => ({ 'x-token': useStoreUsuarios().token })

  const avisarError = (error, porDefecto) =>
    Notify.create({ type: 'negative', message: mensajeDeError(error, porDefecto), position: 'bottom' })

  /**
   * Última posición de cada vehículo: arreglo con placa, serviceCode, latitude, longitude, address, ignition,
   * speed, odometer, vehicleStatus, generationDate (Satrack) y generationDate_colombia ('…-05:00').
   * null si falló (así el mapa conserva lo que ya mostraba).
   */
  const obtenerPosiciones = async ({ silencioso = false } = {}) => {
    loading.value = true
    try {
      const { data } = await axios.get('api/satrack/posiciones', { headers: headers() })
      return Array.isArray(data?.data) ? data.data : []
    } catch (error) {
      // En la actualización automática no se llena la pantalla de avisos si no hay señal
      if (!silencioso) avisarError(error, 'No se pudieron obtener las posiciones')
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Una página (100 eventos) del historial. Fechas 'AAAA-MM-DD' en hora Colombia;
   * el backend toma la fecha final hasta las 23:59:59. Máximo 31 días.
   */
  const obtenerHistorial = async (serviceCode, fechaInicio, fechaFin, pagina = 1) => {
    loading.value = true
    try {
      const { data } = await axios.get(`api/satrack/historial/${encodeURIComponent(serviceCode)}`, {
        params: { fechaInicio, fechaFin, pagina },
        headers: headers(),
      })
      return { placa: data?.placa || null, eventos: data?.data?.events || [] }
    } catch (error) {
      avisarError(error, 'No se pudo consultar el historial')
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Solo administrador. Sin fecha el backend toma AYER (hora Colombia).
   * Respuesta: { fecha, filas_guardadas, resultado: [{ placa, km_recorridos, ... accion }], sin_eventos, errores }
   */
  const guardarResumen = async (fecha) => {
    loading.value = true
    try {
      const { data } = await axios.post('api/satrack/guardar-resumen', fecha ? { fecha } : {}, { headers: headers() })
      return data
    } catch (error) {
      throw new Error(mensajeDeError(error, 'No se pudo guardar el resumen del día'))
    } finally {
      loading.value = false
    }
  }

  return { loading, obtenerPosiciones, obtenerHistorial, guardarResumen }
})
