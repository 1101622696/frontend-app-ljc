<template>
  <q-page padding class="bg-grey-2">
    <!-- ───────────── FILTROS ───────────── -->
    <div class="filter-bar q-mb-md">
      <div class="row items-center">
        <q-icon name="build_circle" color="orange" size="20px" />
        <span class="text-subtitle1 text-weight-medium q-ml-xs">Solicitudes de mantenimiento</span>
        <q-space />
        <q-badge color="blue-1" text-color="blue-9" rounded>{{ filtradas.length }}</q-badge>
      </div>
      <div class="text-caption text-grey-7 q-mt-xs">
        Avisos de algo raro en el vehículo. Le llegan al propietario como notificación.
      </div>

      <!-- Placa (solo si hay más de una) -->
      <div v-if="placasLista.length > 1" class="filter-scroll row no-wrap q-gutter-x-sm q-pb-xs q-mt-sm">
        <q-chip
          v-for="placa in ['', ...placasLista]"
          :key="placa || 'todas'"
          clickable
          icon="local_shipping"
          :color="filtroPlaca === placa ? 'primary' : 'grey-2'"
          :text-color="filtroPlaca === placa ? 'white' : 'grey-8'"
          class="filter-chip"
          @click="cambiarPlaca(placa)"
        >
          {{ placa || 'Todas' }}
          <q-badge v-if="conteoPorPlaca[placa || '']" rounded color="white" text-color="grey-9" class="q-ml-xs">
            {{ conteoPorPlaca[placa || ''] }}
          </q-badge>
        </q-chip>
      </div>
    </div>

    <!-- ───────────── LISTA ───────────── -->
    <div v-if="!filtradas.length && !cargandoLista" class="text-center text-grey-6 q-py-xl">
      <q-icon name="build_circle" size="48px" />
      <div class="q-mt-sm">{{ mensajeVacio }}</div>
    </div>

    <q-card
      v-for="s in visibles"
      :key="s.consecutivo"
      flat
      class="viaje-card q-mb-sm cursor-pointer"
      @click="abrirDetalle(s)"
    >
      <q-card-section class="q-py-sm">
        <div class="row items-center no-wrap">
          <span class="placa-badge">{{ s.placa }}</span>
          <span class="text-weight-bold q-ml-sm">{{ s.consecutivo }}</span>
          <q-space />
          <q-icon v-if="s.link" name="photo_camera" color="grey-6" size="16px" class="q-mr-xs" />
          <q-badge color="orange-1" text-color="orange-10" :label="nombreTipo(s.tipo_mantenimiento)" />
        </div>
        <div class="text-body2 q-mt-xs descripcion-corta">{{ s.descripcion || 'Sin descripción' }}</div>
        <div class="row items-center text-caption text-grey-7">
          <span>{{ formatoFecha(s.fecha_creacion, true) }}{{ s.usuario ? ` · ${s.usuario}` : '' }}</span>
          <q-space />
          <span v-if="s.odometro !== '' && s.odometro !== undefined">{{ formatoMiles(s.odometro) }} km</span>
        </div>
      </q-card-section>
    </q-card>

    <div v-if="visibles.length < filtradas.length" class="text-center q-my-md">
      <q-btn outline rounded color="primary" label="Cargar más" @click="limite += POR_PAGINA" />
    </div>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" label="Solicitud" @click="abrirCrear" />
    </q-page-sticky>

    <!-- ───────────── DETALLE ───────────── -->
    <q-dialog v-model="mostrarDetalles" :maximized="$q.screen.lt.md">
      <q-card v-if="detalle" style="width: 520px; max-width: 100vw">
        <q-card-section class="row items-center q-pb-sm sticky-header">
          <span class="placa-badge-lg">{{ detalle.placa }}</span>
          <div class="q-ml-md">
            <div class="text-h6">{{ detalle.consecutivo }}</div>
            <q-badge color="orange-1" text-color="orange-10" :label="nombreTipo(detalle.tipo_mantenimiento)" />
          </div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-sm">
          <div class="seccion-titulo">Lo que se notó</div>
          <div class="text-body2 q-py-sm texto-largo">{{ detalle.descripcion || '—' }}</div>

          <div class="seccion-titulo q-mt-md">Datos</div>
          <Fila etiqueta="Tipo" :valor="nombreTipo(detalle.tipo_mantenimiento)" />
          <Fila
            etiqueta="Odómetro"
            :valor="detalle.odometro !== '' && detalle.odometro !== undefined ? `${formatoMiles(detalle.odometro)} km` : ''"
          />
          <Fila etiqueta="Fecha y hora" :valor="formatoFecha(detalle.fecha_creacion, true)" />
          <Fila etiqueta="Reportó" :valor="detalle.usuario" />
          <Fila etiqueta="Correo" :valor="detalle.correo_usuario" />

          <div class="seccion-titulo q-mt-md">Fotos</div>
          <div class="row q-gutter-sm q-py-xs">
            <q-btn
              v-if="detalle.link"
              outline
              size="sm"
              icon="photo_library"
              label="Ver fotos"
              @click="abrirVisor(detalle.link, `Fotos ${detalle.consecutivo}`)"
            />
            <span v-else class="text-caption text-grey-6">Sin fotos</span>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ───────────── CREAR ───────────── -->
    <q-dialog v-model="dialogCrear" persistent :maximized="$q.screen.lt.md">
      <q-card style="width: 520px; max-width: 100vw">
        <q-card-section class="bg-grey-1 row items-center">
          <div>
            <div class="text-h6">Nueva solicitud</div>
            <div class="text-caption">Cuéntele al propietario qué notó en el vehículo</div>
          </div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <!-- Con una sola placa se muestra fija; con varias, se escoge -->
          <q-input
            v-if="placasFormulario.length === 1"
            :model-value="placasFormulario[0].value"
            label="Placa"
            outlined
            dense
            readonly
          />
          <q-select
            v-else
            v-model="form.placa"
            :options="placasFormulario"
            label="Placa"
            outlined
            dense
            emit-value
            map-options
          />
          <q-select
            v-model="form.tipo_mantenimiento"
            :options="TIPOS"
            option-value="valor"
            option-label="etiqueta"
            label="Tipo"
            outlined
            dense
            emit-value
            map-options
          />
          <q-input
            v-model.trim="form.descripcion"
            label="¿Qué notó?"
            type="textarea"
            autogrow
            outlined
            dense
            hint="Ej.: suena la suspensión delantera al frenar, bota aceite por la caja"
          />
          <CampoNumero
            v-model="form.odometro"
            label="Odómetro (opcional)"
            sufijo="km"
            :hint="odometroActual !== null ? `Último registrado: ${formatoMiles(odometroActual)} km` : ''"
          />
          <CampoArchivos
            v-model="form.archivos"
            label="Fotos (opcional)"
            multiple
            accept="image/*"
            :max-archivos="6"
          />
          <div class="text-caption text-grey-7">En el celular puede tomar la foto directamente con la cámara.</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn unelevated color="primary" icon="send" label="Enviar" :loading="guardando" @click="guardarCrear" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import { useStoreSolicitudes } from '../stores/solicitudes'
