import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { useStoreUsuarios } from './usuarios'
import { mensajeDeError } from '../utils/formato'

// Consultas: devuelven datos (o vacío) y avisan si fallan; no lanzan.
// Acciones (crear, editar, activar): lanzan Error con el mensaje del backend,
// así el diálogo NO se cierra y el usuario no pierde lo que llenó.
//
// Otras pantallas usan: obtenerVehiculos (selects de placa, devuelve arreglo),
// obtenerResumenPorPlaca y obtenerResumenVehiculo / postResumenVehiculo* (ResumenVehiculosPage).

export const useStoreVehiculos = defineStore('Vehiculo', () => {
  const loading = ref(false)

  const headers = () => ({ 'x-token': useStoreUsuarios().token })
  const avisarError = (error, porDefecto) =>
    Notify.create({ type: 'negative', message: mensajeDeError(error, porDefecto), position: 'bottom' })

  async function accion(fn, porDefecto) {
    loading.value = true
    try {
      const { data } = await fn()
      if (data?.mensaje) Notify.create({ type: 'positive', message: data.mensaje, position: 'bottom' })
      return data
    } catch (error) {
      throw new Error(mensajeDeError(error, porDefecto))
    } finally {
      loading.value = false
    }
  }

  // ── Consultas ──

  /**
   * Vehículos que el usuario puede ver (el backend filtra: admin todos, los demás sus placas).
   * Cada uno trae soat / tecnico / poliza ('activo' | 'proxima a vencer' | 'vencido' | 'sin fecha')
   * y dias_soat / dias_tecnico / dias_poliza calculados al consultar.
   */
  const obtenerVehiculos = async () => {
    loading.value = true
    try {
      const { data } = await axios.get('api/vehiculos/', { headers: headers() })
      return Array.isArray(data) ? data : []
    } catch (error) {
      avisarError(error, 'No se pudieron cargar los vehículos')
      return []
    } finally {
      loading.value = false
    }
  }

  /** Detalle de un vehículo (mismos campos que la lista) */
  const obtenerdatodevehiculo = async (placa) => {
    try {
      const { data } = await axios.get(`api/vehiculos/obtenerdatosvehiculo/${encodeURIComponent(placa)}`, {
        headers: headers(),
      })
      return data
    } catch (error) {
      avisarError(error, 'No se pudo abrir el vehículo')
      return null
    }
  }

  /** { ok, resumen: { total: { count, consecutivos } }, placas }. Acepta varias placas separadas por coma */
  const obtenerResumenPorPlaca = async (placa) => {
    try {
      const { data } = await axios.get(`api/vehiculos/resumen-solicitante/placa/${encodeURIComponent(placa)}`, {
        headers: headers(),
      })
      return data
    } catch (error) {
      avisarError(error, 'No se pudo obtener el resumen del vehículo')
      return { ok: false, resumen: null }
    }
  }

  /** Resumen anual de un vehículo: [12 meses + TOTAL] (ResumenVehiculosPage) */
  const obtenerResumenVehiculo = async (placa, anio) => {
    try {
      const { data } = await axios.get(
        `api/resumenvehiculo/resumen-vehiculo/${encodeURIComponent(placa)}/${encodeURIComponent(anio)}`,
        { headers: headers() },
      )
      return data
    } catch (error) {
      avisarError(error, 'No se pudo obtener el resumen del vehículo')
      return null
    }
  }

  // ── Resúmenes (ResumenVehiculosPage) ──
  // Se dejan sin lanzar porque esa pantalla no atrapa el error: avisan y devuelven null.

  const generarResumen = async (url, datos, porDefecto) => {
    loading.value = true
    try {
      const { data } = await axios.post(url, datos, { headers: headers() })
      if (data?.mensaje) Notify.create({ type: 'positive', message: data.mensaje, position: 'bottom' })
      return data
    } catch (error) {
      avisarError(error, porDefecto)
      return null
    } finally {
      loading.value = false
    }
  }

  const postResumenVehiculoMensual = (datos) =>
    generarResumen('api/resumenvehiculo/resumen-vehiculo/mensual', datos, 'No se pudo generar el resumen mensual')

  const postResumenVehiculoAnual = (datos) =>
    generarResumen('api/resumenvehiculo/resumen-vehiculo/anual', datos, 'No se pudo generar el resumen anual')

  // ── Acciones (lanzan Error) ──

  /** formData con los datos y 'archivos'. Responde { mensaje, placa } */
  const postVehiculo = (formData) =>
    accion(() => axios.post('api/vehiculos/crear', formData, { headers: headers() }), 'No se pudo crear el vehículo')

  /** La placa va en la URL y no se cambia (es la llave de viajes, gastos, etc.) */
  const putVehiculo = (placa, formData) =>
    accion(
      () => axios.put(`api/vehiculos/editar/${encodeURIComponent(placa)}`, formData, { headers: headers() }),
      'No se pudo editar el vehículo',
    )

  const putActivarVehiculo = (placa) =>
    accion(
      () => axios.put(`api/vehiculos/activar/${encodeURIComponent(placa)}`, {}, { headers: headers() }),
      'No se pudo activar el vehículo',
    )

  const putDesactivarVehiculo = (placa) =>
    accion(
      () => axios.put(`api/vehiculos/desactivar/${encodeURIComponent(placa)}`, {}, { headers: headers() }),
      'No se pudo desactivar el vehículo',
    )

  return {
    loading,
    obtenerVehiculos,
    obtenerdatodevehiculo,
    obtenerResumenPorPlaca,
    obtenerResumenVehiculo,
    postResumenVehiculoMensual,
    postResumenVehiculoAnual,
    postVehiculo,
    putVehiculo,
    putActivarVehiculo,
    putDesactivarVehiculo,
  }
})
