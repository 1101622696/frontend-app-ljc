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
            @update:model-value="cargarUsuarios"
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
          v-for="usuario in usuarios"
          :key="usuario.email"
          clickable
          @click="verDetalles(usuario.email)"
        >
          <q-item-section>
            <q-item-label>{{ usuario.nombre }} - {{ usuario.email }}</q-item-label>
            <q-item-label caption v-if="usuario.valorFiltro !== undefined">
              {{ obtenerEtiquetaValor(usuario.valorFiltro) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <div>
      <q-dialog v-model="mostrarDetalles" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Detalles del Usuario</div>
          </q-card-section>

          <q-card-section class="q-pt-none" v-if="detallesUsuario">
            <div class="q-pa-md">
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Nombre:</div>
                <div class="col-8">{{ detallesUsuario.nombre }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Perfil:</div>
                <div class="col-8">{{ detallesUsuario.perfil }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Email:</div>
                <div class="col-8">{{ detallesUsuario.email }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Estado:</div>
                <div class="col-8">{{ detallesUsuario.estado }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Placa asignada:</div>
                <div class="col-8">{{ detallesUsuario.placa_asignada }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Tipo de documento:</div>
                <div class="col-8">{{ detallesUsuario.tipo_documento }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Número de documento:</div>
                <div class="col-8">{{ detallesUsuario.documento }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Ciudad de expedición:</div>
                <div class="col-8">{{ detallesUsuario.ciudad_expedicion }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Fecha de expedición:</div>
                <div class="col-8">{{ detallesUsuario.fecha_expedicion }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">País de nacimiento:</div>
                <div class="col-8">{{ detallesUsuario.pais_nacimiento }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Ciudad de nacimiento:</div>
                <div class="col-8">{{ detallesUsuario.ciudad_nacimiento }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Fecha de nacimiento:</div>
                <div class="col-8">{{ detallesUsuario.fecha_nacimiento }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Grupo sanguíneo:</div>
                <div class="col-8">{{ detallesUsuario.grupo_sanguineo_rh }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Género:</div>
                <div class="col-8">{{ detallesUsuario.genero }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Estado civil:</div>
                <div class="col-8">{{ detallesUsuario.estado_civil }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Teléfono:</div>
                <div class="col-8">{{ detallesUsuario.telefono }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Tipo de licencia:</div>
                <div class="col-8">{{ detallesUsuario.tipo_licencia }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Número de licencia:</div>
                <div class="col-8">{{ detallesUsuario.num_licencia }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Fecha de expedición:</div>
                <div class="col-8">{{ detallesUsuario.fecha_expedicion_licencia }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Fecha vencimiento licencia:</div>
                <div class="col-8">{{ detallesUsuario.fecha_vencimiento_licencia }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Viajes realizados:</div>
                <div class="col-8">{{ detallesUsuario.viajes_realizados }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Banco:</div>
                <div class="col-8">{{ detallesUsuario.banco }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Número de cuenta:</div>
                <div class="col-8">{{ detallesUsuario.num_cuenta }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Salario Base:</div>
                <div class="col-8">{{ detallesUsuario.salario_base }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Seguridad Social:</div>
                <div class="col-8">{{ detallesUsuario.sso }}</div>
              </div>
            </div>

            <div class="row q-mb-md">
              <div class="col-4 text-weight-bold">Activación:</div>
              <div class="col-8">
                <q-toggle
                  v-model="isActive"
                  :color="detallesUsuario.estado === 'activo' ? 'grey' : 'primary'"
                  @update:model-value="cambiarEstado"
                />
              </div>
            </div>
            <q-card-actions align="right">
              <q-btn class="option-button" @click="editar(detallesUsuario)">✏️</q-btn>

              <!-- Solo si el usuario logueado es admin o propietario, y el detalle es de un conductor -->
              <template
                v-if="
                  (perfilUsuario === 'administrador' || perfilUsuario === 'propietario') &&
                  detallesUsuario.perfil === 'conductor'
                "
              >
                <q-btn
                  color="teal"
                  label="Calcular nómina"
                  size="sm"
                  @click="abrirCalcularNomina"
                />
                <q-btn color="blue" label="Pagar base" size="sm" @click="pagarSalario" />
              </template>
            </q-card-actions>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cerrar" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="dialogNomina" persistent>
        <q-card style="min-width: 320px">
          <q-card-section>
            <div class="text-h6">Nómina — {{ detallesUsuario?.nombre }}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input filled v-model="mesNomina" type="month" label="Mes" :dense="dense" />
            <q-btn
              color="teal"
              label="Calcular"
              class="q-mt-md full-width"
              @click="calcularNomina"
              :loading="cargandoNomina"
            />
          </q-card-section>

          <!-- Resultado del cálculo -->
          <q-card-section v-if="calculoNomina" class="q-pt-none">
            <q-separator class="q-mb-md" />
            <div class="text-subtitle2 q-mb-sm">Resumen</div>
            <div class="row q-mb-xs">
              <div class="col-7 text-caption text-weight-bold">Viajes del mes:</div>
              <div class="col-5 text-caption">{{ calculoNomina.total_viajes_mes }}</div>
            </div>
            <div class="row q-mb-xs">
              <div class="col-7 text-caption text-weight-bold">10% total:</div>
              <div class="col-5 text-caption">
                {{ formatearPesos(calculoNomina.diez_pcto_total_mes) }}
              </div>
            </div>
            <div class="row q-mb-xs">
              <div class="col-7 text-caption text-weight-bold">Saldo anticipo:</div>
              <div class="col-5 text-caption">
                {{ formatearPesos(calculoNomina.saldo_anticipo_total_mes) }}
              </div>
            </div>
            <div class="row q-mb-xs">
              <div class="col-7 text-caption text-weight-bold">Préstamos pendientes:</div>
              <div class="col-5 text-caption">
                {{ formatearPesos(calculoNomina.total_prestamos_pendientes) }}
              </div>
            </div>
            <q-separator class="q-my-sm" />
            <div class="row">
              <div class="col-7 text-weight-bold">Total a pagar:</div>
              <div
                class="col-5 text-weight-bold"
                :class="calculoNomina.total_nomina >= 0 ? 'text-green' : 'text-red'"
              >
                {{ formatearPesos(calculoNomina.total_nomina) }}
              </div>
            </div>

            <q-btn
              color="green"
              label="Aprobar y pagar nómina"
              class="q-mt-md full-width"
              @click="aprobarNomina"
              :loading="cargandoNomina"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cerrar" color="primary" @click="dialogNomina = false" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- <q-dialog v-model="alert" persistent maximized> -->
      <q-dialog v-model="alert" persistent>
        <q-card class="bg-grey-2">
          <!-- HEADER -->
          <q-card-section class="bg-primary text-white">
            <div class="text-h6 text-weight-bold">
              {{ accion == 1 ? 'Agregar Usuario' : 'Editar Usuario' }}
            </div>
            <div class="text-caption">Complete la información del usuario</div>
          </q-card-section>

          <q-card-section class="q-pa-md">
            <!-- ================= DATOS PRINCIPALES ================= -->
            <q-card flat bordered class="rounded-borders q-mb-md">
              <q-card-section>
                <div class="text-subtitle1 text-primary text-weight-bold q-mb-md">
                  Datos principales
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-12">
                    <q-input
                      outlined
                      rounded
                      v-model.trim="formulario.nombre"
                      label="Nombre completo"
                      dense
                    />
                  </div>

                  <div class="col-12">
                    <q-input
                      outlined
                      rounded
                      type="email"
                      v-model.trim="formulario.email"
                      label="Correo electrónico"
                      dense
                    />
                  </div>

                  <div class="col-12">
                    <q-input
                      outlined
                      rounded
                      type="password"
                      v-model.trim="formulario.password"
                      label="Contraseña"
                      dense
                    />
                  </div>

                  <div class="col-12">
                    <q-select
                      outlined
                      rounded
                      v-model="formulario.perfil"
                      label="Perfil"
                      :options="perfilOptions"
                      dense
                    />
                  </div>

                  <div class="col-12">
                    <q-select
                      outlined
                      rounded
                      v-model="formulario.placa_asignada"
                      label="Placas asignadas"
                      :options="placasOptions"
                      multiple
                      use-chips
                      dense
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- ================= DOCUMENTO ================= -->
            <q-card flat bordered class="rounded-borders q-mb-md">
              <q-card-section>
                <div class="text-subtitle1 text-primary text-weight-bold q-mb-md">
                  Documento de identidad
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-12">
                    <q-select
                      outlined
                      rounded
                      v-model="formulario.tipo_documento"
                      label="Tipo de documento"
                      :options="tipodocOptions"
                      dense
                    />
                  </div>

                  <div class="col-12">
                    <q-input
                      outlined
                      rounded
                      v-model.trim="formulario.documento"
                      label="Número de documento"
                      dense
                    />
                  </div>

                  <div class="col-12">
                    <q-input
                      outlined
                      rounded
                      v-model.trim="formulario.ciudad_expedicion"
                      label="Ciudad de expedición"
                      dense
                    />
                  </div>

                  <div class="col-12">
                    <div class="text-caption text-grey-7 q-mb-xs">Fecha de expedición</div>

                    <q-date
                      v-model="formulario.fecha_expedicion"
                      minimal
                      bordered
                      class="rounded-borders full-width"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- ================= INFORMACIÓN PERSONAL ================= -->
            <q-card flat bordered class="rounded-borders q-mb-md">
              <q-card-section>
                <div class="text-subtitle1 text-primary text-weight-bold q-mb-md">
                  Información personal
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-12">
                    <q-select
                      outlined
                      rounded
                      v-model="formulario.pais_nacimiento"
                      label="País de nacimiento"
                      :options="paisOptions"
                      dense
                    />
                  </div>

                  <div class="col-12">
                    <q-input
                      outlined
                      rounded
                      v-model.trim="formulario.ciudad_nacimiento"
                      label="Ciudad de nacimiento"
                      dense
                    />
                  </div>

                  <div class="col-12">
                    <div class="text-caption text-grey-7 q-mb-xs">Fecha de nacimiento</div>

                    <q-date
                      v-model="formulario.fecha_nacimiento"
                      minimal
                      bordered
                      class="rounded-borders full-width"
                    />
                  </div>

                  <div class="col-12">
                    <q-select
                      outlined
                      rounded
                      v-model="formulario.grupo_sanguineo_rh"
                      label="Grupo sanguíneo"
                      :options="rhOptions"
                      dense
                    />
                  </div>

                  <div class="col-12">
                    <q-select
                      outlined
                      rounded
                      v-model="formulario.genero"
                      label="Género"
                      :options="generoOptions"
                      dense
                    />
                  </div>

                  <div class="col-12">
                    <q-select
                      outlined
                      rounded
                      v-model="formulario.estado_civil"
                      label="Estado civil"
                      :options="estadocivilOptions"
                      dense
                    />
                  </div>

                  <div class="col-12">
                    <q-input
                      outlined
                      rounded
                      v-model.trim="formulario.telefono"
                      label="Teléfono"
                      dense
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- ================= LICENCIA ================= -->
            <q-card flat bordered class="rounded-borders q-mb-md">
              <q-card-section>
                <div class="text-subtitle1 text-primary text-weight-bold q-mb-md">
                  Información de licencia
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-12">
                    <q-select
                      outlined
                      rounded
                      v-model="formulario.tipo_licencia"
                      label="Tipo de licencia"
                      :options="tipolicenciaOptions"
                      dense
                    />
                  </div>

                  <div class="col-12">
                    <q-input
                      outlined
                      rounded
                      v-model.trim="formulario.num_licencia"
                      label="Número de licencia"
                      dense
                    />
                  </div>

                  <div class="col-12">
                    <div class="text-caption text-grey-7 q-mb-xs">Fecha expedición licencia</div>

                    <q-date
                      v-model="formulario.fecha_expedicion_licencia"
                      minimal
                      bordered
                      class="rounded-borders full-width"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- ================= INFORMACIÓN BANCARIA ================= -->
            <q-card flat bordered class="rounded-borders q-mb-md">
              <q-card-section>
                <div class="text-subtitle1 text-primary text-weight-bold q-mb-md">
                  Información bancaria
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-12">
                    <q-select
                      outlined
                      rounded
                      v-model="formulario.banco"
                      label="Banco"
                      :options="bancoOptions"
                      dense
                    />
                  </div>

                  <div class="col-12">
                    <q-input
                      outlined
                      rounded
                      v-model.trim="formulario.num_cuenta"
                      label="Número de cuenta"
                      dense
                    />
                  </div>

                  <div class="col-12">
                    <q-input
                      outlined
                      rounded
                      v-model="salariobaseFormatted"
                      label="Salario base"
                      dense
                      prefix="$"
                      @update:model-value="formatearSalarioBase"
                    />
                  </div>

                  <div class="col-12">
                    <q-input
                      outlined
                      rounded
                      v-model="ssoFormatted"
                      label="Seguridad social"
                      prefix="$"
                      dense
                      @update:model-value="formatearSSO"
                    />
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
              rounded
              color="primary"
              :loading="useUsuario.loading"
              @click="guardar"
            >
              <q-icon :name="accion === 1 ? 'person_add' : 'edit'" class="q-mr-sm" />

              {{ accion === 1 ? 'Agregar usuario' : 'Actualizar usuario' }}

              <template v-slot:loading>
                <q-spinner color="white" size="1em" />
              </template>
            </q-btn>
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>

    <q-btn color="primary" :label="'Registrar Usuario'" class="q-mt-md" @click="abrir" />
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useStoreUsuarios } from '../stores/usuarios'
import { useStoreVehiculos } from '../stores/vehiculos'
import { useStoreNominas } from '../stores/nomina'
import { useQuasar } from 'quasar'
import { TIPOS_FILTRO, CONFIG_FILTROS } from '../composables/filtrosusuarios'

const useUsuario = useStoreUsuarios()
const useVehiculo = useStoreVehiculos()
const alert = ref(false)
const accion = ref(1)
const $q = useQuasar()

const useNomina = useStoreNominas()
const dialogNomina = ref(false)
const mesNomina = ref('')
const calculoNomina = ref(null)
const cargandoNomina = ref(false)

const salariobaseFormatted = ref('')
const ssoFormatted = ref('')

function formatearSalarioBase(val) {
  salariobaseFormatted.value = formatearNumero(val)
  formulario.value.salario_base = Number(salariobaseFormatted.value.replace(/\./g, ''))
}

function formatearSSO(val) {
  ssoFormatted.value = formatearNumero(val)
  formulario.value.sso = Number(ssoFormatted.value.replace(/\./g, ''))
}

function formatearNumero(valor) {
  if (!valor) return ''
  const limpio = valor.toString().replace(/\D/g, '')
  return new Intl.NumberFormat('es-CO').format(limpio)
}

const estadoInicial = {
  nombre: '',
  email: '',
  password: '',
  perfil: '',
  placa_asignada: [],
  tipo_documento: '',
  documento: '',
  ciudad_expedicion: '',
  fecha_expedicion: '',
  pais_nacimiento: '',
  ciudad_nacimiento: '',
  fecha_nacimiento: '',
  grupo_sanguineo_rh: '',
  genero: '',
  estado_civil: '',
  telefono: '',
  tipo_licencia: '',
  num_licencia: '',
  fecha_expedicion_licencia: '',
  fecha_vencimiento_licencia: '',
  viajes_realizados: '',
  banco: '',
  num_cuenta: '',
  salario_base: '',
  sso: '',
}

const formulario = ref({ ...estadoInicial })
const cargando = ref(false)

const tipoLista = ref(TIPOS_FILTRO.TODOS)
const ordenActual = ref('desc')
const usuarios = ref([])
const valorFiltroTexto = ref(null)

const detallesUsuario = ref(null)
const mostrarDetalles = ref(false)

const perfilOptions = ['administrador', 'conductor', 'propietario']

const perfilUsuario = computed(() => useUsuario.perfile)

const placasOptions = ref([])

const tipodocOptions = ['CC', 'TI', 'CE', 'Passport', 'PTP']

const paisOptions = ['Colombia', 'Venezuela', 'Ecuador']

const rhOptions = ['o+', 'o-', 'A+']

const generoOptions = ['Masculino', 'Femenino', 'Otro']

const estadocivilOptions = ['Soltero', 'Casado', 'Divorciado', 'Unión libre']

const tipolicenciaOptions = ['A1', 'B1', 'C1', 'C3']

const bancoOptions = ['Bancolombia', 'Bogotá', 'NU', 'Nequi', 'BBVA']

async function cargarPlacas() {
  try {
    const response = await useVehiculo.obtenerVehiculos()

    if (!Array.isArray(response)) {
      placasOptions.value = []
      return
    }

    // Traer todas las placas
    placasOptions.value = response.map((v) => v.placa)
  } catch (error) {
    console.error('Error cargando placas:', error)
    placasOptions.value = []
  }
}

function abrir() {
  accion.value = 1
  alert.value = true
}

function cerrar() {
  alert.value = false
  resetearFormulario()
}

async function guardar() {
  cargando.value = true

  if (!validar()) {
    cargando.value = false
    return
  }

  try {
    const dataEnviar = {
      ...formulario.value,

      placa_asignada: Array.isArray(formulario.value.placa_asignada)
        ? formulario.value.placa_asignada.join(',')
        : formulario.value.placa_asignada,
    }

    let response

    if (accion.value === 2) {
      response = await useUsuario.putUsuarios(formulario.value.email, dataEnviar)
    } else {
      response = await useUsuario.postUsuario(dataEnviar)
    }

    console.log('Respuesta exitosa:', response)

    cerrar()
    cargarUsuarios()
    resetearFormulario()
  } catch (error) {
    console.error('Error completo:', error)
    mostrarMensajeError('Error al guardar el usuario')
  } finally {
    cargando.value = false
  }
}

function editar(usuario) {
  accion.value = 2

  formulario.value = {
    ...estadoInicial,

    ...usuario,

    // convertir string -> array
    placa_asignada: usuario.placa_asignada ? usuario.placa_asignada.split(',') : [],
  }

    salariobaseFormatted.value = formatearNumero(
    usuario.salario_base || 0
  )

    ssoFormatted.value = formatearNumero(
    usuario.sso || 0
  )

  alert.value = true
}

function validar() {
  let verificado = true

  const { nombre, password, perfil, email, placa_asignada, documento } = formulario.value

  if (!nombre) {
    mostrarMensajeError('Diligencie el nombre')
    verificado = false
  }

  // SOLO exigir password al crear
  if (accion.value === 1 && !password) {
    mostrarMensajeError('Diligencie una contraseña')
    verificado = false
  }

  if (!perfil) {
    mostrarMensajeError('Seleccione el perfil')
    verificado = false
  }

  if (!email) {
    mostrarMensajeError('Diligencie el email')
    verificado = false
  }

  if (!placa_asignada || placa_asignada.length === 0) {
    mostrarMensajeError('Diligencie la placa asignada')
    verificado = false
  }

  if (!documento) {
    mostrarMensajeError('Diligencie el número de documento')
    verificado = false
  }

  return verificado
}

function mostrarMensajeError(mensaje) {
  $q.notify({
    type: 'negative',
    message: mensaje,
    position: 'bottom-right',
  })
}

// function mostrarMensajeExito(mensaje) {
//     $q.notify({
//         type: "positive",
//         message: mensaje,
//         position: "bottom-right",
//     });
// }

async function verDetalles(email) {
  try {
    const detalle = await useUsuario.listardatosUsuario(email)
    console.log('Detalles obtenidos:', detalle)

    if (detalle) {
      detallesUsuario.value = {
        nombre: detalle['nombre'] || '',
        email: detalle['email'] || '',
        perfil: detalle['perfil'] || '',
        placa_asignada: detalle['placa_asignada'] || '',
        tipo_documento: detalle['tipo_documento'] || '',
        documento: detalle['documento'] || '',
        ciudad_expedicion: detalle['ciudad_expedicion'] || '',
        fecha_expedicion: detalle['fecha_expedicion'] || '',
        pais_nacimiento: detalle['pais_nacimiento'] || '',
        ciudad_nacimiento: detalle['ciudad_nacimiento'] || '',
        fecha_nacimiento: detalle['fecha_nacimiento'] || '',
        grupo_sanguineo_rh: detalle['grupo_sanguineo_rh'] || '',
        genero: detalle['genero'] || '',
        estado_civil: detalle['estado_civil'] || '',
        telefono: detalle['telefono'] || '',
        tipo_licencia: detalle['tipo_licencia'] || '',
        num_licencia: detalle['num_licencia'] || '',
        fecha_expedicion_licencia: detalle['fecha_expedicion_licencia'] || '',
        fecha_vencimiento_licencia: detalle['fecha_vencimiento_licencia'] || '',
        viajes_realizados: detalle['viajes_realizados'] || '',
        banco: detalle['banco'] || '',
        num_cuenta: detalle['num_cuenta'] || '',
        salario_base: detalle['salario_base'] || '',
        sso: detalle['sso'] || '',
        estado: detalle['estado'] || '',
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

  cargarUsuarios()
}

function actualizarValorFiltro(nuevoValor) {
  // console.log(`Cambiando valor del filtro a: ${nuevoValor}`);
  valorFiltroTexto.value = nuevoValor
  cargarUsuarios()
}

function obtenerEtiquetaValor(valor) {
  // Implementa la lógica para formatear el valor según el tipo de filtro
  if (tipoLista.value === TIPOS_FILTRO.PERFIL) {
    return `${valor}`
  } else if (tipoLista.value === TIPOS_FILTRO.ESTADO) {
    return `${valor}`
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

async function cargarUsuarios() {
  try {
    let response

    // conductor -> solo él
    if (perfilUsuario.value === 'conductor') {
      response = [await useUsuario.obtenerUsuariosPorEmail(useUsuario.user.email)]
    }

    // propietario -> conductores de sus placas
    else if (perfilUsuario.value === 'propietario') {
      response = await useUsuario.obtenerUsuariosPorPropietario(useUsuario.user.email)
    }

    // filtros
    else if (filtroActual.value?.esFiltroTexto) {
      response = await useUsuario.obtenerUsuariosFiltrados(
        filtroActual.value.campoDatos,
        valorFiltroTexto.value,
      )
    }

    // ordenamientos
    else if (tipoLista.value !== TIPOS_FILTRO.TODOS) {
      response = await useUsuario.obtenerUsuariosOrdenados(
        filtroActual.value.campoOrden,
        ordenActual.value,
      )
    }

    // admin
    else {
      response = await useUsuario.listarUsuario()
    }

    if (Array.isArray(response)) {
      usuarios.value = response.map((item) => {
        const result = {
          nombre: item['nombre'] || '',
          email: item['email'] || '',
        }

        const campoDatos = filtroActual.value?.campoDatos

        if (campoDatos && item[campoDatos] !== undefined) {
          result.valorFiltro = item[campoDatos]
        }

        return result
      })
    } else {
      usuarios.value = []
    }
  } catch (error) {
    console.error(error)
    usuarios.value = []
  }
}

onMounted(() => {
  cargarUsuarios()
  cargarPlacas()
})

const isActive = computed({
  get: () => detallesUsuario.value && detallesUsuario.value.estado === 'activo',
  set: () => {},
})
const cambiarEstado = async () => {
  try {
    if (detallesUsuario.value.estado === 'activo') {
      await useUsuario.putInactivarUsuario(detallesUsuario.value.email)
      detallesUsuario.value.estado = 'inactivo'
    } else {
      await useUsuario.putActivarUsuario(detallesUsuario.value.email)
      detallesUsuario.value.estado = 'activo'
    }
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error)
  }
}

function resetearFormulario() {
  formulario.value = { ...estadoInicial }
  accion.value = 1
  salariobaseFormatted.value = ''
  ssoFormatted.value = ''
}

async function abrirCalcularNomina() {
  mesNomina.value = new Date().toISOString().slice(0, 7) // default mes actual
  calculoNomina.value = null
  dialogNomina.value = true
}

async function calcularNomina() {
  if (!mesNomina.value) {
    mostrarMensajeError('Seleccione un mes')
    return
  }
  cargandoNomina.value = true
  try {
    const res = await useNomina.calcularNomina(detallesUsuario.value.email, mesNomina.value)
    calculoNomina.value = res?.resultado || null
  } catch (e) {
    mostrarMensajeError('Error al calcular nómina')
    console.error('Error al calcular nómina:', e)
  } finally {
    cargandoNomina.value = false
  }
}

async function aprobarNomina() {
  cargandoNomina.value = true
  try {
    await useNomina.postAprobarNomina(detallesUsuario.value.email, { mes: mesNomina.value })
    // mostrarMensajeExito('Nómina aprobada correctamente')
    dialogNomina.value = false
    calculoNomina.value = null
  } catch (e) {
    mostrarMensajeError('Error al aprobar nómina')
    console.error('Error al aprobar nómina:', e)
  } finally {
    cargandoNomina.value = false
  }
}

async function pagarSalario() {
  if (!mesNomina.value) {
    mostrarMensajeError('Seleccione un mes')
    return
  }
  cargandoNomina.value = true
  try {
    await useNomina.postPagarSalario(detallesUsuario.value.email, { mes: mesNomina.value })
    // mostrarMensajeExito('Salario pagado correctamente')
  } catch (e) {
    mostrarMensajeError('Error al pagar salario')
    console.error('Error al pagar salario:', e)
  } finally {
    cargandoNomina.value = false
  }
}

function formatearPesos(valor) {
  const num = parseFloat(valor) || 0
  return num.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  })
}

defineOptions({
  name: 'UsuariosPage',
})
</script>
