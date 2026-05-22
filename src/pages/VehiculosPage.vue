<template>
  <q-page class="flex flex-center">
    <q-card-section>
      <div class="row items-center q-col-gutter-md">
        <div class="col-12 col-md-auto">
          <q-btn-group spread>
            <q-btn
              v-for="(config, tipo) in filtrosConfig"
              :key="tipo"
              :label="tipo === 'todos' ? 'Todos' : `Por ${config.titulo.split(' ').pop()}`"
              :icon="config.icono"
              :color="config.color"
              @click="cargarListaPor(tipo)"
              :outline="tipoLista !== tipo"
            />
          </q-btn-group>
        </div>

        <div class="col-12 col-md-auto" v-if="tipoLista !== 'todos' && !filtroActual.esFiltroTexto">
          <q-btn-toggle
            v-model="ordenActual"
            toggle-color="primary"
            :options="opcionesOrdenamiento"
            @update:model-value="cargarVehiculos"
          />
        </div>

        <div class="col-12 col-md-auto" v-if="filtroActual.esFiltroTexto">
          <q-select
            v-model="valorFiltroTexto"
            :options="opcionesFiltroTexto"
            option-value="valor"
            option-label="etiqueta"
            dense
            outlined
            emit-value
            map-options
            @update:model-value="actualizarValorFiltro"
          />
        </div>
      </div>
    </q-card-section>

    <q-card-section>
      <div class="text-h6 q-mb-md">
        <q-icon :name="filtroActual.icono" :color="filtroActual.color" />
        {{ filtroActual.titulo }}
        <span v-if="filtroActual.esFiltroTexto && valorFiltroTexto">
          - {{ obtenerEtiquetaFiltroTexto(valorFiltroTexto) }}
        </span>
      </div>

      <q-list bordered separator>
        <q-item
          v-for="vehiculo in vehiculos"
          :key="vehiculo.placa"
          clickable
          @click="verDetalles(vehiculo.placa)"
        >
          <q-item-section>
            <q-item-label>{{ vehiculo.placa }} - {{ vehiculo.modelo }}</q-item-label>
            <q-item-label caption v-if="vehiculo.valorFiltro !== undefined">
              {{ obtenerEtiquetaValor(vehiculo.valorFiltro) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <div>
      <q-dialog v-model="mostrarDetalles" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Detalles del vehiculo</div>
          </q-card-section>

          <q-card-section class="q-pt-none" v-if="detallesVehiculo">
            <div class="q-pa-md">
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Placa:</div>
                <div class="col-8">{{ detallesVehiculo.placa }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Viajes:</div>
                <div class="col-8">{{ detallesVehiculo.viajes }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Licencia:</div>
                <div class="col-8">{{ detallesVehiculo.licencia }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Marca:</div>
                <div class="col-8">{{ detallesVehiculo.marca }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Modelo:</div>
                <div class="col-8">{{ detallesVehiculo.modelo }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Referencia:</div>
                <div class="col-8">{{ detallesVehiculo.referencia }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Odómetro:</div>
                <div class="col-8">{{ detallesVehiculo.odometro }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Clase de vehículo:</div>
                <div class="col-8">{{ detallesVehiculo.clase_vehiculo }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Color:</div>
                <div class="col-8">{{ detallesVehiculo.color }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Servicio:</div>
                <div class="col-8">{{ detallesVehiculo.servicio }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Capacidad:</div>
                <div class="col-8">{{ detallesVehiculo.capacidad }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Combustible:</div>
                <div class="col-8">{{ detallesVehiculo.combustible }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Número motor:</div>
                <div class="col-8">{{ detallesVehiculo.numero_motor }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Número chasis:</div>
                <div class="col-8">{{ detallesVehiculo.numero_chasis }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Fecha de Matrícula:</div>
                <div class="col-8">{{ detallesVehiculo.fecha_matricula }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Estado del Soat:</div>
                <div class="col-8">{{ detallesVehiculo.soat }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Fecha de expedición del soat:</div>
                <div class="col-8">{{ detallesVehiculo.soat_expedicion }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Vencimiento de soat:</div>
                <div class="col-8">{{ detallesVehiculo.soat_vencimiento }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Capacidad Toneladas:</div>
                <div class="col-8">{{ detallesVehiculo.capacidad_ton }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Estado del tecnicomecánico:</div>
                <div class="col-8">{{ detallesVehiculo.tecnico }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Fecha de expedición del tecnicomecánico:</div>
                <div class="col-8">{{ detallesVehiculo.tecnico_expedicion }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Vencimiento del tecnicomecánico:</div>
                <div class="col-8">{{ detallesVehiculo.tecnico_vencimiento }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Póliza:</div>
                <div class="col-8">{{ detallesVehiculo.poliza }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Póliza expedición:</div>
                <div class="col-8">{{ detallesVehiculo.poliza_expedicion }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Vencimiento Póliza:</div>
                <div class="col-8">{{ detallesVehiculo.poliza_vencimiento }}</div>
              </div>
              <!-- <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Adjuntos:</div>
                <div class="col-8">
                  <a :href="detallesVehiculo.link" target="_blank"> Ver archivo </a>
                </div>
              </div> -->
              <q-btn
                outline
                color="orange"
                icon="folder"
                label="Ver archivos"
                size="sm"
                @click="abrirVisor(detallesVehiculo.link, 'Documentos')"
              />
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Estado:</div>
                <div class="col-8">{{ detallesVehiculo.estado }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Fecha creación:</div>
                <div class="col-8">{{ detallesVehiculo.fecha_creacion }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Rendimiento de kms por Galón:</div>
                <div class="col-8">{{ detallesVehiculo.rendimiento_galon }}</div>
              </div>
            </div>

            <div class="row q-mb-md">
              <div class="col-4 text-weight-bold">Activación:</div>
              <div class="col-8">
                <q-toggle
                  v-model="isActive"
                  :color="detallesVehiculo.estado === 'Activo' ? 'grey' : 'primary'"
                  @update:model-value="cambiarEstado"
                />
              </div>
            </div>
            <q-card-actions align="right">
              <q-btn class="option-button" @click="editar(detallesVehiculo)"> ✏️ </q-btn>
            </q-card-actions>
          </q-card-section>

          <DriveVisor
            v-model="dialogAbierto"
            :titulo="tituloVisor"
            :archivos="archivos"
            :cargando="cargandoVisor"
            :error="errorVisor"
            :url-archivo="urlArchivo"
            :es-imagen="esImagen"
            :es-pdf="esPdf"
          />

          <q-card-actions align="right">
            <q-btn flat label="Cerrar" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog
        v-model="alert"
        persistent
        transition-show="slide-up"
        transition-hide="slide-down"
      >
        <q-card class="bg-grey-2">
          <!-- HEADER -->
          <q-card-section class="bg-primary text-white q-py-md">
            <div class="text-h6 text-weight-bold">
              {{ accion === 1 ? 'Agregar Vehículo' : 'Editar Vehículo' }}
            </div>

            <div class="text-caption text-blue-1">Complete la información del vehículo</div>
          </q-card-section>

          <q-scroll-area style="height: calc(100vh - 140px)">
            <div class="q-pa-md">
              <!-- INFORMACIÓN GENERAL -->
              <q-card flat bordered class="rounded-borders q-mb-md">
                <q-card-section>
                  <div class="text-subtitle1 text-primary text-weight-bold q-mb-md">
                    Información General
                  </div>

                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-sm-6">
                      <q-input filled rounded v-model.trim="formulario.placa" label="Placa" dense />
                    </div>

                    <div class="col-12 col-sm-6">
                      <q-input
                        filled
                        rounded
                        v-model.trim="formulario.licencia"
                        label="Licencia"
                        dense
                      />
                    </div>

                    <div class="col-12 col-sm-6">
                      <q-select
                        filled
                        rounded
                        v-model="formulario.marca"
                        label="Marca"
                        :options="marcaOptions"
                        dense
                      />
                    </div>

                    <div class="col-12 col-sm-6">
                      <q-input
                        filled
                        rounded
                        v-model.trim="formulario.modelo"
                        label="Modelo"
                        dense
                      />
                    </div>

                    <div class="col-12">
                      <q-input
                        filled
                        rounded
                        v-model.trim="formulario.referencia"
                        label="Referencia"
                        dense
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- ESPECIFICACIONES -->
              <q-card flat bordered class="rounded-borders q-mb-md">
                <q-card-section>
                  <div class="text-subtitle1 text-primary text-weight-bold q-mb-md">
                    Especificaciones
                  </div>

                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-sm-6">
                      <q-input
                        filled
                        rounded
                        type="number"
                        v-model.trim="formulario.odometro"
                        label="Odómetro"
                        dense
                      />
                    </div>

                    <div class="col-12 col-sm-6">
                      <q-select
                        filled
                        rounded
                        v-model="formulario.clase_vehiculo"
                        label="Clase de vehículo"
                        :options="clase_vehiculoOptions"
                        dense
                      />
                    </div>

                    <div class="col-12 col-sm-6">
                      <q-input filled rounded v-model.trim="formulario.color" label="Color" dense />
                    </div>

                    <div class="col-12 col-sm-6">
                      <q-select
                        filled
                        rounded
                        v-model="formulario.servicio"
                        label="Servicio"
                        :options="servicioOptions"
                        dense
                      />
                    </div>

                    <div class="col-12 col-sm-6">
                      <q-input
                        filled
                        rounded
                        v-model.trim="formulario.capacidad"
                        label="Capacidad"
                        dense
                      />
                    </div>

                    <div class="col-12 col-sm-6">
                      <q-input
                        filled
                        rounded
                        type="number"
                        v-model.trim="formulario.capacidad_ton"
                        label="Capacidad toneladas"
                        dense
                      />
                    </div>

                    <div class="col-12">
                      <q-select
                        filled
                        rounded
                        v-model="formulario.combustible"
                        label="Combustible"
                        :options="combustibleOptions"
                        dense
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- MOTOR -->
              <q-card flat bordered class="rounded-borders q-mb-md">
                <q-card-section>
                  <div class="text-subtitle1 text-primary text-weight-bold q-mb-md">
                    Motor y Chasis
                  </div>

                  <div class="row q-col-gutter-md">
                    <div class="col-12">
                      <q-input
                        filled
                        rounded
                        v-model.trim="formulario.numero_motor"
                        label="Número motor"
                        dense
                      />
                    </div>

                    <div class="col-12">
                      <q-input
                        filled
                        rounded
                        v-model.trim="formulario.numero_chasis"
                        label="Número chasis"
                        dense
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- FECHAS -->
              <q-card flat bordered class="rounded-borders q-mb-md">
                <q-card-section>
                  <div class="text-subtitle1 text-primary text-weight-bold q-mb-md">
                    Fechas y Documentación
                  </div>

                  <div class="row q-col-gutter-md">
                    <!-- FECHA MATRICULA -->
                    <div class="col-12">
                      <div class="text-caption text-grey-7 q-mb-xs">Fecha de matrícula</div>

                      <q-input filled rounded v-model="formulario.fecha_matricula" readonly dense>
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                              <q-date v-model="formulario.fecha_matricula" />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>

                    <!-- SOAT -->
                    <div class="col-12">
                      <div class="text-caption text-grey-7 q-mb-xs">Fecha expedición SOAT</div>

                      <q-input filled rounded v-model="formulario.soat_expedicion" readonly dense>
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                              <q-date v-model="formulario.soat_expedicion" />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>

                    <!-- TECNICO -->
                    <div class="col-12">
                      <div class="text-caption text-grey-7 q-mb-xs">
                        Fecha expedición técnico-mecánica
                      </div>

                      <q-input
                        filled
                        rounded
                        v-model="formulario.tecnico_expedicion"
                        readonly
                        dense
                      >
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                              <q-date v-model="formulario.tecnico_expedicion" />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>

                    <!-- POLIZA -->
                    <div class="col-12">
                      <div class="text-caption text-grey-7 q-mb-xs">Fecha expedición póliza</div>

                      <q-input filled rounded v-model="formulario.poliza_expedicion" readonly dense>
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                              <q-date v-model="formulario.poliza_expedicion" />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- ARCHIVOS -->
              <q-card flat bordered class="rounded-borders q-mb-xl">
                <q-card-section>
                  <div class="text-subtitle1 text-primary text-weight-bold q-mb-md">
                    Archivos Adjuntos
                  </div>

                  <q-file
                    filled
                    rounded
                    multiple
                    clearable
                    use-chips
                    v-model="archivosSeleccionados"
                    label="Seleccionar archivos"
                    accept="image/*, application/pdf, .doc, .docx, .xls, .xlsx, .kml, .kmz"
                    @update:model-value="manejarSeleccionArchivos"
                  >
                    <template v-slot:prepend>
                      <q-icon name="attach_file" />
                    </template>
                  </q-file>

                  <div class="q-mt-md row q-col-gutter-sm">
                    <div
                      v-for="(archivo, index) in formulario.archivos"
                      :key="index"
                      class="col-12"
                    >
                      <q-chip
                        removable
                        square
                        color="blue-1"
                        text-color="primary"
                        icon="description"
                        @remove="eliminarArchivo(index)"
                        class="full-width"
                      >
                        {{ archivo.name }}

                        <q-tooltip>
                          {{ archivo.type }} - {{ (archivo.size / 1024).toFixed(2) }} KB
                        </q-tooltip>
                      </q-chip>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-scroll-area>

          <!-- BOTONES -->
          <q-card-actions class="bg-white q-pa-md" align="between">
            <q-btn flat color="grey-8" label="Cerrar" icon="close" @click="cerrar()" />

            <q-btn unelevated rounded color="primary" :loading="cargando" @click="guardar">
              <q-icon :name="accion === 1 ? 'directions_car' : 'edit'" class="q-mr-sm" />

              {{ accion === 1 ? 'Agregar vehículo' : 'Actualizar vehículo' }}

              <template v-slot:loading>
                <q-spinner color="white" size="1em" />
              </template>
            </q-btn>
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>

    <q-btn color="primary" :label="'Registrar nuevo'" class="q-mt-md" @click="abrir" />
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useStoreVehiculos } from '../stores/vehiculos'
import { useStoreUsuarios } from '../stores/usuarios'
import { useQuasar } from 'quasar'
import { TIPOS_FILTRO, CONFIG_FILTROS } from '../composables/filtrosvehiculos'
import { useDriveVisor } from '../composables/useDriveVisor'
import DriveVisor from 'src/components/VisorDrive.vue'

const {
  dialogAbierto,
  archivos,
  cargando: cargandoVisor,
  titulo: tituloVisor,
  error: errorVisor,
  abrirVisor,
  urlArchivo,
  esImagen,
  esPdf,
} = useDriveVisor()

const useVehiculo = useStoreVehiculos()
const useUsuario = useStoreUsuarios()

const alert = ref(false)
const accion = ref(1)
const $q = useQuasar()
const perfilUsuario = computed(() => useUsuario.perfile)

// const props = defineProps({
//   datos: {
//     type: Object,
//     default: () => ({}),
//   },
//   esEdicion: {
//     type: Boolean,
//     default: false,
//   },
// })

const estadoInicial = {
  placa: '',
  licencia: '',
  marca: '',
  modelo: '',
  referencia: '',
  odometro: '',
  clase_vehiculo: '',
  color: '',
  servicio: '',
  capacidad: '',
  combustible: '',
  numero_motor: '',
  numero_chasis: '',
  fecha_matricula: '',
  soat_expedicion: '',
  capacidad_ton: '',
  tecnico_expedicion: '',
  poliza_expedicion: '',
  archivos: [],
  rendimiento_galon: '',
}

const formulario = ref({ ...estadoInicial })
const cargando = ref(false)

const tipoLista = ref(TIPOS_FILTRO.TODOS)
const ordenActual = ref('desc')

const vehiculos = ref([])

const valorFiltroTexto = ref(null)

const detallesVehiculo = ref(null)
const mostrarDetalles = ref(false)

const marcaOptions = [
  'KENWORTH',
  'Freightliner',
  'Mack',
  'Volvo',
  'International',
  'Scania',
  'Hino',
  'Isuzu',
]
const clase_vehiculoOptions = ['TRACTOMULA', 'CAMION', 'AUTOMÓVIL']

const servicioOptions = ['Carga', 'Particular', 'Público', 'Oficial', 'Especial']

const combustibleOptions = ['Gasolina', 'ACPM', 'Diesel', 'Gas natural', 'Eléctrico', 'Híbrido']

function abrir() {
  accion.value = 1
  alert.value = true
}

function cerrar() {
  alert.value = false
  resetearFormulario()
}

// async function guardar() {
//   cargando.value = true

//   if (!validar()) {
//     cargando.value = false
//     return
//   }

//   try {
//     const formData = new FormData()

//     Object.entries(formulario.value).forEach(([key, value]) => {
//       if (key === 'archivos') {
//         value.forEach((file) => formData.append('archivos', file))
//       } else if (value !== null && value !== undefined && value !== '') {
//         formData.append(key, value)
//       }
//     })
//     let response

//     if (props.esEdicion) {
//       response = await useVehiculo.putVehiculo(formulario.value.placa, formData)
//     } else {
//       response = await useVehiculo.postVehiculo(formData)
//     }

//     console.log('Respuesta exitosa:', response)

//     cerrar()
//     cargarVehiculos()
//     alert.value = false
//     resetearFormulario()
//   } catch (error) {
//     console.error('Error al guardar:', error)
//     mostrarMensajeError('Error al guardar el vehículo')
//   } finally {
//     cargando.value = false
//   }
// }

async function guardar() {
  cargando.value = true

  if (!validar()) {
    cargando.value = false
    return
  }

  try {
    const formData = new FormData()

    Object.entries(formulario.value).forEach(([key, value]) => {
      // múltiples archivos
      if (key === 'archivos' && Array.isArray(value)) {
        value.forEach((file) => {
          formData.append('archivos', file)
        })
      }

      // arrays normales
      else if (Array.isArray(value)) {
        formData.append(key, value.join(','))
      }

      // valores normales
      else if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value)
      }
    })

    let response

    if (accion.value === 2) {
      response = await useVehiculo.putVehiculo(formulario.value.placa, formData)
    } else {
      response = await useVehiculo.postVehiculo(formData)
    }

    console.log('Respuesta exitosa:', response)

    cerrar()
    cargarVehiculos()
    resetearFormulario()
  } catch (error) {
    console.error('Error completo:', error)
    mostrarMensajeError('Error al guardar el vehículo')
  } finally {
    cargando.value = false
  }
}

function editar(vehiculo) {
  accion.value = 2

  formulario.value = {
    ...estadoInicial,
    ...vehiculo,
  }
  alert.value = true
}

async function validar() {
  let verificado = true

  const { placa, marca, modelo } = formulario.value

  if (placa === '') {
    mostrarMensajeError('Diligencie la placa')
    verificado = false
  }
  if (marca === '') {
    mostrarMensajeError('Diligencie una marca')
    verificado = false
  }
  if (modelo === '') {
    mostrarMensajeError('Diligencie el modelo')
    verificado = false
  }

  return verificado
}

async function verDetalles(placa) {
  try {
    const detalle = await useVehiculo.obtenerdatodevehiculo(placa)
    console.log('Detalles obtenidos:', detalle)

    if (detalle) {
      detallesVehiculo.value = {
        placa: detalle['placa'] || '',
        licencia: detalle['licencia'] || '',
        marca: detalle['marca'] || '',
        modelo: detalle['modelo'] || '',
        referencia: detalle['referencia'] || '',
        odometro: detalle['odometro'] || '',
        clase_vehiculo: detalle['clase_vehiculo'] || '',
        color: detalle['color'] || '',
        servicio: detalle['servicio'] || '',
        capacidad: detalle['capacidad'] || '',
        combustible: detalle['combustible'] || '',
        numero_motor: detalle['numero_motor'] || '',
        numero_chasis: detalle['numero_chasis'] || '',
        fecha_matricula: detalle['fecha_matricula'] || '',
        soat_expedicion: detalle['soat_expedicion'] || '',
        capacidad_ton: detalle['capacidad_ton'] || '',
        tecnico_expedicion: detalle['tecnico_expedicion'] || '',
        poliza_expedicion: detalle['poliza_expedicion'] || '',
        archivos: detalle['archivos'] || '',
        fecha_creacion: detalle['fecha_creacion'] || '',
        rendimiento_galon: detalle['rendimiento_galon'] || '',
        link: detalle['link'] || '',
      }
      mostrarDetalles.value = true
    } else {
      console.error('No se pudieron obtener los detalles')
    }
  } catch (error) {
    console.error('Error al obtener detalles:', error)
  }
}

const filtrosConfig = computed(() => CONFIG_FILTROS)

const filtroActual = computed(() => CONFIG_FILTROS[tipoLista.value])

const opcionesOrdenamiento = computed(() => {
  if (tipoLista.value === TIPOS_FILTRO.TODOS) return []

  return [
    { label: filtroActual.value.etiquetaDesc, value: 'desc' },
    { label: filtroActual.value.etiquetaAsc, value: 'asc' },
  ]
})

watch(tipoLista, (newValue) => {
  const filtro = CONFIG_FILTROS[newValue]
  if (filtro.esFiltroTexto && filtro.opcionesFiltro?.length > 0) {
    valorFiltroTexto.value = filtro.opcionesFiltro[0].valor
  } else {
    valorFiltroTexto.value = null
  }
})

function cargarListaPor(tipo) {
  tipoLista.value = tipo
  ordenActual.value = 'desc'

  // Obtener el filtro actual basado en el tipo
  const filtro = CONFIG_FILTROS[tipo]

  // Asegurarnos de que hay un valor por defecto válido
  if (filtro.esFiltroTexto && filtro.opcionesFiltro?.length > 0) {
    // Usar el primer valor como valor por defecto
    valorFiltroTexto.value = filtro.opcionesFiltro[0].valor
    // console.log(`Tipo cambiado a ${tipo}, valor por defecto: ${valorFiltroTexto.value}`);
  } else {
    valorFiltroTexto.value = null
    // console.log(`Tipo cambiado a ${tipo}, sin valor por defecto`);
  }

  cargarVehiculos()
}

function actualizarValorFiltro(nuevoValor) {
  // console.log(`Cambiando valor del filtro a: ${nuevoValor}`);
  valorFiltroTexto.value = nuevoValor
  cargarVehiculos()
}

function obtenerEtiquetaValor(valor) {
  // Implementa la lógica para formatear el valor según el tipo de filtro
  if (tipoLista.value === TIPOS_FILTRO.ESTADO) {
    return `${valor}`
  } else if (tipoLista.value === TIPOS_FILTRO.DISTANCIA) {
    return `${valor} km`
  }
  return valor
}

function obtenerEtiquetaFiltroTexto(valor) {
  if (filtroActual.value.esFiltroTexto && filtroActual.value.opcionesFiltro) {
    const opcion = filtroActual.value.opcionesFiltro.find((opt) => opt.valor === valor)
    return opcion ? opcion.etiqueta : valor
  }
  return valor
}

const opcionesFiltroTexto = computed(() => {
  if (tipoLista.value && filtroActual.value && filtroActual.value.esFiltroTexto) {
    return filtroActual.value.opcionesFiltro || []
  }
  return []
})

// async function cargarVehiculos() {
//   try {
//     let response

//     if (tipoLista.value === TIPOS_FILTRO.TODOS) {
//       response = await useVehiculo.obtenerVehiculos()
//     } else if (filtroActual.value.esFiltroTexto) {
//       // console.log(`Filtrando por: ${tipoLista.value}, valor: ${valorFiltroTexto.value}`);

//       response = await useVehiculo.obtenerVehiculosFiltrados(
//         filtroActual.value.campoDatos,
//         valorFiltroTexto.value
//       )

//     } else {

//       response = await useVehiculo.obtenerVehiculosOrdenados(
//         filtroActual.value.campoOrden,
//         ordenActual.value
//       )
//     }
//     if (Array.isArray(response)) {
//       vehiculos.value = response.map((item) => {
//         const result = {
//           placa: item['placa'] || '',
//           modelo: item['modelo'] || '',
//         }

//         const campoDatos = filtroActual.value?.campoDatos
//         if (campoDatos && item[campoDatos] !== undefined) {
//           result.valorFiltro = item[campoDatos]
//         }

//         return result
//       })
//     } else {
//       console.error('Error en formato de respuesta:', response)
//       vehiculos.value = []
//     }
//   } catch (error) {
//     console.error(`Error al cargar vehiculos por ${tipoLista.value}:`, error)
//     vehiculos.value = []
//   }
// }

async function cargarVehiculos() {
  try {
    let response = []
    // ADMINISTRADOR
    if (perfilUsuario.value === 'administrador') {
      if (tipoLista.value === TIPOS_FILTRO.TODOS) {
        response = await useVehiculo.obtenerVehiculos()
      } else if (filtroActual.value.esFiltroTexto) {
        response = await useVehiculo.obtenerVehiculosFiltrados(
          filtroActual.value.campoDatos,
          valorFiltroTexto.value,
        )
      } else {
        response = await useVehiculo.obtenerVehiculosOrdenados(
          filtroActual.value.campoOrden,
          ordenActual.value,
        )
      }
    }
    // PROPIETARIO Y CONDUCTOR
    else {
      const placasUsuario = useUsuario.user?.placa_asignada?.split(',').map((p) => p.trim()) || []
      let todosLosVehiculos = []
      for (const placa of placasUsuario) {
        const data = await useVehiculo.obtenerResumenPorPlaca(placa)
        const lista = data?.resumen?.total?.consecutivos || []
        todosLosVehiculos.push(...lista)
      }
      response = todosLosVehiculos
      // FILTROS TEXTO
      if (filtroActual.value?.esFiltroTexto) {
        response = response.filter((item) => {
          const valor = item[filtroActual.value.campoDatos]

          return String(valor).toLowerCase().includes(String(valorFiltroTexto.value).toLowerCase())
        })
      }
      // ORDENAMIENTOS
      else if (tipoLista.value !== TIPOS_FILTRO.TODOS) {
        const campo = filtroActual.value.campoOrden

        response.sort((a, b) => {
          const valorA = parseFloat(a[campo]) || 0
          const valorB = parseFloat(b[campo]) || 0
          return ordenActual.value === 'desc' ? valorB - valorA : valorA - valorB
        })
      }
    }
    if (Array.isArray(response)) {
      vehiculos.value = response.map((item) => {
        const result = {
          placa: item.placa || '',
          modelo: item.modelo || 0,
        }
        const campoDatos = filtroActual.value?.campoDatos
        if (campoDatos && item[campoDatos] !== undefined) {
          result.valorFiltro = item[campoDatos]
        }
        return result
      })
    } else {
      console.error('Error en formato de respuesta:', response)
      vehiculos.value = []
    }
  } catch (error) {
    console.error(`Error al cargar vehiculos por ${tipoLista.value}:`, error)
    vehiculos.value = []
  }
}

onMounted(() => {
  cargarVehiculos()
})

const isActive = computed({
  get: () => detallesVehiculo.value && detallesVehiculo.value.estado === 'Activo',
  set: () => {},
})
const cambiarEstado = async () => {
  try {
    if (detallesVehiculo.value.estado === 'Activo') {
      await useVehiculo.putDesactivarVehiculo(detallesVehiculo.value.placa)
      detallesVehiculo.value.estado = 'Inactivo'
    } else {
      await useVehiculo.putActivarVehiculo(detallesVehiculo.value.placa)
      detallesVehiculo.value.estado = 'Activo'
    }
  } catch (error) {
    console.error('Error al cambiar estado del vehículo:', error)
  }
}

function manejarSeleccionArchivos(files) {
  if (files) {
    // Si es array de archivos
    if (Array.isArray(files)) {
      files.forEach((file) => {
        // Verificar si el archivo ya existe en la lista (evitar duplicados)
        const existeArchivo = formulario.value.archivos.some(
          (a) => a.name === file.name && a.size === file.size && a.type === file.type,
        )

        if (!existeArchivo) {
          formulario.value.archivos.push(file)
        }
      })
    }
    // Si es un solo archivo
    else if (files instanceof File) {
      const existeArchivo = formulario.value.archivos.some(
        (a) => a.name === files.name && a.size === files.size && a.type === files.type,
      )

      if (!existeArchivo) {
        formulario.value.archivos.push(files)
      }
    }
  }
}

function eliminarArchivo(index) {
  formulario.value.archivos.splice(index, 1)
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

// function mostrarMensajeExito(mensaje) {
//   $q.notify({
//     type: 'positive',
//     message: mensaje,
//     position: 'bottom-right',
//   })
// }

defineOptions({
  name: 'VehiculosPage',
})
</script>