import { useStoreUsuarios } from '../stores/usuarios'
import { useStoreVehiculos } from '../stores/vehiculos'
import { useVisorArchivos } from '../composables/useVisorArchivos'
import CampoArchivos from 'components/CampoArchivos.vue'
import CampoNumero from 'components/viajes/CampoNumero.vue'
import { formatoMiles, formatoFecha } from '../utils/formato'

defineOptions({ name: 'SolicitudesPage' })

const $q = useQuasar()
const route = useRoute()
const useSolicitud = useStoreSolicitudes()
const useUsuario = useStoreUsuarios()
const useVehiculo = useStoreVehiculos()

// Visor de archivos (con pellizco), montado una sola vez en MainLayout
const { abrirArchivos: abrirVisor } = useVisorArchivos()

// ── Componente pequeño de la vista ──

const Fila = (props) =>
  h('div', { class: 'detalle-fila' }, [
    h('span', { class: 'detalle-label' }, props.etiqueta),
    h(
      'span',
      { class: ['detalle-valor', props.clase] },
      props.valor === '' || props.valor === undefined || props.valor === null ? '—' : props.valor,
    ),
  ])
Fila.props = ['etiqueta', 'valor', 'clase']

// ── Catálogo (en minúscula para comparar y enviar) ──

const TIPOS = [
  { valor: 'correctivo', etiqueta: 'Correctivo' },
  { valor: 'preventivo', etiqueta: 'Preventivo' },
  { valor: 'otro', etiqueta: 'Otro' },
]
const nombreTipo = (t) => TIPOS.find((x) => x.valor === t)?.etiqueta || t || 'Sin tipo'

