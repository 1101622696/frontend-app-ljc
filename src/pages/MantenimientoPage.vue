<template>
  <q-page padding class="bg-grey-2">
    <!-- ───────────── FILTROS ───────────── -->
    <div class="filter-bar q-mb-md">
      <!-- Estado de la factura -->
      <div class="filter-scroll row no-wrap q-gutter-x-sm q-pb-xs">
        <q-chip
          v-for="opcion in opcionesEstado"
          :key="opcion.valor"
          clickable
          :color="filtroEstado === opcion.valor ? 'primary' : 'grey-2'"
          :text-color="filtroEstado === opcion.valor ? 'white' : 'grey-8'"
          class="filter-chip"
          @click="cambiarFiltro('estado', opcion.valor)"
        >
          {{ opcion.etiqueta }}
          <q-badge v-if="opcion.cantidad" rounded color="white" text-color="grey-9" class="q-ml-xs">
            {{ opcion.cantidad }}
          </q-badge>
        </q-chip>
      </div>

      <!-- Tipo -->
      <div class="filter-scroll row no-wrap q-gutter-x-sm q-pb-xs q-mt-xs">
        <q-chip
          v-for="opcion in opcionesTipoFiltro"
          :key="opcion.valor"
          clickable
          size="sm"
          :color="filtroTipo === opcion.valor ? 'secondary' : 'grey-2'"
          :text-color="filtroTipo === opcion.valor ? 'white' : 'grey-8'"
          class="filter-chip"
          @click="cambiarFiltro('tipo', opcion.valor)"
        >
          {{ opcion.etiqueta }}
        </q-chip>
      </div>

      <!-- Placa (solo si hay más de una) -->
      <div v-if="placasLista.length > 1" class="filter-scroll row no-wrap q-gutter-x-sm q-pb-xs q-mt-xs">
        <q-chip
          v-for="placa in ['', ...placasLista]"
          :key="placa || 'todas'"
          clickable
          size="sm"
          icon="local_shipping"
          :color="filtroPlaca === placa ? 'grey-9' : 'grey-2'"
          :text-color="filtroPlaca === placa ? 'white' : 'grey-8'"
          class="filter-chip"
          @click="cambiarFiltro('placa', placa)"
        >
          {{ placa || 'Todas' }}
        </q-chip>
      </div>

      <div class="row items-center text-caption text-grey-8 q-mt-sm">
        <span>{{ filtrados.length }} mantenimiento{{ filtrados.length === 1 ? '' : 's' }}</span>
        <q-space />
        <span>Total: <b class="text-grey-10">{{ formatoPeso(totalFiltrado) }}</b></span>
      </div>
    </div>

    <!-- ───────────── LISTA ───────────── -->
    <div v-if="!filtrados.length && !cargandoLista" class="text-center text-grey-6 q-py-xl">
      <q-icon name="build" size="48px" />
      <div class="q-mt-sm">{{ mensajeVacio }}</div>
    </div>

    <q-card
      v-for="m in visibles"
      :key="m.consecutivo"
      flat
      class="viaje-card q-mb-sm cursor-pointer"
      @click="verDetalles(m.consecutivo)"
    >
      <q-card-section class="q-py-sm">
        <div class="row items-center no-wrap">
          <span class="placa-badge">{{ m.placa }}</span>
          <span class="text-weight-bold q-ml-sm">{{ m.consecutivo }}</span>
          <q-space />
          <q-badge :color="colorEstado(m.estado_factura)" :label="nombreEstado(m.estado_factura)" />
        </div>
        <div class="text-body2 q-mt-xs ellipsis">
          {{ nombreTipo(m.tipo_mantenimiento) }}{{ m.descripcion ? ` · ${m.descripcion}` : '' }}
        </div>
        <div class="row items-center text-caption text-grey-7">
          <span>{{ formatoFecha(m.fecha_creacion) }}{{ m.odometro !== '' && m.odometro !== undefined ? ` · ${formatoMiles(m.odometro)} km` : '' }}</span>
          <q-space />
          <span class="text-body2 text-weight-bold text-grey-10">{{ formatoPeso(m.valor_mantenimiento) }}</span>
        </div>
      </q-card-section>
    </q-card>

    <div v-if="visibles.length < filtrados.length" class="text-center q-my-md">
      <q-btn outline rounded color="primary" label="Cargar más" @click="limite += POR_PAGINA" />
    </div>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" label="Mantenimiento" @click="abrirCrear" />
    </q-page-sticky>

    <!-- ───────────── DETALLE ───────────── -->
    <q-dialog v-model="mostrarDetalles" :maximized="$q.screen.lt.md">
      <q-card v-if="detalle" style="width: 560px; max-width: 100vw">
        <q-card-section class="row items-center q-pb-sm sticky-header">
          <span class="placa-badge-lg">{{ detalle.placa }}</span>
          <div class="q-ml-md">
            <div class="text-h6">{{ detalle.consecutivo }}</div>
            <q-badge :color="colorEstado(detalle.estado_factura)" :label="nombreEstado(detalle.estado_factura)" />
          </div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-sm">
          <q-banner
            v-if="detalle.estado_factura !== 'legalizado'"
            dense
            rounded
            class="bg-orange-1 text-orange-10 q-mb-md"
          >
            <template #avatar><q-icon name="receipt_long" /></template>
            Falta la factura. Legalícelo cuando la tenga.
          </q-banner>

          <div class="ganancia-banner ganancia-negativa q-mb-md">
            <div class="text-caption">Valor del mantenimiento (gasto del vehículo)</div>
            <div class="text-h6">{{ formatoPeso(detalle.valor_mantenimiento) }}</div>
          </div>

          <div class="seccion-titulo">Mantenimiento</div>
          <Fila etiqueta="Tipo" :valor="nombreTipo(detalle.tipo_mantenimiento)" />
          <Fila etiqueta="Descripción" :valor="detalle.descripcion" />
          <Fila etiqueta="Fecha" :valor="formatoFecha(detalle.fecha_creacion)" />
          <Fila
            etiqueta="Odómetro"
            :valor="detalle.odometro !== '' && detalle.odometro !== undefined ? `${formatoMiles(detalle.odometro)} km` : ''"
          />

          <div class="seccion-titulo q-mt-md">Factura</div>
          <Fila
            etiqueta="Estado"
            :valor="nombreEstado(detalle.estado_factura)"
            :clase="detalle.estado_factura === 'legalizado' ? 'text-positive' : 'text-orange-9'"
          />
          <Fila etiqueta="Número de factura" :valor="detalle.numero_factura" />

          <div class="seccion-titulo q-mt-md">Registro</div>
          <Fila etiqueta="Registrado por" :valor="detalle.usuario" />
          <Fila etiqueta="Correo" :valor="detalle.correo_usuario" />

          <div class="seccion-titulo q-mt-md">Documentos</div>
          <div class="row q-gutter-sm">
            <q-btn
              v-if="detalle.link_factura"
              outline
              size="sm"
              icon="receipt"
              label="Factura"
              @click="abrirVisor(detalle.link_factura, `Factura ${detalle.consecutivo}`)"
            />
            <q-btn
              v-if="detalle.link && detalle.link !== detalle.link_factura"
              outline
              size="sm"
              icon="folder"
              label="Archivos"
              @click="abrirVisor(detalle.link, `Archivos ${detalle.consecutivo}`)"
            />
            <span v-if="!detalle.link && !detalle.link_factura" class="text-caption text-grey-6">Sin documentos</span>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-1 sticky-footer">
          <q-btn flat color="grey-8" icon="edit" label="Editar" @click="abrirEditar" />
          <q-space />
          <q-btn
            v-if="detalle.estado_factura !== 'legalizado'"
            unelevated
            color="positive"
            icon="task_alt"
            label="Legalizar"
            @click="abrirLegalizar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ───────────── REGISTRAR / EDITAR ───────────── -->
    <q-dialog v-model="dialogForm" persistent :maximized="$q.screen.lt.md">
      <q-card style="width: 560px; max-width: 100vw">
        <q-card-section class="bg-grey-1 row items-center">
          <div>
            <div class="text-h6">{{ editando ? `Editar ${editando}` : 'Registrar mantenimiento' }}</div>
            <div v-if="editando" class="text-caption">Solo cambia lo que modifique</div>
          </div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-select
            v-model="form.placa"
            :options="placasFormulario"
            label="Placa"
            outlined
            dense
            emit-value
            map-options
          />
          <q-select
            v-model="form.tipo_mantenimiento"
            :options="TIPOS"
            option-value="valor"
            option-label="etiqueta"
            label="Tipo de mantenimiento"
            outlined
            dense
            emit-value
            map-options
          />
          <q-input
            v-model.trim="form.descripcion"
            label="Descripción (qué se hizo)"
            type="textarea"
            autogrow
            outlined
            dense
          />
          <CampoNumero
            v-model="form.valor_mantenimiento"
            label="Valor del mantenimiento"
            moneda
            :minimo-sugerido="1000"
            hint="Valor completo, ej. 850.000"
          />
          <CampoNumero
            v-model="form.odometro"
            label="Odómetro (opcional)"
            sufijo="km"
            :hint="odometroActual !== null ? `Actual del vehículo: ${formatoMiles(odometroActual)} km` : ''"
          />

          <q-separator />
          <div class="text-subtitle2 text-grey-8">Factura</div>
          <q-banner dense rounded class="bg-blue-1 text-blue-10">
            <template #avatar><q-icon name="info" /></template>
            Si tiene la factura, quedará legalizado; si no, podrá legalizarlo después.
          </q-banner>
          <q-input v-model.trim="form.numero_factura" label="Número de factura (opcional)" outlined dense />
          <CampoArchivos
            v-model="form.archivos"
            label="Foto o PDF de la factura (opcional)"
            multiple
            accept="image/*, application/pdf"
            :link-actual="editando ? detalle?.link || '' : ''"
          />
          <div class="text-caption" :class="avisoFactura.clase">{{ avisoFactura.texto }}</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            :label="editando ? 'Guardar cambios' : 'Registrar'"
            :loading="guardando"
            @click="guardarForm"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ───────────── LEGALIZAR ───────────── -->
    <q-dialog v-model="dialogLegalizar" persistent>
      <q-card style="width: 440px; max-width: 95vw">
        <q-card-section class="bg-grey-1">
          <div class="text-h6">Legalizar {{ detalle?.consecutivo }}</div>
          <div class="text-caption">
            {{ detalle?.placa }} · {{ nombreTipo(detalle?.tipo_mantenimiento) }} · {{ formatoPeso(detalle?.valor_mantenimiento) }}
          </div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model.trim="formLegalizar.numero_factura" label="Número de factura" outlined dense />
          <CampoArchivos
            v-model="formLegalizar.archivos"
            :label="tieneSoporte ? 'Foto o PDF de la factura (opcional)' : 'Foto o PDF de la factura (obligatorio)'"
            multiple
            accept="image/*, application/pdf"
          />
          <div class="text-caption text-grey-7">
            {{
              tieneSoporte
                ? 'Si no adjunta nada, se toma como soporte lo que ya tiene adjunto el mantenimiento.'
                : 'Este mantenimiento no tiene archivos: adjunte la factura.'
            }}
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn unelevated color="positive" label="Legalizar" :loading="guardando" @click="guardarLegalizar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useQuasar } from 'quasar'
import { useStoreMantenimiento } from '../stores/mantenimientos'
import { useStoreUsuarios } from '../stores/usuarios'
import { useStoreVehiculos } from '../stores/vehiculos'
import { useVisorArchivos } from '../composables/useVisorArchivos'
import CampoArchivos from 'components/CampoArchivos.vue'
import CampoNumero from 'components/viajes/CampoNumero.vue'
import { formatoPeso, formatoMiles, formatoFecha } from '../utils/formato'

