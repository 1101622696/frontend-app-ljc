export const TIPOS_FILTRO = {
  TODOS: 'todos',
  VIAJES: 'viajes',
  TIPO_PAGO: 'tipo de pago',
  RETE_FUENTE: 'rete fuente',
  RETE_ICA: 'rete ica',
  VALOR_ESTIMADO: 'valor estimado',
  VALOR_REAL: 'valor real',
  GANANCIA: 'ganancia',
  ESTADO: 'estado'
};

export const CONFIG_FILTROS = {

  [TIPOS_FILTRO.TODOS]: {
    titulo: 'Todos los Clientes',
    icono: 'groups',
    color: 'primary',
    campoOrden: null,
    etiquetaAsc: 'Ascendente',
    etiquetaDesc: 'Descendente',
    campoDatos: null
  },

  [TIPOS_FILTRO.VIAJES]: {
    titulo: 'Clientes por Viajes',
    icono: 'alt_route',
    color: 'indigo',
    campoOrden: 'viajes',
    etiquetaAsc: 'Menos viajes',
    etiquetaDesc: 'Más viajes',
    campoDatos: 'viajes'
  },

  [TIPOS_FILTRO.RETE_ICA]: {
    titulo: 'Clientes por Rete ICA',
    icono: 'request_quote',
    color: 'deep-orange',
    campoOrden: 'rete_ica',
    etiquetaAsc: 'No aplica rete ICA',
    etiquetaDesc: 'Aplica rete ICA',
    campoDatos: 'rete_ica'
  },

  [TIPOS_FILTRO.VALOR_ESTIMADO]: {
    titulo: 'Clientes por Valor Estimado',
    icono: 'monetization_on',
    color: 'teal',
    campoOrden: 'valor_estimado',
    etiquetaAsc: 'Menor valor estimado',
    etiquetaDesc: 'Mayor valor estimado',
    campoDatos: 'total_valor_viaje_estimado'
  },

  [TIPOS_FILTRO.VALOR_REAL]: {
    titulo: 'Clientes por Valor Real',
    icono: 'paid',
    color: 'green',
    campoOrden: 'valor_real',
    etiquetaAsc: 'Menor valor real',
    etiquetaDesc: 'Mayor valor real',
    campoDatos: 'total_valor_viaje_real'
  },

  [TIPOS_FILTRO.GANANCIA]: {
    titulo: 'Clientes por Ganancia',
    icono: 'trending_up',
    color: 'positive',
    campoOrden: 'ganancia',
    etiquetaAsc: 'Menor ganancia',
    etiquetaDesc: 'Mayor ganancia',
    campoDatos: 'total_ganancia_viaje'
  },

  [TIPOS_FILTRO.ESTADO]: {
    titulo: 'Clientes por Estado',
    icono: 'toggle_on',
    color: 'cyan',
    campoOrden: 'estado',
    campoDatos: 'estado',
    esFiltroTexto: true,
    opcionesFiltro: [
      { valor: 'Activo', etiqueta: 'Activo' },
      { valor: 'Inactivo', etiqueta: 'Inactivo' }
    ]
  },

  [TIPOS_FILTRO.TIPO_PAGO]: {
    titulo: 'Clientes por Frecuencia de Pago',
    icono: 'calendar_today',
    color: 'purple',
    campoOrden: 'tipo_pago',
    campoDatos: 'tipo_pago',
    esFiltroTexto: true,
    opcionesFiltro: [
      { valor: 'quincenal', etiqueta: 'Quincenal' },
      { valor: 'mensual', etiqueta: 'Mensual' }
    ]
  },

  [TIPOS_FILTRO.RETE_FUENTE]: {
    titulo: 'Clientes por Rete Fuente',
    icono: 'account_balance',
    color: 'brown',
    campoOrden: 'rete_fuente',
    campoDatos: 'rete_fuente',
    esFiltroTexto: true,
    opcionesFiltro: [
      { valor: 'si', etiqueta: 'Aplica rete fuente' },
      { valor: 'no', etiqueta: 'No aplica rete fuente' }
    ]
  }

};