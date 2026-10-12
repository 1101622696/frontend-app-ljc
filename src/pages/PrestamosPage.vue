<template>
  <q-page padding class="bg-grey-2">
    <!-- Filtros por estado -->
    <div class="filter-bar q-mb-md">
      <div class="filter-scroll row no-wrap q-gutter-x-sm">
        <q-chip
          v-for="e in opcionesEstado"
          :key="e.valor"
          clickable
          :color="filtroEstado === e.valor ? 'primary' : 'grey-2'"
          :text-color="filtroEstado === e.valor ? 'white' : 'grey-8'"
          class="filter-chip"
          @click="cambiarEstado(e.valor)"
        >
          {{ e.etiqueta }}
          <q-badge v-if="e.cantidad" rounded color="white" text-color="grey-9" class="q-ml-xs">{{ e.cantidad }}</q-badge>
        </q-chip>
      </div>
      <div v-if="porDescontar" class="text-caption text-grey-8 q-mt-sm">
        Por descontar en salario: <b class="text-negative">{{ formatoPeso(porDescontar) }}</b>
      </div>
    </div>

    <div v-if="!prestamos.length && !usePrestamo.loading" class="text-center text-grey-6 q-py-xl">
      <q-icon name="savings" size="48px" />
      <div class="q-mt-sm">No hay préstamos</div>
    </div>

    <q-card
      v-for="p in prestamos"
      :key="p.consecutivo"
      flat
      class="tarjeta q-mb-sm cursor-pointer"
      @click="verDetalle(p.consecutivo)"
    >
      <q-card-section class="q-py-sm">
        <div class="row items-center no-wrap">
          <span class="text-weight-bold">{{ p.consecutivo }}</span>
          <span v-if="!esConductor" class="q-ml-sm ellipsis">{{ p.usuario }}</span>
          <q-space />
          <q-badge :color="colorEstado(p.estado_prestamo)" :label="nombreEstado(p.estado_prestamo)" />
        </div>
        <div class="row items-center q-mt-xs">
          <span class="text-caption text-grey-7">{{ formatoFecha(p.fecha_creacion) }}{{ p.motivo ? ` · ${p.motivo}` : '' }}</span>
          <q-space />
          <span class="text-body2 text-weight-bold">
            {{ formatoPeso(p.estado_prestamo === 'pendiente' || p.estado_prestamo === 'rechazado' ? p.valor_pedido : p.valor_prestado) }}
          </span>
        </div>
      </q-card-section>
    </q-card>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" label="Préstamo" @click="abrirSolicitar" />
    </q-page-sticky>

    <!-- ───────────── DETALLE ───────────── -->
    <q-dialog v-model="dialogDetalle">
      <q-card v-if="detalle" style="width: 480px; max-width: 95vw">
        <q-card-section class="row items-center">
          <div>
            <div class="text-h6">{{ detalle.consecutivo }}</div>
            <q-badge :color="colorEstado(detalle.estado_prestamo)" :label="nombreEstado(detalle.estado_prestamo)" />
          </div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <Fila etiqueta="Conductor" :valor="detalle.usuario" />
          <Fila etiqueta="Fecha de solicitud" :valor="formatoFecha(detalle.fecha_creacion)" />
          <Fila etiqueta="Valor pedido" :valor="formatoPeso(detalle.valor_pedido)" />
          <Fila v-if="detalle.motivo" etiqueta="Motivo" :valor="detalle.motivo" />
          <template v-if="['desembolsado', 'liquidado'].includes(detalle.estado_prestamo)">
            <Fila etiqueta="Valor prestado" :valor="formatoPeso(detalle.valor_prestado)" clase="text-weight-bold" />
            <Fila etiqueta="Fecha desembolso" :valor="formatoFecha(detalle.fecha_desembolso)" />
          </template>
          <Fila v-if="detalle.estado_prestamo === 'liquidado'" etiqueta="Descontado en" :valor="detalle.consecutivo_nomina || '—'" />
          <Fila v-if="detalle.estado_prestamo === 'rechazado'" etiqueta="Motivo del rechazo" :valor="detalle.motivo_rechazo || '—'" />
          <q-banner v-if="detalle.estado_prestamo === 'desembolsado'" dense rounded class="bg-blue-1 text-blue-10 q-mt-md">
            Se descuenta completo en la próxima nómina de salario.
          </q-banner>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-if="detalle.link_comprobante" outline size="sm" icon="receipt" label="Comprobante" @click="abrirVisor(detalle.link_comprobante, 'Comprobante del desembolso')" />
          <q-space />
          <template v-if="esGestion && detalle.estado_prestamo === 'pendiente'">
            <q-btn flat color="negative" label="Rechazar" @click="abrirRechazar" />
            <q-btn unelevated color="green" icon="payments" label="Desembolsar" @click="abrirDesembolsar" />
          </template>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ───────────── SOLICITAR ───────────── -->
    <q-dialog v-model="dialogSolicitar" persistent>
      <q-card style="width: 440px; max-width: 95vw">
        <q-card-section class="bg-grey-1"><div class="text-h6">Solicitar préstamo</div></q-card-section>
        <q-card-section class="q-gutter-md">
          <q-select
            v-if="!esConductor"
            v-model="formSolicitar.correo_conductor"
            :options="conductores"
            label="Conductor"
            outlined
            dense
            emit-value
            map-options
          />
          <CampoNumero v-model="formSolicitar.valor_pedido" label="Valor" moneda />
          <q-input v-model.trim="formSolicitar.motivo" label="¿Para qué es? (opcional)" outlined dense />
          <div class="text-caption text-grey-7">Si se aprueba, se descuenta completo de su próximo salario.</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn unelevated color="primary" label="Solicitar" :loading="guardando" @click="guardarSolicitar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ───────────── DESEMBOLSAR ───────────── -->
    <q-dialog v-model="dialogDesembolsar" persistent>
      <q-card style="width: 460px; max-width: 95vw">
        <q-card-section class="bg-grey-1">
          <div class="text-h6">Desembolsar {{ detalle?.consecutivo }}</div>
          <div class="text-caption">{{ detalle?.usuario }} pidió {{ formatoPeso(detalle?.valor_pedido) }}</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <CampoNumero v-model="formDesembolso.valor_prestado" label="Valor consignado" moneda hint="Puede ser menor a lo que pidió" />
          <q-input v-model="formDesembolso.fecha_desembolso" type="date" label="Fecha" outlined dense stack-label />
          <CampoArchivos v-model="formDesembolso.comprobante" label="Comprobante (obligatorio)" multiple accept="image/*, application/pdf" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn unelevated color="green" label="Registrar desembolso" :loading="guardando" @click="guardarDesembolso" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ───────────── RECHAZAR ───────────── -->
    <q-dialog v-model="dialogRechazar" persistent>
      <q-card style="width: 420px; max-width: 95vw">
        <q-card-section class="text-h6">Rechazar {{ detalle?.consecutivo }}</q-card-section>
        <q-card-section>
          <q-input v-model.trim="motivoRechazo" label="Motivo (se le muestra al conductor)" outlined dense autogrow />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn unelevated color="negative" label="Rechazar" :loading="guardando" @click="guardarRechazo" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useQuasar } from 'quasar'