// ── Perfil ──

const esAdmin = computed(() => useUsuario.perfile === 'administrador')
const esConductor = computed(() => useUsuario.perfile === 'conductor')
// placa_asignada = 'SNT473, STA778' → ['SNT473', 'STA778']
const misPlacas = computed(() =>
  String(useUsuario.user?.placa_asignada || '')
    .split(',')
    .map((p) => p.replace(/\s+/g, '').toUpperCase())
    .filter(Boolean),
)

// ── Vehículos (placas del formulario y odómetro actual) ──

const vehiculos = ref([])

async function cargarVehiculos() {
  // El backend filtra por perfil: conductor y propietario reciben solo sus vehículos
  const lista = await useVehiculo.obtenerVehiculos()
  vehiculos.value = Array.isArray(lista) ? lista : []
}

/** Conductor: sus placas asignadas. Propietario/admin: sus vehículos activos (si no cargaron, sus placas) */
const placasFormulario = computed(() => {
  let placas
  if (esConductor.value) placas = misPlacas.value
  else {
    placas = vehiculos.value.filter((v) => v.estado !== 'inactivo').map((v) => v.placa)
    if (!placas.length && !esAdmin.value) placas = misPlacas.value
  }
  return placas.map((p) => ({ label: p, value: p }))
})

const odometroActual = computed(() => {
  const v = vehiculos.value.find((x) => x.placa === form.value.placa)
  const n = Number(v?.odometro)
  return v && v.odometro !== '' && Number.isFinite(n) ? n : null
})

// ── Lista y filtro por placa (en el cliente: la lista ya viene completa) ──

const POR_PAGINA = 30
const solicitudes = ref([])
const cargandoLista = ref(false)
const filtroPlaca = ref('')
const limite = ref(POR_PAGINA)

async function cargarSolicitudes() {
  cargandoLista.value = true
  try {
    solicitudes.value = await useSolicitud.listarSolicitudes({
      esAdmin: esAdmin.value,
      placas: misPlacas.value,
    })
  } finally {
    cargandoLista.value = false
  }
}

const placasLista = computed(() => {
  const set = new Set(esAdmin.value ? [] : misPlacas.value)
  solicitudes.value.forEach((s) => s.placa && set.add(s.placa))
  return [...set].sort()
})

const conteoPorPlaca = computed(() => {
  const conteo = { '': solicitudes.value.length }
  solicitudes.value.forEach((s) => {
    conteo[s.placa] = (conteo[s.placa] || 0) + 1
  })
  return conteo
})

const filtradas = computed(() =>
  filtroPlaca.value ? solicitudes.value.filter((s) => s.placa === filtroPlaca.value) : solicitudes.value,
)

const visibles = computed(() => filtradas.value.slice(0, limite.value))

function cambiarPlaca(placa) {
  filtroPlaca.value = placa
  limite.value = POR_PAGINA
}

