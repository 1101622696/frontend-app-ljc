import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { useStoreUsuarios } from './usuarios'

export const useStoreSolicitudes = defineStore(
  'Solicitud',
  () => {
    let loading = ref(false)
    let solicitudes = ref([])
    // const useUsuario = useStoreUsuarios()

const obtenerSolicitudes = async () => {
      const useUsuario = useStoreUsuarios()
  loading.value = true
  try {
    let response = await axios.get(`api/solicitudes/`, {
      headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
      },
    })
    console.log('Respuesta resumen:', response.data)
    return response.data
  } catch (error) {
    console.error('No se pudo obtener la solicitud', error)
    return { resumen: null }
  } finally {
    loading.value = false
  }
}

const obtenerResumenPorPlaca = async (placa) => {
      const useUsuario = useStoreUsuarios()
  loading.value = true
  try {
    let response = await axios.get(`api/solicitudes/resumen-solicitante/placa/${placa}`, {
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

    const obtenerdatodessolicitud = async (consecutivo) => {
      const useUsuario = useStoreUsuarios()
      try {
        let response = await axios.get(`api/solicitudes/obtenerdatossolicitud/${consecutivo}`, {
          headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta desde store:', response.data)
        return response.data
      } catch (error) {
        console.error('No se pudo obtener los datos de la solicitud', error)
        return null
      } finally {
        loading.value = false
      }
    }

    const postSolicitud = async (formData) => {
         const useUsuario = useStoreUsuarios()
      try {
        loading.value = true
        console.log('Enviando datos al servidor...')
        const response = await axios.post('api/solicitudes/crear', formData, {
          headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta recibida:', response)

        Notify.create({
          message: 'solicitud creada correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al registrar solicitud',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

    return {
      obtenerdatodessolicitud,
      obtenerResumenPorPlaca,
      obtenerSolicitudes,
      postSolicitud,
      loading,
      solicitudes,
      // useUsuario,
    }
  },
  { persist: true },
)
