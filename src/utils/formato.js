// Formatos comunes de la app (pesos, kilos, fechas). Usar estos y no copias en cada página.

const formateadorPeso = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/** 1250000 → "$ 1.250.000". Vacío → "—". El cero se muestra "$ 0" */
export const formatoPeso = (valor) => {
  if (valor === null || valor === undefined || valor === '') return '—'
  const n = Number(valor)
  return Number.isFinite(n) ? formateadorPeso.format(n) : '—'
}

/** 34270 → "34.270 kg" */
export const formatoKilos = (valor) => {
  if (valor === null || valor === undefined || valor === '') return '—'
  return `${Math.round(Number(valor)).toLocaleString('es-CO')} kg`
}

/** 1250000 → "1.250.000" (sin símbolo) */
export const formatoMiles = (valor) => {
  if (valor === null || valor === undefined || valor === '') return ''
  const n = Number(valor)
  return Number.isFinite(n) ? n.toLocaleString('es-CO') : ''
}

/**
 * '2026-10-05' → '05 oct 2026'. Las fechas sin hora se toman como fecha local
 * (new Date('2026-10-05') las corre un día en Colombia).
 */
export const formatoFecha = (valor, conHora = false) => {
  if (!valor) return '—'
  const texto = String(valor)
  const soloFecha = /^\d{4}-\d{2}-\d{2}$/.test(texto)
  const fecha = soloFecha ? new Date(`${texto}T00:00:00`) : new Date(texto)
  if (isNaN(fecha)) return texto
  const opciones = { day: '2-digit', month: 'short', year: 'numeric' }
  if (conHora && !soloFecha) Object.assign(opciones, { hour: '2-digit', minute: '2-digit' })
  return fecha.toLocaleString('es-CO', opciones)
}

/** Fecha de hoy en Colombia 'AAAA-MM-DD' (para valores por defecto de formularios) */
export const hoyISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Mensaje de error de axios o de un Error */
export const mensajeDeError = (error, porDefecto = 'Ocurrió un error') =>
  error?.response?.data?.mensaje || error?.response?.data?.msg || error?.message || porDefecto
