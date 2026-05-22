<template>
  <q-page class="q-pa-md">
    <!-- Header con tabs -->
    <div class="text-h6 q-mb-md"><q-icon name="gps_fixed" color="primary" /> Satrack</div>

    <q-tabs v-model="tabActual" dense align="left" class="q-mb-md">
      <q-tab name="mapa" icon="map" label="Mapa en vivo" />
      <q-tab name="historial" icon="history" label="Historial" />
      <q-tab name="resumen" icon="summarize" label="Guardar resumen" />
    </q-tabs>

    <!-- ── TAB MAPA ── -->
    <q-tab-panels v-model="tabActual" animated keep-alive>
      <q-tab-panel name="mapa" class="q-pa-none">
        <div class="row q-gutter-sm q-mb-md items-center">
          <q-btn
            color="primary"
            icon="refresh"
            label="Actualizar posiciones"
            :loading="useSatrack.loading"
            @click="cargarPosiciones"
          />
          <span v-if="ultimaActualizacion" class="text-caption text-grey-6">
            Última actualización: {{ ultimaActualizacion }}
          </span>
        </div>

        <!-- Mapa -->
        <div id="mapa-satrack" style="height: 400px; border-radius: 8px; z-index: 0" />

        <!-- Lista de vehículos debajo del mapa -->
        <q-list bordered separator class="q-mt-md">
          <q-item
            v-for="v in posiciones"
            :key="v.serviceCode"
            clickable
            @click="centrarEnVehiculo(v)"
          >
            <q-item-section avatar>
              <q-icon
                :name="v.ignition ? 'local_shipping' : 'local_shipping'"
                :color="v.ignition ? 'green' : 'grey'"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ v.placa }} — {{ v.address }}</q-item-label>
              <q-item-label caption>{{ v.vehicleStatus }} · {{ v.speed }} km/h</q-item-label>
              <q-item-label caption>{{ formatearFecha(v.generationDate) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge
                :color="v.ignition ? 'green' : 'grey'"
                :label="v.ignition ? 'Encendido' : 'Apagado'"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>

      <!-- ── TAB HISTORIAL ── -->
      <q-tab-panel name="historial">
        <div class="q-gutter-md">
          <q-select
            filled
            v-model="historialServiceCode"
            label="Vehículo"
            :options="opcionesVehiculos"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            :dense="dense"
          />
          <q-input
            filled
            v-model="historialFechaInicio"
            label="Fecha inicio"
            type="date"
            :dense="dense"
          />
          <q-input
            filled
            v-model="historialFechaFin"
            label="Fecha fin"
            type="date"
            :dense="dense"
          />
          <q-btn
            color="primary"
            label="Consultar historial"
            :loading="useSatrack.loading"
            @click="consultarHistorial"
          />
        </div>

        <q-list bordered separator class="q-mt-md" v-if="eventosHistorial.length">
          <q-item v-for="(e, i) in eventosHistorial" :key="i">
            <q-item-section>
              <q-item-label
                >{{ formatearFecha(e.generationDate) }} — {{ e.description }}</q-item-label
              >
              <q-item-label caption>
                {{ e.vehicleStatus }} · {{ e.speed }} km/h · Odómetro: {{ e.odometer }} km
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge :color="e.ignition ? 'green' : 'grey'" :label="e.ignition ? 'ON' : 'OFF'" />
            </q-item-section>
          </q-item>
        </q-list>

        <div v-else-if="historialConsultado" class="text-grey-6 q-mt-md text-center">
          No hay eventos para ese período
        </div>
      </q-tab-panel>

      <!-- ── TAB RESUMEN ── -->
      <q-tab-panel name="resumen">
        <div class="q-gutter-md">
          <div class="text-body2 text-grey-7 q-mb-sm">
            Guarda un resumen consolidado del día en la hoja Satrack_Resumen.
          </div>
          <q-input
            filled
            v-model="fechaResumen"
            label="Fecha (YYYY-MM-DD)"
            type="date"
            :dense="dense"
          />
          <q-btn
            color="secondary"
            label="Guardar resumen del día"
            :loading="useSatrack.loading"
            @click="guardarResumen"
          />
        </div>

        <div v-if="resultadoResumen" class="q-mt-md">
          <q-banner class="bg-positive text-white">
            Se guardaron {{ resultadoResumen.filas_guardadas }} registros correctamente.
          </q-banner>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useStoreSatrack } from '../stores/satrack'
import { useQuasar } from 'quasar'
import L from 'leaflet'

// Fix icono de Leaflet en Vite/Quasar
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

const useSatrack = useStoreSatrack()
const $q = useQuasar()
const dense = ref(false)

const tabActual = ref('mapa')
const posiciones = ref([])
const ultimaActualizacion = ref('')
let mapaInstancia = null
const marcadores = {}

watch(tabActual, async (val) => {
  if (val === 'mapa') {
    await nextTick()
    mapaInstancia?.invalidateSize()
  }
})
// Historial
const historialServiceCode = ref('')
const historialFechaInicio = ref('')
const historialFechaFin = ref('')
const eventosHistorial = ref([])
const historialConsultado = ref(false)
const opcionesVehiculos = ref([])

// Resumen
const fechaResumen = ref(new Date().toISOString().split('T')[0])
const resultadoResumen = ref(null)

function iniciarMapa() {
  if (mapaInstancia) return
  mapaInstancia = L.map('mapa-satrack').setView([7.1, -73.1], 7)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
  }).addTo(mapaInstancia)
}

