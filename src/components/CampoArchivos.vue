<template>
  <div class="campo-archivos">
    <div class="row items-start no-wrap q-gutter-x-sm">
      <!-- Galería / archivos del celular -->
      <q-file
        class="col"
        :model-value="valorQFile"
        :label="label"
        :multiple="multiple"
        :append="multiple"
        :accept="accept"
        :max-files="multiple ? maxArchivos : undefined"
        :display-value="textoSeleccion"
        :disable="disable || procesando"
        clearable
        outlined
        rounded
        dense
        bg-color="white"
        @update:model-value="alElegir"
        @rejected="rechazados"
      >
        <template #prepend>
          <q-icon name="attach_file" />
        </template>
      </q-file>

      <!-- Cámara: abre la cámara directamente (Android) -->
      <q-btn
        v-if="aceptaImagenes"
        round
        unelevated
        color="primary"
        icon="photo_camera"
        :disable="disable || procesando || lleno"
        aria-label="Tomar foto"
        @click="abrirCamara"
      >
        <q-tooltip>Tomar foto</q-tooltip>
      </q-btn>
      <input
        ref="inputCamara"
        type="file"
        accept="image/*"
        capture="environment"
        class="hidden"
        @change="alTomarFoto"
      />
    </div>

    <!-- Lo que se va a subir: miniatura de cada foto y botón para quitarla -->
    <div v-if="modelValue.length" class="row q-gutter-sm q-mt-sm">
      <div v-for="(archivo, i) in modelValue" :key="claveDe(archivo)" class="miniatura">
        <img v-if="vistas[i]" :src="vistas[i]" :alt="archivo.name" />
        <div v-else class="miniatura__icono column flex-center">
          <q-icon :name="iconoDe(archivo)" size="28px" :color="archivo.type === 'application/pdf' ? 'red-5' : 'grey-7'" />
          <div class="miniatura__nombre ellipsis">{{ archivo.name }}</div>
        </div>
        <div class="miniatura__peso">{{ peso(archivo.size) }}</div>
        <q-btn
          round
          dense
          unelevated
          size="xs"
          color="negative"
          icon="close"
          class="miniatura__quitar"
          :disable="disable || procesando"
          :aria-label="`Quitar ${archivo.name}`"
          @click="quitar(i)"
        />
      </div>
    </div>

    <div class="text-caption q-mt-xs q-px-sm" :class="procesando ? 'text-primary' : 'text-grey-7'">
      <template v-if="procesando">
        <q-spinner size="14px" class="q-mr-xs" /> Preparando fotos…
      </template>
      <template v-else-if="linkActual">
        {{
          multiple
            ? 'Ya tiene archivos adjuntos. Los que agregue se suman a los existentes.'
            : 'Ya tiene un archivo adjunto. Si sube otro, reemplaza al actual.'
        }}
      </template>
      <template v-else>
        {{ multiple ? `Hasta ${maxArchivos} archivos de ${maxMb} MB cada uno.` : `Un archivo de máximo ${maxMb} MB.` }}
        <span v-if="aceptaImagenes"> Las fotos se reducen antes de subir.</span>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, toRaw } from 'vue'
import { Notify } from 'quasar'
import { comprimirImagen, esImagen } from '../utils/imagenes'

// v-model = arreglo de File (siempre arreglo, aunque multiple sea false, para tratar igual todos los módulos).
// Las fotos se comprimen al agregarlas: lo que queda en el v-model ya es lo que se sube.

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  label: { type: String, default: 'Archivos adjuntos' },
  multiple: { type: Boolean, default: false },
  accept: { type: String, default: 'image/*, application/pdf, .doc, .docx, .xls, .xlsx' },
  maxMb: { type: Number, default: 15 },
  maxArchivos: { type: Number, default: 10 },
  linkActual: { type: String, default: '' }, // link guardado del registro que se está editando
  disable: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const inputCamara = ref(null)
const procesando = ref(false)

const valorQFile = computed(() => (props.multiple ? props.modelValue : props.modelValue[0] || null))
const aceptaImagenes = computed(() => !props.accept || /image/i.test(props.accept))
const lleno = computed(() => props.multiple && props.modelValue.length >= props.maxArchivos)
const textoSeleccion = computed(() => {
  const n = props.modelValue.length
  return n ? (n === 1 ? '1 archivo' : `${n} archivos`) : ''
})

