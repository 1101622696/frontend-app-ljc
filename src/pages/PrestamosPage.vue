<template>
  <q-page padding class="bg-grey-2">

    <!-- Encabezado -->
    <div class="row items-center q-mb-sm">
      <span class="text-subtitle1 text-weight-medium">Préstamos</span>
      <q-badge color="blue-1" text-color="blue-9" class="q-ml-auto" rounded>
        {{ prestamos.length }}
      </q-badge>
    </div>

    <!-- Cards -->
    <div class="q-gutter-y-sm">
      <q-card
        v-for="prestamo in prestamos"
        :key="prestamo.consecutivo"
        flat bordered
        class="prestamo-card cursor-pointer"
        @click="verDetalles(prestamo.consecutivo)"
      >
        <q-card-section class="q-pa-md">

          <div class="row items-center q-mb-sm">
            <span class="text-caption text-grey-6" style="font-family: monospace;">#{{ prestamo.consecutivo }}</span>
            <q-space />
            <q-badge
              :color="colorEstadoPrestamo(prestamo.estado_prestamo)"
              text-color="white"
              rounded
            >
              {{ prestamo.estado_prestamo || 'pendiente' }}
            </q-badge>
          </div>

          <div class="row q-gutter-sm">
            <div class="metrica-chip col">
              <div class="metrica-label">Valor pedido</div>
              <div class="metrica-valor">{{ formatPeso(prestamo.valor_pedido) }}</div>
            </div>
            <div class="metrica-chip col">
              <div class="metrica-label">Valor prestado</div>
              <div class="metrica-valor">{{ formatPeso(prestamo.valor_prestado) }}</div>
            </div>
          </div>

          <div class="row items-center q-mt-sm" style="border-top: 1px solid rgba(0,0,0,0.06); padding-top: 8px;">
            <q-icon name="event" size="13px" color="grey-5" class="q-mr-xs" />
            <span class="text-caption text-grey-5">{{ formatFecha(prestamo.fecha_creacion) }}</span>
            <q-space />
            <q-icon name="chevron_right" color="grey-4" size="16px" />
          </div>

        </q-card-section>
      </q-card>
    </div>

    <!-- Dialog detalles -->
    <q-dialog v-model="mostrarDetalles" persistent>
      <q-card style="min-width: 350px; max-width: 95vw; width: 500px; border-radius: 16px !important;">

        <q-card-section class="q-pb-sm">
          <div class="row items-center">
            <div>
              <div class="text-subtitle1 text-weight-medium">Detalles del préstamo</div>
              <div class="text-caption text-grey-6" v-if="detallesPrestamo">
                #{{ detallesPrestamo.consecutivo }}
              </div>
            </div>
            <q-space />
            <q-badge
              v-if="detallesPrestamo"
              :color="colorEstadoPrestamo(detallesPrestamo.estado_prestamo)"
              text-color="white"
              rounded
            >
              {{ detallesPrestamo.estado_prestamo || 'pendiente' }}
            </q-badge>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-md" v-if="detallesPrestamo" style="max-height: 65vh; overflow-y: auto;">

          <div class="row q-gutter-sm q-mb-md">
            <div class="metrica-chip col">
              <div class="metrica-label">Valor pedido</div>
              <div class="metrica-valor">{{ formatPeso(detallesPrestamo.valor_pedido) }}</div>
            </div>
            <div class="metrica-chip col">
              <div class="metrica-label">Valor prestado</div>
              <div class="metrica-valor">{{ formatPeso(detallesPrestamo.valor_prestado) }}</div>
            </div>
          </div>

          <div class="seccion-titulo">Información</div>
          <div class="detalle-fila">
            <span class="detalle-label">Fecha de solicitud</span>
            <span class="detalle-valor">{{ formatFecha(detallesPrestamo.fecha_creacion) }}</span>
          </div>
          <div class="detalle-fila">
            <span class="detalle-label">Estado</span>
            <q-badge
              :color="colorEstadoPrestamo(detallesPrestamo.estado_prestamo)"
              text-color="white"
              rounded
            >
              {{ detallesPrestamo.estado_prestamo || 'pendiente' }}
            </q-badge>
          </div>

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

        <q-separator />

        <q-card-actions class="q-pa-md">
          <q-btn
            outline color="secondary" icon="folder" label="Ver archivos" size="sm"
            @click="abrirVisor(detallesPrestamo.link, 'Documentos')"
          />
          <q-space />
          <q-btn
            v-if="(perfilUsuario === 'propietario' || perfilUsuario === 'administrador') && detallesPrestamo?.estado_prestamo !== 'liquidado'"
            color="green" icon="payments" label="Registrar pago" size="sm"
            @click="irAPago"
          />
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>

      </q-card>
    </q-dialog>

    <!-- Dialog solicitar / registrar pago -->
    <q-dialog v-model="alert" persistent>
      <q-card style="min-width: 350px; max-width: 95vw; width: 440px; border-radius: 16px !important;">

        <q-card-section class="q-pb-sm">
          <div class="text-subtitle1 text-weight-medium">
            {{ accion == 1 ? 'Solicitar préstamo' : 'Registrar pago' }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-md">

          <div v-if="accion == 1">
            <q-input
              outlined rounded
              v-model="valorpedidoFormatted"
              label="Valor solicitado"
              :dense="dense"
              @update:model-value="formatearValorPedido"
            />
          </div>

          <template v-if="accion == 2">
            <q-input
              outlined rounded
              v-model="valorprestadoFormatted"
              label="Valor prestado"
              :dense="dense"
              class="q-mb-md"
              @update:model-value="formatearValorPrestado"
            />

            <div class="seccion-titulo">Comprobante</div>
            <q-file
              label="Seleccionar archivos"
              outlined rounded multiple
              v-model="archivosSeleccionados"
              @update:model-value="manejarSeleccionArchivos"
              accept="image/*, application/pdf"
              clearable
            />
            <div class="q-mt-sm row q-gutter-xs" v-if="formulario.archivos?.length">
              <q-chip
                v-for="(archivo, index) in formulario.archivos"
                :key="index"
                removable dense
                @remove="eliminarArchivo(index)"
              >
                {{ archivo.name }}
              </q-chip>
            </div>
          </template>

        </q-card-section>

        <q-separator />

        <q-card-actions class="q-pa-md" align="right">
          <q-btn outline label="Cancelar" color="grey-7" @click="cerrar()" />
          <q-btn
            color="primary"
            :loading="usePrestamo.loading"
            @click="guardar"
          >
            {{ accion == 1 ? 'Solicitar' : 'Registrar pago' }}
            <template v-slot:loading>
              <q-spinner color="white" size="1em" />
            </template>
          </q-btn>
        </q-card-actions>

      </q-card>
    </q-dialog>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" @click="abrir" />
    </q-page-sticky>

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
        estado_prestamo: item.estado_prestamo || '',
        valor_prestado: item.valor_prestado || '',
        fecha_creacion: item.fecha_creacion || '',
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

  formulario.value.valor_pedido = Number(valorpedidoFormatted.value.replace(/\./g, ''))
}

