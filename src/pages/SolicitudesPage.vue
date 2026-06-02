<template>
  <q-page padding class="bg-grey-2">

    <!-- Encabezado -->
    <div class="row items-center q-mb-sm">
      <q-icon
        name="build_circle"
        color="orange"
        size="20px"
      />

      <span class="text-subtitle1 text-weight-medium q-ml-xs">
        Solicitudes de mantenimiento
      </span>

      <q-badge
        color="blue-1"
        text-color="blue-9"
        class="q-ml-auto"
        rounded
      >
        {{ solicitudes.length }}
      </q-badge>
    </div>

    <!-- Cards -->
    <div class="q-gutter-y-sm">
      <q-card
        v-for="solicitud in solicitudes"
        :key="solicitud.consecutivo"
        flat
        bordered
        class="nomina-card cursor-pointer"
        @click="verDetalles(solicitud.consecutivo)"
      >
        <q-card-section class="q-pa-md">

          <div class="row items-center q-mb-sm">
            <div class="avatar-chip q-mr-md">
              {{ solicitud.placa?.substring(0, 2) }}
            </div>

            <div class="col">
              <div class="text-body2 text-weight-medium">
                {{ solicitud.placa }}
              </div>

              <div class="text-caption text-grey-6">
                #{{ solicitud.consecutivo }}
              </div>
            </div>

            <q-space />

            <q-badge
              color="orange-1"
              text-color="orange-9"
              rounded
            >
              {{ solicitud.tipo_mantenimiento }}
            </q-badge>
          </div>

          <div class="row q-gutter-sm">

            <div class="metrica-chip col">
              <div class="metrica-label">Odómetro</div>
              <div class="metrica-valor">
                {{ solicitud.odometro }}
              </div>
            </div>

            <div class="metrica-chip col">
              <div class="metrica-label">Descripción</div>
              <div class="metrica-valor">
                {{ solicitud.descripcion }}
              </div>
            </div>

          </div>

          <div
            class="row items-center q-mt-sm"
            style="border-top: 1px solid rgba(0,0,0,.06); padding-top:8px"
          >
            <q-icon
              name="event"
              size="13px"
              color="grey-5"
              class="q-mr-xs"
            />

            <span class="text-caption text-grey-5">
              {{ formatFecha(solicitud.fecha_creacion) }}
            </span>

            <q-space />

            <q-icon
              name="chevron_right"
              color="grey-4"
              size="16px"
            />
          </div>

        </q-card-section>
      </q-card>
    </div>

    <!-- Dialog -->
    <q-dialog v-model="mostrarDetalles" persistent>
      <q-card
        style="min-width:350px; max-width:95vw; width:500px; border-radius:16px !important;"
      >

        <!-- Header -->
        <q-card-section class="q-pb-sm">
          <div
            class="row items-center"
            v-if="detallesSolicitud"
          >
            <div class="avatar-chip q-mr-md">
              {{ detallesSolicitud.placa?.substring(0, 2) }}
            </div>

            <div class="col">
              <div class="text-subtitle1 text-weight-medium">
                {{ detallesSolicitud.placa }}
              </div>

              <div class="text-caption text-grey-6">
                #{{ detallesSolicitud.consecutivo }}
              </div>
            </div>

            <q-badge
              color="orange-1"
              text-color="orange-9"
              rounded
            >
              {{ detallesSolicitud.tipo_mantenimiento }}
            </q-badge>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section
          v-if="detallesSolicitud"
          class="q-pt-md"
          style="max-height:65vh; overflow-y:auto"
        >

          <!-- Banner -->
          <div class="ganancia-banner ganancia-positiva q-mb-md">
            <div
              class="text-caption"
              style="opacity:.7"
            >
              Solicitud registrada
            </div>

            <div class="text-h6 text-weight-bold">
              {{ detallesSolicitud.tipo_mantenimiento }}
            </div>
          </div>

          <!-- Información general -->
          <div class="seccion-titulo">
            Información general
          </div>

          <div class="detalle-fila">
            <span class="detalle-label">Consecutivo</span>
            <span
              class="detalle-valor"
              style="font-family: monospace"
            >
              #{{ detallesSolicitud.consecutivo }}
            </span>
          </div>

          <div class="detalle-fila">
            <span class="detalle-label">Placa</span>
            <span class="detalle-valor">
              {{ detallesSolicitud.placa }}
            </span>
          </div>

          <div class="detalle-fila">
            <span class="detalle-label">Tipo</span>
            <span class="detalle-valor">
              {{ detallesSolicitud.tipo_mantenimiento }}
            </span>
          </div>

          <div class="detalle-fila">
            <span class="detalle-label">Descripción</span>
            <span class="detalle-valor">
              {{ detallesSolicitud.descripcion }}
            </span>
          </div>

          <!-- Datos técnicos -->
          <div class="seccion-titulo q-mt-md">
            Datos técnicos
          </div>

          <div class="row q-gutter-sm q-mb-sm">
            <div class="metrica-chip col">
              <div class="metrica-label">Odómetro</div>
              <div class="metrica-valor">
                {{ detallesSolicitud.odometro }}
              </div>
            </div>
          </div>

          <!-- Registro -->
          <div class="seccion-titulo q-mt-md">
            Registro
          </div>

          <div class="detalle-fila">
            <span class="detalle-label">Usuario</span>
            <span class="detalle-valor">
              {{ detallesSolicitud.usuario }}
            </span>
          </div>

          <div class="detalle-fila">
            <span class="detalle-label">Correo</span>
            <span class="detalle-valor">
              {{ detallesSolicitud.correo_usuario }}
            </span>
          </div>

          <div class="detalle-fila">
            <span class="detalle-label">Fecha creación</span>
            <span class="detalle-valor">
              {{ formatFecha(detallesSolicitud.fecha_creacion) }}
            </span>
          </div>

        </q-card-section>

        <q-separator />

        <q-card-actions class="q-pa-md">
          <q-space />

          <q-btn
            flat
            label="Cerrar"
            color="primary"
            v-close-popup
          />
        </q-card-actions>

      </q-card>
    </q-dialog>

      <q-dialog v-model="alert" persistent>
        <q-card class="bg-grey-2">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6 text-weight-bold">Agregar Solicitud</div>
          </q-card-section>

          <q-card-section class="q-pa-md">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input
                  v-if="perfilUsuario === 'conductor'"
                  outlined
                  rounded
                  v-model="formulario.placa"
                  label="Tu placa"
                  :dense="dense"
                  disable
                />

                <!-- Propietario y Admin: select con opciones -->
                <q-select
                  v-else
                  outlined
                  rounded
                  v-model="formulario.placa"
                  label="Placa"
                  :options="placasOptions"
                  :dense="dense"
                />
              </div>

              <div class="col-12">
                <q-select
                  outlined
                  rounded
                  v-model="formulario.tipo_mantenimiento"
                  label="Tipo de mantenimiento"
                  :options="tipo_mantenimientoOptions"
                />
              </div>

              <div class="col-12">
                <q-input
                  outlined
                  rounded
                  v-model.trim="formulario.descripcion"
                  label="Descripción de la solicitud"
                  :dense="dense"
                />
              </div>

              <div class="col-12">
                <q-input
                  outlined
                  rounded
                  v-model.trim="formulario.odometro"
                  label="Odómetro actual"
                  :dense="dense"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              @click="guardar"
              color="accent"
              class="text-white"
              :loading="useSolicitud.loading"
            >
              Agregar

              <template v-slot:loading>
                <q-spinner color="white" size="1em" />
              </template>
            </q-btn>

            <q-btn label="Cerrar" color="black" outline @click="cerrar()" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    <!-- </div> -->

    <!-- <q-btn color="primary" label="Registrar nuevo" class="q-mt-md" @click="abrir" /> -->
 
     <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" @click="abrir" />
    </q-page-sticky>

  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'