defineOptions({ name: 'MantenimientoPage' })

const $q = useQuasar()
const useMantenimiento = useStoreMantenimiento()
const useUsuario = useStoreUsuarios()
const useVehiculo = useStoreVehiculos()

// Visor de archivos (con pellizco), montado una sola vez en MainLayout
const { abrirArchivos: abrirVisor } = useVisorArchivos()

// ── Componente pequeño de la vista ──

const Fila = (props) =>
  h('div', { class: 'detalle-fila' }, [
    h('span', { class: 'detalle-label' }, props.etiqueta),
    h(
      'span',
      { class: ['detalle-valor', props.clase] },
      props.valor === '' || props.valor === undefined || props.valor === null ? '—' : props.valor,
    ),
  ])
Fila.props = ['etiqueta', 'valor', 'clase']

// ── Catálogos (siempre en minúscula para comparar y enviar) ──

const TIPOS = [
  { valor: 'preventivo', etiqueta: 'Preventivo' },
  { valor: 'correctivo', etiqueta: 'Correctivo' },
  { valor: 'otro', etiqueta: 'Otro' },
]
const nombreTipo = (t) => TIPOS.find((x) => x.valor === t)?.etiqueta || t || '—'

const ESTADOS = [
  { valor: 'pendiente', etiqueta: 'Pendiente factura', color: 'orange' },
  { valor: 'legalizado', etiqueta: 'Legalizado', color: 'positive' },
]
const nombreEstado = (e) => ESTADOS.find((x) => x.valor === e)?.etiqueta || e || '—'
const colorEstado = (e) => ESTADOS.find((x) => x.valor === e)?.color || 'grey'

