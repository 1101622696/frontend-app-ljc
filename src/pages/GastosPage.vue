<template>
  <q-page padding class="bg-grey-2">
    <!-- ───────────── FILTROS ───────────── -->
    <div class="filter-bar q-mb-md">
      <div class="filter-scroll row no-wrap q-gutter-x-sm q-pb-xs">
        <q-chip
          v-for="opcion in opcionesTipo"
          :key="opcion.valor"
          clickable
          :color="filtroTipo === opcion.valor ? 'primary' : 'grey-2'"
          :text-color="filtroTipo === opcion.valor ? 'white' : 'grey-8'"
          class="filter-chip"
          @click="cambiarTipo(opcion.valor)"
        >
          {{ opcion.etiqueta }}
          <q-badge rounded color="white" text-color="grey-9" class="q-ml-xs">{{ opcion.cantidad }}</q-badge>
        </q-chip>
      </div>

      <div v-if="placasFiltro.length" class="filter-scroll row no-wrap q-gutter-x-sm q-mt-xs">
        <q-chip
          v-for="opcion in placasFiltro"
          :key="opcion.valor"
          clickable
          size="sm"
          :color="filtroPlaca === opcion.valor ? 'grey-9' : 'grey-2'"
          :text-color="filtroPlaca === opcion.valor ? 'white' : 'grey-8'"
          class="filter-chip"
          @click="cambiarPlaca(opcion.valor)"
        >
          {{ opcion.etiqueta }}
        </q-chip>
      </div>

      <div class="row items-center q-mt-sm">
        <span class="text-caption text-grey-7">{{ filtrados.length }} gasto(s)</span>
        <q-space />
        <span class="text-caption text-grey-7 q-mr-xs">Total</span>
        <span class="text-subtitle2 text-weight-bold text-negative">{{ formatoPeso(totalFiltrado) }}</span>
      </div>
    </div>

    <!-- ───────────── LISTA ───────────── -->
    <div v-if="!filtrados.length && !cargandoLista" class="text-center text-grey-6 q-py-xl">
      <q-icon name="receipt_long" size="48px" />
      <div class="q-mt-sm">No hay gastos {{ filtroTipo || filtroPlaca ? 'con estos filtros' : 'registrados' }}</div>
    </div>

    <q-card
      v-for="gasto in visibles"
      :key="gasto.consecutivo"
      flat
      class="viaje-card q-mb-sm cursor-pointer"
      @click="verDetalle(gasto)"
    >
      <q-card-section class="q-py-sm">
        <div class="row items-center no-wrap">
          <span class="placa-badge">{{ gasto.placa }}</span>
          <span class="text-weight-bold q-ml-sm">{{ gasto.consecutivo }}</span>
          <q-space />
          <span class="text-body2 text-weight-bold">{{ formatoPeso(gasto.valor_gasto) }}</span>
        </div>
        <div class="row items-center q-mt-xs no-wrap">
          <q-badge :color="colorTipo(gasto.tipo_gasto)" :label="nombreTipo(gasto.tipo_gasto)" />
          <span class="text-caption text-grey-7 q-ml-sm ellipsis">{{ gasto.descripcion }}</span>
        </div>
        <div class="row items-center text-caption text-grey-7 q-mt-xs">
          <span>{{ formatoFecha(gasto.fecha_registro) }}</span>
          <q-space />
          <span v-if="!gasto.editable" class="text-grey-6">
            <q-icon name="lock" size="12px" /> Se corrige desde {{ moduloDe(gasto.tipo_gasto) }}
          </span>
        </div>
      </q-card-section>
    </q-card>

    <div v-if="filtrados.length > visibles.length" class="text-center q-my-md">
      <q-btn outline rounded color="primary" label="Cargar más" @click="limite += POR_PAGINA" />
    </div>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" label="Gasto" @click="abrirCrear" />
    </q-page-sticky>

    <!-- ───────────── DETALLE ───────────── -->
    <q-dialog v-model="dialogDetalle">
      <q-card v-if="detalle" style="width: 480px; max-width: 95vw">
        <q-card-section class="row items-center no-wrap">
          <span class="placa-badge-lg">{{ detalle.placa }}</span>
          <div class="q-ml-md">
            <div class="text-h6">{{ detalle.consecutivo }}</div>
            <q-badge :color="colorTipo(detalle.tipo_gasto)" :label="nombreTipo(detalle.tipo_gasto)" />
          </div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="ganancia-banner ganancia-negativa q-mb-md">
            <div class="text-caption">Valor del gasto</div>
            <div class="text-h6">{{ formatoPeso(detalle.valor_gasto) }}</div>
          </div>
          <Fila etiqueta="Fecha" :valor="formatoFecha(detalle.fecha_registro)" />
          <Fila etiqueta="Tipo" :valor="nombreTipo(detalle.tipo_gasto)" />
          <Fila etiqueta="Descripción" :valor="detalle.descripcion || '—'" />
          <Fila etiqueta="Referencia" :valor="detalle.codigo_referencia || '—'" />
          <q-banner v-if="!detalle.editable" dense rounded class="bg-grey-3 text-grey-9 q-mt-md">
            <template #avatar><q-icon name="lock" /></template>
            Este gasto lo creó el sistema. Se corrige desde {{ moduloDe(detalle.tipo_gasto) }}.
          </q-banner>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            v-if="detalle.link_soporte"
            outline
            size="sm"
            icon="receipt"
            label="Soporte"
            @click="abrirVisor(detalle.link_soporte, 'Soporte del gasto')"
          />
          <q-space />
          <q-btn v-if="detalle.editable" unelevated color="primary" icon="edit" label="Editar" @click="abrirEditar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ───────────── REGISTRAR / EDITAR ───────────── -->
    <q-dialog v-model="dialogForm" persistent :maximized="$q.screen.lt.md">
      <q-card style="width: 460px; max-width: 100vw">
        <q-card-section class="bg-grey-1">
          <div class="text-h6">{{ editando ? `Editar ${editando}` : 'Registrar gasto' }}</div>
          <div class="text-caption text-grey-7">
            Combustible, viajes, nómina y mantenimientos se registran en su propio módulo.
          </div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-select
            v-model="form.placa"
            :options="placasFormulario"
            label="Placa"
            outlined
            dense
            emit-value
            map-options
          />
          <q-select
            v-model="form.tipo_gasto"
            :options="tiposFormulario"
            label="Tipo de gasto"
            outlined
            dense
            emit-value
            map-options
          />
          <CampoNumero v-model="form.valor_gasto" label="Valor" moneda />
          <q-input v-model="form.fecha_registro" type="date" label="Fecha" outlined dense stack-label :max="hoyISO()" />
          <q-input v-model.trim="form.descripcion" label="Descripción (opcional)" outlined dense autogrow />
          <!-- Soporte: factura o recibo (opcional). Al editar, los nuevos se suman a los que ya tiene -->
          <CampoArchivos
            v-model="form.archivos"
            label="Soporte (factura o recibo)"
            multiple
            :max-archivos="5"
            accept="image/*, application/pdf"
            :link-actual="editando ? detalle?.link_soporte || '' : ''"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn unelevated color="primary" :label="editando ? 'Guardar cambios' : 'Registrar'" :loading="guardando" @click="guardar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useQuasar } from 'quasar'
