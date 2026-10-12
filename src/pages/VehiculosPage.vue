<template>
  <q-page padding class="bg-grey-2">
    <!-- ───────────── FILTROS ───────────── -->
    <div class="filter-bar q-mb-md">
      <div class="filter-scroll row no-wrap q-gutter-x-sm q-pb-xs">
        <q-chip
          v-for="opcion in opcionesFiltro"
          :key="opcion.valor"
          clickable
          :icon="opcion.icono"
          :color="filtro === opcion.valor ? 'primary' : 'grey-2'"
          :text-color="filtro === opcion.valor ? 'white' : 'grey-8'"
          class="filter-chip"
          @click="filtro = opcion.valor"
        >
          {{ opcion.etiqueta }}
          <q-badge v-if="opcion.cantidad" rounded color="white" text-color="grey-9" class="q-ml-xs">
            {{ opcion.cantidad }}
          </q-badge>
        </q-chip>
      </div>
      <div v-if="esConductor" class="text-caption text-grey-7 q-mt-xs">
        Vea el estado de su vehículo. Si algún dato está mal, avísele al propietario.
      </div>
    </div>

    <!-- ───────────── LISTA ───────────── -->
    <div v-if="!vehiculosFiltrados.length && !cargandoLista" class="text-center text-grey-6 q-py-xl">
      <q-icon name="local_shipping" size="48px" />
      <div class="q-mt-sm">{{ mensajeVacio }}</div>
    </div>

    <q-card
      v-for="v in vehiculosFiltrados"
      :key="v.placa"
      flat
      class="viaje-card q-mb-sm cursor-pointer"
      :class="{ 'tarjeta-inactiva': v.estado !== 'activo' }"
      @click="verDetalle(v.placa)"
    >
      <q-card-section class="q-py-sm">
        <div class="row items-center no-wrap">
          <span class="placa-badge">{{ v.placa }}</span>
          <div class="q-ml-sm ellipsis">
            <div class="text-body2 text-weight-medium ellipsis">{{ v.marca || 'Sin marca' }} {{ v.modelo }}</div>
            <div class="text-caption text-grey-7">{{ formatoMiles(v.odometro) || '—' }} km</div>
          </div>
          <q-space />
          <q-badge
            :color="v.estado === 'activo' ? 'green-1' : 'grey-4'"
            :text-color="v.estado === 'activo' ? 'green-9' : 'grey-8'"
            :label="v.estado === 'activo' ? 'Activo' : 'Inactivo'"
          />
        </div>

        <!-- Semáforo de documentos -->
        <div class="row q-gutter-xs q-mt-xs">
          <q-badge
            v-for="doc in DOCUMENTOS"
            :key="doc.clave"
            outline
            :color="infoDoc(v[doc.clave]).color"
            class="doc-chip"
          >
            <q-icon :name="infoDoc(v[doc.clave]).icono" size="12px" class="q-mr-xs" />
            {{ doc.corto }} · {{ textoDias(v[doc.clave], v['dias_' + doc.clave]) }}
          </q-badge>
        </div>
      </q-card-section>
    </q-card>

    <q-page-sticky v-if="puedeGestionar" position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" label="Vehículo" @click="abrirCrear" />
    </q-page-sticky>

    <!-- ───────────── DETALLE ───────────── -->
    <q-dialog v-model="mostrarDetalle" :maximized="$q.screen.lt.md">
      <q-card v-if="detalle" style="width: 560px; max-width: 100vw">
        <q-card-section class="row items-center q-pb-sm sticky-header">
          <span class="placa-badge-lg">{{ detalle.placa }}</span>
          <div class="q-ml-md">
            <div class="text-subtitle1 text-weight-medium">{{ detalle.marca }} {{ detalle.modelo }}</div>
            <q-badge
              :color="detalle.estado === 'activo' ? 'positive' : 'grey-6'"
              :label="detalle.estado === 'activo' ? 'Activo' : 'Inactivo'"
            />
          </div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-sm">
          <!-- Documentos primero: es lo que más se consulta -->
          <div class="seccion-titulo">Documentos</div>
          <div v-for="doc in DOCUMENTOS" :key="doc.clave" class="doc-legal-card q-mb-sm" :class="'borde-' + infoDoc(detalle[doc.clave]).color">
            <div class="row items-center">
              <span class="text-body2 text-weight-medium">{{ doc.nombre }}</span>
              <q-space />
              <q-badge :color="infoDoc(detalle[doc.clave]).color" :label="infoDoc(detalle[doc.clave]).etiqueta" />
            </div>
            <div class="row q-mt-xs text-caption">
              <div class="col">
                <div class="text-grey-6">Expedición</div>
                <div>{{ formatoFecha(detalle[doc.clave + '_expedicion']) }}</div>
              </div>
              <div class="col">
                <div class="text-grey-6">Vencimiento</div>
                <div>{{ formatoFecha(detalle[doc.clave + '_vencimiento']) }}</div>
              </div>
              <div class="col text-right">
                <div class="text-grey-6">Quedan</div>
                <div class="text-weight-bold" :class="'text-' + infoDoc(detalle[doc.clave]).color">
                  {{ textoDias(detalle[doc.clave], detalle['dias_' + doc.clave], true) }}
                </div>
              </div>
            </div>
          </div>

          <div class="seccion-titulo q-mt-md">Operación</div>
          <Fila etiqueta="Odómetro" :valor="detalle.odometro !== '' && detalle.odometro !== undefined ? `${formatoMiles(detalle.odometro)} km` : ''" />
          <Fila etiqueta="Viajes" :valor="formatoMiles(detalle.viajes || 0)" />
          <Fila etiqueta="Rendimiento esperado" :valor="detalle.rendimiento_galon ? `${formatoDecimal(detalle.rendimiento_galon)} km/gal` : ''" />
          <Fila etiqueta="Capacidad" :valor="detalle.capacidad_ton ? `${formatoDecimal(detalle.capacidad_ton)} t` : ''" />
          <Fila v-if="detalle.capacidad" etiqueta="Capacidad (tarjeta)" :valor="detalle.capacidad" />
          <Fila etiqueta="Código Satrack" :valor="detalle.service_code" />

          <div class="seccion-titulo q-mt-md">Identificación</div>
          <Fila etiqueta="Marca" :valor="detalle.marca" />
          <Fila etiqueta="Modelo" :valor="detalle.modelo" />
          <Fila etiqueta="Referencia" :valor="detalle.referencia" />
          <Fila etiqueta="Clase" :valor="detalle.clase_vehiculo" />
          <Fila etiqueta="Color" :valor="detalle.color" />
          <Fila etiqueta="Servicio" :valor="detalle.servicio" />
          <Fila etiqueta="Combustible" :valor="detalle.combustible" />
          <Fila etiqueta="Licencia de tránsito" :valor="detalle.licencia" />
          <Fila etiqueta="N° motor" :valor="detalle.numero_motor" />
          <Fila etiqueta="N° chasis" :valor="detalle.numero_chasis" />
          <Fila etiqueta="Fecha de matrícula" :valor="formatoFecha(detalle.fecha_matricula)" />
          <Fila etiqueta="Registrado" :valor="formatoFecha(detalle.fecha_creacion)" />
        </q-card-section>

        <q-card-actions class="q-pa-md bg-grey-1 sticky-footer">
          <q-btn
            v-if="detalle.link"
            outline
            size="sm"
            color="secondary"
            icon="folder"
            label="Archivos"
            @click="abrirVisor(detalle.link, `Documentos ${detalle.placa}`)"
          />
          <q-space />
          <template v-if="puedeGestionar">
            <q-btn
              flat
              :color="detalle.estado === 'activo' ? 'negative' : 'positive'"
              :icon="detalle.estado === 'activo' ? 'block' : 'check_circle'"
              :label="detalle.estado === 'activo' ? 'Desactivar' : 'Activar'"
              :loading="cambiandoEstado"
              @click="pedirCambioEstado"
            />
            <q-btn unelevated color="primary" icon="edit" label="Editar" @click="abrirEditar" />
          </template>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ───────────── CREAR / EDITAR ───────────── -->
    <q-dialog v-model="dialogForm" persistent :maximized="$q.screen.lt.md">
      <q-card style="width: 640px; max-width: 100vw">
        <q-card-section class="bg-grey-1 row items-center sticky-header">
          <div>
            <div class="text-h6">{{ esEdicion ? `Editar ${placaEditando}` : 'Nuevo vehículo' }}</div>
            <div class="text-caption text-grey-7">Lo marcado con * es obligatorio</div>
          </div>
          <q-space />
          <q-btn flat round icon="close" :disable="guardando" v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <!-- Vehículo -->
          <div class="seccion-titulo">Vehículo</div>
          <q-input
            v-if="!esEdicion"
            :model-value="formulario.placa"
            label="Placa *"
            hint="Sin espacios ni guiones, ej. SNT473. Después no se puede cambiar."
            outlined
            dense
            maxlength="7"
            @update:model-value="escribirPlaca"
          />
          <q-input v-else :model-value="placaEditando" label="Placa" outlined dense readonly hint="La placa no se puede cambiar" />

          <q-banner v-if="!esEdicion && esPropietario" dense rounded class="bg-blue-1 text-blue-10">
            <template #avatar><q-icon name="info" /></template>
            La placa {{ formulario.placa || 'nueva' }} quedará asignada a usted y la verá en todas sus listas.
          </q-banner>

          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6"><q-input v-model.trim="formulario.marca" label="Marca *" outlined dense /></div>
            <div class="col-12 col-sm-6"><q-input v-model.trim="formulario.modelo" label="Modelo (año) *" inputmode="numeric" outlined dense /></div>
            <div class="col-12 col-sm-6"><q-input v-model.trim="formulario.referencia" label="Referencia / línea" outlined dense /></div>
            <div class="col-12 col-sm-6"><q-select v-model="formulario.clase_vehiculo" :options="CLASES" label="Clase" outlined dense /></div>
            <div class="col-12 col-sm-6"><q-input v-model.trim="formulario.color" label="Color" outlined dense /></div>
            <div class="col-12 col-sm-6"><q-select v-model="formulario.servicio" :options="SERVICIOS" label="Servicio" outlined dense /></div>
            <div class="col-12 col-sm-6"><q-select v-model="formulario.combustible" :options="COMBUSTIBLES" label="Combustible" outlined dense /></div>
            <div class="col-12 col-sm-6"><q-input v-model="formulario.fecha_matricula" type="date" label="Fecha de matrícula" outlined dense stack-label /></div>
            <div class="col-12 col-sm-6"><q-input v-model.trim="formulario.licencia" label="Licencia de tránsito" outlined dense /></div>
            <div class="col-12 col-sm-6"><q-input v-model.trim="formulario.numero_motor" label="N° motor" outlined dense /></div>
            <div class="col-12"><q-input v-model.trim="formulario.numero_chasis" label="N° chasis" outlined dense /></div>
          </div>

          <!-- Operación -->
          <div class="seccion-titulo">Operación</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <CampoNumero
                v-model="formulario.odometro"
                label="Odómetro"
                sufijo="km"
                :hint="esEdicion && odometroActual ? `Registrado: ${formatoMiles(odometroActual)} km. No puede ser menor.` : 'Kilometraje actual del tablero'"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model.trim="formulario.capacidad_ton"
                label="Capacidad"
                suffix="t"
                inputmode="decimal"
                hint="Toneladas que carga, ej. 34,5"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model.trim="formulario.rendimiento_galon"
                label="Rendimiento esperado"
                suffix="km/gal"
                inputmode="decimal"
                hint="Con esto se comparan los tanqueos, ej. 8,5. Si lo deja vacío: 8"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model.trim="formulario.service_code"
                label="Código Satrack (service_code)"
                hint="Como aparece en Satrack. Si lo deja vacío se usa la placa"
                outlined
                dense
              />
            </div>
            <div class="col-12">
              <q-input v-model.trim="formulario.capacidad" label="Capacidad según la tarjeta (opcional)" outlined dense />
            </div>
          </div>

          <!-- Documentos -->
          <div class="seccion-titulo">Documentos</div>
          <div class="text-caption text-grey-8">
            Si no escribe la fecha de vencimiento, vence a 1 año de la expedición. Escríbala solo cuando el documento
            vence en otra fecha: por ejemplo, la tecnomecánica de un vehículo nuevo no vence al año.
          </div>
          <div v-for="doc in DOCUMENTOS" :key="doc.clave" class="doc-legal-card">
            <div class="text-body2 text-weight-medium q-mb-sm">{{ doc.nombre }}</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-input
                  :model-value="formulario[doc.clave + '_expedicion']"
                  type="date"
                  label="Expedición"
                  outlined
                  dense
                  stack-label
                  bg-color="white"
                  @update:model-value="cambiarExpedicion(doc.clave, $event)"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="formulario[doc.clave + '_vencimiento']"
                  type="date"
                  label="Vencimiento (opcional)"
                  outlined
                  dense
                  stack-label
                  clearable
                  bg-color="white"
                  :hint="hintVencimiento(doc.clave)"
                />
              </div>
            </div>
          </div>

          <!-- Archivos -->
          <div class="seccion-titulo">Archivos</div>
          <CampoArchivos
            v-model="formulario.archivos"
            label="Tarjeta de propiedad, SOAT, tecnomecánica, póliza…"
            multiple
            accept="image/*, application/pdf"
            :link-actual="esEdicion ? detalle?.link || '' : ''"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-1 sticky-footer">
          <q-btn flat label="Cancelar" color="grey-8" :disable="guardando" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            :icon="esEdicion ? 'save' : 'add'"
            :label="esEdicion ? 'Guardar cambios' : 'Crear vehículo'"
            :loading="guardando"
            @click="guardar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useQuasar } from 'quasar'
