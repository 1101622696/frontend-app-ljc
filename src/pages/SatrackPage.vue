<template>
  <q-page padding class="bg-grey-2">
    <q-tabs v-model="tabActual" dense align="left" active-color="primary" indicator-color="primary" class="q-mb-md text-grey-8" no-caps>
      <q-tab name="mapa" icon="map" label="Mapa en vivo" />
      <q-tab name="historial" icon="history" label="Historial" />
      <q-tab v-if="esAdmin" name="resumen" icon="summarize" label="Resumen del día" />
    </q-tabs>

    <!-- ═════════════ MAPA ═════════════
         v-show (no v-if): el contenedor del mapa no se destruye al cambiar de pestaña -->
    <div v-show="tabActual === 'mapa'">
      <div class="filter-bar q-mb-md row items-center q-gutter-sm">
        <q-btn unelevated color="primary" icon="refresh" label="Actualizar" :loading="cargandoPosiciones" @click="cargarPosiciones()" />
        <q-toggle v-model="autoActualizar" dense label="Cada 60 s" />
        <q-space />
        <span v-if="ultimaActualizacion" class="text-caption text-grey-7">Actualizado {{ ultimaActualizacion }}</span>
      </div>

      <div ref="contenedorMapa" class="mapa" />

      <div v-if="!posiciones.length && posicionesCargadas" class="text-center text-grey-6 q-py-lg">
        <q-icon name="gps_off" size="40px" />
        <div class="q-mt-sm">No hay vehículos con GPS activo</div>
      </div>

      <q-card
        v-for="v in posiciones"
        :key="v.serviceCode"
        flat
        class="viaje-card q-mt-sm cursor-pointer"
        @click="centrarEnVehiculo(v)"
      >
        <q-card-section class="q-py-sm">
          <div class="row items-center no-wrap">
            <span class="placa-badge">{{ v.placa }}</span>
            <span class="text-caption text-grey-7 q-ml-sm">{{ formatoMiles(v.speed) || 0 }} km/h</span>
            <q-space />
            <q-badge :color="encendido(v.ignition) ? 'positive' : 'grey-6'" :label="encendido(v.ignition) ? 'Encendido' : 'Apagado'" />
          </div>
          <div class="text-body2 q-mt-xs ellipsis">{{ v.address || 'Sin dirección' }}</div>
          <div class="row items-center text-caption text-grey-7">
            <span>{{ v.vehicleStatus || '' }}</span>
            <q-space />
            <span>{{ horaColombia(v.generationDate_colombia) }}</span>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- ═════════════ HISTORIAL ═════════════ -->
    <div v-if="tabActual === 'historial'">
      <div class="filter-bar q-mb-md q-gutter-sm">
        <q-select
          v-model="historial.serviceCode"
          :options="opcionesVehiculos"
          label="Vehículo"
          outlined
          dense
          emit-value
          map-options
        />
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-input v-model="historial.inicio" type="date" label="Desde" outlined dense stack-label :max="hoyISO()" />
          </div>
          <div class="col-6">
            <q-input v-model="historial.fin" type="date" label="Hasta" outlined dense stack-label :max="hoyISO()" />
          </div>
        </div>
        <div class="text-caption text-grey-7">Horas en Colombia. Máximo {{ MAX_DIAS_HISTORIAL }} días.</div>
        <q-btn unelevated color="primary" icon="search" label="Consultar" :loading="cargandoHistorial" @click="consultarHistorial" />
      </div>

      <div v-if="historialConsultado && !eventos.length" class="text-center text-grey-6 q-py-lg">
        No hay eventos en ese período
      </div>

      <q-card v-for="(e, i) in eventos" :key="i" flat class="viaje-card q-mb-xs">
        <q-card-section class="q-py-xs">
          <div class="row items-center no-wrap">
            <span class="text-weight-medium">{{ horaColombia(e.generationDate_colombia) }}</span>
            <q-space />
            <q-badge :color="encendido(e.ignition) ? 'positive' : 'grey-6'" :label="encendido(e.ignition) ? 'Encendido' : 'Apagado'" />
          </div>
          <div class="text-caption text-grey-8">{{ e.description || e.vehicleStatus || '' }}</div>
          <div class="text-caption text-grey-6">
            {{ formatoMiles(e.speed) || 0 }} km/h · Odómetro {{ formatoMiles(e.odometer) || '—' }} km
          </div>
        </q-card-section>
      </q-card>

      <div v-if="hayMasEventos" class="text-center q-my-md">
        <q-btn outline rounded color="primary" label="Cargar más" :loading="cargandoHistorial" @click="cargarMasEventos" />
      </div>
    </div>

    <!-- ═════════════ RESUMEN DEL DÍA (solo admin) ═════════════ -->
    <div v-if="tabActual === 'resumen' && esAdmin">
      <div class="filter-bar q-mb-md q-gutter-sm">
        <div class="text-body2 text-grey-8">
          Calcula km, tiempo encendido y velocidad máxima de cada vehículo y lo guarda en la hoja Satrack_Resumen.
          Si el día ya estaba guardado, se actualiza. Normalmente se guarda el día de ayer.
        </div>
        <q-input v-model="fechaResumen" type="date" label="Día" outlined dense stack-label :max="hoyISO()" />
        <q-btn unelevated color="primary" icon="save" label="Guardar resumen del día" :loading="guardandoResumen" @click="guardarResumen" />
      </div>

      <template v-if="resultadoResumen">
        <q-banner rounded dense class="bg-green-1 text-green-10 q-mb-sm">
          <template #avatar><q-icon name="check_circle" /></template>
          {{ formatoFecha(resultadoResumen.fecha) }}: {{ resultadoResumen.filas_guardadas }} vehículo(s) guardado(s).
        </q-banner>

        <q-card v-for="r in resultadoResumen.resultado || []" :key="r.placa" flat class="viaje-card q-mb-sm">
          <q-card-section class="q-py-sm">
            <div class="row items-center no-wrap">
              <span class="placa-badge">{{ r.placa }}</span>
              <q-space />
              <q-badge outline color="grey-7" :label="r.accion === 'actualizado' ? 'Actualizado' : 'Nuevo'" />
            </div>
            <Fila etiqueta="Km recorridos" :valor="`${formatoMiles(r.km_recorridos) || 0} km`" />
            <Fila etiqueta="Tiempo encendido" :valor="duracion(r.tiempo_encendido)" />
            <Fila etiqueta="Velocidad máxima" :valor="`${formatoMiles(r.velocidad_maxima) || 0} km/h`" />
            <Fila etiqueta="Primer encendido" :valor="horaColombia(r.primer_encendido)" />
            <Fila etiqueta="Último apagado" :valor="horaColombia(r.ultimo_apagado)" />
          </q-card-section>
        </q-card>

        <q-banner v-if="resultadoResumen.sin_eventos?.length" rounded dense class="bg-grey-3 text-grey-9 q-mb-sm">
          Sin movimiento ese día: {{ resultadoResumen.sin_eventos.join(', ') }}
        </q-banner>
        <q-banner v-if="resultadoResumen.errores?.length" rounded dense class="bg-red-1 text-red-10">
          <div class="text-weight-medium">No se pudieron calcular:</div>
          <div v-for="err in resultadoResumen.errores" :key="err.placa">{{ err.placa }}: {{ err.mensaje }}</div>
        </q-banner>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch, h } from 'vue'