function formatearValorPrestado(val) {
  valorprestadoFormatted.value = formatearNumero(val)

  formulario.value.valor_prestado = Number(valorprestadoFormatted.value.replace(/\./g, ''))
}
function formatearNumero(valor) {
  if (!valor) return ''

  const limpio = valor.toString().replace(/\D/g, '')

  return new Intl.NumberFormat('es-CO').format(limpio)
}

function mostrarMensajeError(mensaje) {
  $q.notify({
    type: 'negative',
    message: mensaje,
    position: 'bottom-right',
  })
}

function formatFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatPeso(valor) {
  if (!valor) return '—'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0
  }).format(valor)
}

function colorEstadoPrestamo(estado) {
  const map = {
    liquidado: 'positive',
    pendiente: 'warning',
    aprobado: 'blue',
    rechazado: 'negative',
  }
  return map[estado] || 'grey'
}

defineOptions({
  name: 'PrestamosPage',
})

</script>

<style scoped>
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

.placa-badge-lg {
  background: #111827;
  color: white;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
  padding: 6px 20px;
  border-radius: 8px;
  font-family: monospace;
}

.detalle-fila {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.detalle-fila:last-child {
  border-bottom: none;
}
.detalle-label {
  font-size: 13px;
  color: #9ca3af;
}
.detalle-valor {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  text-align: right;
  max-width: 60%;
}

.prestamo-card {
  border: 1px solid #E5E7EB !important;
  border-radius: 12px !important;
  transition: border-color 0.15s;
}
.prestamo-card:active {
  opacity: 0.85;
}
</style>


