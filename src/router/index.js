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
 
  // esto es del nuevo beforeEach, por lo del rol 
Router.beforeEach(async (to, from, next) => {
  if (to.meta.perfiles) {
    const useUsuario = useStoreUsuarios();
    
    // Esperar a que el store esté listo si el token existe en localStorage
    // pero perfile aún no se ha cargado
const tokenEnStorage = localStorage.getItem('x-token');

// Si el store no tiene perfile aún, leerlo directo del persist de Pinia
let userRole = useUsuario.perfile;
let token = useUsuario.token;

if (tokenEnStorage && !userRole) {
  try {
    const persistedStore = JSON.parse(localStorage.getItem('usuarios-store') || '{}');
    userRole = persistedStore.perfile || '';
    token = persistedStore.token || tokenEnStorage;
    // Restaurar manualmente al store
    if (userRole) useUsuario.perfile = userRole;
    if (token) useUsuario.token = token;
  } catch (e) {
    console.error('Error leyendo store persistido:', e);
  }
}
    console.log('perfil de usuario:', userRole);

    if (!userRole || !token) {
      useUsuario.eliminarToken();
      return next('/');
    }

    if (to.meta.perfiles.includes(userRole)) {
      return next();
    } else {
      return next('/IndexPage');
    }
  }
  return next();
});

  return Router
})