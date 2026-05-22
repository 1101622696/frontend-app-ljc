<template>
  <q-page class="flex flex-center">
    <q-card-section>
      <div class="text-h6 q-mb-md">Lista de préstamos</div>

      <q-list bordered separator>
        <q-item
          v-for="prestamo in prestamos"
          :key="prestamo.consecutivo"
          clickable
          @click="verDetalles(prestamo.consecutivo)"
        >
          <q-item-section>
            <q-item-label>
              {{ prestamo.consecutivo }} - $
              {{ Number(prestamo.valor_pedido).toLocaleString('es-CO') }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <div>
      <q-dialog v-model="mostrarDetalles" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Detalles del préstamo</div>
          </q-card-section>

          <q-card-section class="q-pt-none" v-if="detallesPrestamo">
            <div class="q-pa-md">
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Consecutivo:</div>
                <div class="col-8">{{ detallesPrestamo.consecutivo }}</div>
              </div>

              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Valor Pedido:</div>
                <div class="col-8">
                  $ {{ Number(detallesPrestamo.valor_pedido).toLocaleString('es-CO') }}
                </div>
              </div>

              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Valor Prestado:</div>
                <div class="col-8">
                  $ {{ Number(detallesPrestamo.valor_prestado).toLocaleString('es-CO') }}
                </div>
              </div>

              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Fecha de solicitud:</div>
                <div class="col-8">{{ detallesPrestamo.fecha_creacion }}</div>
              </div>

              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Estado:</div>
                <div class="col-8">{{ detallesPrestamo.estado_prestamo }}</div>
              </div>

              <q-btn
                outline
                color="orange"
                icon="folder"
                label="Ver archivos"
                size="sm"
                @click="abrirVisor(detallesPrestamo.link, 'Documentos')"
              />
            </div>

            <q-card-actions align="right">
              <q-btn
                v-if="
                  (perfilUsuario === 'propietario' || perfilUsuario === 'administrador') &&
                  detallesPrestamo?.estado_prestamo !== 'liquidado'
                "
                color="green"
                icon="payments"
                label="Registrar pago"
                @click="irAPago"
              />
              <q-btn flat label="Cerrar" color="primary" v-close-popup />
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

      <q-dialog v-model="alert" persistent>
        <q-card class="bg-grey-2">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6 text-weight-bold">
              {{ accion == 1 ? 'Solicitar Préstamo' : 'Registrar Pago' }}
            </div>
          </q-card-section>

          <q-card-section class="q-pa-md">
            <div class="row q-col-gutter-md">
              <!-- SOLO CONDUCTOR: valor pedido -->
              <div class="col-12" v-if="accion == 1">
                <q-input
                  outlined
                  rounded
                  v-model="valorpedidoFormatted"
                  label="Valor solicitado"
                  :dense="dense"
                  @update:model-value="formatearValorPedido"
                />
              </div>

              <!-- SOLO PROPIETARIO: valor prestado + archivo -->
              <template v-if="accion == 2">
                <div class="col-12">
                  <q-input
                    outlined
                    rounded
                    v-model="valorprestadoFormatted"
                    label="Valor prestado"
                    :dense="dense"
                    @update:model-value="formatearValorPrestado"
                  />
                </div>

                <div class="col-12">
                  <q-banner class="q-mt-lg q-mb-sm text-indigo">Adjuntar comprobante</q-banner>
                  <q-file
                    label="Seleccionar archivos"
                    outlined
                    rounded
                    multiple
                    v-model="archivosSeleccionados"
                    @update:model-value="manejarSeleccionArchivos"
                    accept="image/*, application/pdf"
                    clearable
                    style="max-width: 400px"
                  />
                  <div class="q-mt-md row q-col-gutter-sm">
                    <q-chip
                      v-for="(archivo, index) in formulario.archivos"
                      :key="index"
                      removable
                      @remove="eliminarArchivo(index)"
                      class="q-ma-xs"
                    >
                      {{ archivo.name }}
                    </q-chip>
                  </div>
                </div>
              </template>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              @click="guardar"
              color="accent"
              class="text-white"
              :loading="usePrestamo.loading"
            >
              {{ accion == 1 ? 'Solicitar' : 'Registrar pago' }}
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
import { useStorePrestamos } from '../stores/prestamos'
import { useStoreUsuarios } from '../stores/usuarios'
import { useQuasar } from 'quasar'
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

const usePrestamo = useStorePrestamos()
const useUsuario = useStoreUsuarios()

const alert = ref(false)
const accion = ref(1)

const $q = useQuasar()
const perfilUsuario = computed(() => useUsuario.perfile)
const valorpedidoFormatted = ref('')
const valorprestadoFormatted = ref('')

defineProps({
  datos: {
    type: Object,
    default: () => ({}),
  },
  esEdicion: {
    type: Boolean,
    default: false,
  },
})

const estadoInicial = {
  valor_pedido: '',
  valor_prestado: '',
  archivos: [],
}

const formulario = ref({ ...estadoInicial })

const cargando = ref(false)

const prestamos = ref([])

const detallesPrestamo = ref(null)
const mostrarDetalles = ref(false)

function abrir() {
  accion.value = 1
  resetearFormulario()
  alert.value = true
}

async function irAPago() {
  mostrarDetalles.value = false
  resetearFormulario()
  accion.value = 2  
  formulario.value.consecutivo = detallesPrestamo.value.consecutivo
  await new Promise(resolve => setTimeout(resolve, 100))
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

    let response

    if (accion.value == 1) {
      response = await usePrestamo.postPrestamo(formData)
    } else {
      response = await usePrestamo.putPrestamo(formulario.value.consecutivo, formData)
    }

    console.log('Respuesta exitosa:', response)

    cerrar()

    cargarPrestamos()

    alert.value = false

    resetearFormulario()
  } catch (error) {
    console.error('Error al guardar:', error)

    mostrarMensajeError('Error al guardar el préstamo')
  } finally {
    cargando.value = false
  }
}

