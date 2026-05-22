import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { useStoreUsuarios } from './usuarios'

export const useStoreGastos = defineStore(
  'Gasto',
  () => {
    let loading = ref(false)
    let gastos = ref([])
    // const useUsuario = useStoreUsuarios()

    const obtenerGastos = async () => {
      const useUsuario = useStoreUsuarios()
      loading.value = true
      try {
        let response = await axios.get(`api/gastos/gastos-vehiculos`, {
          headers: {
            // "x-token": localStorage.getItem('x-token')
            'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta gasto:', response.data)
        return response.data
      } catch (error) {
        console.error('No se pudo obtener el gasto', error)
        return { resumen: null }
      } finally {
        loading.value = false
      }
    }

    const obtenerdatosdelgasto = async (consecutivo) => {
      const useUsuario = useStoreUsuarios()
      try {
        let response = await axios.get(`api/gastos/obtenerdatosgasto/${consecutivo}`, {
          headers: {
            // "x-token": localStorage.getItem('x-token')
            'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta desde store:', response.data)
        return response.data
      } catch (error) {
        console.error('No se pudo obtener los datos del gasto', error)
        return null
      } finally {
        loading.value = false
      }
    }

    const obtenerResumenPorPlaca = async (placa) => {
      const useUsuario = useStoreUsuarios()
      loading.value = true
      try {
        let response = await axios.get(`api/gastos/resumen-solicitante/placa/${placa}`, {
          headers: {
            // "x-token": localStorage.getItem('x-token')
            'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta resumen por placa:', response.data)
        return response.data
      } catch (error) {
        console.error('No se pudo obtener el resumen por placa', error)
        return { resumen: null }
      } finally {
        loading.value = false
      }
    }

    const obtenerGastosOrdenados = async (tipo = 'fecha', orden = 'desc') => {
      const useUsuario = useStoreUsuarios()

      loading.value = true
      try {
        const response = await axios.get(`api/gastos/ordenados`, {
          params: { tipo, orden },
          headers: {
            // "x-token": localStorage.getItem('x-token')
            'x-token': useUsuario.token,
          },
        })

        return response.data
      } catch (err) {
        console.error(`No se pudo obtener los gastos ordenados por ${tipo}:`, err)
        throw err
      } finally {
        loading.value = false
      }
    }

    const postGasto = async (formData) => {
      const useUsuario = useStoreUsuarios()
      try {
        loading.value = true
        console.log('Enviando datos al servidor...')
        const response = await axios.post('api/gastos/gastos-vehiculos', formData, {
          headers: {
            // "x-token": localStorage.getItem('x-token')
            'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta recibida:', response)

        Notify.create({
          message: 'gasto creado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al registrar gasto',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

    const putGasto = async (consecutivo, formData) => {
      const useUsuario = useStoreUsuarios()
      try {
        loading.value = true
        console.log('Enviando datos al servidor...')
        const response = await axios.put(`api/gastos/editar/${consecutivo}`, formData, {
          headers: {
            // "x-token": localStorage.getItem('x-token')
            'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta recibida:', response)

        Notify.create({
          message: 'gasto editado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al registrar gasto',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

    return {
      obtenerGastos,
      obtenerResumenPorPlaca,
      obtenerdatosdelgasto,
      obtenerGastosOrdenados,
      postGasto,
      putGasto,
      loading,
      gastos,
      // useUsuario,
    }
  },
  { persist: true },
)
