<!-- Un ítem del checklist: Cumple / No Cumple + observación.
     Valor guardado: 'Cumple' | 'No Cumple' | 'No Cumple: <observación>'.
     (Antes la observación REEMPLAZABA el valor: el backend no la reconocía como "No cumple"
      y no avisaba al propietario de fallas en frenos o llantas.) -->
<template>
  <div class="campo-preoperacional" :class="{ 'campo-falla': estado === 'no_cumple' }">
    <div class="text-body2 q-mb-xs">
      {{ label }}
      <q-icon v-if="critico" name="priority_high" color="orange-8" size="16px">
        <q-tooltip>Ítem crítico (frenos o llantas)</q-tooltip>
      </q-icon>
    </div>

    <q-option-group v-model="estado" :options="opciones" type="radio" inline dense @update:model-value="emitir" />

    <template v-if="estado === 'no_cumple'">
      <q-input
        v-model="nota"
        type="textarea"
        autogrow
        outlined
        dense
        bg-color="white"
        class="q-mt-xs"
        :label="`¿Qué encontró? (${label})`"
        @update:model-value="emitir"
      />
      <q-banner v-if="critico" dense rounded class="bg-orange-1 text-orange-10 q-mt-xs">
        <template #avatar><q-icon name="warning" color="orange-9" /></template>
        Se avisará al propietario. Puede viajar, pero revise esto cuanto antes.
      </q-banner>
    </template>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  critico: { type: Boolean, default: false }, // frenos / llantas: muestra el aviso al marcar No Cumple
})
const emit = defineEmits(['update:modelValue'])

const opciones = [
  { label: 'Cumple', value: 'cumple' },
  { label: 'No Cumple', value: 'no_cumple', color: 'negative' },
]

const estado = ref('cumple')
const nota = ref('')

/** Lee el valor guardado. Registros viejos: cualquier texto distinto de 'Cumple' era la observación */
function separar(valor) {
  const texto = String(valor ?? '').trim()
  if (!texto || /^(cumple|si|sí|ok)$/i.test(texto)) return { estado: 'cumple', nota: '' }
  const m = texto.match(/^no\s*cumple\s*:?\s*([\s\S]*)$/i)
  return { estado: 'no_cumple', nota: m ? m[1] : texto }
}

const valorActual = () => {
  if (estado.value === 'cumple') return 'Cumple'
  const n = nota.value.trim()
  return n ? `No Cumple: ${n}` : 'No Cumple'
}

function emitir() {
  if (estado.value === 'cumple') nota.value = ''
  emit('update:modelValue', valorActual())
}

// Sincroniza con el formulario (nuevo, edición o corrección). Si el valor es el mismo que acabamos
// de emitir no se toca, para no borrar espacios mientras el usuario escribe.
watch(
  () => props.modelValue,
  (valor) => {
    if (valor === valorActual() && valor) return
    const s = separar(valor)
    estado.value = s.estado
    nota.value = s.nota
    if (!String(valor ?? '').trim()) emit('update:modelValue', 'Cumple') // vacío se muestra y guarda como Cumple
  },
  { immediate: true },
)
</script>

<style scoped>
.campo-preoperacional {
  padding: 6px 8px;
  border-radius: 8px;
}
.campo-falla {
  background: #fef2f2;
}
</style>
