<template>
  <q-page padding class="bg-grey-2">
    <!-- El conductor no maneja clientes (el backend responde 403) -->
    <div v-if="!puedeVer" class="text-center text-grey-6 q-py-xl">
      <q-icon name="lock" size="48px" />
      <div class="q-mt-sm">Esta sección es para el propietario y el administrador.</div>
    </div>

    <template v-else>
      <!-- ───────────── FILTROS ───────────── -->
      <div class="filter-bar q-mb-md">
        <div class="filter-scroll row no-wrap q-gutter-x-sm q-pb-xs">
          <q-chip
            v-for="opcion in opcionesFiltro"
            :key="opcion.valor"
            clickable
            :color="filtro === opcion.valor ? 'primary' : 'grey-2'"
            :text-color="filtro === opcion.valor ? 'white' : 'grey-8'"
            class="filter-chip"
            @click="filtro = opcion.valor"
          >
            {{ opcion.etiqueta }}
            <q-badge v-if="opcion.cantidad" rounded color="white" text-color="grey-9" class="q-ml-xs">
              {{ opcion.cantidad }}
            </q-badge>
          </q-chip>
        </div>
        <div class="row items-center no-wrap q-gutter-x-sm q-mt-sm">
          <span class="text-caption text-grey-7">Ordenar:</span>
          <q-chip
            v-for="o in ORDENES"
            :key="o.valor"
            clickable
            dense
            size="sm"
            :outline="orden !== o.valor"
            :color="orden === o.valor ? 'secondary' : 'grey-7'"
            :text-color="orden === o.valor ? 'white' : 'grey-8'"
            @click="orden = o.valor"
          >
            {{ o.etiqueta }}
          </q-chip>
        </div>
        <div class="text-caption text-grey-7 q-mt-xs">
          Totales de los viajes aprobados, facturados o pagados.
          <b v-if="esPropietario">Como propietario ve solo los viajes y la ganancia de sus vehículos.</b>
        </div>
      </div>

      <!-- ───────────── LISTA ───────────── -->
      <div v-if="!clientesFiltrados.length && !cargandoLista" class="text-center text-grey-6 q-py-xl">
        <q-icon name="groups" size="48px" />
        <div class="q-mt-sm">{{ filtro === 'inactivo' ? 'No hay clientes inactivos' : 'No hay clientes registrados' }}</div>
      </div>

      <q-card
        v-for="c in clientesFiltrados"
        :key="c.codigo"
        flat
        class="viaje-card q-mb-sm cursor-pointer"
        :class="{ 'tarjeta-inactiva': c.estado !== 'activo' }"
        @click="verDetalle(c.codigo)"
      >
        <q-card-section class="q-py-sm">
          <div class="row items-center no-wrap">
            <div class="avatar-chip q-mr-sm">{{ iniciales(c.empresa) }}</div>
            <div class="col ellipsis">
              <div class="text-body2 text-weight-medium ellipsis">{{ c.empresa }}</div>
              <div class="text-caption text-grey-7">{{ c.codigo }}{{ c.nit ? ` · NIT ${c.nit}` : '' }}</div>
            </div>
            <q-badge v-if="c.estado !== 'activo'" color="grey-5" label="Inactivo" />
            <q-icon v-else-if="incumple(c)" name="warning" color="orange-9" size="18px">
              <q-tooltip>Pagó menos de lo prometido en algún viaje</q-tooltip>
            </q-icon>
          </div>
          <div class="row q-gutter-x-sm q-mt-sm no-wrap">
            <div class="metrica-chip col">
              <div class="metrica-label">Viajes</div>
              <div class="metrica-valor">{{ formatoMiles(c.viajes || 0) }}</div>
            </div>
            <div class="metrica-chip col">
              <div class="metrica-label">Facturado</div>
              <div class="metrica-valor">{{ formatoPeso(c.total_valor_viaje_real) }}</div>
            </div>
            <div class="metrica-chip col">
              <div class="metrica-label">{{ esPropietario ? 'Su ganancia' : 'Ganancia' }}</div>
              <div class="metrica-valor" :class="claseSigno(c.total_ganancia_viaje)">{{ formatoPeso(c.total_ganancia_viaje) }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn fab icon="add" color="primary" label="Cliente" @click="abrirCrear" />
      </q-page-sticky>
    </template>

    <!-- ───────────── DETALLE ───────────── -->
    <q-dialog v-model="mostrarDetalle" :maximized="$q.screen.lt.md">
      <q-card v-if="detalle" style="width: 560px; max-width: 100vw">
        <q-card-section class="row items-center no-wrap q-pb-sm sticky-header">
          <div class="avatar-chip q-mr-md">{{ iniciales(detalle.empresa) }}</div>
          <div class="col ellipsis">
            <div class="text-subtitle1 text-weight-medium ellipsis">{{ detalle.empresa }}</div>
            <div class="text-caption text-grey-7">{{ detalle.codigo }}</div>
            <q-badge :color="detalle.estado === 'activo' ? 'positive' : 'grey-6'" :label="detalle.estado === 'activo' ? 'Activo' : 'Inactivo'" />
          </div>
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-sm">
          <!-- Totales -->
          <div class="seccion-titulo">Viajes con este cliente</div>
          <div v-if="esPropietario" class="text-caption text-grey-7 q-mb-xs">Solo los viajes de sus vehículos.</div>
          <Fila etiqueta="Viajes" :valor="formatoMiles(detalle.viajes || 0)" />
          <Fila etiqueta="Valor estimado" :valor="formatoPeso(detalle.total_valor_viaje_estimado)" />
          <Fila etiqueta="Valor facturado" :valor="formatoPeso(detalle.total_valor_viaje_real)" />
          <Fila
            :etiqueta="esPropietario ? 'Su ganancia' : 'Ganancia'"
            :valor="formatoPeso(detalle.total_ganancia_viaje)"
            :clase="['text-weight-bold', claseSigno(detalle.total_ganancia_viaje)]"
          />

          <!-- ¿Cumple lo prometido? -->
          <div class="seccion-titulo q-mt-md">¿Cumple lo prometido?</div>
          <div v-if="!detalle.viajes" class="text-caption text-grey-6 q-py-sm">Aún no hay viajes para comparar.</div>
          <template v-else>
            <div class="ganancia-banner q-my-sm" :class="incumple(detalle) ? 'ganancia-negativa' : 'ganancia-positiva'">
              <div class="text-body2 text-weight-medium">
                {{ incumple(detalle) ? 'Ha pagado menos de lo prometido' : 'Cumple lo que promete' }}
              </div>
            </div>
            <div v-for="ind in indicadores" :key="ind.etiqueta" class="indicador">
              <div class="row items-center no-wrap">
                <span class="detalle-label">{{ ind.etiqueta }}</span>
                <q-space />
                <span class="text-weight-bold" :class="ind.clase">{{ ind.valor }}</span>
              </div>
              <div class="text-caption text-grey-7">{{ ind.explicacion }}</div>
            </div>
          </template>

          <!-- Datos -->
          <div class="seccion-titulo q-mt-md">Información</div>
          <Fila etiqueta="NIT" :valor="detalle.nit" />
          <Fila etiqueta="Teléfono" :valor="detalle.telefono" />
          <Fila etiqueta="Email" :valor="detalle.email" />
          <Fila etiqueta="Registrado" :valor="formatoFecha(detalle.fecha_creacion)" />

          <div class="seccion-titulo q-mt-md">Facturación</div>
          <Fila etiqueta="Tipo de pago" :valor="nombreTipoPago(detalle.tipo_pago)" />
          <Fila etiqueta="Rete fuente" :valor="detalle.rete_fuente === 'si' ? 'Sí (1 %)' : 'No'" />
          <Fila etiqueta="Rete ICA" :valor="textoReteIca(detalle.rete_ica)" />
        </q-card-section>

        <q-card-actions class="q-pa-md bg-grey-1 sticky-footer">
          <q-btn
            flat
            :color="detalle.estado === 'activo' ? 'negative' : 'positive'"
            :icon="detalle.estado === 'activo' ? 'block' : 'check_circle'"
            :label="detalle.estado === 'activo' ? 'Desactivar' : 'Activar'"
            :loading="cambiandoEstado"
            @click="pedirCambioEstado"
          />
          <q-space />
          <q-btn unelevated color="primary" icon="edit" label="Editar" @click="abrirEditar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ───────────── CREAR / EDITAR ───────────── -->
    <q-dialog v-model="dialogForm" persistent :maximized="$q.screen.lt.md">
      <q-card style="width: 520px; max-width: 100vw">
        <q-card-section class="bg-grey-1 row items-center">
          <div>
            <div class="text-h6">{{ codigoEditando ? `Editar ${codigoEditando}` : 'Nuevo cliente' }}</div>
            <div class="text-caption text-grey-7">Lo marcado con * es obligatorio</div>
          </div>
          <q-space />
          <q-btn flat round icon="close" :disable="guardando" v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input v-model.trim="formulario.empresa" label="Empresa *" outlined dense />
          <q-input v-model.trim="formulario.nit" label="NIT *" hint="Ej. 900123456-7" inputmode="numeric" outlined dense />
          <q-input v-model.trim="formulario.telefono" label="Teléfono" type="tel" inputmode="tel" outlined dense />
          <q-input v-model.trim="formulario.email" label="Email" type="email" inputmode="email" outlined dense />
          <q-select
            v-model="formulario.tipo_pago"
            :options="TIPOS_PAGO"
            label="Tipo de pago"
            outlined
            dense
            emit-value
            map-options
            clearable
          />

          <div>
            <div class="text-body2 q-mb-xs">¿Le aplica rete fuente? (1 %)</div>
            <q-btn-toggle
              v-model="formulario.rete_fuente"
              spread
              no-caps
              unelevated
              toggle-color="primary"
              color="grey-3"
              text-color="grey-9"
              :options="OPCIONES_SI_NO"
            />
          </div>

          <q-input
            v-model.trim="formulario.rete_ica"
            label="Rete ICA"
            suffix="%"
            inputmode="decimal"
            outlined
            dense
            bottom-slots
          >
            <template #hint>
              Si el certificado dice "x mil", divida entre 10 (10 x mil = 1 %).
              <span v-if="reteIcaPorMil">Equivale a {{ reteIcaPorMil }} x mil.</span>
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-8" :disable="guardando" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            :icon="codigoEditando ? 'save' : 'add'"
            :label="codigoEditando ? 'Guardar cambios' : 'Crear cliente'"
            :loading="guardando"
            @click="guardar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useQuasar } from 'quasar'
import { useStoreClientes } from '../stores/clientes'
import { useStoreUsuarios } from '../stores/usuarios'
import { formatoPeso, formatoMiles, formatoFecha } from '../utils/formato'

defineOptions({ name: 'ClientesPage' })

const $q = useQuasar()
const useCliente = useStoreClientes()
const useUsuario = useStoreUsuarios()

// Fila "etiqueta: valor" del detalle (mismo patrón de ViajesPage)
const Fila = (props) =>
  h('div', { class: 'detalle-fila' }, [
    h('span', { class: 'detalle-label' }, props.etiqueta),
    h('span', { class: ['detalle-valor', props.clase] }, props.valor === '' || props.valor === undefined || props.valor === null ? '—' : props.valor),
  ])
Fila.props = ['etiqueta', 'valor', 'clase']

// ── Perfil ──

const puedeVer = computed(() => ['administrador', 'propietario'].includes(useUsuario.perfile))
const esPropietario = computed(() => useUsuario.perfile === 'propietario')

// ── Utilidades de la vista ──

const TIPOS_PAGO = [
  { label: 'Contado', value: 'contado' },
  { label: 'Quincenal', value: 'quincenal' },
  { label: 'Mensual', value: 'mensual' },
]
const OPCIONES_SI_NO = [
  { label: 'Sí', value: 'si' },
  { label: 'No', value: 'no' },
]
const nombreTipoPago =(valor) => TIPOS_PAGO.find((t) => t.value === valor)?.label || valor || ''

const claseSigno = (n) => (Number(n) > 0 ? 'text-positive' : Number(n) < 0 ? 'text-negative' : '')

function iniciales(empresa) {
  return String(empresa || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0])
    .join('')
    .toUpperCase()
}

