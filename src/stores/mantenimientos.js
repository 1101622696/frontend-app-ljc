import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { useStoreUsuarios } from './usuarios'

export const useStoreMantenimiento = defineStore(
  'Mantenimiento',
  () => {
    let loading = ref(false)
    let mantenimientos = ref([])

    const obtenerMantenimientos = async () => {
      const useUsuario = useStoreUsuarios()
      loading.value = true
      try {
        let response = await axios.get(`api/mantenimientos`, {
          headers: {
            'x-token': useUsuario.token,
          },
        })
        return Array.isArray(response.data) ? response.data : response.data.mantenimientos || []
      } catch (error) {
        console.error('No se pudo obtener los mantenimientos', error)
        return []
      } finally {
        loading.value = false
      }
    }

    const obtenerdatodemantenimiento = async (consecutivo) => {
      const useUsuario = useStoreUsuarios()
      loading.value = true
      try {
        let response = await axios.get(
          `api/mantenimientos/obtenerdatosmantenimiento/${consecutivo}`,
          {
            headers: {
                'x-token': useUsuario.token,
            },
          },
        )
        return response.data
      } catch (error) {
        console.error('No se pudo obtener los datos del mantenimiento', error)
        return null
      } finally {
        loading.value = false
      }
    }

    const obtenerResumenPorPlaca = async (placa) => {
      const useUsuario = useStoreUsuarios()
      loading.value = true
      try {
        let response = await axios.get(`api/mantenimientos/resumen-solicitante/placa/${placa}`, {
          headers: {
            'x-token': useUsuario.token,
          },
        })
        return response.data
      } catch (error) {
        console.error('No se pudo obtener el resumen por placa', error)
        return { resumen: null }
      } finally {
        loading.value = false
      }
    }

    const obtenerMantenimientosOrdenados = async (tipo = 'fecha', orden = 'desc') => {
      const useUsuario = useStoreUsuarios()

      loading.value = true
      try {
        const response = await axios.get(`api/mantenimientos/ordenados`, {
          params: { tipo, orden },
          headers: {
            'x-token': useUsuario.token,
          },
        })

        return response.data
      } catch (err) {
        console.error(`No se pudo obtener los mantenimientos ordenados por ${tipo}:`, err)
        throw err
      } finally {
        loading.value = false
      }
    }

    const obtenerMantenimientosFiltrados = async (tipo, valor) => {
      const useUsuario = useStoreUsuarios()

      loading.value = true

      try {
        const response = await axios.get(`api/mantenimientos/filtrados`, {
          params: { tipo, valor }, 
          headers: {
            'x-token': useUsuario.token,
          },
        })

        return response.data
      } catch (err) {
        console.error(`No se pudo obtener los mantenimientos filtrados por ${tipo}:`, err)
        console.error('Detalles del error:', err.response?.data || err.message)
        throw err
      } finally {
        loading.value = false
      }
    }

    const postMantenimiento = async (formData) => {
      const useUsuario = useStoreUsuarios()
      try {
        loading.value = true
        const response = await axios.post('api/mantenimientos/crear', formData, {
          headers: {
            'x-token': useUsuario.token,
          },
        })
        Notify.create({
          message: 'mantenimiento creado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al crear mantenimiento',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

    const putMantenimiento = async (consecutivo, formData) => {
      const useUsuario = useStoreUsuarios()
      try {
        loading.value = true
        const response = await axios.put(`api/mantenimientos/editar/${consecutivo}`, formData, {
          headers: {
            'x-token': useUsuario.token,
          },
        })
        Notify.create({
          message: 'mantenimiento editado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al editar mantenimiento',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

    return {
      obtenerMantenimientos,
      obtenerResumenPorPlaca,
      obtenerdatodemantenimiento,
      obtenerMantenimientosFiltrados,
      obtenerMantenimientosOrdenados,
      postMantenimiento,
      putMantenimiento,
      loading,
      mantenimientos,
    }
  },
  { persist: true },
)
