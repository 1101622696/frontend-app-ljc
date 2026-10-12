// Compresión de fotos en el celular ANTES de subirlas.
// Una foto de cámara pesa 3–6 MB; con señal de carretera eso falla o tarda minutos.
// Reducida a 2048 px por el lado largo y JPEG 75 % queda en ~300–700 KB y una factura
// o un tiquete se siguen leyendo bien (se puede hacer zoom en el visor).

const COMPRIMIBLES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_LADO = 2048
const CALIDAD = 0.75
const YA_LIVIANA = 300 * 1024 // por debajo de esto no vale la pena

/** Abre la imagen respetando la orientación de la cámara (EXIF) */
async function abrirImagen(archivo) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(archivo, { imageOrientation: 'from-image' })
    } catch {
      // WebView viejo: sigue con <img>
    }
  }
  const url = URL.createObjectURL(archivo)
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    await img.decode()
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}

const aBlob = (canvas, tipo, calidad) => new Promise((resolver) => canvas.toBlob(resolver, tipo, calidad))

/**
 * Devuelve un File más liviano (JPEG) o el mismo archivo si no es una foto,
 * ya es liviana o comprimir no la achica. Nunca lanza: ante cualquier problema, el original.
 */
export async function comprimirImagen(archivo, { maxLado = MAX_LADO, calidad = CALIDAD } = {}) {
  if (!archivo || !COMPRIMIBLES.includes(String(archivo.type).toLowerCase())) return archivo

  let fuente = null
  try {
    fuente = await abrirImagen(archivo)
    const ancho = fuente.width || fuente.naturalWidth
    const alto = fuente.height || fuente.naturalHeight
    if (!ancho || !alto) return archivo

    const escala = Math.min(1, maxLado / Math.max(ancho, alto))
    if (escala === 1 && archivo.size <= YA_LIVIANA) return archivo

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(ancho * escala)
    canvas.height = Math.round(alto * escala)
    const ctx = canvas.getContext('2d')
    // Fondo blanco: un PNG con transparencia quedaría negro en JPEG
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(fuente, 0, 0, canvas.width, canvas.height)

    const blob = await aBlob(canvas, 'image/jpeg', calidad)
    canvas.width = 0 // libera la memoria del canvas en celulares de gama baja
    canvas.height = 0
    if (!blob || blob.size >= archivo.size) return archivo

    const nombre = String(archivo.name || 'foto').replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], nombre, { type: 'image/jpeg', lastModified: archivo.lastModified || Date.now() })
  } catch {
    return archivo
  } finally {
    fuente?.close?.()
  }
}

export const esImagen = (archivo) => String(archivo?.type || '').startsWith('image/')