/** Rete ICA en % y su equivalente en "por mil" (así viene en los certificados) */
function textoReteIca(valor) {
  const n = Number(valor) || 0
  if (!n) return 'No aplica'
  const porcentaje = n.toLocaleString('es-CO', { maximumFractionDigits: 3 })
  const porMil = (n * 10).toLocaleString('es-CO', { maximumFractionDigits: 2 })
  return `${porcentaje} % (${porMil} x mil)`
}

/** El cliente pagó por tonelada menos de lo prometido en algún viaje */
const incumple = (c) => Number(c.viajes_precio_menor) > 0 || Number(c.diferencia_precio_total) < 0

// ── Lista ──

const clientes = ref([])
const cargandoLista = ref(false)
const filtro = ref('activo')
const orden = ref('viajes')

const ORDENES = [
  { valor: 'viajes', etiqueta: 'Más viajes' },
  { valor: 'ganancia', etiqueta: 'Más ganancia' },
  { valor: 'recientes', etiqueta: 'Más recientes' },
]

const opcionesFiltro = computed(() => [
  { valor: 'activo', etiqueta: 'Activos', cantidad: clientes.value.filter((c) => c.estado === 'activo').length },
  { valor: 'inactivo', etiqueta: 'Inactivos', cantidad: clientes.value.filter((c) => c.estado !== 'activo').length },
  { valor: 'todos', etiqueta: 'Todos', cantidad: clientes.value.length },
])

