import LoginPage from '../pages/LoginPage.vue'
import MainLayout from '../layouts/MainLayout.vue'

// Perfiles
const TODOS = ['administrador', 'propietario', 'conductor']
const GESTION = ['administrador', 'propietario']
// const ADMIN = ['administrador']

// Cada pantalla dice quién puede entrar (el guardián de router/index.js lo revisa).
// Debe coincidir con link-list.js y con los permisos del backend.
const pantalla = (path, name, archivo, perfiles) => ({
  path,
  name,
  component: () => import(`../pages/${archivo}.vue`),
  meta: { perfiles },
})

const routes = [
  { path: '/', component: LoginPage },
  {
    path: '/IndexPage',
    component: MainLayout,
    children: [
      // /IndexPage sin nada más = inicio (también exige sesión)
      { path: '', component: () => import('../pages/HomePage.vue'), meta: { perfiles: TODOS } },
      pantalla('HomePage', 'HomePage', 'HomePage', TODOS),
      pantalla('Viajes', 'ViajesPage', 'ViajesPage', TODOS),
      pantalla('Preoperacionales', 'PreoperacionalesPage', 'PreoperacionalesPage', TODOS),
      pantalla('Combustible', 'CombustiblePage', 'CombustiblePage', TODOS),
      pantalla('Solicitudes', 'SolicitudesPage', 'SolicitudesPage', TODOS),
      pantalla('Vehiculos', 'VehiculosPage', 'VehiculosPage', TODOS),
      pantalla('Nomina', 'NominaPage', 'NominaPage', TODOS),
      pantalla('Prestamos', 'PrestamosPage', 'PrestamosPage', TODOS),
      pantalla('Usuarios', 'UsuariosPage', 'UsuariosPage', TODOS),
      pantalla('Clientes', 'ClientesPage', 'ClientesPage', GESTION),
      pantalla('Mantenimiento', 'MantenimientoPage', 'MantenimientoPage', GESTION),
      pantalla('Gastos', 'GastosPage', 'GastosPage', GESTION),
      pantalla('ResumenVehiculos', 'ResumenVehiculosPage', 'ResumenVehiculosPage', GESTION),
      pantalla('Satrack', 'SatrackPage', 'SatrackPage', GESTION),
    ],
  },
  // Rutas que no existen
  { path: '/:catchAll(.*)*', component: () => import('../pages/ErrorNotFound.vue') },
]

export default routes
