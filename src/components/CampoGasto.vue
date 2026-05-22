<template>
  <div class="campo-gasto q-mb-sm">
    <div class="text-caption text-grey-7 q-mb-xs">{{ label }}</div>

    <div class="row q-gutter-sm">
      <q-input
        filled
        v-model="valorFormateado"
        type="text"
        label="Valor ($)"
        :dense="dense"
        class="col"
        @update:model-value="formatearValor"
      />

      <q-select
        v-if="valorInterno > 0"
        filled
        v-model="tipoFacturaInterno"
        :options="tiposFactura"
        label="Tipo factura"
        :dense="dense"
        class="col"
        @update:model-value="emitir"
      />
    </div>

<q-file
  v-if="valorInterno > 0 && conArchivo"
  filled
  v-model="archivoInterno"
  :label="`Soporte ${label}`"
  :dense="dense"
  class="q-mt-xs"
  @update:model-value="emitir"
/>
  </div>
</template>

<script setup>
import { ref, watch  } from 'vue'

const props = defineProps({
  label: String,
  dense: Boolean,
  conTipoFactura: { type: Boolean, default: true },
  conArchivo: { type: Boolean, default: true },
  valorInicial: { type: Number, default: 0 },
  tipoFacturaInicial: { type: String, default: '' }  // ← agregar
})
const valorInterno = ref(props.valorInicial)
  
const valorFormateado = ref('')
  
  const tipoFacturaInterno = ref('')
  const archivoInterno = ref(null)

watch(() => props.valorInicial, (nuevoValor) => {
  valorInterno.value = nuevoValor
  valorFormateado.value = nuevoValor > 0 ? nuevoValor.toLocaleString('es-CO') : ''
  tipoFacturaInterno.value = props.tipoFacturaInicial  // ← agregar
}, { immediate: true })

const emit = defineEmits([
  'update:valor',
  'update:tipoFactura',
  'update:archivo'
])

const tiposFactura = ['Factura', 'Recibo', 'Otro']


function formatearValor(valor) {
  const limpio = valor.replace(/\D/g, '')

  valorInterno.value = Number(limpio)

  valorFormateado.value = valorInterno.value.toLocaleString('es-CO')

  emitir()
}

function emitir() {
  emit('update:valor', valorInterno.value)
  emit('update:tipoFactura', tipoFacturaInterno.value)
  emit('update:archivo', archivoInterno.value)
}
</script>