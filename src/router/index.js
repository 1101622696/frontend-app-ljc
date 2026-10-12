import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useStoreUsuarios } from '../stores/usuarios.js'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

const INICIO = '/IndexPage'

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // La sesión se guarda en el celular: al abrir la app NO se vuelve a pedir login.
  // Solo se sale con el botón "Salir" o si el backend responde 401 (usuario desactivado,
  // contraseña cambiada, token inválido); eso lo maneja el interceptor de main.js.
  Router.beforeEach((to) => {
    const useUsuario = useStoreUsuarios()
    const token = useUsuario.token || localStorage.getItem('x-token')
    const perfil = useUsuario.perfile
    const haySesion = Boolean(token && perfil)

    // Pantalla de login: si ya hay sesión, directo al inicio
    if (to.path === '/') {
      return haySesion ? INICIO : true
    }

    if (to.meta.perfiles) {
      if (!haySesion) {
        useUsuario.eliminarToken()
        return '/'
      }
      if (!to.meta.perfiles.includes(perfil)) return INICIO
    }

    return true
  })

  return Router
})