// 'C-12' → 12, para ordenar por el más reciente
const numeroCodigo = (codigo) => parseInt(String(codigo).replace(/\D/g, ''), 10) || 0

const clientesFiltrados = computed(() => {
  let lista = clientes.value
  if (filtro.value === 'activo') lista = lista.filter((c) => c.estado === 'activo')
  if (filtro.value === 'inactivo') lista = lista.filter((c) => c.estado !== 'activo')
  const reciente = (a, b) => numeroCodigo(b.codigo) - numeroCodigo(a.codigo)
  return [...lista].sort((a, b) => {
    if (orden.value === 'viajes') return (Number(b.viajes) || 0) - (Number(a.viajes) || 0) || reciente(a, b)
    if (orden.value === 'ganancia') return (Number(b.total_ganancia_viaje) || 0) - (Number(a.total_ganancia_viaje) || 0) || reciente(a, b)
    return reciente(a, b)
  })
})

async function cargarClientes() {
  cargandoLista.value = true
  try {
    const lista = await useCliente.obtenerClientes()
    // Estados siempre en minúscula para comparar ('activo' / 'inactivo')
    clientes.value = lista.map((c) => ({ ...c, estado: String(c.estado || '').toLowerCase() }))
  } finally {
    cargandoLista.value = false
  }
}

