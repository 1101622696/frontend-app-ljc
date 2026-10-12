<template>
  <div class="row q-col-gutter-sm">
    <!-- 1. Departamento -->
    <div class="col-12 col-sm-5">
      <q-select
        :model-value="departamento"
        :options="opcionesDepartamento"
        label="Departamento"
        outlined
        dense
        use-input
        input-debounce="0"
        clearable
        :disable="disable"
        @filter="filtrarDepartamentos"
        @update:model-value="elegirDepartamento"
      />
    </div>

    <!-- 2. Ciudad: sin departamento busca en todo el país y lo completa solo -->
    <div class="col-12 col-sm-7">
      <q-select
        :model-value="ubicado ? modelValue : null"
        :options="opcionesCiudad"
        :label="label"
        outlined
        dense
        use-input
        input-debounce="0"
        emit-value
        map-options
        clearable
        :disable="disable"
        :hint="ayuda"
        @filter="filtrarCiudades"
        @update:model-value="elegirCiudad"
      >
        <template #option="{ itemProps, opt }">
          <q-item v-bind="itemProps">
            <q-item-section>
              <q-item-label>{{ opt.label }}</q-item-label>
              <q-item-label v-if="!departamento" caption>{{ opt.departamento }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <template #no-option>
          <q-item>
            <q-item-section class="text-grey-7">
              {{ departamento ? 'No hay una ciudad con ese nombre en este departamento' : 'Escriba al menos 3 letras' }}
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCiudades } from '../composables/useCiudades'

// v-model = el destino que se guarda en la hoja (solo la ciudad: 'Bucaramanga', o 'Barbosa (Santander)'
// si el nombre se repite en otro departamento). El departamento solo sirve para elegir.

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: 'Ciudad de destino' },
  disable: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const { departamentos, buscar, ubicarDestino, sinTildes } = useCiudades()

const departamento = ref(null)
const opcionesDepartamento = ref(departamentos)
const opcionesCiudad = ref([])

const ubicado = computed(() => ubicarDestino(props.modelValue))

// Viaje viejo con destino escrito a mano que no está en la lista: se muestra para corregirlo
const ayuda = computed(() =>
  props.modelValue && !ubicado.value ? `Antes decía «${props.modelValue}». Elija la ciudad de la lista.` : ''
)

// Al abrir para editar (o si el valor cambia desde afuera) se selecciona su departamento
watch(
  () => props.modelValue,
  () => {
    if (ubicado.value) departamento.value = ubicado.value.departamento
  },
  { immediate: true }
)

const aOpcion = (c) => ({ label: c.ciudad, value: c.valor, departamento: c.departamento })

function filtrarDepartamentos(texto, actualizar) {
  actualizar(() => {
    const t = sinTildes(texto)
    opcionesDepartamento.value = t ? departamentos.filter((d) => sinTildes(d).includes(t)) : departamentos
  })
}

function filtrarCiudades(texto, actualizar) {
  // Sin departamento hay 1.100 ciudades: se espera a que escriba algo
  if (!departamento.value && sinTildes(texto).length < 3) {
    actualizar(() => {
      opcionesCiudad.value = []
    })
    return
  }
  actualizar(() => {
    opcionesCiudad.value = buscar(texto, departamento.value, departamento.value ? 200 : 40).map(aOpcion)
  })
}

function elegirDepartamento(valor) {
  departamento.value = valor || null
  // La ciudad elegida ya no corresponde a ese departamento
  if (ubicado.value && ubicado.value.departamento !== departamento.value) emit('update:modelValue', '')
}

function elegirCiudad(valor) {
  emit('update:modelValue', valor || '')
  const encontrado = ubicarDestino(valor)
  if (encontrado) departamento.value = encontrado.departamento
}
</script>