import { useStoreVehiculos } from '../stores/vehiculos'
import { useStoreUsuarios } from '../stores/usuarios'
import { useVisorArchivos } from '../composables/useVisorArchivos'
import CampoArchivos from 'components/CampoArchivos.vue'
import CampoNumero from 'components/viajes/CampoNumero.vue'
import { formatoMiles, formatoFecha } from '../utils/formato'

defineOptions({ name: 'VehiculosPage' })

const $q = useQuasar()
const useVehiculo = useStoreVehiculos()
const useUsuario = useStoreUsuarios()

// Visor de archivos (con pellizco), montado una sola vez en MainLayout
const { abrirArchivos: abrirVisor } = useVisorArchivos()

// Fila "etiqueta: valor" del detalle (mismo patrón de ViajesPage)
const Fila = (props) =>
  h('div', { class: 'detalle-fila' }, [
    h('span', { class: 'detalle-label' }, props.etiqueta),
    h('span', { class: ['detalle-valor', props.clase] }, props.valor === '' || props.valor === undefined || props.valor === null ? '—' : props.valor),
  ])
Fila.props = ['etiqueta', 'valor', 'clase']

// ── Perfil ──

const esConductor = computed(() => useUsuario.perfile === 'conductor')
const esPropietario = computed(() => useUsuario.perfile === 'propietario')
// El conductor solo consulta; crear, editar y activar es de propietario y admin (el backend también lo exige)
const puedeGestionar = computed(() => ['administrador', 'propietario'].includes(useUsuario.perfile))

