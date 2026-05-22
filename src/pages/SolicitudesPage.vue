<template>
  <q-page class="flex flex-center">
    <q-card-section>
      <div class="text-h6 q-mb-md">Solicitudes de mantenimiento</div>

      <q-list bordered separator>
        <q-item
          v-for="solicitud in solicitudes"
          :key="solicitud.consecutivo"
          clickable
          @click="verDetalles(solicitud.consecutivo)"
        >
          <q-item-section>
            <q-item-label> {{ solicitud.consecutivo }} - {{ solicitud.placa }} </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <div>
      <q-dialog v-model="mostrarDetalles" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Detalles de la solicitud</div>
          </q-card-section>

          <q-card-section class="q-pt-none" v-if="detallesSolicitud">
            <div class="q-pa-md">
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Consecutivo:</div>
                <div class="col-8">{{ detallesSolicitud.consecutivo }}</div>
              </div>

              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Placa:</div>
                <div class="col-8">{{ detallesSolicitud.placa }}</div>
              </div>

              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Tipo de mantenimiento:</div>
                <div class="col-8">{{ detallesSolicitud.tipo_mantenimiento }}</div>
              </div>

              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Descripción:</div>
                <div class="col-8">{{ detallesSolicitud.descripcion }}</div>
              </div>

              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Odómetro:</div>
                <div class="col-8">{{ detallesSolicitud.odometro }}</div>
              </div>

              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Correo usuario:</div>
                <div class="col-8">{{ detallesSolicitud.correo_usuario }}</div>
              </div>

              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Usuario:</div>
                <div class="col-8">{{ detallesSolicitud.usuario }}</div>
              </div>

              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Fecha creación:</div>
                <div class="col-8">{{ detallesSolicitud.fecha_creacion }}</div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cerrar" color="primary" v-close-popup />
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
    </div>

    <q-btn color="primary" label="Registrar nuevo" class="q-mt-md" @click="abrir" />
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

onMounted(() => {
  cargarSolicitudes()
  cargarPlacas()
})

defineOptions({
  name: 'SolicitudesPage',
})
</script>