async function cargarPosiciones() {
  const res = await useSatrack.obtenerPosiciones()
  if (!res?.ok) {
    $q.notify({ type: 'negative', message: 'Error al obtener posiciones' })
    return
  }

  posiciones.value = res.data
  ultimaActualizacion.value = new Date().toLocaleTimeString('es-CO')

  // Actualizar opciones para historial
  opcionesVehiculos.value = res.data.map((v) => ({
    label: `${v.placa} (${v.serviceCode})`,
    value: v.serviceCode,
  }))

  // Actualizar marcadores en el mapa
  res.data.forEach((v) => {
    if (!v.latitude || !v.longitude) return

    const popup = `
      <b>${v.placa}</b><br>
      ${v.address}<br>
      Estado: ${v.vehicleStatus}<br>
      Velocidad: ${v.speed} km/h<br>
      Odómetro: ${v.odometer} km<br>
      ${formatearFecha(v.generationDate)}
    `

    if (marcadores[v.serviceCode]) {
      marcadores[v.serviceCode].setLatLng([v.latitude, v.longitude])
      marcadores[v.serviceCode].setPopupContent(popup)
    } else {
      const icono = L.divIcon({
        className: '',
        html: `<div style="
          background:${v.ignition ? '#21BA45' : '#999'};
          color:white;
          padding:2px 6px;
          border-radius:4px;
          font-size:11px;
          font-weight:bold;
          white-space:nowrap;
          box-shadow:0 1px 4px rgba(0,0,0,0.4)
        ">${v.placa}</div>`,
        iconAnchor: [20, 10],
      })
      marcadores[v.serviceCode] = L.marker([v.latitude, v.longitude], { icon: icono })
        .addTo(mapaInstancia)
        .bindPopup(popup)
    }
  })
}

function centrarEnVehiculo(v) {
  if (!mapaInstancia || !v.latitude) return
  mapaInstancia.setView([v.latitude, v.longitude], 14)
  marcadores[v.serviceCode]?.openPopup()
  tabActual.value = 'mapa'
}

async function consultarHistorial() {
  if (!historialServiceCode.value || !historialFechaInicio.value || !historialFechaFin.value) {
    $q.notify({ type: 'negative', message: 'Complete todos los campos' })
    return
  }

  // Convertir YYYY-MM-DD al formato que espera Satrack: YYYY/MM/DD HH:mm:ss
  const inicio = historialFechaInicio.value.replace(/-/g, '/') + ' 00:00:00'
  const fin = historialFechaFin.value.replace(/-/g, '/') + ' 23:59:59'

  historialConsultado.value = false
  const res = await useSatrack.obtenerHistorial(
    historialServiceCode.value,
    inicio,
    fin
  )
  eventosHistorial.value = res?.data?.events || []
  historialConsultado.value = true
}

async function guardarResumen() {
  resultadoResumen.value = null
  const res = await useSatrack.guardarResumen(fechaResumen.value)
  if (res?.ok) {
    resultadoResumen.value = res
    $q.notify({ type: 'positive', message: `Resumen guardado: ${res.filas_guardadas} registros` })
  } else {
    $q.notify({ type: 'negative', message: 'Error al guardar resumen' })
  }
}

function formatearFecha(fecha) {
  if (!fecha) return ''
  return (
    new Date(fecha).toLocaleString('es-CO', {
      timeZone: 'UTC',
      hour12: true,
    }) + ' UTC'
  )
}

onMounted(async () => {
  await nextTick()
  iniciarMapa()
  await cargarPosiciones()
})

onUnmounted(() => {
  if (mapaInstancia) {
    mapaInstancia.remove()
    mapaInstancia = null
  }
})

defineOptions({ name: 'SatrackPage' })
</script>