// ── Detalle ──

const detalle = ref(null)
const mostrarDetalle = ref(false)

async function verDetalle(codigo) {
  const data = await useCliente.obtenerdatoscliente(codigo)
  if (!data) return
  detalle.value = { ...data, estado: String(data.estado || '').toLowerCase() }
  mostrarDetalle.value = true
}

// "¿Cumple lo prometido?": un renglón por indicador, con color y una línea que lo explica
const indicadores = computed(() => {
  const d = detalle.value
  if (!d) return []
  const difPrecio = Number(d.diferencia_precio_total) || 0
  const menores = Number(d.viajes_precio_menor) || 0
  const merma = Number(d.valor_merma_total) || 0
  const difFactura = Number(d.diferencia_facturacion_total) || 0
  return [
    {
      etiqueta: 'Precio de la tonelada',
      valor: formatoPeso(difPrecio),
      clase: claseSigno(difPrecio),
      explicacion:
        difPrecio < 0
          ? 'Pagó la tonelada final más barata de lo que dijo al iniciar los viajes.'
          : difPrecio > 0
            ? 'Pagó la tonelada final más cara de lo que dijo al iniciar.'
            : 'Pagó la tonelada al precio que dijo al iniciar.',
    },
    {
      etiqueta: 'Viajes con precio menor',
      valor: `${menores} de ${d.viajes || 0}`,
      clase: menores > 0 ? 'text-negative' : 'text-positive',
      explicacion: menores > 0 ? 'Viajes en que bajó el precio de la tonelada al final.' : 'En ningún viaje bajó el precio prometido.',
    },
    {
      etiqueta: 'Merma (kilos perdidos)',
      valor: formatoPeso(-merma),
      clase: claseSigno(-merma),
      explicacion:
        merma > 0
          ? 'Lo que valen los kilos que se descargaron de menos frente a los cargados.'
          : 'No hubo pérdida de kilos entre el cargue y el descargue.',
    },
    {
      etiqueta: 'Facturado vs. estimado',
      valor: formatoPeso(difFactura),
      clase: claseSigno(difFactura),
      explicacion:
        difFactura < 0
          ? 'Se le facturó menos de lo que se calculó con kilos y precio final.'
          : difFactura > 0
            ? 'Se le facturó más de lo calculado con kilos y precio final.'
            : 'Lo facturado coincide con lo calculado (o aún no se ha facturado).',
    },
  ]
})

// ── Activar / desactivar ──
// El estado solo cambia en pantalla cuando el backend confirma.

const cambiandoEstado = ref(false)

function pedirCambioEstado() {
  const activar = detalle.value.estado !== 'activo'
  if (activar) return cambiarEstado(true)
  $q.dialog({
    title: `Desactivar ${detalle.value.empresa}`,
    message: 'No aparecerá al crear viajes nuevos. Sus viajes anteriores no cambian.',
    cancel: { flat: true, label: 'Cancelar', color: 'grey-8' },
    ok: { unelevated: true, label: 'Desactivar', color: 'negative' },
    persistent: true,
  }).onOk(() => cambiarEstado(false))
}

