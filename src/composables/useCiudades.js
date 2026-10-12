import { CIUDADES_POR_DEPARTAMENTO } from './ciudadesColombia'

/** 'Girón' → 'giron' (para buscar y comparar sin tildes ni mayúsculas) */
export const sinTildes = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

const DEPARTAMENTOS = Object.keys(CIUDADES_POR_DEPARTAMENTO)

// Cuántos departamentos tienen una ciudad con ese nombre
// Nombres cortos para lo que se guarda
const NOMBRE_CORTO = {
  'Archipiélago de San Andrés, Providencia y Santa Catalina': 'San Andrés y Providencia',
  'Bogotá, D.C.': 'D.C.',
}

/** Lo que se guarda en la hoja: 'Bucaramanga - Santander' */
const valorDestino = (departamento, ciudad) =>
  `${ciudad === 'Bogotá, D.C.' ? 'Bogotá' : ciudad} - ${NOMBRE_CORTO[departamento] || departamento}`

/** 'Bucaramanga - Santander' → 'Bucaramanga' (corta en el ÚLTIMO ' - ': 'Mirití - Paraná' tiene guion) */
export const soloCiudad = (destino) => {
  const texto = String(destino ?? '')
  const i = texto.lastIndexOf(' - ')
  return i > 0 ? texto.slice(0, i) : texto
}

// Todas las ciudades: { departamento, ciudad, valor, busqueda }
const TODAS = DEPARTAMENTOS.flatMap((departamento) =>
  CIUDADES_POR_DEPARTAMENTO[departamento].split('|').map((ciudad) => ({
    departamento,
    ciudad,
    valor: valorDestino(departamento, ciudad),
    busqueda: sinTildes(`${ciudad} ${departamento}`),
  }))
)

const porValor = new Map(TODAS.map((c) => [sinTildes(c.valor), c]))

/** Opciones de q-select de un departamento: { label: 'Bucaramanga', value: 'Bucaramanga' } */
const opcionesDe = (departamento) =>
  TODAS.filter((c) => c.departamento === departamento).map((c) => ({ label: c.ciudad, value: c.valor }))

/**
 * Busca ciudades por texto (sin tildes, en cualquier parte del nombre: 'cucuta' encuentra
 * 'San José de Cúcuta'). Con departamento, solo en ese; sin él, en todo el país.
 */
const buscar = (texto, departamento = null, limite = 50) => {
  const t = sinTildes(texto)
  return TODAS.filter((c) => (!departamento || c.departamento === departamento) && (!t || c.busqueda.includes(t))).slice(0, limite)
}

/** Lo guardado → { departamento, ciudad, valor } o null si es un texto viejo que no está en la lista */
const ubicarDestino = (valor) => porValor.get(sinTildes(valor)) || null

export function useCiudades() {
  return { departamentos: DEPARTAMENTOS, opcionesDe, buscar, ubicarDestino, valorDestino, sinTildes }
}