import { useStorePrestamos } from '../stores/prestamos'
import { useStoreUsuarios } from '../stores/usuarios'
import { useVisorArchivos } from '../composables/useVisorArchivos'
import CampoArchivos from 'components/CampoArchivos.vue'
import CampoNumero from 'components/viajes/CampoNumero.vue'
import { formatoPeso, formatoFecha, hoyISO } from '../utils/formato'

defineOptions({ name: 'PrestamosPage' })

const $q = useQuasar()
const usePrestamo = useStorePrestamos()
const useUsuario = useStoreUsuarios()

// Visor de archivos (con pellizco), montado una sola vez en MainLayout
const { abrirArchivos: abrirVisor } = useVisorArchivos()

const Fila = (p) =>
  h('div', { class: 'detalle-fila' }, [
    h('span', { class: 'detalle-label' }, p.etiqueta),
    h('span', { class: ['detalle-valor', p.clase] }, p.valor),
  ])
Fila.props = ['etiqueta', 'valor', 'clase']

const esConductor = computed(() => useUsuario.perfile === 'conductor')
const esGestion = computed(() => ['administrador', 'propietario'].includes(useUsuario.perfile))

const ESTADOS = [
  { valor: 'pendiente', etiqueta: 'Pendiente', color: 'orange' },
  { valor: 'desembolsado', etiqueta: 'Por descontar', color: 'blue' },
  { valor: 'liquidado', etiqueta: 'Descontado', color: 'positive' },
  { valor: 'rechazado', etiqueta: 'Rechazado', color: 'grey-6' },
]
const nombreEstado = (e) => ESTADOS.find((x) => x.valor === e)?.etiqueta || e
const colorEstado = (e) => ESTADOS.find((x) => x.valor === e)?.color || 'grey'

