<template>
  <div class="gastos-viaje">
    <div class="row items-center q-mb-sm">
      <div class="text-subtitle2 text-grey-8">{{ titulo }}</div>
      <q-space />
      <div class="text-subtitle2">Total: {{ formatoPeso(total) }}</div>
    </div>

    <div v-for="tipo in TIPOS" :key="tipo" class="gasto-fila">
      <CampoNumero
        :model-value="modelValue[tipo]?.valor ?? null"
        :label="ETIQUETAS[tipo]"
        moneda
        :hint="ayuda(tipo)"
        @update:model-value="(v) => cambiar(tipo, { valor: v })"
      />

      <template v-if="(modelValue[tipo]?.valor || 0) > 0">
        <q-input
          v-if="tipo === 'otro'"
          :model-value="modelValue[tipo]?.descripcion || ''"
          label="¿En qué fue el gasto?"
          outlined
          dense
          class="q-mt-xs"
          @update:model-value="(v) => cambiar(tipo, { descripcion: v })"
        />

        <q-select
          v-if="!SIEMPRE_RECIBO.includes(tipo)"
          :model-value="modelValue[tipo]?.tipo_factura || 'factura_electronica'"
          :options="OPCIONES_FACTURA"
          label="Tipo de soporte"
          emit-value
          map-options
          outlined
          dense
          class="q-mt-xs"
          @update:model-value="(v) => cambiar(tipo, { tipo_factura: v })"
        />

        <CampoArchivos
          class="q-mt-xs"
          :model-value="modelValue[tipo]?.archivos || []"
          :label="etiquetaArchivo(tipo)"
          multiple
          accept="image/*, application/pdf"
          :link-actual="existentes[tipo]?.link_soporte || ''"
          @update:model-value="(v) => cambiar(tipo, { archivos: v })"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CampoNumero from './CampoNumero.vue'
import CampoArchivos from '../CampoArchivos.vue'
import { formatoPeso } from '../../utils/formato'

// Mismas reglas del backend (helpers/calculos_viaje.js)
const TIPOS = ['peajes', 'lavadas', 'parqueadero', 'engrase', 'fumigacion', 'cargue', 'descargue', 'comision', 'otro']
const ETIQUETAS = {
  peajes: 'Peajes',
  lavadas: 'Lavadas',
  parqueadero: 'Parqueadero',
  engrase: 'Engrase',
  fumigacion: 'Fumigación',
  cargue: 'Cargue',
  descargue: 'Descargue',
  comision: 'Comisión',
  otro: 'Otro',
}
const SIEMPRE_RECIBO = ['cargue', 'descargue', 'comision']
const SIN_SOPORTE = {
  conductor: ['cargue', 'descargue', 'comision'],
  propietario: ['peajes', 'cargue', 'descargue', 'comision'],
}
const OPCIONES_FACTURA = [
  { label: 'Factura electrónica', value: 'factura_electronica' },
  { label: 'Recibo de caja', value: 'recibo_caja' },
]

const props = defineProps({
  // { peajes: { valor, tipo_factura, descripcion, archivos: [] }, ... }
  modelValue: { type: Object, default: () => ({}) },
  quien: { type: String, required: true }, // 'conductor' | 'propietario'
  titulo: { type: String, default: 'Gastos' },
  // Gastos ya guardados de este quien (para saber si ya tiene soporte)
  existentes: { type: Object, default: () => ({}) },
  // false cuando el propietario corrige gastos del conductor al aprobar
  exigirSoporte: { type: Boolean, default: true },
})
const emit = defineEmits(['update:modelValue'])

const total = computed(() => TIPOS.reduce((suma, t) => suma + (Number(props.modelValue[t]?.valor) || 0), 0))

const requiereSoporte = (tipo) => props.exigirSoporte && !SIN_SOPORTE[props.quien]?.includes(tipo)

function ayuda(tipo) {
  if (SIEMPRE_RECIBO.includes(tipo)) return 'Recibo de caja, sin soporte obligatorio'
  if (!requiereSoporte(tipo)) return 'Soporte opcional'
  return 'Si tiene valor, adjunte el soporte'
}

function etiquetaArchivo(tipo) {
  const yaTiene = Boolean(props.existentes[tipo]?.link_soporte)
  if (requiereSoporte(tipo) && !yaTiene) return `Soporte de ${ETIQUETAS[tipo]} (obligatorio)`
  return `Soporte de ${ETIQUETAS[tipo]} (opcional)`
}

function cambiar(tipo, cambios) {
  emit('update:modelValue', {
    ...props.modelValue,
    [tipo]: { valor: null, tipo_factura: 'factura_electronica', descripcion: '', archivos: [], ...props.modelValue[tipo], ...cambios },
  })
}

/** Revisa antes de enviar. Devuelve el primer error o '' */
function validar() {
  for (const tipo of TIPOS) {
    const g = props.modelValue[tipo]
    if (!g || !(Number(g.valor) > 0)) continue
    if (tipo === 'otro' && !String(g.descripcion || '').trim() && !props.existentes.otro?.descripcion) {
      return 'Describa en qué fue el gasto "Otro"'
    }
    if (requiereSoporte(tipo) && !g.archivos?.length && !props.existentes[tipo]?.link_soporte) {
      return `Adjunte el soporte de ${ETIQUETAS[tipo]}`
    }
  }
  return ''
}

defineExpose({ validar, total })
</script>

<script>
/** Pasa los gastos a FormData con los nombres que espera el backend */
export function agregarGastosAFormData(formData, gastos, quien) {
  Object.entries(gastos || {}).forEach(([tipo, g]) => {
    if (!g) return
    formData.append(`${tipo}_${quien}`, String(Number(g.valor) || 0))
    if (g.tipo_factura) formData.append(`tipo_factura_${tipo}_${quien}`, g.tipo_factura)
    if (g.descripcion) formData.append(`descripcion_${tipo}_${quien}`, g.descripcion)
    ;(g.archivos || []).forEach((archivo) => formData.append(`${tipo}_${quien}_archivos`, archivo))
  })
}

/** Convierte la lista de gastos del backend en el objeto que usa el componente */
export function gastosDesdeLista(lista, quien) {
  const resultado = {}
  ;(lista || [])
    .filter((g) => g.quien === quien)
    .forEach((g) => {
      resultado[g.tipo_gasto] = {
        valor: Number(g.valor) || 0,
        tipo_factura: g.tipo_factura || 'factura_electronica',
        descripcion: g.descripcion || '',
        archivos: [],
      }
    })
  return resultado
}

/** Gastos guardados indexados por tipo (para la prop "existentes") */
export function existentesDesdeLista(lista, quien) {
  return Object.fromEntries((lista || []).filter((g) => g.quien === quien).map((g) => [g.tipo_gasto, g]))
}
</script>

<style scoped>
.gasto-fila {
  padding: 6px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.gasto-fila:last-child {
  border-bottom: none;
}
</style>
