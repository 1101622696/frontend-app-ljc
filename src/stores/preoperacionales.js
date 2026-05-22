import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { useStoreUsuarios } from './usuarios'

export const useStorePreoperacionales = defineStore(
  'Preoperacional',
  () => {
    let loading = ref(false)
    let preoperacionales = ref([])
    // const useUsuario = useStoreUsuarios()

    const obtenerPreoperacionales = async () => {
      const useUsuario = useStoreUsuarios()
      loading.value = true
      try {
        let response = await axios.get(`api/preoperacionales/`, {
          headers: {
            // "x-token": localStorage.getItem('x-token')
            'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta preoperacional:', response.data)
        return response.data
      } catch (error) {
        console.error('No se pudo obtener el preoperacional', error)
        return { resumen: null }
      } finally {
        loading.value = false
      }
    }

    const obtenerResumenPorPlaca = async (placa) => {
      const useUsuario = useStoreUsuarios()
      loading.value = true
      try {
        let response = await axios.get(`api/preoperacionales/resumen-solicitante/placa/${placa}`, {
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

    const obtenerdatospreoperacional = async (consecutivo) => {
      const useUsuario = useStoreUsuarios()
      try {
        let response = await axios.get(
          `api/preoperacionales/obtenerdatospreoperacional/${consecutivo}`,
          {
            headers: {
              // "x-token": localStorage.getItem('x-token')
              'x-token': useUsuario.token,
            },
          },
        )
        console.log('Respuesta desde store:', response.data)
        return response.data
      } catch (error) {
        console.error('No se pudo obtener los datos del preoperacional', error)
        return null
      } finally {
        loading.value = false
      }
    }

    const postPreoperacional = async (formData) => {
      const useUsuario = useStoreUsuarios()
      try {
        loading.value = true
        console.log('Enviando datos al servidor...')
        const response = await axios.post('api/preoperacionales/crear', formData, {
          headers: {
            // "x-token": localStorage.getItem('x-token')
            'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta recibida:', response)

        Notify.create({
          message: 'preoperacional creado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al registrar preoperacional',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

    const putPreoperacional = async (consecutivo, formData) => {
      const useUsuario = useStoreUsuarios()
      try {
        loading.value = true
        console.log('Enviando datos al servidor...')
        const response = await axios.put(`api/preoperacionales/editar/${consecutivo}`, formData, {
          headers: {
            // "x-token": localStorage.getItem('x-token')
            'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta recibida:', response)

        Notify.create({
          message: 'Preoperacional editado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al editar preoperacional',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

    return {
      obtenerdatospreoperacional,
      obtenerPreoperacionales,
      obtenerResumenPorPlaca,
      postPreoperacional,
      putPreoperacional,
      loading,
      preoperacionales,
      // useUsuario,
    }
  },
  { persist: true },
)
