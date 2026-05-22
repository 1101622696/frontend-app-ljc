export const TIPOS_FILTRO = {
  TODOS: 'todos',
  FECHA: 'fecha',
  VALOR: 'valor',
  TIPO: 'tipo',
  PLACA: 'placa',
};

export const CONFIG_FILTROS = {
  [TIPOS_FILTRO.TODOS]: {
    titulo: 'Todos los Mantenimientos',
    icono: 'user',
    color: 'primary',
    campoOrden: null,
    etiquetaAsc: 'Ascendente',
    etiquetaDesc: 'Descendente',
    campoDatos: null
  },
  [TIPOS_FILTRO.FECHA]: {
    titulo: 'Mantenimientos por Fecha',
    icono: 'event',
    color: 'secondary',
    campoOrden: 'fecha',
    etiquetaAsc: 'Recientes',
    etiquetaDesc: 'Antiguas',
    campoDatos: 'fecha_creacion'
  },
  [TIPOS_FILTRO.VALOR]: {
    titulo: 'Mantenimientos por valor',
    icono: 'money',
    color: 'accent',
    campoOrden: 'valor',
    etiquetaAsc: 'costosos',
    etiquetaDesc: 'valor',
    campoDatos: 'valor_mantenimiento'
  },
  [TIPOS_FILTRO.TIPO]: {
    titulo: 'Mantenimientos por tipo',
    icono: 'book',
    color: 'accent',
    campoOrden: null,
    campoDatos: 'tipo_mantenimiento',
    esFiltroTexto: true,
    opcionesFiltro: [
      {valor: 'correctivo', etiqueta: 'correctivo'},
      {valor: 'preventivo', etiqueta: 'preventivo'}
    ]
  },
[TIPOS_FILTRO.PLACA]: {
  titulo: 'Mantenimientos por placa',
  icono: 'directions_car',
  color: 'accent',
  campoOrden: null,
  campoDatos: 'placa',
  esFiltroTexto: true,
  opcionesFiltro: []
}
};