import { useStoreSolicitudes } from '../stores/solicitudes'
import { useStoreUsuarios } from '../stores/usuarios'
import { useStoreVehiculos } from '../stores/vehiculos'

const useSolicitud = useStoreSolicitudes()
const useVehiculo = useStoreVehiculos()
const useUsuario = useStoreUsuarios()

const $q = useQuasar()

const perfilUsuario = computed(() => useUsuario.perfile)

const alert = ref(false)
const accion = ref(1)

const solicitudes = ref([])

const detallesSolicitud = ref(null)
const mostrarDetalles = ref(false)

const cargando = ref(false)

const placasOptions = ref([])

const tipo_mantenimientoOptions = ['Preventivo', 'Correctivo']

const estadoInicial = {
  placa: '',
  tipo_mantenimiento: '',
  descripcion: '',
  odometro: '',
}

const formulario = ref({ ...estadoInicial })

function abrir() {
  accion.value = 1
  alert.value = true
}

function cerrar() {
  alert.value = false
}

function resetearFormulario() {
  formulario.value = { ...estadoInicial }
  accion.value = 1
}

function mostrarMensajeError(mensaje) {
  $q.notify({
    type: 'negative',
    message: mensaje,
    position: 'bottom-right',
  })
}

async function validar() {
  let verificado = true

  const { placa, tipo_mantenimiento, odometro } = formulario.value

  if (placa === '') {
    mostrarMensajeError('Diligencie la placa')
    verificado = false
  }

  if (tipo_mantenimiento === '') {
    mostrarMensajeError('Seleccione un tipo de mantenimiento')
    verificado = false
  }

  if (odometro === '') {
    mostrarMensajeError('Diligencie el odómetro')
    verificado = false
  }

  return verificado
}

