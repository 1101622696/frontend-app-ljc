<template>
  <q-dialog
    :model-value="modelValue"
    :persistent="obligatorio"
    @update:model-value="(v) => emit('update:modelValue', v)"
  >
    <q-card style="width: 420px; max-width: 92vw">
      <q-card-section>
        <div class="text-h6">{{ obligatorio ? 'Cree su contraseña' : 'Cambiar contraseña' }}</div>
        <div v-if="obligatorio" class="text-caption text-grey-7 q-mt-xs">
          Por seguridad, cambie la contraseña que le asignaron antes de continuar.
        </div>
      </q-card-section>

      <q-card-section class="q-gutter-md q-pt-none">
        <q-input
          v-model="actual"
          :type="ver ? 'text' : 'password'"
          :label="obligatorio ? 'Contraseña que le dieron' : 'Contraseña actual'"
          outlined
          dense
          autocomplete="current-password"
        />
        <q-input
          v-model="nueva"
          :type="ver ? 'text' : 'password'"
          label="Nueva contraseña"
          hint="Mínimo 6 caracteres"
          outlined
          dense
          autocomplete="new-password"
        />
        <q-input
          v-model="confirmar"
          :type="ver ? 'text' : 'password'"
          label="Confirmar nueva contraseña"
          outlined
          dense
          autocomplete="new-password"
          @keyup.enter="guardar"
        />
        <q-checkbox v-model="ver" label="Mostrar contraseñas" dense />

        <div v-if="error" class="text-negative text-body2">{{ error }}</div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-if="!obligatorio" flat label="Cancelar" color="grey-8" v-close-popup />
        <q-btn v-else flat label="Salir" color="grey-8" @click="emit('salir')" />
        <q-btn unelevated color="primary" label="Guardar" :loading="guardando" @click="guardar" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useStoreUsuarios } from '../stores/usuarios'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // true: no se puede cerrar sin cambiarla (primer ingreso)
  obligatorio: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'cambiada', 'salir'])

const useUsuario = useStoreUsuarios()

const actual = ref('')
const nueva = ref('')
const confirmar = ref('')
const ver = ref(false)
const error = ref('')
const guardando = ref(false)

watch(
  () => props.modelValue,
  (abierto) => {
    if (abierto) {
      actual.value = ''
      nueva.value = ''
      confirmar.value = ''
      error.value = ''
    }
  },
)

async function guardar() {
  error.value = ''
  if (!actual.value || !nueva.value || !confirmar.value) {
    error.value = 'Complete los tres campos'
    return
  }
  if (nueva.value.length < 6) {
    error.value = 'La nueva contraseña debe tener al menos 6 caracteres'
    return
  }
  if (nueva.value !== confirmar.value) {
    error.value = 'Las contraseñas nuevas no coinciden'
    return
  }

  guardando.value = true
  try {
    await useUsuario.cambiarMiPassword(actual.value, nueva.value)
    emit('cambiada')
    emit('update:modelValue', false)
  } catch (e) {
    error.value = e.message
  } finally {
    guardando.value = false
  }
}
</script>