// ── Perfil ──

const esAdmin = computed(() => useUsuario.perfile === 'administrador')
const misPlacas = computed(() =>
  String(useUsuario.user?.placa_asignada || '')
    .split(',')
    .map((p) => p.replace(/\s+/g, '').toUpperCase())
    .filter(Boolean),
)

// ── Vehículos (placas del formulario y odómetro actual) ──

const vehiculos = ref([])

async function cargarVehiculos() {
  // El backend ya filtra: el propietario recibe solo sus vehículos
  const lista = await useVehiculo.obtenerVehiculos()
  vehiculos.value = Array.isArray(lista) ? lista : []
}

const placasFormulario = computed(() => {
  const activas = vehiculos.value.filter((v) => v.estado !== 'inactivo').map((v) => v.placa)
  // Al editar, la placa actual debe aparecer aunque el vehículo esté inactivo
  if (form.value.placa && !activas.includes(form.value.placa)) activas.push(form.value.placa)
  return activas.map((p) => ({ label: p, value: p }))
})

const odometroActual = computed(() => {
  const v = vehiculos.value.find((x) => x.placa === form.value.placa)
  const n = Number(v?.odometro)
  return v && v.odometro !== '' && Number.isFinite(n) ? n : null
})

// ── Lista y filtros (en el cliente: la lista ya viene completa) ──

