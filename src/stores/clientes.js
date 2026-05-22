import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { useStoreUsuarios } from './usuarios'

export const useStoreClientes = defineStore(
  'Cliente',
  () => {
    let loading = ref(false)
    let clientes = ref([])
    // const useUsuario = useStoreUsuarios()

const obtenerClientes = async () => {
    const useUsuario = useStoreUsuarios()

  loading.value = true
  try {
    let response = await axios.get(`api/clientes/`, {
      headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
      },
    })
    console.log('Respuesta cliente:', response.data)
    return response.data 
  } catch (error) {
    console.error('No se pudo obtener el cliente', error)
    return { resumen: null }
  } finally {
    loading.value = false
  }
}


     const obtenerClientesOrdenados = async (tipo = 'fecha', orden = 'desc') => {
      const useUsuario = useStoreUsuarios()
   
  loading.value = true;    
    try {
      const response = await axios.get(`api/clientes/ordenados`, {
        params: { tipo, orden },
        headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
        },
      });
      
      return response.data;
    } catch (err) {
      console.error(`No se pudo obtener los clientes ordenados por ${tipo}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

const obtenerClientesFiltrados = async (tipo, valor) => {
    const useUsuario = useStoreUsuarios()

      loading.value = true;
  // console.log(`Enviando petición: tipo=${tipo}, valor=${valor}`);
  
  try {
    const response = await axios.get(`api/clientes/filtrados`, {
      params: { tipo, valor },  // Asegúrate de que estos nombres coincidan con el backend
      headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
      },
    });
    
    // console.log("Respuesta del servidor:", response.data);
    return response.data;
  } catch (err) {
    console.error(`No se pudo obtener los clientes filtrados por ${tipo}:`, err);
    console.error("Detalles del error:", err.response?.data || err.message);
    throw err;
  } finally {
    loading.value = false;
  }
};

    const obtenerdatoscliente = async (codigo) => {
    const useUsuario = useStoreUsuarios()

      try {
        let response = await axios.get(`api/clientes/obtenerdatoscliente/${codigo}`, {
          headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta desde store:', response.data)
        return response.data
      } catch (error) {
        console.error('No se pudo obtener los datos del cliente', error)
        return null
      } finally {
        loading.value = false
      }
    }

    const postCliente = async (formData) => {
    const useUsuario = useStoreUsuarios()

      try {
        loading.value = true
        console.log('Enviando datos al servidor...')
        const response = await axios.post('api/clientes/crear', formData, {
          headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta recibida:', response)

        Notify.create({
          message: 'Cliente creado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
      message: error.response?.data?.mensaje || 'Error al crear',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }
   
    const putCliente = async (codigo, formData) => {
    const useUsuario = useStoreUsuarios()

      try {
        loading.value = true
        console.log('Enviando datos al servidor...')
        const response = await axios.put(`api/clientes/editar/${codigo}`, formData, {
          headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta recibida:', response)

        Notify.create({
          message: 'Cliente editado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al registrar gasto'
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

    const putActivarCliente = async (codigo, formData) => {
    const useUsuario = useStoreUsuarios()

      try {
        loading.value = true
        console.log('Enviando datos al servidor...')
        const response = await axios.put(`api/clientes/activar/${codigo}`, formData, {
          headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta recibida:', response)

        Notify.create({
          message: 'Cliente activado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al activar cliente',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

    const putDesactivarCliente = async (codigo, formData) => {
    const useUsuario = useStoreUsuarios()

      try {
        loading.value = true
        console.log('Enviando datos al servidor...')
        const response = await axios.put(`api/clientes/desactivar/${codigo}`, formData, {
          headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta recibida:', response)

        Notify.create({
          message: 'Cliente desactivado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al desactivar cliente',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

    return {
      obtenerdatoscliente,
      obtenerClientes,
      obtenerClientesFiltrados,
      obtenerClientesOrdenados,
      postCliente,
      putCliente,
      putActivarCliente,
      putDesactivarCliente,
      loading,
      clientes,
      // useUsuario,
    }
  },
  { persist: true },
)