import { useQuasar } from 'quasar'
import L from 'leaflet'
import { useStoreSatrack } from '../stores/satrack'
import { useStoreUsuarios } from '../stores/usuarios'
import { formatoFecha, formatoMiles, hoyISO } from '../utils/formato'

defineOptions({ name: 'SatrackPage' })

const $q = useQuasar()
const useSatrack = useStoreSatrack()
const useUsuario = useStoreUsuarios()

const esAdmin = computed(() => useUsuario.esAdmin)

const Fila = (p) =>
  h('div', { class: 'detalle-fila' }, [
    h('span', { class: 'detalle-label' }, p.etiqueta),
    h('span', { class: ['detalle-valor', p.clase] }, p.valor),
  ])
Fila.props = ['etiqueta', 'valor', 'clase']

const MAX_DIAS_HISTORIAL = 31
const EVENTOS_POR_PAGINA = 100 // lo que devuelve el backend por página
const INTERVALO_MS = 60000

const tabActual = ref('mapa')

// ── Utilidades ──

/** Satrack manda la ignición como 1/0, true/false o texto */
const encendido = (valor) =>
  valor === true || valor === 1 || ['1', 'true', 'on', 'encendido'].includes(String(valor ?? '').trim().toLowerCase())

/**
 * '2026-10-11T08:15:00-05:00' → '11 oct 2026 8:15 a. m.'
 * Se lee del texto (ya viene en hora Colombia) para no depender de la zona horaria del celular.
 */
function horaColombia(texto) {
  const m = String(texto ?? '').match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/)
  if (!m) return '—'
  const hora = Number(m[2])
  const h12 = hora % 12 || 12
  return `${formatoFecha(m[1])} ${h12}:${m[3]} ${hora < 12 ? 'a. m.' : 'p. m.'}`
}

/** 135 → '2 h 15 min' */
const duracion = (minutos) => {
  const total = Math.max(0, Math.round(Number(minutos) || 0))
  const horas = Math.floor(total / 60)
  return horas ? `${horas} h ${total % 60} min` : `${total} min`
}