async function validar() {
  let verificado = true

  if (accion.value === 1) {
    if (formulario.value.valor_pedido === '') {
      mostrarMensajeError('Diligencie el valor del pedido')
      verificado = false
    }
  }

  if (accion.value === 2) {
    if (formulario.value.valor_prestado === '') {
      mostrarMensajeError('Diligencie el valor prestado')
      verificado = false
    }
  }

  return verificado
}

async function verDetalles(consecutivo) {
  try {
    const detalle = await usePrestamo.obtenerdatodelprestamo(consecutivo)

    if (detalle) {
      detallesPrestamo.value = {
        consecutivo: detalle['consecutivo'] || '',
        valor_pedido: detalle['valor_pedido'] || '',
        valor_prestado: detalle['valor_prestado'] || '',
        fecha_creacion: detalle['fecha_creacion'] || '',
        estado_prestamo: detalle['estado_prestamo'] || '',
        link: detalle['link'] || '',
      }

      mostrarDetalles.value = true
    }
  } catch (error) {
    console.error('Error al obtener detalles:', error)
  }
}

async function cargarPrestamos() {
  try {
    let response = []
    // ADMINISTRADOR
    if (perfilUsuario.value === 'administrador') {
      response = await usePrestamo.obtenerPrestamos()
    }

    // PROPIETARIO
    else if (perfilUsuario.value === 'propietario') {
      const data = await usePrestamo.obtenerPrestamosPorPropietario()
      response = data?.resumen?.total?.consecutivos || []
    }

    // CONDUCTOR
    else if (perfilUsuario.value === 'conductor') {
      const data = await usePrestamo.obtenerResumenPorEmail(useUsuario.user.email)
      response = data?.resumen?.total?.consecutivos || []
    }
    if (Array.isArray(response)) {
      prestamos.value = response.map((item) => ({
        consecutivo: item.consecutivo || '',
        valor_pedido: item.valor_pedido || '',
      }))
    } else {
      prestamos.value = []
    }
  } catch (error) {
    console.error('Error al cargar préstamos:', error)
    prestamos.value = []
  }
}

onMounted(() => {
  cargarPrestamos()
})

function manejarSeleccionArchivos(files) {
  if (files) {
    if (Array.isArray(files)) {
      files.forEach((file) => {
        const existeArchivo = formulario.value.archivos.some(
          (a) => a.name === file.name && a.size === file.size && a.type === file.type,
        )

        if (!existeArchivo) {
          formulario.value.archivos.push(file)
        }
      })
    } else if (files instanceof File) {
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

function formatearValorPedido(val) {
  valorpedidoFormatted.value = formatearNumero(val)

  // guardar número real en tu formulario
  formulario.value.valor_pedido = Number(valorpedidoFormatted.value.replace(/\./g, ''))
}

function formatearValorPrestado(val) {
  valorprestadoFormatted.value = formatearNumero(val)

  // guardar número real en tu formulario
  formulario.value.valor_prestado = Number(valorprestadoFormatted.value.replace(/\./g, ''))
}
function formatearNumero(valor) {
  if (!valor) return ''

  // quitar todo lo que no sea número
  const limpio = valor.toString().replace(/\D/g, '')

  // formatear con puntos
  return new Intl.NumberFormat('es-CO').format(limpio)
}

function mostrarMensajeError(mensaje) {
  $q.notify({
    type: 'negative',
    message: mensaje,
    position: 'bottom-right',
  })
}

defineOptions({
  name: 'PrestamosPage',
})
</script>
