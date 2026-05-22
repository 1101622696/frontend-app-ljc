export const TIPOS_FILTRO = {
  TODOS: 'todos',
  GALONES: 'galones',
  VALOR_PAGADO: 'valor pagado',
  PRECIO_POR_GALON: 'precio por galón',
  RENDIMIENTO_REAL: 'rendimiento real',
  ALERTA: 'alerta',
  MES: 'mes',
  ESTADO_FACTURA: 'estado de la factura'
};

export const CONFIG_FILTROS = {

  [TIPOS_FILTRO.TODOS]: {
    titulo: 'Todos los Registros de Combustible',
    icono: 'local_gas_station',
    color: 'primary',
    campoOrden: null,
    etiquetaAsc: 'Ascendente',
    etiquetaDesc: 'Descendente',
    campoDatos: null
  },

  [TIPOS_FILTRO.GALONES]: {
    titulo: 'Registros por Galones',
    icono: 'water_drop',
    color: 'blue',
    campoOrden: 'galones',
    etiquetaAsc: 'Menos galones cargados',
    etiquetaDesc: 'Más galones cargados',
    campoDatos: 'galones_cargados'
  },

  [TIPOS_FILTRO.VALOR_PAGADO]: {
    titulo: 'Registros por Valor Pagado',
    icono: 'payments',
    color: 'green',
    campoOrden: 'valor_pagado',
    etiquetaAsc: 'Menor valor pagado',
    etiquetaDesc: 'Mayor valor pagado',
    campoDatos: 'valor_pagado'
  },

  [TIPOS_FILTRO.PRECIO_POR_GALON]: {
    titulo: 'Registros por Precio por Galón',
    icono: 'attach_money',
    color: 'amber',
    campoOrden: 'precio_por_galon',
    etiquetaAsc: 'Galón más barato',
    etiquetaDesc: 'Galón más caro',
    campoDatos: 'precio_por_galon'
  },

  [TIPOS_FILTRO.RENDIMIENTO_REAL]: {
    titulo: 'Registros por Rendimiento Real',
    icono: 'speed',
    color: 'deep-orange',
    campoOrden: 'rendimiento_real',
    etiquetaAsc: 'Menos eficiente',
    etiquetaDesc: 'Más eficiente',
    campoDatos: 'rendimiento_real'
  },

  [TIPOS_FILTRO.MES]: {
    titulo: 'Combustible por Mes',
    icono: 'calendar_month',
    color: 'indigo',
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

  [TIPOS_FILTRO.ESTADO_FACTURA]: {
    titulo: 'Registros por Estado de Factura',
    icono: 'receipt_long',
    color: 'purple',
    campoOrden: null,
    campoDatos: 'estado_factura',
    esFiltroTexto: true,
    opcionesFiltro: [
      { valor: 'pendiente', etiqueta: 'Pendiente' },
      { valor: 'legalizado', etiqueta: 'Legalizado' }
    ]
  },

  [TIPOS_FILTRO.ALERTA]: {
    titulo: 'Registros por Alerta',
    icono: 'warning_amber',
    color: 'red',
    campoOrden: null,
    campoDatos: 'alerta',
    esFiltroTexto: true,
    opcionesFiltro: [
      { valor: 'si', etiqueta: 'Con Alerta' },
      { valor: 'no', etiqueta: 'Sin Alerta' }
    ]
  }

};