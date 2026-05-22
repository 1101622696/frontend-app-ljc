export const TIPOS_FILTRO = {
  TODOS: 'todos',
  VALOR_GASTO: 'valor del gasto',
};

export const CONFIG_FILTROS = {
  [TIPOS_FILTRO.TODOS]: {
    titulo: 'Todos los Gastos',
    icono: 'local_shipping',
    color: 'primary',
    campoOrden: null,
    etiquetaAsc: 'Ascendente',
    etiquetaDesc: 'Descendente',
    campoDatos: null
  },
  [TIPOS_FILTRO.VALOR_GASTO]: {
    titulo: 'Gastos por Valor',
    icono: 'attach_money',
    color: 'secondary',
    campoOrden: 'valor_gasto',
    etiquetaAsc: 'gastos con menor valor',
    etiquetaDesc: 'gastos con mayor valor', 
    campoDatos: 'valor_gasto'
  },
};