<template>
  <q-page class="flex flex-center">
    <q-card-section>
      <q-list bordered separator>
        <q-item
          v-for="preoperacional in preoperacionales"
          :key="preoperacional.consecutivo"
          clickable
          @click="verDetalles(preoperacional.consecutivo)"
        >
          <q-item-section>
            <q-item-label
              >{{ preoperacional.consecutivo }} - {{ preoperacional.placa }}</q-item-label
            >
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <div>
      <q-dialog v-model="mostrarDetalles" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Detalles del Preoperacional</div>
          </q-card-section>

          <q-card-section class="q-pt-none" v-if="detallesPreoperacional">
            <div class="q-pa-md">
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Consecutivo:</div>
                <div class="col-8">{{ detallesPreoperacional.consecutivo }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Viajes:</div>
                <div class="col-8">{{ detallesPreoperacional.codigo_viaje }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Vehículo del preoperacional:</div>
                <div class="col-8">{{ detallesPreoperacional.placa }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Odómetro:</div>
                <div class="col-8">{{ detallesPreoperacional.odometro }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Nivel de agua:</div>
                <div class="col-8">{{ detallesPreoperacional.nivel_agua }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Nivel de aceite:</div>
                <div class="col-8">{{ detallesPreoperacional.nivel_aceite }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Galones:</div>
                <div class="col-8">{{ detallesPreoperacional.galones }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Fugas visibles:</div>
                <div class="col-8">{{ detallesPreoperacional.fugas_visibles }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Presion frenos:</div>
                <div class="col-8">{{ detallesPreoperacional.presion_frenos }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Fugas audibles:</div>
                <div class="col-8">{{ detallesPreoperacional.fugas_audibles }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Freno de parqueo:</div>
                <div class="col-8">{{ detallesPreoperacional.freno_parqueo }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">ABS sin testigo:</div>
                <div class="col-8">{{ detallesPreoperacional.abs_sintestigo }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Prueba Freno:</div>
                <div class="col-8">{{ detallesPreoperacional.prueba_freno }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Luces altas/bajas:</div>
                <div class="col-8">{{ detallesPreoperacional.luces_altas_bajas }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Direccionales:</div>
                <div class="col-8">{{ detallesPreoperacional.direccionales }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Luces de freno:</div>
                <div class="col-8">{{ detallesPreoperacional.luces_freno }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Luces de remolque:</div>
                <div class="col-8">{{ detallesPreoperacional.luces_remolque }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Testigo tablero:</div>
                <div class="col-8">{{ detallesPreoperacional.testigo_tablero }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">filtro aire:</div>
                <div class="col-8">{{ detallesPreoperacional.filtro_aire }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Volante:</div>
                <div class="col-8">{{ detallesPreoperacional.volante }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Sin fugas:</div>
                <div class="col-8">{{ detallesPreoperacional.sin_fugas }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Cambios suaves:</div>
                <div class="col-8">{{ detallesPreoperacional.cambios_suave }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Sin ruidos:</div>
                <div class="col-8">{{ detallesPreoperacional.sin_ruidos }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Cinturón de seguridad:</div>
                <div class="col-8">{{ detallesPreoperacional.cinturon_seguridad }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Espejos:</div>
                <div class="col-8">{{ detallesPreoperacional.espejos }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Extintor cabezote:</div>
                <div class="col-8">{{ detallesPreoperacional.extintor_cabezote }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Extintor de trailer:</div>
                <div class="col-8">{{ detallesPreoperacional.extintor_trailer }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Botiquín:</div>
                <div class="col-8">{{ detallesPreoperacional.botiquin }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Triángulos reflectivos:</div>
                <div class="col-8">{{ detallesPreoperacional.triangulos_reflectivos }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Kit de carretera:</div>
                <div class="col-8">{{ detallesPreoperacional.kit_carretera }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Señalización Cómo Conduzco:</div>
                <div class="col-8">{{ detallesPreoperacional.senalizacion_conduzco }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">correas:</div>
                <div class="col-8">{{ detallesPreoperacional.correas }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Estado de la carpa:</div>
                <div class="col-8">{{ detallesPreoperacional.estado_carpa }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Refrigerante:</div>
                <div class="col-8">{{ detallesPreoperacional.refrigerante }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Pito/Bocina:</div>
                <div class="col-8">{{ detallesPreoperacional.pito }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Alarma de retroceso:</div>
                <div class="col-8">{{ detallesPreoperacional.alarma_retroceso }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Presión de llantas:</div>
                <div class="col-8">{{ detallesPreoperacional.presion_llantas }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Desgaste de llantas:</div>
                <div class="col-8">{{ detallesPreoperacional.desgaste_llantas }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Tuercas ajustadas:</div>
                <div class="col-8">{{ detallesPreoperacional.tuercas_ajustadas }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Fisuras en la suspensión:</div>
                <div class="col-8">{{ detallesPreoperacional.suspension_fisuras }}</div>
              </div>
              <!-- <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Acople de quinta rueda:</div>
                <div class="col-8">{{ detallesPreoperacional.acople_quintarueda }}</div>
              </div> -->
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Quinta rueda:</div>
                <div class="col-8">{{ detallesPreoperacional.quinta_rueda }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Pasador de rey:</div>
                <div class="col-8">{{ detallesPreoperacional.pasador_rey }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Mangueras de aire:</div>
                <div class="col-8">{{ detallesPreoperacional.mangueras_aire }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Seguro acople:</div>
                <div class="col-8">{{ detallesPreoperacional.seguro_acople }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Placas visibles:</div>
                <div class="col-8">{{ detallesPreoperacional.placas_visibles }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Correo del usuario:</div>
                <div class="col-8">{{ detallesPreoperacional.correo_usuario }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Usuario:</div>
                <div class="col-8">{{ detallesPreoperacional.usuario }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Fecha del registro:</div>
                <div class="col-8">{{ detallesPreoperacional.fecha_creacion }}</div>
              </div>
              <q-btn
                outline
                color="orange"
                icon="folder"
                label="Ver archivos"
                size="sm"
                @click="abrirVisor(detallesPreoperacional.link, 'Documentos')"
              />
            </div>

       <!-- lo comentaré porque el preoperacional es de una sola vez, pero si se necesita, en el backend ya está el codigo para editarlo -->
            <!-- <q-card-actions align="right">
              <q-btn class="option-button" @click="editar(detallesPreoperacional)"> ✏️ </q-btn>
            </q-card-actions> -->
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

      <q-dialog v-model="alert" persistent>
        <q-card class="bg-grey-1">
          <!-- HEADER -->
          <q-card-section class="bg-primary text-white q-py-md">
            <div class="text-h6 text-weight-bold">
              {{ accion == 1 ? 'Agregar Preoperacional' : 'Editar Preoperacional' }}
            </div>
            <div class="text-caption">Complete la inspección preoperacional del vehículo</div>
          </q-card-section>

          <q-card-section class="scroll q-pa-md" style="max-height: 85vh">
            <!-- DATOS PRINCIPALES -->
            <q-card flat bordered class="rounded-borders q-mb-lg shadow-1">
              <q-card-section>
                <div class="text-subtitle1 text-primary text-weight-bold q-mb-md">
                  🚚 Datos principales
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-12">
                    <q-select
                      filled
                      rounded
                      bg-color="white"
                      v-model="formulario.codigo_viaje"
                      label="Viaje"
                      :options="viajeOptions"
                      option-label="label"
                      option-value="value"
                      emit-value
                      map-options
                    />
                  </div>

                  <div class="col-12 col-sm-6">
                    <q-input
                      filled
                      rounded
                      bg-color="white"
                      v-model="formulario.placa"
                      label="Placa"
                      disable
                    />
                  </div>

                  <div class="col-12 col-sm-6">
                    <q-input
                      filled
                      rounded
                      bg-color="white"
                      v-model.trim="formulario.odometro"
                      label="Odómetro"
                      type="number"
                    />
                  </div>

                  <div class="col-12 col-sm-6">
                    <q-input
                      filled
                      rounded
                      bg-color="white"
                      v-model.trim="formulario.galones"
                      label="Galones"
                      type="number"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- MOTOR -->
            <q-card flat bordered class="rounded-borders q-mb-lg shadow-1">
              <q-card-section>
                <div class="text-subtitle1 text-primary text-weight-bold q-mb-md">
                  🛠️ Motor y fluidos
                </div>

                <div class="row q-col-gutter-md">
                  <div
                    class="col-12"
                    v-for="campo in [
                      ['nivel_agua', 'Nivel de agua'],
                      ['nivel_aceite', 'Nivel de aceite'],
                      ['fugas_visibles', 'Fugas visibles'],
                      ['correas', 'Correas en buen estado'],
                      ['filtro_aire', 'Filtro de aire'],
                    ]"
                    :key="campo[0]"
                  >
                    <CampoPreoperacional v-model="formulario[campo[0]]" :label="campo[1]" />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- LLANTAS -->
            <q-card flat bordered class="rounded-borders q-mb-lg shadow-1">
              <q-card-section>
                <div class="text-subtitle1 text-primary text-weight-bold q-mb-md">
                  🛞 Llantas y suspensión
                </div>

                <div class="row q-col-gutter-md">
                  <div
                    class="col-12"
                    v-for="campo in [
                      ['presion_llantas', 'Presión adecuada en llantas'],
                      ['suspension_fisuras', 'Suspensión sin fisuras'],
                      ['tuercas_ajustadas', 'Tuercas ajustadas'],
                      ['desgaste_llantas', 'Sin desgaste irregular'],
                    ]"
                    :key="campo[0]"
                  >
                    <CampoPreoperacional v-model="formulario[campo[0]]" :label="campo[1]" />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- FRENOS -->
            <q-card flat bordered class="rounded-borders q-mb-lg shadow-1">
              <q-card-section>
                <div class="text-subtitle1 text-primary text-weight-bold q-mb-md">
                  🛑 Sistema de frenos
                </div>

                <div class="row q-col-gutter-md">
                  <div
                    class="col-12"
                    v-for="campo in [
                      ['presion_frenos', 'Presión aire 100–125 PSI'],
                      ['fugas_audibles', 'Sin fugas audibles'],
                      ['freno_parqueo', 'Freno de parqueo'],
                      ['abs_sintestigo', 'ABS sin testigo'],
                      ['prueba_freno', 'Prueba de frenado'],
                    ]"
                    :key="campo[0]"
                  >
                    <CampoPreoperacional v-model="formulario[campo[0]]" :label="campo[1]" />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- SISTEMA ELECTRICO -->
            <q-card flat bordered class="rounded-borders q-mb-lg shadow-1">
              <q-card-section>
                <div class="text-subtitle1 text-primary text-weight-bold q-mb-md">
                  💡 Sistema eléctrico
                </div>

                <div class="row q-col-gutter-md">
                  <div
                    class="col-12"
                    v-for="campo in [
                      ['luces_altas_bajas', 'Luces altas y bajas'],
                      ['direccionales', 'Direccionales'],
                      ['luces_freno', 'Luces de freno'],
                      ['luces_remolque', 'Luces del remolque'],
                      ['testigo_tablero', 'Testigos del tablero'],
                    ]"
                    :key="campo[0]"
                  >
                    <CampoPreoperacional v-model="formulario[campo[0]]" :label="campo[1]" />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- CABINA -->
            <q-card flat bordered class="rounded-borders q-mb-lg shadow-1">
              <q-card-section>
                <div class="text-subtitle1 text-primary text-weight-bold q-mb-md">
                  🚦 Cabina y seguridad
                </div>

                <div class="row q-col-gutter-md">
                  <div
                    class="col-12"
                    v-for="campo in [
                      ['cinturon_seguridad', 'Cinturón de seguridad'],
                      ['espejos', 'Espejos ajustados'],
                      ['extintor_cabezote', 'Extintor vigente'],
                      ['botiquin', 'Botiquín completo'],
                      ['triangulos_reflectivos', 'Triángulos reflectivos'],
                    ]"
                    :key="campo[0]"
                  >
                    <CampoPreoperacional v-model="formulario[campo[0]]" :label="campo[1]" />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- OTROS -->
            <q-card flat bordered class="rounded-borders q-mb-lg shadow-1">
              <q-card-section>
                <div class="text-subtitle1 text-primary text-weight-bold q-mb-md">
                  📋 Otros elementos
                </div>

                <div class="row q-col-gutter-md">
                  <div
                    class="col-12"
                    v-for="campo in [
                      ['extintor_trailer', 'Extintor trailer'],
                      ['kit_carretera', 'Kit carretera'],
                      ['senalizacion_conduzco', 'Señalización conduzco'],
                      ['estado_carpa', 'Estado carpa'],
                      ['refrigerante', 'Refrigerante'],
                      ['pito', 'Pito/Bocina'],
                      ['alarma_retroceso', 'Alarma retroceso'],
                      ['placas_visibles', 'Placas visibles'],
                    ]"
                    :key="campo[0]"
                  >
                    <CampoPreoperacional v-model="formulario[campo[0]]" :label="campo[1]" />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- ARCHIVOS -->
            <q-card flat bordered class="rounded-borders shadow-1">
              <q-card-section>
                <div class="text-subtitle1 text-primary text-weight-bold q-mb-md">
                  📎 Adjuntar archivos
                </div>

                <q-file
                  filled
                  rounded
                  bg-color="white"
                  v-model="archivosSeleccionados"
                  label="Seleccionar archivos"
                  multiple
                  clearable
                  use-chips
                  @update:model-value="manejarSeleccionArchivos"
                  accept="image/*, application/pdf, .doc, .docx, .xls, .xlsx, .kml, .kmz"
                />

                <div class="q-mt-md row q-col-gutter-sm">
                  <div v-for="(archivo, index) in formulario.archivos" :key="index" class="col-12">
                    <q-chip
                      removable
                      @remove="eliminarArchivo(index)"
                      color="primary"
                      text-color="white"
                      icon="attach_file"
                      class="full-width"
                    >
                      {{ archivo.name }}
                    </q-chip>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-card-section>

          <!-- BOTONES -->
          <q-card-actions class="bg-white q-pa-md" align="between">
            <q-btn flat color="grey-8" label="Cerrar" icon="close" @click="cerrar()" />

            <q-btn
              unelevated
              color="primary"
              :loading="usePreoperacional.loading"
              @click="guardar"
              class="rounded-borders q-px-xl"
            >
              {{ esEdicion ? 'Actualizar' : 'Guardar Preoperacional' }}

              <template #loading>
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
import { useStorePreoperacionales } from '../stores/preoperacionales'
import { useStoreViajes } from '../stores/viajes'
import { useStoreUsuarios } from '../stores/usuarios'
import { useQuasar } from 'quasar'
import CampoPreoperacional from 'src/components/CampoPreoperacional.vue'
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

const usePreoperacional = useStorePreoperacionales()
const useViaje = useStoreViajes()
const useUsuario = useStoreUsuarios()

const perfilUsuario = computed(() => useUsuario.perfile)

const alert = ref(false)
const accion = ref(1)
const $q = useQuasar()

const estadoInicial = {
  codigo_viaje: '',
  placa: '',
  odometro: '',
  nivel_agua: '',
  nivel_aceite: '',
  galones: '',
  fugas_visibles: '',
  presion_frenos: '',
  fugas_audibles: '',
  freno_parqueo: '',
  abs_sintestigo: '',
  prueba_freno: '',
  luces_altas_bajas: '',
  direccionales: '',
  luces_freno: '',
  luces_remolque: '',
  testigo_tablero: '',
  filtro_aire: '',
  volante: '',
  sin_fugas: '',
  cambios_suave: '',
  sin_ruidos: '',
  cinturon_seguridad: '',
  espejos: '',
  extintor_cabezote: '',
  extintor_trailer: '',
  botiquin: '',
  triangulos_reflectivos: '',
  kit_carretera: '',
  senalizacion_conduzco: '',
  correas: '',
  estado_carpa: '',
  refrigerante: '',
  pito: '',
  alarma_retroceso: '',
  presion_llantas: '',
  desgaste_llantas: '',
  tuercas_ajustadas: '',
  suspension_fisuras: '',
  quinta_rueda: '',
  pasador_rey: '',
  mangueras_aire: '',
  seguro_acople: '',
  placas_visibles: '',
  archivos: [],
}

const formulario = ref({ ...estadoInicial })
const cargando = ref(false)

const viajeOptions = ref([])

const preoperacionales = ref([])

const detallesPreoperacional = ref(null)
const mostrarDetalles = ref(false)

function abrir() {
  accion.value = 1
  alert.value = true
}

function cerrar() {
  alert.value = false
}

async function guardar() {
  cargando.value = true

  if (!validar()) {
    cargando.value = false
    return
  }

  try {
    const formData = new FormData()

    Object.entries(formulario.value).forEach(([key, value]) => {
      if (key === 'archivos') {
        value.forEach((file) => formData.append('archivos', file))
      } else if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value)
      }
    })
    
    const response = await usePreoperacional.postPreoperacional(formData)

    console.log('Respuesta exitosa:', response)

    cerrar()
    cargarPreoperacionales()
    alert.value = false
    resetearFormulario()
  } catch (error) {
    console.error('Error al guardar:', error)
    mostrarMensajeError('Error al guardar el preoperacional')
  } finally {
    cargando.value = false
  }
}

async function validar() {
  let verificado = true

  const { codigo_viaje, odometro, galones } = formulario.value

  if (codigo_viaje === '') {
    mostrarMensajeError('Seleccione el código del viaje')
    verificado = false
  }
  if (odometro === '') {
    mostrarMensajeError('Diligencie el odómetro')
    verificado = false
  }
  if (galones === '') {
    mostrarMensajeError('Diligencie los galones que carga ahora el vehículo')
    verificado = false
  }
  return verificado
}

async function verDetalles(consecutivo) {
  try {
    const detalle = await usePreoperacional.obtenerdatospreoperacional(consecutivo)
    console.log('Detalles obtenidos:', detalle)

    if (detalle) {
      detallesPreoperacional.value = {
        consecutivo: detalle['consecutivo'] || '',
        codigo_viaje: detalle['codigo_viaje'] || '',
        placa: detalle['placa'] || '',
        odometro: detalle['odometro'] || '',
        nivel_agua: detalle['nivel_agua'] || '',
        nivel_aceite: detalle['nivel_aceite'] || '',
        galones: detalle['galones'] || '',
        fugas_visibles: detalle['fugas_visibles'] || '',
        presion_frenos: detalle['presion_frenos'] || '',
        fugas_audibles: detalle['fugas_audibles'] || '',
        freno_parqueo: detalle['freno_parqueo'] || '',
        abs_sintestigo: detalle['abs_sintestigo'] || '',
        prueba_freno: detalle['prueba_freno'] || '',
        luces_altas_bajas: detalle['luces_altas_bajas'] || '',
        direccionales: detalle['direccionales'] || '',
        luces_freno: detalle['luces_freno'] || '',
        luces_remolque: detalle['luces_remolque'] || '',
        testigo_tablero: detalle['testigo_tablero'] || '',
        filtro_aire: detalle['filtro_aire'] || '',
        volante: detalle['volante'] || '',
        sin_fugas: detalle['sin_fugas'] || '',
        cambios_suave: detalle['cambios_suave'] || '',
        sin_ruidos: detalle['sin_ruidos'] || '',
        cinturon_seguridad: detalle['cinturon_seguridad'] || '',
        espejos: detalle['espejos'] || '',
        extintor_cabezote: detalle['extintor_cabezote'] || '',
        extintor_trailer: detalle['extintor_trailer'] || '',
        botiquin: detalle['botiquin'] || '',
        triangulos_reflectivos: detalle['triangulos_reflectivos'] || '',
        kit_carretera: detalle['kit_carretera'] || '',
        senalizacion_conduzco: detalle['senalizacion_conduzco'] || '',
        correas: detalle['correas'] || '',
        estado_carpa: detalle['estado_carpa'] || '',
        refrigerante: detalle['refrigerante'] || '',
        pito: detalle['pito'] || '',
        alarma_retroceso: detalle['alarma_retroceso'] || '',
        presion_llantas: detalle['presion_llantas'] || '',
        desgaste_llantas: detalle['desgaste_llantas'] || '',
        tuercas_ajustadas: detalle['tuercas_ajustadas'] || '',
        suspension_fisuras: detalle['suspension_fisuras'] || '',
        // acople_quintarueda: detalle['acople_quintarueda'] || '',
        quinta_rueda: detalle['quinta_rueda'] || '',
        pasador_rey: detalle['pasador_rey'] || '',
        mangueras_aire: detalle['mangueras_aire'] || '',
        seguro_acople: detalle['seguro_acople'] || '',
        placas_visibles: detalle['placas_visibles'] || '',
        correo_usuario: detalle['correo_usuario'] || '',
        usuario: detalle['usuario'] || '',
        fecha_creacion: detalle['fecha_creacion'] || '',
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

async function cargarPreoperacionales() {
  try {
    let response
    // ADMIN -> todos
    if (perfilUsuario.value === 'administrador') {
      response = await usePreoperacional.obtenerPreoperacionales()
    }

    // PROPIETARIO -> por placas asignadas
    else if (perfilUsuario.value === 'propietario') {
      const placas = useUsuario.user?.placa_asignada || ''

      response = await usePreoperacional.obtenerResumenPorPlaca(placas)

      response = response?.resumen?.total?.consecutivos || []
    }

    // CONDUCTOR -> por sus placas
    else if (perfilUsuario.value === 'conductor') {
      const placas = useUsuario.user?.placa_asignada || ''

      response = await usePreoperacional.obtenerResumenPorPlaca(placas)

      response = response?.resumen?.total?.consecutivos || []
    }
    if (Array.isArray(response)) {
      preoperacionales.value = response.map((item) => ({
        consecutivo: item.consecutivo || '',
        placa: item.placa || '',
      }))
    } else {
      console.error('Error en formato de respuesta:', response)
      preoperacionales.value = []
    }
  } catch (error) {
    console.error('Error al cargar preoperacionales:', error)
    preoperacionales.value = []
  }
}

onMounted(() => {
  cargarPreoperacionales()
  cargarViajesPreoperacionales()
})

async function cargarViajesPreoperacionales() {
  try {
    const [responseViajes, responsePreop] = await Promise.all([
      useViaje.obtenerResumenPorPlaca(),
      usePreoperacional.obtenerPreoperacionales(),
    ])

    if (!responseViajes?.ok) return

    const viajes = responseViajes.resumen?.total?.viajes || []

    // Códigos de viaje que ya tienen preoperacional
    const viajesConPreop = new Set(
      Array.isArray(responsePreop) ? responsePreop.map((p) => p.codigo_viaje) : [],
    )

    const placasUsuario =
      useUsuario.user?.placa_asignada?.split(',').map((p) => p.trim().toUpperCase()) || []

    viajeOptions.value = viajes
      .filter((v) => {
        const placaViaje = v.placa?.toUpperCase()
        const esPreoperacional = v.estado_preoperacional === 'se debe'
        const sinPreop = !viajesConPreop.has(v.consecutivo) // ← excluir los que ya tienen

        if (perfilUsuario.value === 'administrador') {
          return esPreoperacional && sinPreop
        }
        return esPreoperacional && sinPreop && placasUsuario.includes(placaViaje)
      })
      .map((v) => ({
        label: `${v.consecutivo} — ${v.placa} — ${v.destino}`,
        value: v.consecutivo,
        placa: v.placa,
      }))
  } catch (e) {
    console.error(e)
  }
}

watch(
  () => formulario.value.codigo_viaje,
  (nuevoViaje) => {
    if (!nuevoViaje) {
      formulario.value.placa = ''
      return
    }
    const viaje = viajeOptions.value.find((v) => v.value === nuevoViaje)
    formulario.value.placa = viaje?.placa || ''
  },
)

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
  name: 'PreoperacionalesPage',
})
</script>
