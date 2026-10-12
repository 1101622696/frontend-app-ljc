import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { useStoreUsuarios } from './usuarios'
import { mensajeDeError } from '../utils/formato'

// Consultas: devuelven datos (o vacío / null) y no lanzan.
// Acciones (crear / editar): lanzan Error con el mensaje del backend, así el formulario NO se cierra.
// El Error lleva `sinConexion = true` cuando no hubo respuesta (sin señal): la pantalla lo guarda en el celular.

// Un viaje admite preoperacional mientras esté abierto y no lo tenga
const ESTADOS_ABIERTOS = ['solicitado', 'anticipo_consignado']

const numeroConsecutivo = (c) => parseInt(String(c ?? '').replace(/\D/g, ''), 10) || 0

export const useStorePreoperacionales = defineStore('Preoperacional', () => {
  const loading = ref(false)

  const headers = () => ({ 'x-token': useStoreUsuarios().token })

  const exito = (mensaje) => Notify.create({ type: 'positive', message: mensaje, position: 'bottom' })
  const fallo = (error, porDefecto) =>
    Notify.create({
      type: 'negative',
      message: error.response ? mensajeDeError(error, porDefecto) : `${porDefecto}: sin conexión`,
      position: 'bottom',
    })

  async function accion(fn, porDefecto) {
    loading.value = true
    try {
      const respuesta = await fn()
      if (respuesta?.data?.mensaje) exito(respuesta.data.mensaje)
      return respuesta?.data
    } catch (error) {
      const e = new Error(error.response ? mensajeDeError(error, porDefecto) : 'Sin conexión con el servidor')
      e.sinConexion = !error.response
      e.estado = error.response?.status
      throw e
    } finally {
      loading.value = false
    }
  }

  // ── Consultas ──

  /** Lista completa (con los ítems). El backend filtra por placas si no es admin y ordena el más reciente primero */
  const listar = async () => {
    loading.value = true
    try {
      const { data } = await axios.get('api/preoperacionales/', { headers: headers() })
      const lista = Array.isArray(data) ? data : []
      return lista.sort((a, b) => numeroConsecutivo(b.consecutivo) - numeroConsecutivo(a.consecutivo))
    } catch (error) {
      fallo(error, 'No se pudieron cargar los preoperacionales')
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Viajes que esperan preoperacional + odómetro actual de cada vehículo.
   * Placas: las de los vehículos que el usuario puede ver (el admin, todas).
   * Devuelve { viajes, odometros } o null si no se pudo consultar (la pantalla usa la copia local).
   */
  const obtenerViajesPendientes = async () => {
    try {
      const { data: vehiculos } = await axios.get('api/vehiculos/', { headers: headers() })
      const lista = Array.isArray(vehiculos) ? vehiculos : []
      const odometros = Object.fromEntries(lista.map((v) => [v.placa, Number(v.odometro) || 0]))
      const placas = lista.map((v) => v.placa).filter(Boolean)
      if (!placas.length) return { viajes: [], odometros }

      const { data } = await axios.get(`api/viajes/resumen-solicitante/placa/${encodeURIComponent(placas.join(','))}`, {
        headers: headers(),
      })
      const viajes = (data?.resumen?.total?.consecutivos || [])
        .filter(
          (v) =>
            ESTADOS_ABIERTOS.includes(String(v.estado_viaje || '').toLowerCase()) &&
            // 'se debe' normalmente; el backend solo rechaza los 'realizado'
            String(v.estado_preoperacional || '').toLowerCase() !== 'realizado',
        )
        .sort((a, b) => numeroConsecutivo(b.consecutivo) - numeroConsecutivo(a.consecutivo))
      return { viajes, odometros }
    } catch (error) {
      if (error.response) fallo(error, 'No se pudieron cargar los viajes')
      return null
    }
  }

  // ── Acciones (lanzan Error) ──

  const crear = (formData) =>
    accion(
      () => axios.post('api/preoperacionales/crear', formData, { headers: headers(), timeout: 120000 }),
      'No se pudo guardar el preoperacional',
    )

  /** Solo admin / propietario. Edita ítems, galones y agrega archivos (viaje, placa y odómetro no cambian) */
  const editar = (consecutivo, formData) =>
    accion(
      () =>
        axios.put(`api/preoperacionales/editar/${encodeURIComponent(consecutivo)}`, formData, {
          headers: headers(),
          timeout: 120000,
        }),
      'No se pudo editar el preoperacional',
    )

  return {
    loading,
    listar,
    obtenerViajesPendientes,
    crear,
    editar,
  }
})