const mensajeVacio = computed(() => {
  if (!esAdmin.value && !misPlacas.value.length) return 'No tiene placas asignadas. Comuníquese con el administrador.'
  if (filtroPlaca.value) return `No hay solicitudes de ${filtroPlaca.value}`
  return 'No hay solicitudes. Si nota algo raro en el vehículo, cree una con el botón +'
})

// ── Detalle (la lista ya trae todos los campos: no hace falta otra consulta) ──

const detalle = ref(null)
const mostrarDetalles = ref(false)

function abrirDetalle(solicitud) {
  detalle.value = solicitud
  mostrarDetalles.value = true
}

/** Al llegar desde una notificación (?consecutivo=S-5) se abre esa solicitud */
async function abrirDesdeRuta() {
  const consecutivo = route.query?.consecutivo
  if (!consecutivo) return
  const enLista = solicitudes.value.find((s) => s.consecutivo === consecutivo)
  const data = enLista || (await useSolicitud.obtenerdatodessolicitud(consecutivo))
  if (data) abrirDetalle(data)
}

// ─────────────────────────────────────────────────────────────
// Crear
// ─────────────────────────────────────────────────────────────

// Función: cada formulario recibe un objeto y un arreglo de fotos NUEVOS
const vacio = () => ({
  placa: null,
  tipo_mantenimiento: 'correctivo',
  descripcion: '',
  odometro: null,
  archivos: [],
})

const dialogCrear = ref(false)
const form = ref(vacio())
const guardando = ref(false)

function abrirCrear() {
  form.value = vacio()
  // Se precarga cada vez que se abre (antes se perdía después del primer registro)
  if (placasFormulario.value.length === 1) form.value.placa = placasFormulario.value[0].value
  dialogCrear.value = true
}

/** Síncrona: devuelve el primer error o '' */
function validar() {
  const f = form.value
  if (!f.placa) return 'Seleccione la placa'
  if (!f.tipo_mantenimiento) return 'Seleccione el tipo'
  if (!f.descripcion) return 'Cuente qué notó en el vehículo'
  if (f.descripcion.length < 5) return 'Describa un poco más lo que notó'
  if (f.odometro !== null && odometroActual.value !== null && f.odometro < odometroActual.value) {
    return `El odómetro no puede ser menor al último registrado (${formatoMiles(odometroActual.value)} km)`
  }
  return ''
}

async function guardarCrear() {
  const error = validar()
  if (error) {
    $q.notify({ type: 'warning', message: error, position: 'bottom' })
    return
  }

  const f = form.value
  const fd = new FormData()
  fd.append('placa', f.placa) // una sola placa, nunca la lista completa del usuario
  fd.append('tipo_mantenimiento', f.tipo_mantenimiento)
  fd.append('descripcion', f.descripcion)
  if (f.odometro !== null) fd.append('odometro', String(f.odometro))
  f.archivos.forEach((a) => fd.append('archivos', a))

  guardando.value = true
  try {
    const r = await useSolicitud.crearSolicitud(fd)
    dialogCrear.value = false
    $q.notify({
      type: 'positive',
      message: `Solicitud ${r?.consecutivo || ''} enviada. El propietario de ${r?.placa || f.placa} recibirá el aviso.`,
      position: 'bottom',
      timeout: 5000,
    })
    await Promise.all([cargarSolicitudes(), cargarVehiculos()])
  } catch (e) {
    // El diálogo sigue abierto con lo que el usuario escribió
    $q.notify({ type: 'negative', message: e.message, position: 'bottom', timeout: 5000 })
  } finally {
    guardando.value = false
  }
}

// ── Inicio ──

onMounted(async () => {
  await Promise.all([cargarVehiculos(), cargarSolicitudes()])
  await abrirDesdeRuta()
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
.seccion-titulo {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #9ca3af;
  margin-bottom: 4px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
/* Dos líneas de la descripción en la tarjeta */
.descripcion-corta {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.texto-largo {
  white-space: pre-wrap;
  word-break: break-word;
}
.sticky-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 2;
}
</style>

<!-- Sin scoped: lo usa el componente funcional Fila -->
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
