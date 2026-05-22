import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { useStoreUsuarios } from './usuarios'

export const useStorePrestamos = defineStore(
  'Prestamo',
  () => {
    let loading = ref(false)
    let prestamos = ref([])
    // const useUsuario = useStoreUsuarios()

const obtenerPrestamos = async () => {
      const useUsuario = useStoreUsuarios()
  loading.value = true
  try {
    let response = await axios.get(`api/prestamos/`, {
      headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
      },
    })
    console.log('Respuesta prestamo:', response.data)
    return response.data 
  } catch (error) {
    console.error('No se pudo obtener el prestamo', error)
    return { resumen: null }
  } finally {
    loading.value = false
  }
}

const obtenerResumenPorEmail = async (email) => {
     const useUsuario = useStoreUsuarios()
  loading.value = true
  try {
    let response = await axios.get(`api/prestamos/resumen-solicitante/${email}`, {
      headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
      },
    })
    console.log('Respuesta resumen por email:', response.data)
    return response.data 
  } catch (error) {
    console.error('No se pudo obtener el resumen por email', error)
    return { resumen: null }
  } finally {
    loading.value = false
  }
}

const obtenerPrestamosPorPropietario = async () => {
      const useUsuario = useStoreUsuarios()
  loading.value = true
  try {
    let response = await axios.get(`api/prestamos/resumen-propietario`, {
      headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
      },
    })
    console.log('Respuesta prestamo:', response.data)
    return response.data 
  } catch (error) {
    console.error('No se pudo obtener el prestamo', error)
    return { resumen: null }
  } finally {
    loading.value = false
  }
}

    const obtenerdatodelprestamo = async (consecutivo) => {
      const useUsuario = useStoreUsuarios()
      try {
        let response = await axios.get(`api/prestamos/obtenerdatosprestamo/${consecutivo}`, {
          headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta desde store:', response.data)
        return response.data
      } catch (error) {
        console.error('No se pudo obtener los datos del préstamo', error)
        return null
      } finally {
        loading.value = false
      }
    }

    const postPrestamo = async (formData) => {
         const useUsuario = useStoreUsuarios()
      try {
        loading.value = true
        console.log('Enviando datos al servidor...')
        const response = await axios.post('api/prestamos/crear', formData, {
          headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta recibida:', response)

        Notify.create({
          message: 'prestamo creado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al registrar prestamo',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }
   
    const putPrestamo = async (consecutivo, formData) => {
          const useUsuario = useStoreUsuarios()
      try {
        loading.value = true
        console.log('Enviando datos al servidor...')
        const response = await axios.put(`api/prestamos/editar/${consecutivo}`, formData, {
          headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta recibida:', response)

        Notify.create({
          message: 'Préstamo editado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al editar préstamo',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

    return {
      obtenerdatodelprestamo,
      obtenerPrestamos,
      obtenerResumenPorEmail,
      obtenerPrestamosPorPropietario,
      postPrestamo,
      putPrestamo,
      loading,
      prestamos,
      // useUsuario,
    }
  },
  { persist: true },
)