// ── Documentos y su semáforo ──
// El backend calcula el estado y los días con la fecha de vencimiento al momento de consultar.

const DOCUMENTOS = [
  { clave: 'soat', nombre: 'SOAT', corto: 'SOAT' },
  { clave: 'tecnico', nombre: 'Técnico-mecánica', corto: 'Tecno' },
  { clave: 'poliza', nombre: 'Póliza', corto: 'Póliza' },
]

const ESTADOS_DOC = {
  activo: { etiqueta: 'Al día', color: 'positive', icono: 'check_circle' },
  'proxima a vencer': { etiqueta: 'Por vencer', color: 'orange-9', icono: 'schedule' },
  vencido: { etiqueta: 'Vencido', color: 'negative', icono: 'error' },
  'sin fecha': { etiqueta: 'Sin fecha', color: 'grey-7', icono: 'help_outline' },
}
const infoDoc = (estado) => ESTADOS_DOC[String(estado || '').toLowerCase()] || ESTADOS_DOC['sin fecha']

/** Texto corto de los días que le quedan al documento */
function textoDias(estado, dias, largo = false) {
  if (dias === null || dias === undefined || dias === '' || String(estado).toLowerCase() === 'sin fecha') {
    return largo ? 'Sin fecha' : 'sin fecha'
  }
  const n = Number(dias)
  if (n < 0) return largo ? `Venció hace ${-n} ${-n === 1 ? 'día' : 'días'}` : `vencido ${-n} d`
  if (n === 0) return 'vence hoy'
  return largo ? `${n} ${n === 1 ? 'día' : 'días'}` : `${n} d`
}

