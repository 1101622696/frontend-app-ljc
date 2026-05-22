export const TIPOS_FILTRO = {
  TODOS: 'todos',
  VALOR: 'valor',
  MES: 'mes',
  VIAJES: 'viajes',
  TIPO: 'tipo'
};

export const CONFIG_FILTROS = {
  [TIPOS_FILTRO.TODOS]: {
    titulo: 'Todas los Nóminas',
    icono: 'flight',
    color: 'primary',
    campoOrden: null,
    etiquetaAsc: 'Ascendente',
    etiquetaDesc: 'Descendente',
    campoDatos: null
  },
  [TIPOS_FILTRO.VALOR]: {
    titulo: 'Nóminas por Valor',
    icono: 'paid',
    color: 'secondary',
    campoOrden: 'valor',
    etiquetaAsc: 'Menos valor',
    etiquetaDesc: 'Más valor', 
    campoDatos: 'total_nomina'
  },
  [TIPOS_FILTRO.MES]: {
  titulo: 'Combustible por Mes',
  icono: 'calendar_month',
  color: 'primary',
  campoDatos: 'mes',
  esFiltroTexto: true,
  opcionesFiltro: [
    { valor: '1', etiqueta: 'Enero' },
    { valor: '2', etiqueta: 'Febrero' },
    { valor: '3', etiqueta: 'Marzo' },
    { valor: '4', etiqueta: 'Abril' },
    { valor: '5', etiqueta: 'Mayo' },
    { valor: '6', etiqueta: 'Junio' },
    { valor: '7', etiqueta: 'Julio' },
    { valor: '8', etiqueta: 'Agosto' },
    { valor: '9', etiqueta: 'Septiembre' },
    { valor: '10', etiqueta: 'Octubre' },
    { valor: '11', etiqueta: 'Noviembre' },
    { valor: '12', etiqueta: 'Diciembre' },
  ]
},
  [TIPOS_FILTRO.VIAJES]: {
    titulo: 'Nóminas por Viajes',
    icono: 'alt_route',
    color: 'secondary',
    campoOrden: 'viajes',
    etiquetaAsc: 'Menos viajes',
    etiquetaDesc: 'Más viajes',
    campoDatos: 'total_viajes_mes'
  },
  [TIPOS_FILTRO.TIPO]: {
    titulo: 'Nóminas por Tipo',
    icono: 'account_balance',
    color: 'green',
    campoOrden: null,
    campoDatos: 'tipo',
    esFiltroTexto: true,
    opcionesFiltro: [
      {valor: 'viajes', etiqueta: 'viajes'},
      {valor: 'salario', etiqueta: 'salario'}
    ]
  }
};