const claveDe = (archivo) => `${archivo.name}-${archivo.size}-${archivo.lastModified}`
const peso = (bytes) => (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`)
const iconoDe = (archivo) => {
  const tipo = String(archivo.type || '')
  if (tipo === 'application/pdf') return 'picture_as_pdf'
  if (tipo.includes('sheet') || tipo.includes('excel')) return 'table_chart'
  if (tipo.includes('word') || tipo.includes('document')) return 'description'
  return 'insert_drive_file'
}

// Archivos que ya pasaron por la compresión (para no repetirla)
const listos = new WeakSet()

const sinRepetidos = (lista) => {
  const vistos = new Set()
  return lista.filter((archivo) => {
    const clave = claveDe(archivo)
    if (vistos.has(clave)) return false
    vistos.add(clave)
    return true
  })
}

/** ¿El v-model sigue teniendo exactamente estos archivos? (si guardaron y limpiaron el formulario, no) */
const sigueIgual = (lista) =>
  props.modelValue.length === lista.length && props.modelValue.every((archivo, i) => toRaw(archivo) === lista[i])

/**
 * Recibe la lista completa (los que ya estaban + los nuevos).
 * 1. Al instante deja los archivos en el v-model: si el usuario guarda antes de que termine
 *    la compresión, se suben sin comprimir pero NO se pierden.
 * 2. Comprime las fotos nuevas y, si el formulario no cambió mientras tanto, las reemplaza.
 */
async function procesar(lista) {
  let inmediata = sinRepetidos(lista.map((a) => toRaw(a)))
  if (props.multiple && inmediata.length > props.maxArchivos) {
    Notify.create({ type: 'warning', message: `Máximo ${props.maxArchivos} archivos. Se dejaron los primeros.`, position: 'bottom' })
    inmediata = inmediata.slice(0, props.maxArchivos)
  }
  if (!props.multiple) inmediata = inmediata.slice(-1)
  emit('update:modelValue', inmediata)

  if (inmediata.every((a) => listos.has(a))) return

  procesando.value = true
  try {
    const comprimidos = []
    for (const original of inmediata) {
      const archivo = listos.has(original) ? original : await comprimirImagen(original)
      listos.add(archivo)
      comprimidos.push(archivo)
    }
    if (!sigueIgual(inmediata)) return

    const maxBytes = props.maxMb * 1024 * 1024
    const final = sinRepetidos(comprimidos.filter((a) => a.size <= maxBytes))
    const pesados = comprimidos.length - comprimidos.filter((a) => a.size <= maxBytes).length
    if (pesados) {
      Notify.create({ type: 'warning', message: `${pesados} archivo(s) superan ${props.maxMb} MB y no se agregaron.`, position: 'bottom' })
    }
    emit('update:modelValue', final)
  } finally {
    procesando.value = false
  }
}

function alElegir(valor) {
  const lista = !valor ? [] : Array.isArray(valor) ? valor : [valor]
  procesar(lista)
}

function abrirCamara() {
  inputCamara.value?.click()
}

function alTomarFoto(evento) {
  const nuevas = Array.from(evento.target.files || [])
  evento.target.value = '' // permite tomar otra foto enseguida
  if (!nuevas.length) return
  procesar(props.multiple ? [...props.modelValue, ...nuevas] : nuevas)
}

function quitar(posicion) {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== posicion))
}

function rechazados(entradas) {
  Notify.create({
    type: 'warning',
    message: `${entradas.length} archivo(s) no se agregaron: el tipo no está permitido o se pasó del máximo de archivos.`,
    position: 'bottom',
  })
}

// ── Miniaturas (se liberan al cambiar la lista o cerrar el formulario) ──

const vistas = ref([])
let urls = new Map()

watch(
  () => props.modelValue,
  (lista) => {
    const nuevas = new Map()
    vistas.value = lista.map((archivo) => {
      if (!esImagen(archivo)) return ''
      const url = urls.get(archivo) || URL.createObjectURL(archivo)
      nuevas.set(archivo, url)
      return url
    })
    urls.forEach((url, archivo) => {
      if (!nuevas.has(archivo)) URL.revokeObjectURL(url)
    })
    urls = nuevas
  },
  { immediate: true }
)

onBeforeUnmount(() => urls.forEach((url) => URL.revokeObjectURL(url)))
</script>

<style scoped>
.miniatura {
  position: relative;
  width: 76px;
  height: 76px;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}
.miniatura img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.miniatura__icono {
  width: 100%;
  height: 100%;
  padding: 4px;
}
.miniatura__nombre {
  font-size: 10px;
  max-width: 100%;
}
.miniatura__peso {
  position: absolute;
  left: 0;
  bottom: 0;
  font-size: 10px;
  padding: 0 4px;
  color: white;
  background: rgba(0, 0, 0, 0.55);
  border-top-right-radius: 6px;
}
.miniatura__quitar {
  position: absolute;
  top: 2px;
  right: 2px;
}
</style>