import { useStoreGastos } from '../stores/gastos'
import { useVisorArchivos } from '../composables/useVisorArchivos'
import CampoNumero from 'components/viajes/CampoNumero.vue'
import CampoArchivos from 'components/CampoArchivos.vue'
import { formatoPeso, formatoFecha, hoyISO } from '../utils/formato'

defineOptions({ name: 'GastosPage' })

const $q = useQuasar()
const useGasto = useStoreGastos()

// Visor de archivos (con pellizco), montado una sola vez en MainLayout
const { abrirArchivos: abrirVisor } = useVisorArchivos()

const Fila = (p) =>
  h('div', { class: 'detalle-fila' }, [
    h('span', { class: 'detalle-label' }, p.etiqueta),
    h('span', { class: ['detalle-valor', p.clase] }, p.valor),
  ])
Fila.props = ['etiqueta', 'valor', 'clase']

// ── Tipos de gasto ──

// Los que se registran a mano desde esta pantalla (el backend rechaza los automáticos)
const TIPOS_MANUALES = [
  { valor: 'soat', etiqueta: 'SOAT' },
  { valor: 'tecnico', etiqueta: 'Técnico-mecánica' },
  { valor: 'poliza', etiqueta: 'Póliza' },
  { valor: 'impuesto', etiqueta: 'Impuesto' },
  { valor: 'llantas', etiqueta: 'Llantas' },
  { valor: 'repuestos', etiqueta: 'Repuestos' },
  { valor: 'lavado', etiqueta: 'Lavado' },
  { valor: 'otro', etiqueta: 'Otro' },
]

