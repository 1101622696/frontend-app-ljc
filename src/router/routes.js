import LoginPage from '../pages/LoginPage.vue';
import Home from '../layouts/MainLayout.vue'; 

const routes = [
  { 
    path: '/', 
    component: LoginPage 
  },
  { 
    path: '/IndexPage', 
    component: Home,
    children: [
      { path: '', component: () => import('../pages/HomePage.vue') },
      { 
        path: 'HomePage', 
        name: 'HomePage', 
        component: () => import('../pages/HomePage.vue'),
        meta: { perfiles: ['administrador', 'propietario', 'conductor'] } 
      },
      { 
        path: 'gpsPage', 
        name: 'gpsPage', 
        component: () => import('../pages/gpsPage.vue'),
        meta: { perfiles: ['administrador', 'propietario', 'conductor'] } 
      },
      { 
        path: 'Solicitudes', 
        name: 'SolicitudesPage', 
        component: () => import('../pages/SolicitudesPage.vue'),
        meta: { perfiles: ['administrador', 'propietario', 'conductor'] }
      },
      { 
        path: 'Clientes', 
        name: 'ClientesPage', 
        component: () => import('../pages/ClientesPage.vue'),
        meta: { perfiles: ['administrador', 'propietario'] }
      },
      { 
        path: 'Combustible', 
        name: 'CombustiblePage', 
        component: () => import('../pages/CombustiblePage.vue'),
        meta: { perfiles: ['administrador', 'propietario', 'conductor'] }
      },
      { 
        path: 'Mantenimiento', 
        name: 'MantenimientoPage', 
        component: () => import('../pages/MantenimientoPage.vue'),
        meta: { perfiles: ['administrador', 'propietario'] }
      },
      { 
        path: 'Vehiculos', 
        name: 'VehiculosPage', 
        component: () => import('../pages/VehiculosPage.vue'),
        meta: { perfiles: ['administrador', 'propietario', 'conductor'] }
      },
      { 
        path: 'Prestamos', 
        name: 'PrestamosPage', 
        component: () => import('../pages/PrestamosPage.vue'),
        meta: { perfiles: ['administrador', 'propietario', 'conductor'] }
      },
      { 
        path: 'Preoperacionales', 
        name: 'PreoperacionalesPage', 
        component: () => import('../pages/PreoperacionalesPage.vue'),
        meta: { perfiles: ['administrador', 'propietario', 'conductor'] }
      },
      { 
        path: 'Usuarios', 
        name: 'UsuariosPage', 
        component: () => import('../pages/UsuariosPage.vue'),
        meta: { perfiles: ['administrador', 'propietario', 'conductor'] }
      },
      { 
        path: 'Gastos', 
        name: 'GastosPage', 
        component: () => import('../pages/GastosPage.vue'),
        meta: { perfiles: ['administrador', 'propietario'] }
      },
      { 
        path: 'Viajes', 
        name: 'ViajesPage', 
        component: () => import('../pages/ViajesPage.vue'),
        meta: { perfiles: ['administrador', 'propietario', 'conductor'] }
      },
      { 
        path: 'ResumenVehiculos', 
        name: 'ResumenVehiculosPage', 
        component: () => import('../pages/ResumenVehiculosPage.vue'), 
        meta: { perfiles: ['administrador', 'propietario'] }
      },
      { 
        path: 'Nomina', 
        name: 'NominaPage', 
        component: () => import('../pages/NominaPage.vue'), 
        meta: { perfiles: ['administrador', 'propietario', 'conductor'] }
      },
      { 
        path: 'Satrack', 
        name: 'SatrackPage', 
        component: () => import('../pages/SatrackPage.vue'), 
        meta: { perfiles: ['administrador', 'propietario'] }
      }
    ]
  },
  // Ruta para manejar rutas no encontradas
  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/ErrorNotFound.vue')
  }
];


export default routes;