const POR_PAGINA = 30
const mantenimientos = ref([])
const cargandoLista = ref(false)
const filtroEstado = ref('')
const filtroTipo = ref('')
const filtroPlaca = ref('')
const limite = ref(POR_PAGINA)

async function cargarMantenimientos() {
  cargandoLista.value = true
  try {
    mantenimientos.value = await useMantenimiento.listarMantenimientos({
      esAdmin: esAdmin.value,
      placas: misPlacas.value,
    })
  } finally {
    cargandoLista.value = false
  }
}

/** Placas para el filtro: las del usuario (propietario) o las que aparecen en la lista (admin) */
const placasLista = computed(() => {
  const set = new Set(esAdmin.value ? [] : misPlacas.value)
  mantenimientos.value.forEach((m) => m.placa && set.add(m.placa))
  return [...set].sort()
})

// Filtros por tipo y placa; el de estado se aplica aparte para poder contar por estado
const porTipoYPlaca = computed(() =>
  mantenimientos.value.filter(
    (m) =>
      (!filtroTipo.value || m.tipo_mantenimiento === filtroTipo.value) &&
      (!filtroPlaca.value || m.placa === filtroPlaca.value),
  ),
)

const filtrados = computed(() =>
  porTipoYPlaca.value.filter(
    (m) => !filtroEstado.value || (m.estado_factura === 'legalizado') === (filtroEstado.value === 'legalizado'),
  ),
)

const visibles = computed(() => filtrados.value.slice(0, limite.value))

const totalFiltrado = computed(() =>
  filtrados.value.reduce((suma, m) => suma + (Number(m.valor_mantenimiento) || 0), 0),
)

