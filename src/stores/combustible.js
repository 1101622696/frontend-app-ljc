import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { useStoreUsuarios } from './usuarios'

export const useStoreCombustible = defineStore(
  'Combustible',
  () => {
    let loading = ref(false)
    let combustible = ref([])
    // const useUsuario = useStoreUsuarios()

    // const obtenerCombustible = async () => {
    //   const useUsuario = useStoreUsuarios()
    //   loading.value = true
    //   try {
    //     let response = await axios.get(`api/combustible`, {
    //       headers: {
    //         // "x-token": localStorage.getItem('x-token')
    //         'x-token': useUsuario.token,
    //       },
    //     })
    //     console.log('Respuesta combustible:', response.data)
    //     return response.data
    //   } catch (error) {
    //     console.error('No se pudo obtener el combustible', error)
    //     return { resumen: null }
    //   } finally {
    //     loading.value = false
    //   }
    // }

    const obtenerCombustible = async (pagina = 1) => {
  const useUsuario = useStoreUsuarios()
  loading.value = true
  try {
    const response = await axios.get(`api/combustible`, {
      params: { pagina, limite: 50 },
      headers: { 'x-token': useUsuario.token },
    })
    return response.data
  } catch (error) {
    console.error('No se pudo obtener el combustible', error)
    return { datos: [], hayMas: false }
  } finally {
    loading.value = false
  }
}

    const obtenerdatosdecombustible = async (consecutivo) => {
      const useUsuario = useStoreUsuarios()

      try {
        let response = await axios.get(`api/combustible/obtenerdatoscombustible/${consecutivo}`, {
          headers: {
            // "x-token": localStorage.getItem('x-token')
            'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta desde store:', response.data)
        return response.data
      } catch (error) {
        console.error('No se pudo obtener los datos del combustible', error)
        return null
      } finally {
        loading.value = false
      }
    }

    const obtenerResumenPorPlaca = async (placa) => {
      const useUsuario = useStoreUsuarios()
      loading.value = true
      try {
        let response = await axios.get(`api/combustible/resumen-solicitante/placa/${placa}`, {
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

    const obtenerCombustiblesOrdenados = async (tipo = 'fecha', orden = 'desc') => {
      const useUsuario = useStoreUsuarios()

      loading.value = true
      try {
        const response = await axios.get(`api/combustible/ordenados`, {
          params: { tipo, orden },
          headers: {
            // "x-token": localStorage.getItem('x-token')
            'x-token': useUsuario.token,
          },
        })

        return response.data
      } catch (err) {
        console.error(`No se pudo obtener combustible ordenados por ${tipo}:`, err)
        throw err
      } finally {
        loading.value = false
      }
    }

    const obtenerCombustiblesFiltrados = async (tipo, valor) => {
      const useUsuario = useStoreUsuarios()

      loading.value = true
      // console.log(`Enviando petición: tipo=${tipo}, valor=${valor}`);

      try {
        const response = await axios.get(`api/combustible/filtrados`, {
          params: { tipo, valor }, // Asegúrate de que estos nombres coincidan con el backend
          headers: {
            // "x-token": localStorage.getItem('x-token')
            'x-token': useUsuario.token,
          },
        })

        // console.log("Respuesta del servidor:", response.data);
        return response.data
      } catch (err) {
        console.error(`No se pudo obtener combustible filtrados por ${tipo}:`, err)
        console.error('Detalles del error:', err.response?.data || err.message)
        throw err
      } finally {
        loading.value = false
      }
    }

    const postCombustible = async (formData) => {
      const useUsuario = useStoreUsuarios()

      try {
        loading.value = true
        console.log('Enviando datos al servidor...')
        const response = await axios.post('api/combustible/crear', formData, {
          headers: {
            // "x-token": localStorage.getItem('x-token')
            'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta recibida:', response)

        Notify.create({
          message: 'Combustible creado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al registrar combustible',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

    const putLegalizarCombustible = async (consecutivo, data) => {
      const useUsuario = useStoreUsuarios()
      try {
        loading.value = true

        const response = await axios.put(`api/combustible/legalizar/${consecutivo}`, data, {
          headers: {
            // "x-token": localStorage.getItem('x-token')
            'x-token': useUsuario.token,
          },
        })

        Notify.create({
          message: 'Combustible legalizado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al legalizar',
        })
        return error
      } finally {
        loading.value = false
      }
    }

    const putCombustible = async (consecutivo, formData) => {
      const useUsuario = useStoreUsuarios()
      try {
        loading.value = true
        console.log('Enviando datos al servidor...')
        const response = await axios.put(`api/combustible/editar/${consecutivo}`, formData, {
          headers: {
            // "x-token": localStorage.getItem('x-token')
            'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta recibida:', response)

        Notify.create({
          message: 'combustible editado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al registrar combustible',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

    return {
      obtenerCombustible,
      obtenerdatosdecombustible,
      obtenerResumenPorPlaca,
      obtenerCombustiblesOrdenados,
      obtenerCombustiblesFiltrados,
      postCombustible,
      putLegalizarCombustible,
      putCombustible,
      loading,
      combustible,
      // useUsuario,
    }
  },
  { persist: true },
)
