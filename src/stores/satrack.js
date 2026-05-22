import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { useStoreUsuarios } from './usuarios'

export const useStoreSatrack = defineStore('Satrack', () => {
  const loading = ref(false)

  const obtenerPosiciones = async () => {
    const useUsuario = useStoreUsuarios()
    loading.value = true
    try {
      const response = await axios.get('api/satrack/posiciones', {
        headers: { 'x-token': useUsuario.token }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener posiciones Satrack:', error)
      return { ok: false, data: [] }
    } finally {
      loading.value = false
    }
  }

  const obtenerHistorial = async (serviceCode, fechaInicio, fechaFin, pagina = 1) => {
    const useUsuario = useStoreUsuarios()
    loading.value = true
    try {
      const response = await axios.get(`api/satrack/historial/${serviceCode}`, {
        params: { fechaInicio, fechaFin, pagina },
        headers: { 'x-token': useUsuario.token }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener historial Satrack:', error)
      return { ok: false, data: [] }
    } finally {
      loading.value = false
    }
  }

  const guardarResumen = async (fecha) => {
    const useUsuario = useStoreUsuarios()
    loading.value = true
    try {
      const response = await axios.post('api/satrack/guardar-resumen',
        { fecha },
        { headers: { 'x-token': useUsuario.token } }
      )
      return response.data
    } catch (error) {
      console.error('Error al guardar resumen Satrack:', error)
      return { ok: false }
    } finally {
      loading.value = false
    }
  }

  return { loading, obtenerPosiciones, obtenerHistorial, guardarResumen }
})