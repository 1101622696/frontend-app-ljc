export const TIPOS_FILTRO = {
  TODOS: 'todos',
  FECHA: 'fecha de licencia',
  VIAJES: 'viajes',
  ESTADO: 'estado',
  PERFIL: 'perfil',
};

export const CONFIG_FILTROS = {
  [TIPOS_FILTRO.TODOS]: {
    titulo: 'Todos los Usuarios',
    icono: 'user',
    color: 'primary',
    campoOrden: null,
    etiquetaAsc: 'Ascendente',
    etiquetaDesc: 'Descendente',
    campoDatos: null
  },
  [TIPOS_FILTRO.FECHA]: {
    titulo: 'Usuarios por Fecha de Licencia',
    icono: 'event',
    color: 'secondary',
    campoOrden: 'fecha_vencimiento_licencia',
    etiquetaAsc: 'Antiguas',
    etiquetaDesc: 'Recientes', 
    campoDatos: 'fecha_vencimiento_licencia'
  },
  [TIPOS_FILTRO.VIAJES]: {
    titulo: 'Usuarios por Viajes',
    icono: 'alt_route',
    color: 'accent',
    campoOrden: 'viajes',
    etiquetaAsc: 'Menos viajes',
    etiquetaDesc: 'Más viajes',
    campoDatos: 'viajes_realizados'
  },
  [TIPOS_FILTRO.ESTADO]: {
    titulo: 'Usuarios por Estado',
    icono: 'toggle_on',
    color: 'green',
    campoOrden: null,
    campoDatos: 'estado',
    esFiltroTexto: true,
    opcionesFiltro: [
      {valor: 'Activo', etiqueta: 'Activo'},
      {valor: 'Inactivo', etiqueta: 'Inactivo'}
    ]
  },
    [TIPOS_FILTRO.PERFIL]: {
    titulo: 'Usuarios por Perfil',
    icono: 'groups',
    color: 'purple',
    campoOrden: null,
    campoDatos: 'perfil',
    esFiltroTexto: true,
    opcionesFiltro: [
      { valor: 'conductor',  etiqueta: 'Conductor' },
      { valor: 'administrador',  etiqueta: 'Administrador' },
      { valor: 'propietario',    etiqueta: 'Propietario' },
    ]
  },
};