import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { useStoreUsuarios } from './usuarios'

export const useStoreVehiculos = defineStore(
  'Vehiculo',
  () => {
    let loading = ref(false)
    let vehiculos = ref([])
    // const useUsuario = useStoreUsuarios()

const obtenerVehiculos = async () => {
      const useUsuario = useStoreUsuarios()
  loading.value = true
  try {
    let response = await axios.get(`api/vehiculos/`, {
      headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
      },
    })
    console.log('Respuesta vehiculo:', response.data)
    return response.data 
  } catch (error) {
    console.error('No se pudo obtener el vehiculo', error)
    return { resumen: null }
  } finally {
    loading.value = false
  }
}

const obtenerResumenPorPlaca = async (placa) => {
      const useUsuario = useStoreUsuarios()
  loading.value = true
  try {
    let response = await axios.get(`api/vehiculos/resumen-solicitante/placa/${placa}`, {
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

const obtenerVehiculosOrdenados = async (tipo = 'fecha', orden = 'desc') => {
      const useUsuario = useStoreUsuarios()
   
  loading.value = true;    
    try {
      const response = await axios.get(`api/vehiculos/ordenados`, {
        params: { tipo, orden },
        headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
        },
      });
      
      return response.data;
    } catch (err) {
      console.error(`No se pudo obtener los vehiculos ordenados por ${tipo}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

const obtenerVehiculosFiltrados = async (tipo, valor) => {
    const useUsuario = useStoreUsuarios()

      loading.value = true;
  // console.log(`Enviando petición: tipo=${tipo}, valor=${valor}`);
  
  try {
    const response = await axios.get(`api/vehiculos/filtrados`, {
      params: { tipo, valor },  // Asegúrate de que estos nombres coincidan con el backend
      headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
      },
    });
    
    // console.log("Respuesta del servidor:", response.data);
    return response.data;
  } catch (err) {
    console.error(`No se pudo obtener los vehiculos filtrados por ${tipo}:`, err);
    console.error("Detalles del error:", err.response?.data || err.message);
    throw err;
  } finally {
    loading.value = false;
  }
};

    const obtenerdatodevehiculo = async (placa) => {
          const useUsuario = useStoreUsuarios()
      try {
        let response = await axios.get(`api/vehiculos/obtenerdatosvehiculo/${placa}`, {
          headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta desde store:', response.data)
        return response.data
      } catch (error) {
        console.error('No se pudo obtener los datos del vehiculo', error)
        return null
      } finally {
        loading.value = false
      }
    }

    const postVehiculo = async (formData) => {
          const useUsuario = useStoreUsuarios()
      try {
        loading.value = true
        console.log('Enviando datos al servidor...')
        const response = await axios.post('api/vehiculos/crear', formData, {
          headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta recibida:', response)

        Notify.create({
          message: 'vehiculo creado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al registrar vehiculo',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }
   
        const postResumenVehiculoMensual = async (formData) => {
          const useUsuario = useStoreUsuarios()
      try {
        loading.value = true
        console.log('Enviando datos al servidor...')
        const response = await axios.post('api/resumenvehiculo/resumen-vehiculo/mensual', formData, {
          headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta recibida:', response)

        Notify.create({
          message: 'Resumen mensual creado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al registrar resumen mensual',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

const postResumenVehiculoAnual = async (formData) => {
     const useUsuario = useStoreUsuarios()
      try {
        loading.value = true
        console.log('Enviando datos al servidor...')
        const response = await axios.post('api/resumenvehiculo/resumen-vehiculo/anual', formData, {
          headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta recibida:', response)

        Notify.create({
          message: 'Resumen anual creado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al registrar resumen anual',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

    const putVehiculo = async (placa, formData) => {
        const useUsuario = useStoreUsuarios()
      try {
        loading.value = true
        console.log('Enviando datos al servidor...')
        const response = await axios.put(`api/vehiculos/editar/${placa}`, formData, {
          headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta recibida:', response)

        Notify.create({
          message: 'Vehiculo editado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al editar vehiculo',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

    const putActivarVehiculo = async (placa, formData) => {
        const useUsuario = useStoreUsuarios()
      try {
        loading.value = true
        console.log('Enviando datos al servidor...')
        const response = await axios.put(`api/vehiculos/activar/${placa}`, formData, {
          headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta recibida:', response)

        Notify.create({
          message: 'Vehiculo activado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al activar vehiculo',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

    const putDesactivarVehiculo = async (placa, formData) => {
         const useUsuario = useStoreUsuarios()
      try {
        loading.value = true
        console.log('Enviando datos al servidor...')
        const response = await axios.put(`api/vehiculos/desactivar/${placa}`, formData, {
          headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta recibida:', response)

        Notify.create({
          message: 'Vehiculo desactivado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al desactivar vehiculo',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

    return {
      obtenerdatodevehiculo,
      obtenerVehiculos,
      obtenerResumenPorPlaca,
      obtenerVehiculosFiltrados,
      obtenerVehiculosOrdenados,
      postVehiculo,
      postResumenVehiculoMensual,
      postResumenVehiculoAnual,
      putVehiculo,
      putActivarVehiculo,
      putDesactivarVehiculo,
      loading,
      vehiculos,
      // useUsuario,
    }
  },
  { persist: true },
)
