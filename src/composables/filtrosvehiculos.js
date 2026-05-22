export const TIPOS_FILTRO = {
  TODOS: 'todos',
  FECHAPOLIZA: 'fecha de póliza',
  FECHASOAT: 'fecha de soat',
  FECHATECNICO: 'fecha de tecnicomecanica',
  DISTANCIA: 'distancia',
  VIAJES: 'viajes',
  ESTADO: 'estado'
};

export const CONFIG_FILTROS = {
  [TIPOS_FILTRO.TODOS]: {
    titulo: 'Todos los Vehículos',
    icono: 'local_shipping',
    color: 'primary',
    campoOrden: null,
    etiquetaAsc: 'Ascendente',
    etiquetaDesc: 'Descendente',
    campoDatos: null
  },

  [TIPOS_FILTRO.FECHAPOLIZA]: {
    titulo: 'Vehículos por Fecha de Póliza',
    icono: 'verified_user',
    color: 'deep-purple',
    campoOrden: 'fechapoliza',
    etiquetaAsc: 'Más antiguas',
    etiquetaDesc: 'Más recientes',
    campoDatos: 'poliza_vencimiento'
  },

  [TIPOS_FILTRO.FECHASOAT]: {
    titulo: 'Vehículos por Fecha de SOAT',
    icono: 'health_and_safety',
    color: 'green',
    campoOrden: 'fechasoat',
    etiquetaAsc: 'Más antiguas',
    etiquetaDesc: 'Más recientes',
    campoDatos: 'soat_vencimiento'
  },

  [TIPOS_FILTRO.FECHATECNICO]: {
    titulo: 'Vehículos por Fecha de Técnico-Mecánica',
    icono: 'build_circle',
    color: 'orange',
    campoOrden: 'fechatecnico',
    etiquetaAsc: 'Más antiguas',
    etiquetaDesc: 'Más recientes',
    campoDatos: 'tecnico_vencimiento'
  },

  [TIPOS_FILTRO.DISTANCIA]: {
    titulo: 'Vehículos por Distancia',
    icono: 'route',
    color: 'cyan',
    campoOrden: 'distancia',
    etiquetaAsc: 'Menos distancia',
    etiquetaDesc: 'Más distancia',
    campoDatos: 'odometro'
  },

  [TIPOS_FILTRO.VIAJES]: {
    titulo: 'Vehículos por viajes realizados',
    icono: 'alt_route',
    color: 'indigo',
    campoOrden: 'viajes',
    etiquetaAsc: 'Menos viajes',
    etiquetaDesc: 'Más viajes',
    campoDatos: 'viajes'
  },

  [TIPOS_FILTRO.ESTADO]: {
    titulo: 'Vehículos por Estado',
    icono: 'toggle_on',
    color: 'teal',
    campoOrden: null,
    campoDatos: 'estado',
    esFiltroTexto: true,
    opcionesFiltro: [
      { valor: 'Activo', etiqueta: 'Activo' },
      { valor: 'Inactivo', etiqueta: 'Inactivo' }
    ]
  }
};