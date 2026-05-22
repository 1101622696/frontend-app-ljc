<!-- CampoPreoperacional.vue -->
<template>
  <div class="campo-preoperacional">
    <div class="text-caption text-grey-7 q-mb-xs">{{ label }}</div>
<q-option-group
  v-model="valorInterno"
  :options="[
    { label: 'Cumple', value: 'cumple' },
    { label: 'No Cumple', value: 'no_cumple' },
  ]"
  type="radio"
  inline
/>

<q-input
  v-if="valorInterno === 'no_cumple'"
  v-model="notaInterna"
  type="textarea"
  filled
  :label="`Observación: ${label}`"
  :dense="dense"
  @update:model-value="emitir"
/>
  </div>
</template>
<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: String,
  label: String,
  dense: Boolean,
})

const emit = defineEmits(['update:modelValue'])

const valorInterno = ref(
  props.modelValue === 'Cumple' ? 'cumple' :
  (props.modelValue && props.modelValue !== '') ? 'no_cumple' : 'cumple' // ← 'cumple' en lugar de null
)
const notaInterna = ref(
  props.modelValue && props.modelValue !== 'Cumple' && props.modelValue !== '' 
    ? props.modelValue 
    : ''
)

watch(valorInterno, (val) => {
  if (val === 'cumple') {
    notaInterna.value = ''
    emit('update:modelValue', 'Cumple')
  } else if (val === 'no_cumple') {
    emit('update:modelValue', notaInterna.value || 'No Cumple')
  }
})

function emitir(val) {
  emit('update:modelValue', val || 'No Cumple')
}
onMounted(() => {
  emit('update:modelValue', 'Cumple')
})
</script>