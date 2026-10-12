import { useVisorArchivos } from '../composables/useVisorArchivos'

// Atajo para abrir el visor desde cualquier parte (también fuera de un componente).
export const abrirEnlace = (referencia, titulo = 'Archivos adjuntos', opciones = {}) => {
  if (!referencia) return
  useVisorArchivos().abrirArchivos(referencia, titulo, opciones)
}
