import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { useStoreUsuarios } from './usuarios'

export const useStoreViajes = defineStore(
  'Viaje',
  () => {
    let loading = ref(false)
    let viajes = ref([])

    const obtenerViajes = async (pagina = 1) => {
      const useUsuario = useStoreUsuarios()
      loading.value = true
      try {
        const response = await axios.get(`api/viajes/`, {
          params: { pagina, limite: 50 },
          headers: { 'x-token': useUsuario.token },
        })
        return response.data
      } catch (error) {
        console.error('No se pudo obtener el viaje', error)
        return { datos: [], hayMas: false }
      } finally {
        loading.value = false
      }
    }

    const obtenerResumenPorEmail = async (email) => {
      const useUsuario = useStoreUsuarios()
      loading.value = true
      try {
        let response = await axios.get(`api/viajes/resumen-solicitante/${email}`, {
          headers: {
            'x-token': useUsuario.token,
          },
        })
        return response.data
      } catch (error) {
        console.error('No se pudo obtener el resumen por email', error)
        return { resumen: null }
      } finally {
        loading.value = false
      }
    }

    const obtenerResumenPorPlaca = async (placa) => {
      const useUsuario = useStoreUsuarios()
      loading.value = true
      try {
        let response = await axios.get(`api/viajes/resumen-solicitante/placa/${placa}`, {
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

    const obtenerViajesOrdenados = async (tipo = 'fecha', orden = 'desc') => {
      const useUsuario = useStoreUsuarios()

      loading.value = true
      try {
        const response = await axios.get(`api/viajes/ordenados`, {
          params: { tipo, orden },
          headers: {
            'x-token': useUsuario.token,
          },
        })

        return response.data
      } catch (err) {
        console.error(`No se pudo obtener los viajes ordenados por ${tipo}:`, err)
        throw err
      } finally {
        loading.value = false
      }
    }

    const obtenerViajesFiltrados = async (tipo, valor) => {
      const useUsuario = useStoreUsuarios()

      loading.value = true

      try {
        const response = await axios.get(`api/viajes/filtrados`, {
          params: { tipo, valor },
          headers: {
            'x-token': useUsuario.token,
          },
        })

        return response.data
      } catch (err) {
        console.error(`No se pudo obtener los viajes filtrados por ${tipo}:`, err)
        console.error('Detalles del error:', err.response?.data || err.message)
        throw err
      } finally {
        loading.value = false
      }
    }

    const facturarCliente = async (codigoCliente) => {
      const useUsuario = useStoreUsuarios()
      loading.value = true
      try {
        let response = await axios.get(`api/viajes/facturar-cliente/${codigoCliente}`, {
          headers: {
            'x-token': useUsuario.token,
          },
        })
        return response.data
      } catch (error) {
        console.error('No se pudo obtener la facturando cliente', error)
        return { resumen: null }
      } finally {
        loading.value = false
      }
    }

    const obtenerGastos = async (consecutivo) => {
      const useUsuario = useStoreUsuarios()
      loading.value = true
      try {
        let response = await axios.get(`api/viajes/gastos/${consecutivo}`, {
          headers: {
            'x-token': useUsuario.token,
          },
        })
        return response.data
      } catch (error) {
        console.error('No se pudo obtener los gastos', error)
        return []
      } finally {
        loading.value = false
      }
    }

    const obtenerdatodeviaje = async (consecutivo) => {
      const useUsuario = useStoreUsuarios()
      try {
        let response = await axios.get(`api/viajes/obtenerdatosviajes/${consecutivo}`, {
          headers: {
            'x-token': useUsuario.token,
          },
        })
        return response.data
      } catch (error) {
        console.error('No se pudo obtener los datos del viaje', error)
        return null
      } finally {
        loading.value = false
      }
    }

    const obtenerArchivosCarpeta = async (folderId = null, fileId = null) => {
      const useUsuario = useStoreUsuarios()

      try {
        const params = {}
        if (folderId) params.folderId = folderId
        if (fileId) params.fileId = fileId

        const response = await axios.get(`api/drive/drive-archivos`, {
          params,
          headers: {
            'x-token': useUsuario.token,
          },
        })

        return response.data
      } catch (error) {
        console.error('Error al obtener archivos:', error)
        return []
      }
    }

    const postViaje = async (formData) => {
      const useUsuario = useStoreUsuarios()
      try {
        loading.value = true
        const response = await axios.post('api/viajes/crear', formData, {
          headers: {
            'x-token': useUsuario.token,
          },
        })
        Notify.create({
          message: 'viaje creado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al crear el viaje',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

    const putViaje = async (consecutivo, formData) => {
      const useUsuario = useStoreUsuarios()
      try {
        loading.value = true
        const response = await axios.put(`api/viajes/editar/${consecutivo}`, formData, {
          headers: {
            'x-token': useUsuario.token,
          },
        })

        Notify.create({
          message: 'Viaje editado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al editar el viaje',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

    const putCerrarViajeConductor = async (consecutivo, formData) => {
      const useUsuario = useStoreUsuarios()
      try {
        loading.value = true
        const response = await axios.put(`api/viajes/cerrar-conductor/${consecutivo}`, formData, {
          headers: {
            'x-token': useUsuario.token,
          },
        })
        console.log('Respuesta recibida:', response)

        Notify.create({
          message: 'Viaje cerrado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al cerrar el viaje',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

    const putAprobarPropietario = async (consecutivo, formData) => {
      const useUsuario = useStoreUsuarios()
      try {
        loading.value = true
        const response = await axios.put(
          `api/viajes/aprobar-propietario/${consecutivo}`,
          formData,
          {
            headers: {
              'x-token': useUsuario.token,
            },
          },
        )
        Notify.create({
          message: 'Viaje aprobado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al aprobar por propietario',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

    const putCompletarSaldo = async (consecutivo, formData) => {
      const useUsuario = useStoreUsuarios()
      try {
        loading.value = true
        const response = await axios.put(`api/viajes/completar-saldo/${consecutivo}`, formData, {
          headers: {
            'x-token': useUsuario.token,
          },
        })

        Notify.create({
          message: 'Saldo del viaje completado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al completar el saldo del viaje',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

    const putFacturarViaje = async (consecutivo, formData) => {
      const useUsuario = useStoreUsuarios()
      try {
        loading.value = true
        const response = await axios.put(`api/viajes/facturar/${consecutivo}`, formData, {
          headers: {
            'x-token': useUsuario.token,
          },
        })
        Notify.create({
          message: 'Viaje facturado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al facturar el viaje',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

    const putLegalizarFactura = async (consecutivo, formData) => {
      const useUsuario = useStoreUsuarios()
      try {
        loading.value = true
        const response = await axios.put(`api/viajes/legalizar-factura/${consecutivo}`, formData, {
          headers: {
            'x-token': useUsuario.token,
          },
        })
        Notify.create({
          message: 'Viaje legalizado correctamente',
          color: 'positive',
          position: 'bottom',
        })

        return response
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: error.response?.data?.mensaje || 'Error al legalizar la factura',
        })
        loading.value = true
        console.log(error)
        return error
      } finally {
        loading.value = false
      }
    }

    return {
      obtenerdatodeviaje,
      obtenerViajes,
      obtenerResumenPorPlaca,
      obtenerViajesFiltrados,
      obtenerViajesOrdenados,
      facturarCliente,
      obtenerGastos,
      obtenerResumenPorEmail,
      obtenerArchivosCarpeta,
      postViaje,
      putViaje,
      putCerrarViajeConductor,
      putAprobarPropietario,
      putCompletarSaldo,
      putFacturarViaje,
      putLegalizarFactura,
      loading,
      viajes,
    }
  },
  { persist: true },
)