async function cambiarEstado(activar) {
  const codigo = detalle.value.codigo
  cambiandoEstado.value = true
  try {
    if (activar) await useCliente.putActivarCliente(codigo)
    else await useCliente.putDesactivarCliente(codigo)
    detalle.value.estado = activar ? 'activo' : 'inactivo'
    await cargarClientes()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message, position: 'bottom', timeout: 5000 })
  } finally {
    cambiandoEstado.value = false
  }
}

// ─────────────────────────────────────────────────────────────
// Crear / editar
// ─────────────────────────────────────────────────────────────

// Función (no objeto) para que cada formulario empiece limpio
const vacio = () => ({
  empresa: '',
  nit: '',
  telefono: '',
  email: '',
  tipo_pago: null,
  rete_fuente: 'no',
  rete_ica: '',
})

const dialogForm = ref(false)
const formulario = ref(vacio())
const codigoEditando = ref('') // el código va en la URL del PUT; nunca se toma del formulario
const guardando = ref(false)

/** Decimal escrito con coma o punto → número (null si vacío, NaN si no es número) */
function textoADecimal(texto) {
  const limpio = String(texto ?? '').trim().replace(/\s/g, '').replace(',', '.')
  if (limpio === '') return null
  return /^\d+(\.\d+)?$/.test(limpio) ? Number(limpio) : NaN
}

const reteIcaPorMil = computed(() => {
  const n = textoADecimal(formulario.value.rete_ica)
  return n > 0 ? (n * 10).toLocaleString('es-CO', { maximumFractionDigits: 2 }) : ''
})

function abrirCrear() {
  formulario.value = vacio()
  codigoEditando.value = ''
  dialogForm.value = true
}

function abrirEditar() {
  const d = detalle.value
  formulario.value = {
    empresa: d.empresa || '',
    nit: d.nit ? String(d.nit) : '',
    telefono: d.telefono ? String(d.telefono) : '',
    email: d.email || '',
    tipo_pago: d.tipo_pago || null,
    rete_fuente: d.rete_fuente === 'si' ? 'si' : 'no',
    rete_ica: Number(d.rete_ica) ? String(d.rete_ica).replace('.', ',') : '',
  }
  codigoEditando.value = d.codigo
  dialogForm.value = true
}

/** Validación síncrona: devuelve el primer error o '' */
function validarFormulario() {
  const f = formulario.value
  if (!f.empresa) return 'Escriba el nombre de la empresa'
  if (!f.nit) return 'Escriba el NIT'
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return 'El email no es válido'
  const ica = textoADecimal(f.rete_ica)
  if (ica !== null && !(ica >= 0 && ica <= 5)) {
    return 'El rete ICA va en porcentaje y debe estar entre 0 y 5. Si dice "x mil", divida entre 10.'
  }
  return ''
}

function armarDatos() {
  const f = formulario.value
  const ica = textoADecimal(f.rete_ica)
  return {
    empresa: f.empresa,
    nit: f.nit,
    telefono: f.telefono,
    email: f.email,
    tipo_pago: f.tipo_pago || '',
    rete_fuente: f.rete_fuente,
    // Con coma: el backend lee "0.966" como miles (966) y lo rechaza; "0,966" lo lee bien
    rete_ica: ica === null ? '0' : String(ica).replace('.', ','),
  }
}

async function guardar() {
  const error = validarFormulario()
  if (error) {
    $q.notify({ type: 'warning', message: error, position: 'bottom' })
    return
  }

  guardando.value = true
  try {
    let codigo = codigoEditando.value
    if (codigo) {
      await useCliente.putCliente(codigo, armarDatos())
    } else {
      const respuesta = await useCliente.postCliente(armarDatos())
      codigo = respuesta?.codigo
    }
    dialogForm.value = false
    await cargarClientes()
    if (codigo) await verDetalle(codigo)
  } catch (error) {
    // El diálogo sigue abierto con lo que llenó
    $q.notify({ type: 'negative', message: error.message, position: 'bottom', timeout: 5000 })
  } finally {
    guardando.value = false
  }
}

onMounted(() => {
  if (puedeVer.value) cargarClientes()
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
.tarjeta-inactiva {
  opacity: 0.65;
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
.metrica-chip {
  background: #f9fafb;
  border-radius: 8px;
  padding: 6px 8px;
  min-width: 0;
}
.metrica-label {
  font-size: 10px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.metrica-valor {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.indicador {
  padding: 7px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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
  padding: 8px 14px;
}
.ganancia-positiva {
  background: #f0fdf4;
  color: #166534;
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

<!-- Sin scoped: los usa el componente funcional Fila -->
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
