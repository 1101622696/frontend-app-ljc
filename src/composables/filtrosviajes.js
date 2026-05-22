export const TIPOS_FILTRO = {
  TODOS: 'todos',
  FECHA_INICIO: 'fecha de inicio',
  FECHA_FIN: 'fecha de fin',
  ANTICIPO: 'anticipo de conductor',
  DIEZPCTO: 'diez por ciento',
  GANANCIA_ESTIMADA: 'ganancia estimada',
  GANANCIA_REAL: 'ganancia real',
  VALOR_GASTOS_CONDUCTOR: 'valor de gastos del conductor',
  VALOR_GASTOS_PROPIETARIO: 'valor de gastos del propietario',
  VALOR_TONELADA_INICIAL: 'valor de tonelada inicial',
  VALOR_TONELADA_FINAL: 'valor de tonelada final',
  VALOR_VIAJE_REAL: 'valor de viaje real',
  ESTADO_VIAJE: 'estado_viaje',
  ESTADO_SALDO_CLIENTE: 'estado de saldo de cliente',
};

export const CONFIG_FILTROS = {
  [TIPOS_FILTRO.TODOS]: {
    titulo: 'Todos los Viajes',
    icono: 'local_shipping',
    color: 'primary',
    campoOrden: null,
    etiquetaAsc: 'Ascendente',
    etiquetaDesc: 'Descendente',
    campoDatos: null
  },
  [TIPOS_FILTRO.FECHA_INICIO]: {
    titulo: 'Viajes por Fecha de Inicio',
    icono: 'event',
    color: 'secondary',
    campoOrden: 'fecha_inicio',
    etiquetaAsc: 'Más antiguos',
    etiquetaDesc: 'Más recientes', 
    campoDatos: 'fecha_inicio'
  },
  [TIPOS_FILTRO.FECHA_FIN]: {
    titulo: 'Viajes por Fecha fin',
    icono: 'event_available',
    color: 'secondary',
    campoOrden: 'fecha_fin',
    etiquetaAsc: 'Más antiguos',
    etiquetaDesc: 'Más recientes',
    campoDatos: 'fecha_fin_viaje'
  },
  [TIPOS_FILTRO.ANTICIPO]: {
    titulo: 'Anticipo de conductor',
    icono: 'payments',
    color: 'orange',
    campoOrden: 'anticipo_conductor',
    etiquetaAsc: 'Con mayor Anticipo',
    etiquetaDesc: 'Con menor Anticipo',
    campoDatos: 'valor_anticipo_conductor'
  },
  [TIPOS_FILTRO.DIEZPCTO]: {
    titulo: 'Diez por ciento',
    icono: 'percent',
    color: 'purple',
    campoOrden: 'diezpcto',
    etiquetaAsc: 'Con menor diez por ciento',
    etiquetaDesc: 'Con mayor diez por ciento',
    campoDatos: 'diez_pcto'
  },
  [TIPOS_FILTRO.GANANCIA_ESTIMADA]: {
    titulo: 'Ganancia Estimada',
    icono: 'trending_up',
    color: 'positive',
    campoOrden: 'ganancia_estimada',
    etiquetaAsc: 'Viajes con menos ganancia estimada',
    etiquetaDesc: 'Viajes con más ganancia estimada',
    campoDatos: 'ganancia_viaje_estimada'
  },
    [TIPOS_FILTRO.GANANCIA_REAL]: {
    titulo: 'Ganancia Real',
    icono: 'paid',
    color: 'green',
    campoOrden: 'ganancia_real',
    etiquetaAsc: 'Viajes con menos ganancia real',
    etiquetaDesc: 'Viajes con más ganancia real',
    campoDatos: 'ganancia_viaje_real'
  },
    [TIPOS_FILTRO.VALOR_GASTOS_CONDUCTOR]: {
    titulo: 'Gastos del Conductor',
    icono: 'receipt_long',
    color: 'deep-orange',
    campoOrden: 'valor_gastos_conductor',
    etiquetaAsc: 'Viajes con menos gastos del conductor',
    etiquetaDesc: 'Viajes con más gastos del conductor',
    campoDatos: 'total_gastos_conductor'
  },
    [TIPOS_FILTRO.VALOR_GASTOS_PROPIETARIO]: {
    titulo: 'Gastos del Propietario',
    icono: 'request_quote',
    color: 'brown',
    campoOrden: 'valor_gastos_propietario',
    etiquetaAsc: 'Viajes con menos gastos del propietario',
    etiquetaDesc: 'Viajes con más gastos del propietario',
    campoDatos: 'total_gastos_propietario'
  },
    [TIPOS_FILTRO.VALOR_TONELADA_INICIAL]: {
    titulo: 'Valor de Tonelada Inicial',
    icono: 'scale',
    color: 'indigo',
    campoOrden: 'valor_tonelada_inicial',
    etiquetaAsc: 'Viajes con menor valor de tonelada inicial',
    etiquetaDesc: 'Viajes con mayor valor de tonelada inicial',
    campoDatos: 'valor_tonelada_inicial'
  },
    [TIPOS_FILTRO.VALOR_TONELADA_FINAL]: {
    titulo: 'Valor de Tonelada Final',
    icono: 'monitor_weight',
    color: 'indigo',
    campoOrden: 'valor_tonelada_final',
    etiquetaAsc: 'Viajes con menor valor de tonelada final',
    etiquetaDesc: 'Viajes con mayor valor de tonelada final',
    campoDatos: 'valor_tonelada_final'
  },
    [TIPOS_FILTRO.VALOR_VIAJE_REAL]: {
    titulo: 'Valor de Viaje Real',
    icono: 'attach_money',
    color: 'teal',
    campoOrden: 'valor_viaje_real',
    etiquetaAsc: 'Viajes con menor valor de viaje real',
    etiquetaDesc: 'Viajes con mayor valor de viaje real',
    campoDatos: 'valor_viaje_real'
  },
    [TIPOS_FILTRO.ESTADO_VIAJE]: {
    titulo: 'Estado del viaje',
    icono: 'flag',
    color: 'blue',
    campoOrden: null,
    campoDatos: 'estado_viaje',
    esFiltroTexto: true,
    opcionesFiltro: [
      { valor: 'solicitado',  etiqueta: 'Solicitado' },
      { valor: 'completado',  etiqueta: 'Completado' },
      { valor: 'aprobado',    etiqueta: 'Aprobado' },
      { valor: 'facturado',   etiqueta: 'Facturado' },
    ]
  },
  [TIPOS_FILTRO.ESTADO_SALDO_CLIENTE]: {
    titulo: 'Estado de saldo de cliente',
    icono: 'account_balance_wallet',
    color: 'green',
    campoOrden: null,
    campoDatos: 'estado_saldo_cliente',
    esFiltroTexto: true,
    opcionesFiltro: [
      {valor: 'Pendiente', etiqueta: 'pendiente'},
      {valor: 'Completado', etiqueta: 'completado'}
    ]
  }
};