/** Fecha 'AAAA-MM-DD' de ayer (hora local del celular, en Colombia) */
const ayerISO = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const coordenadas = (v) => {
  const lat = Number(v.latitude)
  const lng = Number(v.longitude)
  return Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0) ? [lat, lng] : null
}

// ─────────────────────────────────────────────────────────────
// Mapa
// ─────────────────────────────────────────────────────────────

const contenedorMapa = ref(null)
const posiciones = ref([])
const posicionesCargadas = ref(false)
const cargandoPosiciones = ref(false)
const ultimaActualizacion = ref('')

let mapa = null
let encuadrado = false // el mapa se ajusta a los camiones solo la primera vez (luego respeta el zoom del usuario)
const marcadores = new Map() // serviceCode → L.marker

function iniciarMapa() {
  if (mapa || !contenedorMapa.value) return
  mapa = L.map(contenedorMapa.value).setView([7.1, -73.1], 7)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(mapa)
}

// Los textos de Satrack (dirección, placa…) se ponen con textContent: nunca se interpretan como HTML
function crearIcono(v) {
  const etiqueta = document.createElement('div')
  etiqueta.className = `marcador-placa ${encendido(v.ignition) ? 'encendido' : 'apagado'}`
  etiqueta.textContent = v.placa
  return L.divIcon({ className: '', html: etiqueta, iconAnchor: [24, 10] })
}

function crearPopup(v) {
  const caja = document.createElement('div')
  const linea = (texto, negrita = false) => {
    const el = document.createElement(negrita ? 'b' : 'div')
    el.textContent = texto
    caja.appendChild(el)
  }
  linea(v.placa, true)
  linea(v.address || 'Sin dirección')
  linea(`${encendido(v.ignition) ? 'Encendido' : 'Apagado'}${v.vehicleStatus ? ` · ${v.vehicleStatus}` : ''}`)
  linea(`Velocidad: ${formatoMiles(v.speed) || 0} km/h`)
  linea(`Odómetro: ${formatoMiles(v.odometer) || '—'} km`)
  linea(horaColombia(v.generationDate_colombia))
  return caja
}

/** Crea, mueve y QUITA marcadores según la última lista (un camión que ya no llega desaparece del mapa) */
function actualizarMarcadores(lista) {
  if (!mapa) return
  const presentes = new Set()

  for (const v of lista) {
    const punto = coordenadas(v)
    if (!punto) continue
    presentes.add(v.serviceCode)
    const existente = marcadores.get(v.serviceCode)
    if (existente) {
      existente.setLatLng(punto)
      existente.setIcon(crearIcono(v)) // color encendido/apagado actualizado
      existente.setPopupContent(crearPopup(v))
    } else {
      marcadores.set(v.serviceCode, L.marker(punto, { icon: crearIcono(v) }).addTo(mapa).bindPopup(crearPopup(v)))
    }
  }

  for (const [codigo, marcador] of marcadores) {
    if (!presentes.has(codigo)) {
      marcador.remove()
      marcadores.delete(codigo)
    }
  }

  if (!encuadrado && marcadores.size) {
    const limites = L.latLngBounds([...marcadores.values()].map((m) => m.getLatLng()))
    mapa.fitBounds(limites, { padding: [40, 40], maxZoom: 13 })
    encuadrado = true
  }
}

async function cargarPosiciones({ silencioso = false } = {}) {
  if (cargandoPosiciones.value) return // no encimar peticiones
  cargandoPosiciones.value = true
  try {
    const lista = await useSatrack.obtenerPosiciones({ silencioso })
    if (lista === null) return // falló: se conserva lo que ya se veía
    posiciones.value = lista
    posicionesCargadas.value = true
    ultimaActualizacion.value = new Date().toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })
    actualizarMarcadores(lista)
  } finally {
    cargandoPosiciones.value = false
  }
}