const tieneAlerta = (v) => DOCUMENTOS.some((d) => ['proxima a vencer', 'vencido'].includes(String(v[d.clave]).toLowerCase()))

/** Días del documento más próximo a vencer (para ordenar por urgencia) */
const diasMasUrgente = (v) => {
  const dias = DOCUMENTOS.map((d) => v[`dias_${d.clave}`]).filter((x) => x !== null && x !== undefined && x !== '')
  return dias.length ? Math.min(...dias.map(Number)) : Number.MAX_SAFE_INTEGER
}

const formatoDecimal = (n) => (n === '' || n === null || n === undefined ? '' : Number(n).toLocaleString('es-CO', { maximumFractionDigits: 2 }))

// ── Lista ──

const vehiculos = ref([])
const cargandoLista = ref(false)
const filtro = ref('todos')

const opcionesFiltro = computed(() => [
  { valor: 'todos', etiqueta: 'Todos', icono: 'local_shipping', cantidad: vehiculos.value.length },
  {
    valor: 'alerta',
    etiqueta: 'Documentos por vencer o vencidos',
    icono: 'warning',
    cantidad: vehiculos.value.filter((v) => v.estado === 'activo' && tieneAlerta(v)).length,
  },
  { valor: 'inactivos', etiqueta: 'Inactivos', icono: 'block', cantidad: vehiculos.value.filter((v) => v.estado !== 'activo').length },
])