async function guardar() {
  cargando.value = true

  try {
    const esValido = await validar()

    if (!esValido) return

    const response = await useSolicitud.postSolicitud(formulario.value)

    console.log('Respuesta exitosa:', response)

    cerrar()
    cargarSolicitudes()
    resetearFormulario()

  } catch (error) {
    console.error('Error al guardar:', error)

    mostrarMensajeError('Error al guardar la solicitud')

  } finally {
    cargando.value = false
  }
}

async function cargarPlacas() {
  try {
    // Conductor no necesita cargar placas, ya tiene la suya
    if (perfilUsuario.value === 'conductor') {
      formulario.value.placa = useUsuario.user?.placa_asignada || ''
      return
    }

    const response = await useVehiculo.obtenerVehiculos()
    if (!Array.isArray(response)) return

    if (perfilUsuario.value === 'administrador') {
      placasOptions.value = response.map((v) => v.placa)
    } else if (perfilUsuario.value === 'propietario') {
      const placasAsignadas =
        useUsuario.user?.placa_asignada?.split(',').map((p) => p.trim().toUpperCase()) || []
      placasOptions.value = response
        .filter((v) => placasAsignadas.includes(v.placa.toUpperCase()))
        .map((v) => v.placa)
    }
  } catch (e) {
    console.error(e)
  }
}

async function cargarSolicitudes() {
  try {
    let response
    // ADMIN -> todos
    if (perfilUsuario.value === 'administrador') {
      response = await useSolicitud.obtenerSolicitudes()
    }

    // PROPIETARIO -> por placas asignadas
    else if (perfilUsuario.value === 'propietario') {
      const placas = useUsuario.user?.placa_asignada || ''

      response = await useSolicitud.obtenerResumenPorPlaca(placas)

      response = response?.resumen?.total?.consecutivos || []
    }

    // CONDUCTOR -> por sus placas
    else if (perfilUsuario.value === 'conductor') {
      const placas = useUsuario.user?.placa_asignada || ''

      response = await useSolicitud.obtenerResumenPorPlaca(placas)

      response = response?.resumen?.total?.consecutivos || []
    }
    if (Array.isArray(response)) {
      solicitudes.value = response.map((item) => ({
        consecutivo: item.consecutivo || '',
        placa: item.placa || '',
        odometro: item.odometro || '',
        tipo_mantenimiento: item.tipo_mantenimiento || '',
        fecha_creacion: item.fecha_creacion || '',
        descripcion: item.descripcion || '',
      }))
    } else {
      console.error('Error en formato de respuesta:', response)
      solicitudes.value = []
    }
  } catch (error) {
    console.error('Error al cargar solicitudes:', error)
    solicitudes.value = []
  }
}

async function verDetalles(consecutivo) {
  try {
    const detalle = await useSolicitud.obtenerdatodessolicitud(consecutivo)

    console.log('Detalles obtenidos:', detalle)

    if (detalle) {
      detallesSolicitud.value = {
        consecutivo: detalle.consecutivo || '',
        placa: detalle.placa || '',
        tipo_mantenimiento: detalle.tipo_mantenimiento || '',
        descripcion: detalle.descripcion || '',
        odometro: detalle.odometro || '',
        correo_usuario: detalle.correo_usuario || '',
        usuario: detalle.usuario || '',
        fecha_creacion: detalle.fecha_creacion || '',
      }

      mostrarDetalles.value = true
    }
  } catch (error) {
    console.error('Error al obtener detalles:', error)
  }
}

function formatFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

onMounted(() => {
  cargarSolicitudes()
  cargarPlacas()
})

defineOptions({
  name: 'SolicitudesPage',
})
</script>

<style scoped>

.metrica-chip {
  background: #f9fafb;
  border-radius: 8px;
  padding: 8px 10px;
  min-width: 0;
}
.metrica-chip.rendimiento-malo {
  background: #fef2f2;
}
.metrica-chip.rendimiento-bueno {
  background: #f0fdf4;
}
.metrica-label {
  font-size: 10px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}
.metrica-valor {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

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
  -ms-overflow-style: none;
}
.filter-scroll::-webkit-scrollbar {
  display: none;
}

.filter-chip {
  border-radius: 999px !important;
  font-size: 13px;
  flex-shrink: 0;
}

.solicitudes-card {
  border-radius: 12px !important;
  transition: border-color 0.15s;
}
.solicitudes-card:active {
  opacity: 0.85;
}

.avatar-chip {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #eff6ff;
  color: #1e50a2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
  letter-spacing: 0.5px;
}

.detalle-fila {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.detalle-fila:last-child {
  border-bottom: none;
}
.detalle-label {
  font-size: 13px;
  color: #9CA3AF;
}
.detalle-valor {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  text-align: right;
  max-width: 60%;
}
</style>