function centrarEnVehiculo(v) {
  const punto = coordenadas(v)
  if (!mapa || !punto) return
  mapa.setView(punto, 14)
  marcadores.get(v.serviceCode)?.openPopup()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Al volver a la pestaña del mapa, Leaflet necesita recalcular su tamaño
watch(tabActual, async (tab) => {
  if (tab === 'mapa') {
    await nextTick()
    mapa?.invalidateSize()
  }
})

// ── Actualización automática: solo con la página visible ──

const autoActualizar = ref(false)
let intervalo = null

function detenerIntervalo() {
  if (intervalo) clearInterval(intervalo)
  intervalo = null
}

function iniciarIntervalo() {
  detenerIntervalo()
  if (!autoActualizar.value || document.visibilityState !== 'visible') return
  intervalo = setInterval(() => {
    if (tabActual.value === 'mapa') cargarPosiciones({ silencioso: true })
  }, INTERVALO_MS)
}

watch(autoActualizar, (activo) => (activo ? iniciarIntervalo() : detenerIntervalo()))

function alCambiarVisibilidad() {
  if (document.visibilityState === 'visible' && autoActualizar.value) {
    cargarPosiciones({ silencioso: true })
    iniciarIntervalo()
  } else {
    detenerIntervalo()
  }
}

// ─────────────────────────────────────────────────────────────
// Historial
// ─────────────────────────────────────────────────────────────

const historial = ref({ serviceCode: null, inicio: hoyISO(), fin: hoyISO() })
const eventos = ref([])
const pagina = ref(1)
const hayMasEventos = ref(false)
const historialConsultado = ref(false)
const cargandoHistorial = ref(false)
let consultaActual = null // lo consultado (para "Cargar más" aunque el usuario cambie el formulario)

const opcionesVehiculos = computed(() =>
  posiciones.value.map((v) => ({ label: v.placa, value: v.serviceCode })).sort((a, b) => a.label.localeCompare(b.label)),
)

/** Primer error del formulario ('' si está bien) */
function validarHistorial(f) {
  if (!f.serviceCode) return 'Seleccione el vehículo'
  if (!f.inicio || !f.fin) return 'Seleccione las dos fechas'
  if (f.fin < f.inicio) return 'La fecha final no puede ser anterior a la inicial'
  const dias = (new Date(`${f.fin}T00:00:00`) - new Date(`${f.inicio}T00:00:00`)) / 86400000
  if (dias >= MAX_DIAS_HISTORIAL) return `Consulte máximo ${MAX_DIAS_HISTORIAL} días`
  return ''
}

async function pedirPagina() {
  cargandoHistorial.value = true
  try {
    const { serviceCode, inicio, fin } = consultaActual
    const r = await useSatrack.obtenerHistorial(serviceCode, inicio, fin, pagina.value)
    if (!r) return false
    eventos.value = pagina.value === 1 ? r.eventos : [...eventos.value, ...r.eventos]
    hayMasEventos.value = r.eventos.length >= EVENTOS_POR_PAGINA
    return true
  } finally {
    cargandoHistorial.value = false
  }
}

async function consultarHistorial() {
  const error = validarHistorial(historial.value)
  if (error) {
    $q.notify({ type: 'warning', message: error, position: 'bottom' })
    return
  }
  consultaActual = { ...historial.value }
  pagina.value = 1
  eventos.value = []
  hayMasEventos.value = false
  historialConsultado.value = await pedirPagina()
}

async function cargarMasEventos() {
  pagina.value++
  if (!(await pedirPagina())) pagina.value--
}

// ─────────────────────────────────────────────────────────────
// Resumen del día (admin)
// ─────────────────────────────────────────────────────────────

const fechaResumen = ref(ayerISO())
const resultadoResumen = ref(null)
const guardandoResumen = ref(false)

async function guardarResumen() {
  if (fechaResumen.value && fechaResumen.value > hoyISO()) {
    $q.notify({ type: 'warning', message: 'No se puede guardar el resumen de un día futuro', position: 'bottom' })
    return
  }
  guardandoResumen.value = true
  resultadoResumen.value = null
  try {
    // Sin fecha el backend toma ayer
    resultadoResumen.value = await useSatrack.guardarResumen(fechaResumen.value || undefined)
    $q.notify({ type: 'positive', message: `Resumen guardado: ${resultadoResumen.value.filas_guardadas} vehículo(s)`, position: 'bottom' })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message, position: 'bottom', timeout: 6000 })
  } finally {
    guardandoResumen.value = false
  }
}

// ─────────────────────────────────────────────────────────────

onMounted(async () => {
  await nextTick()
  iniciarMapa()
  document.addEventListener('visibilitychange', alCambiarVisibilidad)
  await cargarPosiciones()
})

// Al salir: sin intervalos ni escuchas colgando y el mapa liberado
onBeforeUnmount(() => {
  detenerIntervalo()
  document.removeEventListener('visibilitychange', alCambiarVisibilidad)
  marcadores.clear()
  if (mapa) {
    mapa.remove()
    mapa = null
  }
})
</script>

<style scoped>
.filter-bar {
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 12px;
}
.mapa {
  height: 55vh;
  min-height: 300px;
  border-radius: 12px;
  z-index: 0;
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
</style>

<!-- Sin scoped: Leaflet crea los marcadores fuera del componente y Fila es funcional -->
<style>
.marcador-placa {
  display: inline-block;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  white-space: nowrap;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}
.marcador-placa.encendido {
  background: #21ba45;
}
.marcador-placa.apagado {
  background: #8a8a8a;
}
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
