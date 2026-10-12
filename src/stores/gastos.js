import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { useStoreUsuarios } from './usuarios'
import { mensajeDeError } from '../utils/formato'

// Libro de gastos de los vehículos (solo administrador y propietario).
// Consultas: devuelven datos (o vacío) y muestran el error.
// Acciones (registrar / editar): lanzan Error con el mensaje del backend para que el diálogo no se cierre.

/** 'SNT473, sta778' → ['SNT473', 'STA778'] */
const placasDelUsuario = (usuario) =>
  String(usuario?.placa_asignada ?? '')
    .split(',')
    .map((p) => p.replace(/\s+/g, '').toUpperCase())
    .filter(Boolean)

export const useStoreGastos = defineStore('Gasto', () => {
  const loading = ref(false)

  const headers = () => ({ 'x-token': useStoreUsuarios().token })

  const avisarError = (error, porDefecto) =>
    Notify.create({ type: 'negative', message: mensajeDeError(error, porDefecto), position: 'bottom' })

  async function accion(fn, porDefecto) {
    loading.value = true
    try {
      const { data } = await fn()
      // advertencia: el gasto quedó, pero algo no (p. ej. no subieron los soportes)
      if (data?.mensaje) {
        Notify.create({ type: data.advertencia ? 'warning' : 'positive', message: data.mensaje, position: 'bottom', timeout: data.advertencia ? 8000 : 2500 })
      }
      return data
    } catch (error) {
      throw new Error(mensajeDeError(error, porDefecto))
    } finally {
      loading.value = false
    }
  }

  // ── Consultas ──

  /**
   * Todos los gastos que el usuario puede ver, más reciente primero (el backend ya los ordena).
   * Admin: el libro completo. Propietario: solo sus placas (resumen-solicitante acepta varias separadas por coma).
   * Cada gasto trae `editable` (true solo los manuales).
   */
  const listarGastos = async () => {
    const usuario = useStoreUsuarios()
    loading.value = true
    try {
      if (usuario.esAdmin) {
        const { data } = await axios.get('api/gastos/gastos-vehiculos', { headers: headers() })
        return Array.isArray(data) ? data : []
      }
      const placas = placasDelUsuario(usuario.user)
      if (!placas.length) return []
      const { data } = await axios.get(`api/gastos/resumen-solicitante/placa/${encodeURIComponent(placas.join(','))}`, {
        headers: headers(),
      })
      return data?.resumen?.total?.consecutivos || []
    } catch (error) {
      avisarError(error, 'No se pudieron cargar los gastos')
      return []
    } finally {
      loading.value = false
    }
  }

  /** Vehículos que el usuario puede ver (el backend filtra por perfil) */
  const listarVehiculos = async () => {
    try {
      const { data } = await axios.get('api/vehiculos', { headers: headers() })
      return Array.isArray(data) ? data : []
    } catch (error) {
      avisarError(error, 'No se pudieron cargar los vehículos')
      return []
    }
  }

  // ── Acciones (lanzan Error) ──

  /** Los datos van como multipart para poder llevar los soportes (campo 'archivos') */
  const comoFormData = ({ archivos = [], ...datos }) => {
    const fd = new FormData()
    Object.entries(datos).forEach(([clave, valor]) => {
      if (valor !== undefined && valor !== null) fd.append(clave, valor)
    })
    archivos.forEach((archivo) => fd.append('archivos', archivo))
    return fd
  }

  /** { placa, tipo_gasto, valor_gasto, fecha_registro, descripcion, archivos } */
  const registrarGasto = (datos) =>
    accion(
      () => axios.post('api/gastos/gastos-vehiculos', comoFormData(datos), { headers: headers() }),
      'No se pudo registrar el gasto',
    )

  /** Solo gastos manuales; el backend responde 409 si es automático. Los archivos se suman a los que ya tiene */
  const editarGasto = (consecutivo, datos) =>
    accion(
      () => axios.put(`api/gastos/editar/${encodeURIComponent(consecutivo)}`, comoFormData(datos), { headers: headers() }),
      'No se pudo editar el gasto',
    )

  return { loading, listarGastos, listarVehiculos, registrarGasto, editarGasto }
})
