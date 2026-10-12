import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { useStoreUsuarios } from './usuarios'
import { mensajeDeError } from '../utils/formato'

export const useStorePrestamos = defineStore('Prestamo', () => {
  const loading = ref(false)
  const headers = () => ({ 'x-token': useStoreUsuarios().token })

  /** { datos, totales, por_descontar } — cada perfil recibe lo suyo */
  const listarPrestamos = async (estado = '') => {
    loading.value = true
    try {
      const { data } = await axios.get('api/prestamos/', { params: { estado }, headers: headers() })
      return data
    } catch (error) {
      Notify.create({ type: 'negative', message: mensajeDeError(error, 'No se pudieron cargar los préstamos'), position: 'bottom' })
      return { datos: [], totales: {}, por_descontar: 0 }
    } finally {
      loading.value = false
    }
  }

  const obtenerdatodeprestamo = async (consecutivo) => {
    try {
      const { data } = await axios.get(`api/prestamos/obtenerdatosprestamo/${encodeURIComponent(consecutivo)}`, {
        headers: headers(),
      })
      return data
    } catch (error) {
      Notify.create({ type: 'negative', message: mensajeDeError(error, 'No se pudo abrir el préstamo'), position: 'bottom' })
      return null
    }
  }

  const accion = async (fn, porDefecto) => {
    loading.value = true
    try {
      const { data } = await fn()
      Notify.create({ type: 'positive', message: data.mensaje, position: 'bottom' })
      return data
    } catch (error) {
      throw new Error(mensajeDeError(error, porDefecto))
    } finally {
      loading.value = false
    }
  }

  const solicitarPrestamo = (datos) =>
    accion(() => axios.post('api/prestamos/crear', datos, { headers: headers() }), 'No se pudo solicitar el préstamo')

  const desembolsarPrestamo = (consecutivo, formData) =>
    accion(() => axios.put(`api/prestamos/desembolsar/${consecutivo}`, formData, { headers: headers() }), 'No se pudo registrar el desembolso')

  const rechazarPrestamo = (consecutivo, motivo_rechazo) =>
    accion(() => axios.put(`api/prestamos/rechazar/${consecutivo}`, { motivo_rechazo }, { headers: headers() }), 'No se pudo rechazar')

  return { loading, listarPrestamos, obtenerdatodeprestamo, solicitarPrestamo, desembolsarPrestamo, rechazarPrestamo }
})