// ── Lista ──

const prestamos = ref([])
const totales = ref({})
const porDescontar = ref(0)
const filtroEstado = ref('')

const opcionesEstado = computed(() => [
  { valor: '', etiqueta: 'Todos', cantidad: Object.values(totales.value).reduce((a, b) => a + b, 0) },
  ...ESTADOS.map((e) => ({ ...e, cantidad: totales.value[e.valor] || 0 })),
])

async function cargar() {
  const r = await usePrestamo.listarPrestamos(filtroEstado.value)
  prestamos.value = r.datos || []
  totales.value = r.totales || {}
  porDescontar.value = r.por_descontar || 0
}

function cambiarEstado(valor) {
  filtroEstado.value = valor
  cargar()
}

// ── Detalle ──

const dialogDetalle = ref(false)
const detalle = ref(null)

async function verDetalle(consecutivo) {
  const data = await usePrestamo.obtenerdatodeprestamo(consecutivo)
  if (!data) return
  detalle.value = data
  dialogDetalle.value = true
}

const guardando = ref(false)
async function ejecutar(fn) {
  guardando.value = true
  try {
    await fn()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message, position: 'bottom', timeout: 5000 })
  } finally {
    guardando.value = false
  }
}
const avisar = (m) => $q.notify({ type: 'warning', message: m, position: 'bottom' })

// ── Solicitar ──

const dialogSolicitar = ref(false)
const formSolicitar = ref({})
const conductores = ref([])

async function abrirSolicitar() {
  formSolicitar.value = { correo_conductor: null, valor_pedido: null, motivo: '' }
  if (!esConductor.value && !conductores.value.length) {
    const lista =
      useUsuario.perfile === 'administrador'
        ? await useUsuario.listarUsuario()
        : await useUsuario.obtenerUsuariosPorPropietario(useUsuario.user?.email)
    conductores.value = (Array.isArray(lista) ? lista : [])
      .filter((u) => u.perfil === 'conductor' && String(u.estado).toLowerCase() === 'activo')
      .map((u) => ({ label: u.nombre, value: u.email }))
  }
  dialogSolicitar.value = true
}

async function guardarSolicitar() {
  const f = formSolicitar.value
  if (!esConductor.value && !f.correo_conductor) return avisar('Seleccione el conductor')
  if (!(f.valor_pedido > 0)) return avisar('Escriba el valor')
  await ejecutar(async () => {
    await usePrestamo.solicitarPrestamo(f)
    dialogSolicitar.value = false
    await cargar()
  })
}

// ── Desembolsar / rechazar ──

const dialogDesembolsar = ref(false)
const formDesembolso = ref({})

function abrirDesembolsar() {
  formDesembolso.value = { valor_prestado: Number(detalle.value.valor_pedido) || null, fecha_desembolso: hoyISO(), comprobante: [] }
  dialogDesembolsar.value = true
}

async function guardarDesembolso() {
  const f = formDesembolso.value
  if (!(f.valor_prestado > 0)) return avisar('Escriba el valor consignado')
  if (!f.comprobante.length) return avisar('Adjunte el comprobante')
  const fd = new FormData()
  fd.append('valor_prestado', String(f.valor_prestado))
  fd.append('fecha_desembolso', f.fecha_desembolso || '')
  f.comprobante.forEach((a) => fd.append('comprobante', a))
  const consecutivo = detalle.value.consecutivo
  await ejecutar(async () => {
    await usePrestamo.desembolsarPrestamo(consecutivo, fd)
    dialogDesembolsar.value = false
    await cargar()
    await verDetalle(consecutivo)
  })
}

const dialogRechazar = ref(false)
const motivoRechazo = ref('')

function abrirRechazar() {
  motivoRechazo.value = ''
  dialogRechazar.value = true
}

async function guardarRechazo() {
  const consecutivo = detalle.value.consecutivo
  await ejecutar(async () => {
    await usePrestamo.rechazarPrestamo(consecutivo, motivoRechazo.value)
    dialogRechazar.value = false
    await cargar()
    await verDetalle(consecutivo)
  })
}

onMounted(cargar)
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
.tarjeta {
  border: 1px solid #e5e7eb !important;
  border-radius: 12px !important;
}
</style>

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
  text-align: right;
  max-width: 60%;
}
</style>
