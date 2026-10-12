import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { useStoreUsuarios } from './usuarios'
import { mensajeDeError } from '../utils/formato'

// Consultas: devuelven datos o vacío. Liquidar/pagar: lanzan Error con el mensaje del backend.

export const useStoreNominas = defineStore('Nomina', () => {
  const loading = ref(false)
  const headers = () => ({ 'x-token': useStoreUsuarios().token })

  const fallo = (error, porDefecto) =>
    Notify.create({ type: 'negative', message: mensajeDeError(error, porDefecto), position: 'bottom' })

  /** Por liquidar, por conductor */
  const obtenerPendientes = async () => {
    loading.value = true
    try {
      const { data } = await axios.get('api/nomina/pendientes', { headers: headers() })
      return Array.isArray(data) ? data : []
    } catch (error) {
      fallo(error, 'No se pudo cargar lo pendiente')
      return []
    } finally {
      loading.value = false
    }
  }

  /** Historial (cada perfil recibe lo suyo) */
  const obtenerNominas = async ({ tipo = '', email = '' } = {}) => {
    loading.value = true
    try {
      const { data } = await axios.get('api/nomina/', { params: { tipo, email }, headers: headers() })
      return Array.isArray(data) ? data : []
    } catch (error) {
      fallo(error, 'No se pudo cargar el historial')
      return []
    } finally {
      loading.value = false
    }
  }

  /** Vista previa. tipo: 'viajes' | 'salario' */
  const calcularNomina = async (email, { tipo = 'viajes', mes = '', viajes = [] } = {}) => {
    try {
      const { data } = await axios.get(`api/nomina/calcular-nomina/${encodeURIComponent(email)}`, {
        params: { tipo, mes, viajes: viajes.join(',') },
        headers: headers(),
      })
      return data
    } catch (error) {
      throw new Error(mensajeDeError(error, 'No se pudo calcular la nómina'))
    }
  }

  const accion = async (url, formData, porDefecto) => {
    loading.value = true
    try {
      const { data } = await axios.post(url, formData, { headers: headers() })
      Notify.create({ type: 'positive', message: data.mensaje, position: 'bottom', timeout: 5000 })
      return data
    } catch (error) {
      throw new Error(mensajeDeError(error, porDefecto))
    } finally {
      loading.value = false
    }
  }

  const liquidarViajes = (email, formData) =>
    accion(`api/nomina/liquidar-viajes/${encodeURIComponent(email)}`, formData, 'No se pudo liquidar')

  const pagarSalario = (email, formData) =>
    accion(`api/nomina/pagar-salario/${encodeURIComponent(email)}`, formData, 'No se pudo registrar el salario')

  const obtenerdatodenomina = async (consecutivo) => {
    try {
      const { data } = await axios.get(`api/nomina/obtenerdatosnomina/${encodeURIComponent(consecutivo)}`, { headers: headers() })
      return data
    } catch (error) {
      fallo(error, 'No se pudo abrir la nómina')
      return null
    }
  }

  return { loading, obtenerPendientes, obtenerNominas, calcularNomina, liquidarViajes, pagarSalario, obtenerdatodenomina }
})