const opcionesEstado = computed(() => {
  const pendientes = porTipoYPlaca.value.filter((m) => m.estado_factura !== 'legalizado').length
  return [
    { valor: '', etiqueta: 'Todos', cantidad: porTipoYPlaca.value.length },
    { valor: 'pendiente', etiqueta: 'Pendientes de factura', cantidad: pendientes },
    { valor: 'legalizado', etiqueta: 'Legalizados', cantidad: porTipoYPlaca.value.length - pendientes },
  ]
})

const opcionesTipoFiltro = [{ valor: '', etiqueta: 'Todos los tipos' }, ...TIPOS]

function cambiarFiltro(cual, valor) {
  if (cual === 'estado') filtroEstado.value = valor
  if (cual === 'tipo') filtroTipo.value = valor
  if (cual === 'placa') filtroPlaca.value = valor
  limite.value = POR_PAGINA
}

const mensajeVacio = computed(() => {
  if (!esAdmin.value && !misPlacas.value.length) return 'No tiene placas asignadas'
  if (filtroEstado.value || filtroTipo.value || filtroPlaca.value) return 'No hay mantenimientos con estos filtros'
  return 'Aún no hay mantenimientos registrados'
})

// ── Detalle ──

const detalle = ref(null)
const mostrarDetalles = ref(false)

async function verDetalles(consecutivo) {
  const data = await useMantenimiento.obtenerdatodemantenimiento(consecutivo)
  if (!data) return
  detalle.value = data
  mostrarDetalles.value = true
}

// ── Acciones comunes ──

const guardando = ref(false)

async function ejecutar(fn) {
  guardando.value = true
  try {
    await fn()
    return true
  } catch (error) {
    // El diálogo sigue abierto con lo que el usuario llenó
    $q.notify({ type: 'negative', message: error.message, position: 'bottom', timeout: 5000 })
    return false
  } finally {
    guardando.value = false
  }
}

/** Un solo aviso con el primer error */
const avisar = (mensaje) => {
  $q.notify({ type: 'warning', message: mensaje, position: 'bottom' })
  return false
}

// ─────────────────────────────────────────────────────────────
// Registrar / editar
// ─────────────────────────────────────────────────────────────

// Función: cada formulario recibe un objeto y un arreglo de archivos NUEVOS
const vacio = () => ({
  placa: null,
  tipo_mantenimiento: null,
  descripcion: '',
  valor_mantenimiento: null,
  odometro: null,
  numero_factura: '',
  archivos: [],
})

const dialogForm = ref(false)
const form = ref(vacio())
const editando = ref('') // consecutivo en edición; vacío = registro nuevo

function abrirCrear() {
  editando.value = ''
  form.value = vacio()
  // Con una sola placa se precarga
  if (placasFormulario.value.length === 1) form.value.placa = placasFormulario.value[0].value
  dialogForm.value = true
}

function abrirEditar() {
  const d = detalle.value
  editando.value = d.consecutivo
  form.value = {
    ...vacio(),
    placa: d.placa,
    tipo_mantenimiento: d.tipo_mantenimiento || null,
    descripcion: d.descripcion || '',
    valor_mantenimiento: Number(d.valor_mantenimiento) || null,
    odometro: d.odometro === '' || d.odometro === undefined ? null : Number(d.odometro),
    numero_factura: d.numero_factura || '',
  }
  dialogForm.value = true
}

/** Le dice al usuario cómo va a quedar la factura con lo que lleva escrito */
const avisoFactura = computed(() => {
  const f = form.value
  const yaLegalizado = editando.value && detalle.value?.estado_factura === 'legalizado'
  if (yaLegalizado) return { texto: 'Este mantenimiento ya está legalizado.', clase: 'text-positive' }
  const tieneArchivo = f.archivos.length > 0 || (editando.value && detalle.value?.link_factura)
  if (f.numero_factura && tieneArchivo) return { texto: 'Quedará legalizado.', clase: 'text-positive' }
  if (f.numero_factura) return { texto: 'Falta el archivo de la factura: quedará pendiente.', clase: 'text-orange-9' }
  return { texto: 'Quedará pendiente de factura.', clase: 'text-grey-7' }
})