// Los crea su propio módulo; aquí solo se ven
const TIPOS_AUTOMATICOS = {
  combustible: { etiqueta: 'Combustible', modulo: 'Combustible', color: 'orange-8' },
  viaje: { etiqueta: 'Viaje', modulo: 'Viajes', color: 'blue-7' },
  nomina_viajes: { etiqueta: 'Nómina viajes', modulo: 'Nómina', color: 'purple-6' },
  nomina_salario: { etiqueta: 'Nómina salario', modulo: 'Nómina', color: 'purple-8' },
  mantenimiento: { etiqueta: 'Mantenimiento', modulo: 'Mantenimientos', color: 'teal-7' },
}

const nombreTipo = (tipo) =>
  TIPOS_AUTOMATICOS[tipo]?.etiqueta ||
  TIPOS_MANUALES.find((t) => t.valor === tipo)?.etiqueta ||
  (tipo ? tipo.charAt(0).toUpperCase() + tipo.slice(1) : 'Sin tipo')
const colorTipo = (tipo) => TIPOS_AUTOMATICOS[tipo]?.color || 'grey-8'
const moduloDe = (tipo) => TIPOS_AUTOMATICOS[tipo]?.modulo || 'su módulo'

// ── Lista (se filtra en el cliente: el libro de una flota de 6 camiones es pequeño) ──

const POR_PAGINA = 50
const gastos = ref([])
const vehiculos = ref([])
const filtroTipo = ref('')
const filtroPlaca = ref('')
const limite = ref(POR_PAGINA)
const cargandoLista = ref(false)

// Chips de tipo según lo que hay en el libro (de la placa elegida)
const opcionesTipo = computed(() => {
  const base = filtroPlaca.value ? gastos.value.filter((g) => g.placa === filtroPlaca.value) : gastos.value
  const conteo = {}
  base.forEach((g) => {
    conteo[g.tipo_gasto] = (conteo[g.tipo_gasto] || 0) + 1
  })
  return [
    { valor: '', etiqueta: 'Todos', cantidad: base.length },
    ...Object.keys(conteo)
      .sort((a, b) => conteo[b] - conteo[a])
      .map((t) => ({ valor: t, etiqueta: nombreTipo(t), cantidad: conteo[t] })),
  ]
})

// Chips de placa solo si el usuario ve más de una
const placasFiltro = computed(() => {
  const placas = [...new Set([...vehiculos.value.map((v) => v.placa), ...gastos.value.map((g) => g.placa)])]
    .filter(Boolean)
    .sort()
  if (placas.length < 2) return []
  return [{ valor: '', etiqueta: 'Todas' }, ...placas.map((p) => ({ valor: p, etiqueta: p }))]
})

const filtrados = computed(() =>
  gastos.value.filter(
    (g) => (!filtroTipo.value || g.tipo_gasto === filtroTipo.value) && (!filtroPlaca.value || g.placa === filtroPlaca.value),
  ),
)
const visibles = computed(() => filtrados.value.slice(0, limite.value))
const totalFiltrado = computed(() => filtrados.value.reduce((s, g) => s + (Number(g.valor_gasto) || 0), 0))

function cambiarTipo(valor) {
  filtroTipo.value = valor
  limite.value = POR_PAGINA
}

function cambiarPlaca(valor) {
  filtroPlaca.value = valor
  filtroTipo.value = ''
  limite.value = POR_PAGINA
}

async function cargarGastos() {
  cargandoLista.value = true
  try {
    gastos.value = await useGasto.listarGastos()
  } finally {
    cargandoLista.value = false
  }
}

// ── Detalle (la lista ya trae todos los campos) ──

const dialogDetalle = ref(false)
const detalle = ref(null)

function verDetalle(gasto) {
  detalle.value = gasto
  dialogDetalle.value = true
}

// ── Registrar / editar ──

const dialogForm = ref(false)
const editando = ref('') // consecutivo en edición; '' = nuevo
const guardando = ref(false)

