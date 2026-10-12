import { createApp } from 'vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createPinia } from 'pinia'
import { Quasar, Notify } from 'quasar'
import App from './App.vue'
import router from './router'
import axios from "axios";
import '@quasar/extras/material-icons/material-icons.css'
import Swal from 'sweetalert2';
import paquete from '../package.json'

// Versión de la app (package.json → "version"). Súbala en cada APK nueva.
// El backend la recibe en x-app-version y, si MIN_APP_VERSION es mayor, pide actualizar.
export const VERSION_APP = paquete.version

// axios.defaults.baseURL = "http://localhost:4000/";
axios.defaults.baseURL = "https://backend-app-ljc.onrender.com";
axios.defaults.headers.common['x-app-version'] = VERSION_APP;

let requestsPending = 0;
let cerrandoSesion = false;
let avisoActualizarMostrado = false;

// Las peticiones con { sinSpinner: true } (el visor de archivos) no muestran el spinner global
const cerrarSpinner = (config) => {
  if (config?.sinSpinner) return;
  requestsPending = Math.max(0, requestsPending - 1);
  if (requestsPending === 0) Swal.close();
};

axios.interceptors.request.use((request) => {
  // Token por defecto en todas las peticiones (las páginas que ya lo envían no cambian)
  const token = localStorage.getItem('x-token');
  if (token && !request.headers['x-token']) request.headers['x-token'] = token;

  if (request.sinSpinner) return request;

  requestsPending++;
  if (requestsPending === 1) {
    Swal.fire({
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    });
  }
  return request;
});

axios.interceptors.response.use(
  function (response) {
    cerrarSpinner(response.config);
    return response;
  },
  function (error) {
    cerrarSpinner(error.config);

    const estado = error.response?.status;
    const codigo = error.response?.data?.codigo;
    const esLogin = String(error.config?.url || '').includes('api/usuarios/login');

    // Sesión inválida (usuario desactivado, contraseña cambiada, token vencido):
    // se borra la sesión y se recarga; el router lleva al login.
    const teniaToken = Boolean(error.config?.headers?.['x-token']);
    if (estado === 401 && teniaToken && !esLogin && !cerrandoSesion) {
      cerrandoSesion = true;
      localStorage.removeItem('x-token');
      localStorage.removeItem('usuarios-store');
      Swal.fire({
        icon: 'info',
        title: 'Sesión cerrada',
        text: error.response?.data?.mensaje || 'Inicie sesión de nuevo.',
        confirmButtonText: 'Entendido',
        allowOutsideClick: false,
      }).then(() => window.location.reload());
    }

    // Debe cambiar la contraseña: MainLayout muestra el diálogo obligatorio
    if (estado === 403 && codigo === 'DEBE_CAMBIAR_PASSWORD') {
      window.dispatchEvent(new CustomEvent('ljc:debe-cambiar-password'));
    }

    // App desactualizada
    if (estado === 426 && !avisoActualizarMostrado) {
      avisoActualizarMostrado = true;
      Swal.fire({
        icon: 'warning',
        title: 'Actualice la app',
        text: error.response?.data?.mensaje || 'Hay una nueva versión de la app. Descárguela para continuar.',
        confirmButtonText: 'Entendido',
      }).then(() => {
        avisoActualizarMostrado = false;
      });
    }

    return Promise.reject(error);
  }
);

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
const myApp = createApp(App)

myApp.use(pinia)
myApp.use(router)
myApp.use(Quasar, {
  plugins: { Notify },
  config: {
    notify: {
      position: 'top',
      timeout: 2500,
      textColor: 'white',
      actions: [{ icon: 'close', color: 'white' }],
      color: "red"
    },
  },
})

myApp.mount('#app')