function validarForm() {
  const f = form.value
  if (!f.placa) return 'Seleccione la placa'
  if (!f.tipo_mantenimiento) return 'Seleccione el tipo de mantenimiento'
  if (!f.descripcion) return 'Describa el mantenimiento'
  if (!(f.valor_mantenimiento > 0)) return 'Escriba el valor del mantenimiento'
  // Al registrar, el odómetro no puede bajar; al editar un registro viejo sí puede ser menor (corrección)
  if (!editando.value && f.odometro !== null && odometroActual.value !== null && f.odometro < odometroActual.value) {
    return `El odómetro no puede ser menor al actual (${formatoMiles(odometroActual.value)} km)`
  }
  return ''
}

function armarFormData() {
  const f = form.value
  const fd = new FormData()
  fd.append('placa', f.placa)
  fd.append('tipo_mantenimiento', f.tipo_mantenimiento)
  fd.append('descripcion', f.descripcion)
  fd.append('valor_mantenimiento', String(f.valor_mantenimiento))
  if (f.odometro !== null) fd.append('odometro', String(f.odometro))
  if (f.numero_factura) fd.append('numero_factura', f.numero_factura)
  f.archivos.forEach((a) => fd.append('archivos', a))
  return fd
}

async function guardarForm() {
  const error = validarForm()
  if (error) return avisar(error)

  const fd = armarFormData()

  if (editando.value) {
    const consecutivo = editando.value
    return ejecutar(async () => {
      await useMantenimiento.editarMantenimiento(consecutivo, fd)
      dialogForm.value = false
      await Promise.all([cargarMantenimientos(), cargarVehiculos()])
      await verDetalles(consecutivo)
    })
  }

  return ejecutar(async () => {
    const r = await useMantenimiento.crearMantenimiento(fd)
    dialogForm.value = false
    avisarCreado(r)
    await Promise.all([cargarMantenimientos(), cargarVehiculos()])
  })
}

/** Mensaje al crear: queda como gasto del vehículo; si algo secundario falló, el backend lo avisa */
function avisarCreado(r) {
  if (r?.advertencia) {
    $q.notify({ type: 'warning', message: r.advertencia, position: 'bottom', timeout: 8000 })
    return
  }
  const factura =
    r?.estado_factura === 'legalizado' ? 'Quedó legalizado.' : 'La factura queda pendiente: puede legalizarlo después.'
  $q.notify({
    type: 'positive',
    message: `Mantenimiento ${r?.consecutivo || ''} registrado como gasto del vehículo ${r?.placa || ''}. ${factura}`,
    position: 'bottom',
    timeout: 6000,
  })
}

// ─────────────────────────────────────────────────────────────
// Legalizar
// ─────────────────────────────────────────────────────────────

const dialogLegalizar = ref(false)
const formLegalizar = ref({ numero_factura: '', archivos: [] })

// El backend acepta legalizar sin archivo nuevo si el mantenimiento ya tiene soporte
const tieneSoporte = computed(() => Boolean(detalle.value?.link_factura || detalle.value?.link))

function abrirLegalizar() {
  formLegalizar.value = { numero_factura: detalle.value.numero_factura || '', archivos: [] }
  dialogLegalizar.value = true
}

async function guardarLegalizar() {
  const f = formLegalizar.value
  if (!f.numero_factura) return avisar('Escriba el número de la factura')
  if (!f.archivos.length && !tieneSoporte.value) return avisar('Adjunte la foto o el PDF de la factura')

  const fd = new FormData()
  fd.append('numero_factura', f.numero_factura)
  f.archivos.forEach((a) => fd.append('archivos', a))

  const consecutivo = detalle.value.consecutivo
  await ejecutar(async () => {
    await useMantenimiento.legalizarMantenimiento(consecutivo, fd)
    dialogLegalizar.value = false
    await cargarMantenimientos()
    await verDetalles(consecutivo)
  })
}

// ── Inicio ──

onMounted(async () => {
  await Promise.all([cargarVehiculos(), cargarMantenimientos()])
})
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
.ganancia-banner {
  border-radius: 10px;
  padding: 10px 14px;
}
.ganancia-negativa {
  background: #fef2f2;
  color: #991b1b;
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

<!-- Sin scoped: lo usa el componente funcional Fila -->
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
