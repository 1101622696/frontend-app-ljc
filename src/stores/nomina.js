import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { useStoreUsuarios } from './usuarios'

export const useStoreNominas = defineStore(
  'Nomina',
  () => {
    let loading = ref(false)
    let nominas = ref([])
    // const useUsuario = useStoreUsuarios()
const obtenerNominas = async () => {
     const useUsuario = useStoreUsuarios()
  loading.value = true
  try {
    let response = await axios.get(`api/nomina/`, {
      headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
      },
    })
    console.log('Respuesta nomina:', response.data)
    return response.data 
  } catch (error) {
    console.error('No se pudo obtener el nomina', error)
    return { resumen: null }
  } finally {
    loading.value = false
  }
}

const obtenerResumenNominaPorEmail = async () => {
     const useUsuario = useStoreUsuarios()
  loading.value = true
  try {
    let response = await axios.get(`api/nomina/resumen-nomina-solicitante`, {
      headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
      },
    })
    console.log('Respuesta nomina:', response.data)
    return response.data 
  } catch (error) {
    console.error('No se pudo obtener el nomina', error)
    return { resumen: null }
  } finally {
    loading.value = false
  }
}


 const obtenerNominaOrdenados = async (tipo = 'fecha', orden = 'desc') => {
      const useUsuario = useStoreUsuarios()
   
  loading.value = true;    
    try {
      const response = await axios.get(`api/nomina/ordenados`, {
        params: { tipo, orden },
        headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
        },
      });
      
      return response.data;
    } catch (err) {
      console.error(`No se pudo obtener las nominas ordenadas por ${tipo}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const obtenerNominaFiltrados = async (tipo, valor) => {
      const useUsuario = useStoreUsuarios()
  
    loading.value = true;
  // console.log(`Enviando petición: tipo=${tipo}, valor=${valor}`);
  
  try {
    const response = await axios.get(`api/nomina/filtrados`, {
      params: { tipo, valor },  // Asegúrate de que estos nombres coincidan con el backend
      headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,      
      },
    });
    
    // console.log("Respuesta del servidor:", response.data);
    return response.data;
  } catch (err) {
    console.error(`No se pudo obtener las nominas filtradas por ${tipo}:`, err);
    console.error("Detalles del error:", err.response?.data || err.message);
    throw err;
  } finally {
    loading.value = false;
  }
};

const calcularNomina = async (email) => {
     const useUsuario = useStoreUsuarios()
  loading.value = true
  try {
    let response = await axios.get(`api/nomina/calcular-nomina/${email}`, {
      headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
      },
    })
    console.log('Respuesta nomina calculada:', response.data)
    return response.data 
  } catch (error) {
    console.error('No se pudo obtener la nomina calculada', error)
    return { resumen: null }
  } finally {
    loading.value = false
  }
}

    const obtenerdatodenomina = async (consecutivo) => {
        const useUsuario = useStoreUsuarios()
      try {
        let response = await axios.get(`api/nomina/obtenerdatosnomina/${consecutivo}`, {
          headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta desde store:', response.data)
        return response.data
      } catch (error) {
        console.error('No se pudo obtener los datos de la nomina', error)
        return null
      } finally {
        loading.value = false
      }
    }

        const postAprobarNomina = async (email, formData) => {
       const useUsuario = useStoreUsuarios()
      try {
        loading.value = true
        console.log('Enviando datos al servidor...')
        const response = await axios.post(`api/nomina/aprobar-nomina/${email}`, formData, {
          headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta recibida:', response)

        Notify.create({
          message: 'Nomina aprobada correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al aprobar nomina',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

    const postPagarSalario = async (email, formData) => {
        const useUsuario = useStoreUsuarios()
      try {
        loading.value = true
        console.log('Enviando datos al servidor...')
        const response = await axios.post(`api/nomina/pagar-salario/${email}`, formData, {
          headers: {
        // "x-token": localStorage.getItem('x-token')
        'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta recibida:', response)

        Notify.create({
          message: 'Salario pagado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al pagar salario',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

       return {
      obtenerdatodenomina,
      obtenerNominas,
      obtenerNominaFiltrados,
      obtenerNominaOrdenados,
      calcularNomina,
      obtenerResumenNominaPorEmail,
      postAprobarNomina,
      postPagarSalario,
      loading,
      nominas,
      // useUsuario,
    }
  },
  { persist: true },
)
