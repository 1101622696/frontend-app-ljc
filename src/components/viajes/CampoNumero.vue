<template>
  <q-input
    :model-value="texto"
    :label="label"
    :hint="hintFinal"
    :prefix="moneda ? '$' : undefined"
    :suffix="sufijo"
    :readonly="readonly"
    :disable="disable"
    :error="Boolean(error)"
    :error-message="error"
    inputmode="numeric"
    outlined
    dense
    bottom-slots
    @update:model-value="alEscribir"
  />
</template>

<script setup>
import { computed } from 'vue'

// Campo numérico entero para el celular: abre el teclado de números y muestra miles con punto.
// v-model entrega un número (o null si está vacío).
const props = defineProps({
  modelValue: { type: [Number, String, null], default: null },
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  moneda: { type: Boolean, default: false }, // muestra $
  sufijo: { type: String, default: undefined }, // ej. 'kg'
  readonly: { type: Boolean, default: false },
  disable: { type: Boolean, default: false },
  error: { type: String, default: '' },
  // Si el valor es menor a esto se muestra una advertencia (ej. 1000 para precios escritos en miles)
  minimoSugerido: { type: Number, default: 0 },
})
const emit = defineEmits(['update:modelValue'])

const texto = computed(() => {
  const n = props.modelValue
  if (n === null || n === undefined || n === '') return ''
  const numero = Number(n)
  return Number.isFinite(numero) ? numero.toLocaleString('es-CO') : ''
})

const hintFinal = computed(() => {
  const n = Number(props.modelValue)
  if (props.minimoSugerido && n > 0 && n < props.minimoSugerido) {
    return `¿Quiso decir ${(n * 1000).toLocaleString('es-CO')}? Escriba el valor completo.`
  }
  return props.hint
})

function alEscribir(valor) {
  const limpio = String(valor ?? '').replace(/\D/g, '')
  emit('update:modelValue', limpio === '' ? null : Number(limpio))
}
</script>