const vacio = () => ({
  placa: vehiculos.value.length === 1 ? vehiculos.value[0].placa : null,
  tipo_gasto: null,
  valor_gasto: null,
  fecha_registro: hoyISO(),
  descripcion: '',
  archivos: [],
})
const form = ref(vacio())

const placasFormulario = computed(() => vehiculos.value.map((v) => ({ label: v.placa, value: v.placa })))

// Un gasto manual antiguo puede tener un tipo que no está en la lista: se agrega para no perderlo al editar
const tiposFormulario = computed(() => {
  const opciones = TIPOS_MANUALES.map((t) => ({ label: t.etiqueta, value: t.valor }))
  const actual = form.value.tipo_gasto
  if (actual && !TIPOS_MANUALES.some((t) => t.valor === actual)) opciones.push({ label: nombreTipo(actual), value: actual })
  return opciones
})

function abrirCrear() {
  editando.value = ''
  form.value = vacio()
  dialogForm.value = true
}

function abrirEditar() {
  const g = detalle.value
  editando.value = g.consecutivo
  form.value = {
    placa: g.placa,
    tipo_gasto: g.tipo_gasto,
    valor_gasto: Number(g.valor_gasto) || null,
    fecha_registro: /^\d{4}-\d{2}-\d{2}$/.test(g.fecha_registro) ? g.fecha_registro : hoyISO(),
    descripcion: g.descripcion || '',
    archivos: [],
  }
  dialogDetalle.value = false
  dialogForm.value = true
}

/** Primer error del formulario ('' si está bien). Síncrona: sí bloquea */
function validar(f) {
  if (!f.placa) return 'Seleccione la placa'
  if (!f.tipo_gasto) return 'Seleccione el tipo de gasto'
  if (!(f.valor_gasto > 0)) return 'Escriba el valor del gasto'
  if (!f.fecha_registro) return 'Seleccione la fecha'
  if (f.fecha_registro > hoyISO()) return 'La fecha no puede ser futura'
  return ''
}

async function guardar() {
  const f = form.value
  const error = validar(f)
  if (error) {
    $q.notify({ type: 'warning', message: error, position: 'bottom' })
    return
  }
  guardando.value = true
  try {
    if (editando.value) {
      await useGasto.editarGasto(editando.value, { ...f })
    } else {
      // Sin descripción el backend pone "Gasto manual: <tipo>"
      const { descripcion, ...resto } = f
      await useGasto.registrarGasto(descripcion ? { ...resto, descripcion } : resto)
    }
    dialogForm.value = false
    await cargarGastos()
  } catch (e) {
    // El diálogo sigue abierto con lo que el usuario llenó
    $q.notify({ type: 'negative', message: e.message, position: 'bottom', timeout: 5000 })
  } finally {
    guardando.value = false
  }
}

onMounted(async () => {
  const [lista] = await Promise.all([useGasto.listarVehiculos(), cargarGastos()])
  vehiculos.value = lista
})
</script>

<style scoped>
.filter-bar {
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 12px;
}
.filter-scroll {
  overflow-x: auto;
  flex-wrap: nowrap;
  scrollbar-width: none;
}
.filter-scroll::-webkit-scrollbar {
  display: none;
}
.filter-chip {
  border-radius: 999px !important;
  font-size: 13px;
  flex-shrink: 0;
}
.viaje-card {
  border: 1px solid #e5e7eb !important;
  border-radius: 12px !important;
}
.viaje-card:active {
  opacity: 0.85;
}
.placa-badge {
  background: #111827;
  color: white;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1.5px;
  padding: 3px 10px;
  border-radius: 6px;
  font-family: monospace;
}
.placa-badge-lg {
  background: #111827;
  color: white;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
  padding: 6px 16px;
  border-radius: 8px;
  font-family: monospace;
}
.ganancia-banner {
  border-radius: 10px;
  padding: 10px 14px;
}
.ganancia-negativa {
  background: #fef2f2;
  color: #991b1b;
}
</style>

<!-- Sin scoped: los usa el componente funcional Fila -->
<style>
.detalle-fila {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.detalle-label {
  font-size: 13px;
  color: #6b7280;
}
.detalle-valor {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  text-align: right;
  max-width: 60%;
}
</style>
