import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { useStoreUsuarios } from './usuarios'
import { mensajeDeError } from '../utils/formato'

// Clientes: solo administrador y propietario.
// Consultas: devuelven datos (o vacío) y avisan si fallan. Acciones: lanzan Error con el mensaje del backend.
//
// Los totales (viajes, valores, ganancia y "¿cumple lo prometido?") los calcula el backend con los viajes
// aprobados, facturados o pagados que el usuario puede ver: el propietario solo los de sus vehículos.

export const useStoreClientes = defineStore('Cliente', () => {
  const loading = ref(false)

  const headers = () => ({ 'x-token': useStoreUsuarios().token })

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

  /** Lista de clientes con sus totales. Siempre devuelve un arreglo */
  const obtenerClientes = async () => {
    loading.value = true
    try {
      const { data } = await axios.get('api/clientes/', { headers: headers() })
      return Array.isArray(data) ? data : []
    } catch (error) {
      Notify.create({ type: 'negative', message: mensajeDeError(error, 'No se pudieron cargar los clientes'), position: 'bottom' })
      return []
    } finally {
      loading.value = false
    }
  }

  /** Un cliente con sus totales */
  const obtenerdatoscliente = async (codigo) => {
    try {
      const { data } = await axios.get(`api/clientes/obtenerdatoscliente/${encodeURIComponent(codigo)}`, {
        headers: headers(),
      })
      return data
    } catch (error) {
      Notify.create({ type: 'negative', message: mensajeDeError(error, 'No se pudo abrir el cliente'), position: 'bottom' })
      return null
    }
  }

  // ── Acciones (lanzan Error) ──

  /** Responde { mensaje, codigo } */
  const postCliente = (datos) =>
    accion(() => axios.post('api/clientes/crear', datos, { headers: headers() }), 'No se pudo crear el cliente')

  const putCliente = (codigo, datos) =>
    accion(
      () => axios.put(`api/clientes/editar/${encodeURIComponent(codigo)}`, datos, { headers: headers() }),
      'No se pudo editar el cliente',
    )

  const putActivarCliente = (codigo) =>
    accion(
      () => axios.put(`api/clientes/activar/${encodeURIComponent(codigo)}`, {}, { headers: headers() }),
      'No se pudo activar el cliente',
    )

  const putDesactivarCliente = (codigo) =>
    accion(
      () => axios.put(`api/clientes/desactivar/${encodeURIComponent(codigo)}`, {}, { headers: headers() }),
      'No se pudo desactivar el cliente',
    )

  return {
    loading,
    obtenerClientes,
    obtenerdatoscliente,
    postCliente,
    putCliente,
    putActivarCliente,
    putDesactivarCliente,
  }
})
