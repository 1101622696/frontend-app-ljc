import { defineStore } from 'pinia'
import axios from 'axios'
import { ref, computed } from 'vue'
import { Notify } from 'quasar'
import useNotifications from '../composables/useNotifications'

// Mensaje legible de un error de axios
export const mensajeError = (error, porDefecto = 'Ocurrió un error') =>
  error?.response?.data?.mensaje || error?.response?.data?.msg || porDefecto

const notificarError = (error, porDefecto) =>
  Notify.create({ type: 'negative', message: mensajeError(error, porDefecto), position: 'bottom' })

const notificarExito = (mensaje) => Notify.create({ type: 'positive', message: mensaje, position: 'bottom' })

export const useStoreUsuarios = defineStore(
  'Usuarios',
  () => {
    const token = ref('')
    const loading = ref(false)
    const usuarios = ref([])
    const user = ref({})
    const perfile = ref('')
    const correo = ref('')

    // Si es 'si', la app muestra el diálogo obligatorio de cambio de contraseña
    const debeCambiarPassword = ref(false)

    const isAuthenticated = computed(() => Boolean(token.value && perfile.value))
    const esAdmin = computed(() => perfile.value === 'administrador')
    const esPropietario = computed(() => perfile.value === 'propietario')
    const esConductor = computed(() => perfile.value === 'conductor')

    const headers = () => ({ 'x-token': token.value })

    // ── Sesión ──

    const setToken = (nuevo) => {
      token.value = nuevo
      localStorage.setItem('x-token', nuevo)
    }

    const aplicarUsuario = (datos) => {
      if (!datos) return
      user.value = datos
      perfile.value = datos.perfil || ''
      correo.value = datos.email || ''
      debeCambiarPassword.value = datos.debe_cambiar_password === 'si'
    }

    const eliminarToken = () => {
      token.value = ''
      user.value = {}
      perfile.value = ''
      correo.value = ''
      debeCambiarPassword.value = false
      localStorage.removeItem('x-token')
      localStorage.removeItem('usuarios-store')
    }

    /** Lanza error con el mensaje del backend si falla */
    const login = async (email, password) => {
      try {
        const res = await axios.post('api/usuarios/login', { email: email.trim(), password })
        setToken(res.data.token)
        aplicarUsuario(res.data.usuario)
        // Las notificaciones las activa MainLayout al entrar (después del cambio de contraseña si aplica)
        return res
      } catch (error) {
        throw new Error(mensajeError(error, 'Usuario o contraseña incorrecta'))
      }
    }

    /** Refresca perfil y placas desde el backend (se llama al abrir la app) */
    const refrescarSesion = async () => {
      if (!token.value) return null
      try {
        const res = await axios.get('api/usuarios/me', { headers: headers() })
        aplicarUsuario(res.data)
        return res.data
      } catch (error) {
        // Sin conexión: se sigue con los datos guardados. El 401 lo maneja el interceptor de main.js
        console.warn('No se pudo refrescar la sesión', error?.message)
        return null
      }
    }

    const iniciarNotificaciones = () => {
      setTimeout(async () => {
        try {
          const { inicializarNotificaciones } = useNotifications()
          await inicializarNotificaciones()
        } catch (error) {
          console.log('Error al inicializar notificaciones:', error)
        }
      }, 1000)
    }

    /** Cambia la contraseña del usuario de la sesión. El backend devuelve un token nuevo */
    const cambiarMiPassword = async (actual, nueva) => {
      loading.value = true
      try {
        const res = await axios.put('api/usuarios/cambiar-mi-password', { actual, nueva }, { headers: headers() })
        setToken(res.data.token)
        aplicarUsuario(res.data.usuario)
        notificarExito('Contraseña actualizada')
        return res.data
      } catch (error) {
        throw new Error(mensajeError(error, 'No se pudo cambiar la contraseña'))
      } finally {
        loading.value = false
      }
    }

    // ── Consultas (devuelven datos o vacío; no lanzan) ──

    const listarUsuario = async () => {
      loading.value = true
      try {
        const response = await axios.get('api/usuarios', { headers: headers() })
        return Array.isArray(response.data) ? response.data : response.data.usuarios || []
      } catch (error) {
        console.error('No se pudo obtener los usuarios', error)
        return []
      } finally {
        loading.value = false
      }
    }

    const obtenerUsuariosPorEmail = async (email) => {
      loading.value = true
      try {
        const response = await axios.get(`api/usuarios/poremail/${encodeURIComponent(email)}`, { headers: headers() })
        return response.data
      } catch (error) {
        console.error('No se pudo obtener el usuario', error)
        return null
      } finally {
        loading.value = false
      }
    }

    const listardatosUsuario = obtenerUsuariosPorEmail

    const obtenerUsuariosPorPropietario = async (email) => {
      loading.value = true
      try {
        const response = await axios.get(`api/usuarios/porpropietario/${encodeURIComponent(email)}`, {
          headers: headers(),
        })
        return response.data
      } catch (error) {
        console.error('No se pudo obtener los usuarios por propietario', error)
        return []
      } finally {
        loading.value = false
      }
    }

    const obtenerUsuariosOrdenados = async (tipo = 'viajes', orden = 'desc') => {
      loading.value = true
      try {
        const response = await axios.get('api/usuarios/ordenados', { params: { tipo, orden }, headers: headers() })
        return response.data
      } catch (error) {
        console.error(`No se pudo obtener los usuarios ordenados por ${tipo}:`, error)
        throw error
      } finally {
        loading.value = false
      }
    }

    const obtenerUsuariosFiltrados = async (tipo, valor) => {
      loading.value = true
      try {
        const response = await axios.get('api/usuarios/filtrados', { params: { tipo, valor }, headers: headers() })
        return response.data
      } catch (error) {
        console.error(`No se pudo obtener los usuarios filtrados por ${tipo}:`, error)
        throw error
      } finally {
        loading.value = false
      }
    }

    // ── Escritura (lanzan error para que la página NO cierre el formulario si falló) ──

    const postUsuario = async (data) => {
      loading.value = true
      try {
        const response = await axios.post('api/usuarios/crear', data, { headers: headers() })
        notificarExito('Usuario creado. Deberá cambiar la contraseña en su primer ingreso.')
        return response
      } catch (error) {
        notificarError(error, 'Error al registrar usuario')
        throw error
      } finally {
        loading.value = false
      }
    }

    const putUsuarios = async (email, data) => {
      loading.value = true
      try {
        const response = await axios.put(`api/usuarios/editar/${encodeURIComponent(email)}`, data, {
          headers: headers(),
        })
        notificarExito('Usuario actualizado correctamente')
        return response
      } catch (error) {
        notificarError(error, 'Error al actualizar usuario')
        throw error
      } finally {
        loading.value = false
      }
    }

    /** Admin / propietario: asigna una contraseña temporal a otro usuario */
    const putUsuariospassword = async (email, password) => {
      loading.value = true
      try {
        const response = await axios.put(
          `api/usuarios/editarpassword/${encodeURIComponent(email)}`,
          { password },
          { headers: headers() },
        )
        notificarExito('Contraseña temporal asignada')
        return response
      } catch (error) {
        notificarError(error, 'No se pudo asignar la contraseña')
        throw error
      } finally {
        loading.value = false
      }
    }

    const putActivarUsuario = async (email) => {
      loading.value = true
      try {
        const response = await axios.put(`api/usuarios/activar/${encodeURIComponent(email)}`, {}, { headers: headers() })
        notificarExito('Usuario activado')
        return response
      } catch (error) {
        notificarError(error, 'Error al activar usuario')
        throw error
      } finally {
        loading.value = false
      }
    }

    const putInactivarUsuario = async (email) => {
      loading.value = true
      try {
        const response = await axios.put(`api/usuarios/inactivar/${encodeURIComponent(email)}`, {}, { headers: headers() })
        notificarExito('Usuario desactivado')
        return response
      } catch (error) {
        notificarError(error, 'Error al desactivar usuario')
        throw error
      } finally {
        loading.value = false
      }
    }

    const registrarTokenFCM = async (tokenFcm) => {
      try {
        if (localStorage.getItem('fcm-token') === tokenFcm) return { success: true }
        const response = await axios.post('api/usuarios/registrar-token-fcm', { token: tokenFcm }, { headers: headers() })
        localStorage.setItem('fcm-token', tokenFcm)
        notificarExito('Notificaciones activadas correctamente')
        return response.data
      } catch (error) {
        notificarError(error, 'Error al registrar notificaciones')
        return { success: false }
      }
    }

    // ── Recuperación por correo (sin sesión). Lanzan error con el mensaje del backend ──

    const solicitarRecuperacion = async (email) => {
      loading.value = true
      try {
        return await axios.post('api/usuarios/recuperar-password', { email: email.trim() })
      } catch (error) {
        throw new Error(mensajeError(error, 'Error al enviar el código'))
      } finally {
        loading.value = false
      }
    }

    const verificarCodigo = async (email, codigo) => {
      loading.value = true
      try {
        return await axios.post('api/usuarios/verificar-codigo', { email: email.trim(), codigo: String(codigo).trim() })
      } catch (error) {
        throw new Error(mensajeError(error, 'Código incorrecto'))
      } finally {
        loading.value = false
      }
    }

    const cambiarPassword = async (email, codigo, nuevaPassword) => {
      loading.value = true
      try {
        return await axios.post('api/usuarios/cambiar-password', {
          email: email.trim(),
          codigo: String(codigo).trim(),
          nuevaPassword,
        })
      } catch (error) {
        throw new Error(mensajeError(error, 'Error al cambiar la contraseña'))
      } finally {
        loading.value = false
      }
    }

    return {
      // estado
      token,
      loading,
      usuarios,
      user,
      perfile,
      correo,
      debeCambiarPassword,
      isAuthenticated,
      esAdmin,
      esPropietario,
      esConductor,
      // sesión
      login,
      eliminarToken,
      refrescarSesion,
      cambiarMiPassword,
      iniciarNotificaciones,
      // consultas
      listarUsuario,
      obtenerUsuariosPorEmail,
      listardatosUsuario,
      obtenerUsuariosPorPropietario,
      obtenerUsuariosOrdenados,
      obtenerUsuariosFiltrados,
      // escritura
      postUsuario,
      putUsuarios,
      putUsuariospassword,
      putActivarUsuario,
      putInactivarUsuario,
      registrarTokenFCM,
      // recuperación
      solicitarRecuperacion,
      verificarCodigo,
      cambiarPassword,
    }
  },
  {
    persist: {
      key: 'usuarios-store',
      storage: localStorage,
      // pinia-plugin-persistedstate v4 usa "pick" (en v3 era "paths")
      pick: ['token', 'user', 'perfile', 'correo', 'debeCambiarPassword'],
    },
  },
)