// Activos primero y, dentro de ellos, el que tiene el documento más cerca de vencer
const vehiculosFiltrados = computed(() => {
  let lista = vehiculos.value
  if (filtro.value === 'alerta') lista = lista.filter((v) => v.estado === 'activo' && tieneAlerta(v))
  if (filtro.value === 'inactivos') lista = lista.filter((v) => v.estado !== 'activo')
  return [...lista].sort(
    (a, b) =>
      (a.estado === 'activo' ? 0 : 1) - (b.estado === 'activo' ? 0 : 1) ||
      diasMasUrgente(a) - diasMasUrgente(b) ||
      a.placa.localeCompare(b.placa),
  )
})

const mensajeVacio = computed(() => {
  if (filtro.value === 'alerta') return 'Todos los documentos están al día'
  if (filtro.value === 'inactivos') return 'No hay vehículos inactivos'
  return esConductor.value ? 'No tiene vehículos asignados' : 'No hay vehículos registrados'
})

async function cargarVehiculos() {
  cargandoLista.value = true
  try {
    // El backend ya devuelve a cada perfil solo lo suyo (admin: todos)
    const lista = await useVehiculo.obtenerVehiculos()
    vehiculos.value = lista.map((v) => ({ ...v, estado: String(v.estado || '').toLowerCase() }))
  } finally {
    cargandoLista.value = false
  }
}

// ── Detalle ──

const detalle = ref(null)
const mostrarDetalle = ref(false)

async function verDetalle(placa) {
  const data = await useVehiculo.obtenerdatodevehiculo(placa)
  if (!data) return
  detalle.value = { ...data, estado: String(data.estado || '').toLowerCase() }
  mostrarDetalle.value = true
}

// ── Activar / desactivar ──
// El estado solo cambia en pantalla cuando el backend confirma (antes el toggle cambiaba aunque fallara).

const cambiandoEstado = ref(false)

function pedirCambioEstado() {
  const activar = detalle.value.estado !== 'activo'
  if (activar) return cambiarEstado(true)
  $q.dialog({
    title: `Desactivar ${detalle.value.placa}`,
    message: 'El vehículo queda en el historial pero se marca como inactivo. Puede activarlo de nuevo cuando quiera.',
    cancel: { flat: true, label: 'Cancelar', color: 'grey-8' },
    ok: { unelevated: true, label: 'Desactivar', color: 'negative' },
    persistent: true,
  }).onOk(() => cambiarEstado(false))
}

async function cambiarEstado(activar) {
  const placa = detalle.value.placa
  cambiandoEstado.value = true
  try {
    if (activar) await useVehiculo.putActivarVehiculo(placa)
    else await useVehiculo.putDesactivarVehiculo(placa)
    detalle.value.estado = activar ? 'activo' : 'inactivo'
    await cargarVehiculos()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message, position: 'bottom', timeout: 5000 })
  } finally {
    cambiandoEstado.value = false
  }
}

// ─────────────────────────────────────────────────────────────
// Crear / editar
// ─────────────────────────────────────────────────────────────

