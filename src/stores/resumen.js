import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { useStoreUsuarios } from './usuarios'
import { mensajeDeError } from '../utils/formato'

// Resumen financiero de los vehículos (administrador y propietario).
// El backend CALCULA todo al momento; la hoja Resumen_Vehiculo es solo un "cierre" opcional.

export const useStoreResumen = defineStore('Resumen', () => {
  const loading = ref(false)

  const headers = () => ({ 'x-token': useStoreUsuarios().token })

  const avisarError = (error, porDefecto) =>
    Notify.create({ type: 'negative', message: mensajeDeError(error, porDefecto), position: 'bottom' })

  async function consulta(fn, porDefecto, vacio) {
    loading.value = true
    try {
      const { data } = await fn()
      return data
    } catch (error) {
      avisarError(error, porDefecto)
      return vacio
    } finally {
      loading.value = false
    }
  }

  // ── Consultas ──

  /** Vehículos que el usuario puede ver (el backend filtra por perfil) */
  const listarVehiculos = async () => {
    try {
      const { data } = await axios.get('api/vehiculos', { headers: headers() })
      return Array.isArray(data) ? data : []
    } catch (error) {
      avisarError(error, 'No se pudieron cargar los vehículos')
      return []
    }
  }

  /** 12 meses ('01'..'12') + la fila TOTAL de una placa y año */
  const resumenVehiculo = async (placa, anio) => {
    const data = await consulta(
      () => axios.get(`api/resumenvehiculo/resumen-vehiculo/${encodeURIComponent(placa)}/${anio}`, { headers: headers() }),
      'No se pudo calcular el resumen del vehículo',
      [],
    )
    return Array.isArray(data) ? data : []
  }

  /** Resumen del mes de cada vehículo visible para el usuario */
  const resumenFlota = async (anio, mes) => {
    const data = await consulta(
      () => axios.get(`api/resumenvehiculo/resumen-vehiculo/flota/${anio}/${mes}`, { headers: headers() }),
      'No se pudo calcular el resumen de la flota',
      [],
    )
    return Array.isArray(data) ? data : []
  }

  // ── Acciones (lanzan Error) ──

  /**
   * Guarda el cierre del mes de una placa en la hoja (actualiza si ya existía, no duplica).
   * No muestra aviso: la página decide (en la flota se guardan varios seguidos).
   */
  const guardarCierreMes = async (placa, anio, mes) => {
    loading.value = true
    try {
      const { data } = await axios.post(
        'api/resumenvehiculo/resumen-vehiculo/mensual',
        { placa, anio, mes, guardar: true },
        { headers: headers() },
      )
      return data
    } catch (error) {
      throw new Error(mensajeDeError(error, `No se pudo guardar el cierre de ${placa}`))
    } finally {
      loading.value = false
    }
  }

  return { loading, listarVehiculos, resumenVehiculo, resumenFlota, guardarCierreMes }
})