const CLASES = ['TRACTOMULA', 'CAMIÓN', 'VOLQUETA', 'CAMIONETA']
const SERVICIOS = ['Público', 'Particular', 'Oficial', 'Especial']
const COMBUSTIBLES = ['ACPM', 'Gasolina', 'Gas natural', 'Eléctrico', 'Híbrido']

const CAMPOS_TEXTO = [
  'marca', 'modelo', 'referencia', 'clase_vehiculo', 'color', 'servicio', 'combustible',
  'licencia', 'numero_motor', 'numero_chasis', 'capacidad', 'service_code',
]

// Función (no objeto) para que cada formulario tenga su propio arreglo de archivos
const vacio = () => ({
  placa: '',
  marca: '',
  modelo: '',
  referencia: '',
  clase_vehiculo: 'TRACTOMULA',
  color: '',
  servicio: 'Público',
  combustible: 'ACPM',
  licencia: '',
  numero_motor: '',
  numero_chasis: '',
  fecha_matricula: '',
  capacidad: '',
  service_code: '',
  odometro: null,
  capacidad_ton: '',
  rendimiento_galon: '',
  soat_expedicion: '',
  soat_vencimiento: '',
  tecnico_expedicion: '',
  tecnico_vencimiento: '',
  poliza_expedicion: '',
  poliza_vencimiento: '',
  archivos: [],
})

const dialogForm = ref(false)
const formulario = ref(vacio())
const placaEditando = ref('') // la placa va en la URL del PUT; nunca se toma del formulario
const odometroActual = ref(0)
const guardando = ref(false)
const esEdicion = computed(() => Boolean(placaEditando.value))

/** Decimal escrito con coma o punto → número (null si vacío, NaN si no es número) */
function textoADecimal(texto) {
  const limpio = String(texto ?? '').trim().replace(/\s/g, '').replace(',', '.')
  if (limpio === '') return null
  return /^\d+(\.\d+)?$/.test(limpio) ? Number(limpio) : NaN
}
const decimalATexto = (n) => (n === '' || n === null || n === undefined ? '' : String(n).replace('.', ','))

function escribirPlaca(valor) {
  formulario.value.placa = String(valor ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '')
}

// Al cambiar la expedición se borra el vencimiento escrito antes, para que no quede el del documento anterior
function cambiarExpedicion(clave, valor) {
  formulario.value[`${clave}_expedicion`] = valor || ''
  formulario.value[`${clave}_vencimiento`] = ''
}

/** 'AAAA-MM-DD' + 1 año (29 de febrero → 28), igual que el backend */
function sumarUnAnio(iso) {
  const [a, m, d] = String(iso).split('-').map(Number)
  if (!a || !m || !d) return ''
  const diasDelMes = new Date(a + 1, m, 0).getDate()
  return `${a + 1}-${String(m).padStart(2, '0')}-${String(Math.min(d, diasDelMes)).padStart(2, '0')}`
}

function hintVencimiento(clave) {
  const f = formulario.value
  if (f[`${clave}_vencimiento`]) return 'Se guarda esta fecha'
  if (f[`${clave}_expedicion`]) return `Vacío: vencerá el ${formatoFecha(sumarUnAnio(f[`${clave}_expedicion`]))} (1 año)`
  return 'Vacío: 1 año después de la expedición'
}

function abrirCrear() {
  formulario.value = vacio()
  placaEditando.value = ''
  odometroActual.value = 0
  dialogForm.value = true
}

function abrirEditar() {
  const v = detalle.value
  const f = vacio()
  CAMPOS_TEXTO.forEach((c) => {
    f[c] = v[c] === undefined || v[c] === null ? '' : String(v[c])
  })
  f.fecha_matricula = v.fecha_matricula || ''
  f.odometro = Number(v.odometro) || null
  f.capacidad_ton = decimalATexto(v.capacidad_ton)
  f.rendimiento_galon = decimalATexto(v.rendimiento_galon)
  DOCUMENTOS.forEach(({ clave }) => {
    f[`${clave}_expedicion`] = v[`${clave}_expedicion`] || ''
    f[`${clave}_vencimiento`] = v[`${clave}_vencimiento`] || ''
  })
  formulario.value = f
  placaEditando.value = v.placa
  odometroActual.value = Number(v.odometro) || 0
  dialogForm.value = true
}

/** Validación síncrona: devuelve el primer error o '' */
function validarFormulario() {
  const f = formulario.value
  if (!esEdicion.value && !/^[A-Z0-9]{5,7}$/.test(f.placa)) return 'Escriba una placa válida, ej. SNT473'
  if (!f.marca) return 'Escriba la marca'
  if (!f.modelo) return 'Escriba el modelo (año)'
  if (esEdicion.value && f.odometro !== null && f.odometro < odometroActual.value) {
    return `El odómetro no puede ser menor al registrado (${formatoMiles(odometroActual.value)} km)`
  }
  const capacidad = textoADecimal(f.capacidad_ton)
  if (capacidad !== null && !(capacidad > 0 && capacidad < 100)) return 'La capacidad en toneladas no es válida (ej. 34,5)'
  const rendimiento = textoADecimal(f.rendimiento_galon)
  if (rendimiento !== null && !(rendimiento > 0 && rendimiento < 50)) return 'El rendimiento no es válido (km por galón, ej. 8,5)'
  for (const doc of DOCUMENTOS) {
    const exp = f[`${doc.clave}_expedicion`]
    const venc = f[`${doc.clave}_vencimiento`]
    if (exp && venc && venc <= exp) return `El vencimiento de ${doc.nombre} debe ser posterior a la expedición`
  }
  return ''
}

// Los decimales se envían con coma: el backend lee "0.966" como miles (966); "0,966" lo lee bien
const decimalParaEnviar = (n) => String(n).replace('.', ',')

function armarFormData() {
  const f = formulario.value
  const fd = new FormData()
  if (!esEdicion.value) fd.append('placa', f.placa)
  CAMPOS_TEXTO.forEach((c) => fd.append(c, String(f[c] ?? '').trim()))
  if (f.fecha_matricula) fd.append('fecha_matricula', f.fecha_matricula)
  if (f.odometro !== null) fd.append('odometro', String(f.odometro))
  const capacidad = textoADecimal(f.capacidad_ton)
  if (capacidad !== null) fd.append('capacidad_ton', decimalParaEnviar(capacidad))
  const rendimiento = textoADecimal(f.rendimiento_galon)
  if (rendimiento !== null) fd.append('rendimiento_galon', decimalParaEnviar(rendimiento))
  DOCUMENTOS.forEach(({ clave }) => {
    if (f[`${clave}_expedicion`]) fd.append(`${clave}_expedicion`, f[`${clave}_expedicion`])
    if (f[`${clave}_vencimiento`]) fd.append(`${clave}_vencimiento`, f[`${clave}_vencimiento`])
  })
  f.archivos.forEach((archivo) => fd.append('archivos', archivo))
  return fd
}

async function guardar() {
  const error = validarFormulario()
  if (error) {
    $q.notify({ type: 'warning', message: error, position: 'bottom' })
    return
  }

  guardando.value = true
  try {
    let placa = placaEditando.value
    if (esEdicion.value) {
      await useVehiculo.putVehiculo(placa, armarFormData())
    } else {
      const respuesta = await useVehiculo.postVehiculo(armarFormData())
      placa = respuesta?.placa || formulario.value.placa
      // El backend le asigna la placa al propietario: se refrescan sus placas en la app
      if (esPropietario.value) await useUsuario.refrescarSesion()
    }
    dialogForm.value = false
    await cargarVehiculos()
    await verDetalle(placa)
  } catch (error) {
    // El diálogo sigue abierto con lo que llenó
    $q.notify({ type: 'negative', message: error.message, position: 'bottom', timeout: 5000 })
  } finally {
    guardando.value = false
  }
}

onMounted(cargarVehiculos)
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
.tarjeta-inactiva {
  opacity: 0.65;
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
  flex-shrink: 0;
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
.doc-chip {
  font-size: 11px;
  padding: 3px 6px;
  border-radius: 6px;
  background: white;
}
.doc-legal-card {
  background: #f9fafb;
  border-radius: 10px;
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-left-width: 4px;
}
.borde-positive {
  border-left-color: #21ba45;
}
.borde-orange-9 {
  border-left-color: #e65100;
}
.borde-negative {
  border-left-color: #c10015;
}
.borde-grey-7 {
  border-left-color: #9e9e9e;
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
.sticky-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 2;
}
.sticky-footer {
  position: sticky;
  bottom: 0;
  z-index: 2;
  flex-wrap: wrap;
  gap: 6px;
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
