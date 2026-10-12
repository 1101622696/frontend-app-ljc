<template>
  <q-page padding class="bg-grey-2">
    <!-- ───────────── GUARDADOS EN EL CELULAR (sin señal) ───────────── -->
    <div v-if="pendientes.length" class="pendientes-box q-mb-md">
      <div class="row items-center q-mb-xs">
        <q-icon name="cloud_off" color="orange-9" size="20px" />
        <span class="text-subtitle2 q-ml-xs">Guardados en el celular</span>
        <q-space />
        <q-btn
          v-if="hayPorEnviar"
          flat
          dense
          no-caps
          color="primary"
          icon="cloud_upload"
          label="Enviar ahora"
          :loading="sincronizando"
          @click="enviarAhora"
        />
      </div>

      <q-card v-for="p in pendientes" :key="p.id" flat class="viaje-card q-mb-xs" :class="{ 'pendiente-error': p.estado === 'error' }">
        <q-card-section class="q-py-sm">
          <div class="row items-center no-wrap">
            <span class="placa-badge">{{ p.payload.placa || '—' }}</span>
            <span class="text-weight-bold q-ml-sm">{{ p.payload.codigo_viaje }}</span>
            <q-space />
            <q-badge v-if="p.estado === 'error'" color="negative" label="Rechazado" />
            <q-badge v-else color="orange" label="Esperando señal" />
          </div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Guardado {{ formatoFecha(p.payload._guardado, true) }} · Odómetro {{ formatoMiles(p.payload.odometro) }} km
          </div>
          <div v-if="p.estado === 'error'" class="text-body2 text-negative q-mt-xs">
            <q-icon name="error" /> {{ p.error }}
          </div>
          <div v-if="p.estado === 'error'" class="row justify-end q-gutter-sm q-mt-xs">
            <q-btn flat dense no-caps color="grey-8" icon="delete" label="Descartar" @click="descartarPendiente(p)" />
            <q-btn unelevated dense no-caps color="primary" icon="edit" label="Corregir" @click="abrirCorregir(p)" />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- ───────────── FILTROS ───────────── -->
    <div class="filter-bar q-mb-md">
      <div class="filter-scroll row no-wrap q-gutter-x-sm q-pb-xs">
        <q-chip
          clickable
          :color="!filtroPlaca ? 'primary' : 'grey-2'"
          :text-color="!filtroPlaca ? 'white' : 'grey-8'"
          class="filter-chip"
          @click="filtroPlaca = ''"
        >
          Todos
          <q-badge v-if="preoperacionales.length" rounded color="white" text-color="grey-9" class="q-ml-xs">
            {{ preoperacionales.length }}
          </q-badge>
        </q-chip>
        <template v-if="placasFiltro.length > 1">
          <q-chip
            v-for="placa in placasFiltro"
            :key="placa"
            clickable
            :color="filtroPlaca === placa ? 'primary' : 'grey-2'"
            :text-color="filtroPlaca === placa ? 'white' : 'grey-8'"
            class="filter-chip"
            @click="filtroPlaca = placa"
          >
            {{ placa }}
          </q-chip>
        </template>
        <q-chip
          clickable
          :color="soloFallas ? 'negative' : 'grey-2'"
          :text-color="soloFallas ? 'white' : 'grey-8'"
          icon="report"
          class="filter-chip"
          @click="soloFallas = !soloFallas"
        >
          Con fallas
        </q-chip>
      </div>
    </div>

    <!-- ───────────── LISTA ───────────── -->
    <div v-if="!filtrados.length && !cargandoLista" class="text-center text-grey-6 q-py-xl">
      <q-icon name="fact_check" size="48px" />
      <div class="q-mt-sm">
        {{ preoperacionales.length ? 'Ningún preoperacional con este filtro' : 'Aún no hay preoperacionales' }}
      </div>
    </div>

    <q-card
      v-for="p in mostrados"
      :key="p.consecutivo"
      flat
      class="viaje-card q-mb-sm cursor-pointer"
      @click="verDetalle(p)"
    >
      <q-card-section class="q-py-sm">
        <div class="row items-center no-wrap">
          <span class="placa-badge">{{ p.placa }}</span>
          <span class="text-weight-bold q-ml-sm">{{ p.consecutivo }}</span>
          <q-space />
          <q-badge v-if="fallasDe(p).criticos.length" color="negative" class="q-ml-xs">
            <q-icon name="warning" size="12px" class="q-mr-xs" />Frenos/llantas
          </q-badge>
          <q-badge v-else-if="fallasDe(p).total" color="orange" class="q-ml-xs" :label="`${fallasDe(p).total} no cumple`" />
          <q-badge v-else color="positive" label="Todo cumple" />
        </div>
        <div class="row items-center text-caption text-grey-7 q-mt-xs">
          <span>Viaje {{ p.codigo_viaje || '—' }} · {{ formatoMiles(p.odometro) || '—' }} km</span>
          <q-space />
          <span>{{ formatoFecha(p.fecha_creacion, true) }}</span>
        </div>
      </q-card-section>
    </q-card>

    <div v-if="filtrados.length > mostrados.length" class="text-center q-my-md">
      <q-btn outline rounded color="primary" label="Cargar más" @click="limite += POR_PAGINA" />
    </div>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" label="Preoperacional" @click="abrirCrear()" />
    </q-page-sticky>

    <!-- ───────────── DETALLE ───────────── -->
    <q-dialog v-model="mostrarDetalle" :maximized="$q.screen.lt.md">
      <q-card v-if="detalle" style="width: 600px; max-width: 100vw">
        <q-card-section class="row items-center q-pb-sm sticky-header">
          <span class="placa-badge-lg">{{ detalle.placa }}</span>
          <div class="q-ml-md">
            <div class="text-h6">{{ detalle.consecutivo }}</div>
            <div class="text-caption text-grey-7">{{ formatoFecha(detalle.fecha_creacion, true) }}</div>
          </div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-sm">
          <q-banner v-if="fallasDetalle.criticos.length" dense rounded class="bg-red-1 text-red-10 q-mb-md">
            <template #avatar><q-icon name="warning" color="negative" /></template>
            No cumple en frenos/llantas: <b>{{ fallasDetalle.criticos.join(', ') }}</b>. Se avisó al propietario.
          </q-banner>
          <q-banner v-else-if="fallasDetalle.total" dense rounded class="bg-orange-1 text-orange-10 q-mb-md">
            <template #avatar><q-icon name="report" color="orange-9" /></template>
            {{ fallasDetalle.total }} ítem(s) no cumplen. Están resaltados abajo.
          </q-banner>
          <q-banner v-else dense rounded class="bg-green-1 text-green-10 q-mb-md">
            <template #avatar><q-icon name="check_circle" color="positive" /></template>
            Todos los ítems cumplen.
          </q-banner>

          <div class="seccion-titulo">Información general</div>
          <Fila etiqueta="Viaje" :valor="detalle.codigo_viaje" />
          <Fila etiqueta="Odómetro" :valor="detalle.odometro ? `${formatoMiles(detalle.odometro)} km` : ''" />
          <Fila etiqueta="Galones" :valor="detalle.galones" />
          <Fila etiqueta="Registró" :valor="detalle.usuario" />
          <Fila etiqueta="Correo" :valor="detalle.correo_usuario" />
          <Fila etiqueta="Fecha" :valor="formatoFecha(detalle.fecha_creacion, true)" />

          <template v-for="seccion in SECCIONES" :key="seccion.titulo">
            <div class="seccion-titulo q-mt-md row items-center">
              <span>{{ seccion.titulo }}</span>
              <q-space />
              <span v-if="fallasSeccion(seccion)" class="text-negative">{{ fallasSeccion(seccion) }} no cumple</span>
            </div>
            <Fila
              v-for="campo in seccion.campos"
              :key="campo[0]"
              :etiqueta="campo[1]"
              :valor="textoItem(detalle[campo[0]])"
              :clase="noCumple(detalle[campo[0]]) ? 'text-negative text-weight-bold' : 'text-positive'"
              :clase-fila="noCumple(detalle[campo[0]]) ? (CRITICOS.includes(campo[0]) ? 'fila-falla fila-critica' : 'fila-falla') : ''"
            />
          </template>

          <div class="seccion-titulo q-mt-md">Documentos</div>
          <q-btn v-if="detalle.link" outline size="sm" icon="folder" label="Ver archivos" @click="abrirVisor(detalle.link, `Preoperacional ${detalle.consecutivo}`)" />
          <span v-else class="text-caption text-grey-6">Sin archivos</span>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-1 sticky-footer">
          <q-btn v-if="esGestion" flat color="grey-8" icon="edit" label="Editar" @click="abrirEditar(detalle)" />
          <q-space />
          <q-btn flat color="primary" label="Cerrar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ───────────── FORMULARIO (nuevo / editar / corregir guardado) ───────────── -->
    <q-dialog v-model="dialogForm" persistent :maximized="$q.screen.lt.md">
      <q-card class="column no-wrap" style="width: 640px; max-width: 100vw">
        <q-card-section class="bg-primary text-white row items-center q-py-sm">
          <div>
            <div class="text-h6">{{ tituloFormulario }}</div>
            <div class="text-caption">Revise el vehículo antes de salir</div>
          </div>
          <q-space />
          <q-btn flat round icon="close" :disable="guardando" v-close-popup />
        </q-card-section>

        <q-card-section class="col scroll q-pa-md">
          <!-- Datos principales -->
          <div class="seccion-form">
            <div class="text-subtitle2 text-primary q-mb-sm"><q-icon name="local_shipping" /> Datos principales</div>
            <div class="q-gutter-md">
              <q-input v-if="modo === 'editar'" :model-value="`${formulario.codigo_viaje} — ${formulario.placa}`" label="Viaje" outlined dense readonly />
              <q-select
                v-else
                v-model="formulario.codigo_viaje"
                :options="opcionesViaje"
                label="Viaje"
                outlined
                dense
                emit-value
                map-options
                bg-color="white"
                :hint="hintViaje"
              >
                <template #no-option>
                  <q-item><q-item-section class="text-grey-7">No hay viajes pendientes de preoperacional</q-item-section></q-item>
                </template>
              </q-select>

              <q-input v-if="modo === 'editar'" :model-value="`${formatoMiles(formulario.odometro)} km`" label="Odómetro" outlined dense readonly hint="El odómetro no se edita" />
              <CampoNumero
                v-else
                v-model="formulario.odometro"
                label="Odómetro (km)"
                sufijo="km"
                :hint="hintOdometro"
                :error="errorOdometro"
              />

              <q-input
                v-model="formulario.galones"
                label="Galones que tiene ahora el tanque"
                inputmode="decimal"
                outlined
                dense
                bg-color="white"
                suffix="gal"
                hint="Puede usar coma o punto, ej. 45,5"
                :error="Boolean(errorGalones)"
                :error-message="errorGalones"
              />
            </div>
          </div>

          <!-- Checklist por secciones -->
          <div v-for="seccion in SECCIONES" :key="seccion.titulo" class="seccion-form">
            <div class="text-subtitle2 text-primary q-mb-xs"><q-icon :name="seccion.icono" /> {{ seccion.titulo }}</div>
            <CampoPreoperacional
              v-for="campo in seccion.campos"
              :key="campo[0]"
              v-model="formulario[campo[0]]"
              :label="campo[1]"
              :critico="CRITICOS.includes(campo[0])"
            />
          </div>

          <!-- Archivos -->
          <div class="seccion-form">
            <div class="text-subtitle2 text-primary q-mb-sm"><q-icon name="attach_file" /> Fotos y documentos</div>
            <CampoArchivos
              v-model="formulario.archivos"
              label="Adjuntar (opcional)"
              multiple
              accept="image/*, application/pdf"
              :link-actual="linkActual"
            />
            <div v-if="modo === 'corregir' && archivosGuardados" class="text-caption text-grey-7 q-mt-xs">
              Ya tiene {{ archivosGuardados }} archivo(s) guardado(s) en el celular; se envían junto con este.
            </div>
          </div>
        </q-card-section>

        <!-- Avisos a la vista del botón (en el celular el formulario es largo) -->
        <q-card-section v-if="errorGuardar || fallasCriticasForm.length" class="q-py-sm q-gutter-y-sm">
          <q-banner v-if="errorGuardar" dense rounded class="bg-red-1 text-red-10">
            <template #avatar><q-icon name="error" color="negative" /></template>
            {{ errorGuardar }}
          </q-banner>
          <q-banner v-if="fallasCriticasForm.length" dense rounded class="bg-orange-1 text-orange-10">
            <template #avatar><q-icon name="warning" color="orange-9" /></template>
            No cumple: <b>{{ fallasCriticasForm.join(', ') }}</b>. Se avisará al propietario. Puede viajar, pero revise esto cuanto antes.
          </q-banner>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="Cancelar" color="grey-8" :disable="guardando" v-close-popup />
          <q-btn unelevated color="primary" :label="etiquetaGuardar" :loading="guardando" @click="guardar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ───────────── CONFIRMAR DESCARTE ───────────── -->
    <q-dialog :model-value="Boolean(porDescartar)" persistent @update:model-value="porDescartar = null">
      <q-card style="width: 380px; max-width: 95vw">
        <q-card-section class="text-h6">Descartar preoperacional</q-card-section>
        <q-card-section class="q-pt-none">
          Se borrará del celular el preoperacional del viaje <b>{{ porDescartar?.payload?.codigo_viaje }}</b>. No se puede deshacer.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-8" @click="porDescartar = null" />
          <q-btn unelevated label="Descartar" color="negative" @click="confirmarDescarte" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, h } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { useStorePreoperacionales } from '../stores/preoperacionales'
import { useStoreUsuarios } from '../stores/usuarios'
import {
  guardarPendiente,
  guardarArchivosOffline,
  listarPendientes,
  actualizarPendiente,
  eliminarPendiente,
  guardarCache,
  leerCache,
} from '../composables/offlineDB'
import { sincronizarPendientes, enviarPendiente, EVENTO_PENDIENTES } from '../composables/sincronizador'
import { useVisorArchivos } from '../composables/useVisorArchivos'
import CampoPreoperacional from 'src/components/CampoPreoperacional.vue'
import CampoArchivos from 'components/CampoArchivos.vue'
import CampoNumero from 'components/viajes/CampoNumero.vue'
import { formatoFecha, formatoMiles } from '../utils/formato'

defineOptions({ name: 'PreoperacionalesPage' })

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const usePreop = useStorePreoperacionales()
const useUsuario = useStoreUsuarios()

// Visor de archivos (con pellizco), montado una sola vez en MainLayout
const { abrirArchivos: abrirVisor } = useVisorArchivos()

// Fila "etiqueta: valor" del detalle (como en ViajesPage) + clase para resaltar la fila
const Fila = (props) =>
  h('div', { class: ['detalle-fila', props.claseFila] }, [
    h('span', { class: 'detalle-label' }, props.etiqueta),
    h('span', { class: ['detalle-valor', props.clase] }, props.valor === '' || props.valor === undefined || props.valor === null ? '—' : props.valor),
  ])
Fila.props = ['etiqueta', 'valor', 'clase', 'claseFila']

// ── Checklist (mismo orden en el formulario y en el detalle) ──

const SECCIONES = [
  {
    titulo: 'Motor y fluidos',
    icono: 'oil_barrel',
    campos: [
      ['nivel_agua', 'Nivel de agua'],
      ['nivel_aceite', 'Nivel de aceite'],
      ['refrigerante', 'Refrigerante'],
      ['fugas_visibles', 'Sin fugas visibles'],
      ['correas', 'Correas en buen estado'],
      ['filtro_aire', 'Filtro de aire'],
    ],
  },
  {
    titulo: 'Sistema de frenos',
    icono: 'do_not_disturb_on',
    campos: [
      ['presion_frenos', 'Presión aire 100–125 PSI'],
      ['fugas_audibles', 'Sin fugas audibles'],
      ['freno_parqueo', 'Freno de parqueo'],
      ['abs_sintestigo', 'ABS sin testigo'],
      ['prueba_freno', 'Prueba de frenado'],
    ],
  },
  {
    titulo: 'Llantas y suspensión',
    icono: 'tire_repair',
    campos: [
      ['presion_llantas', 'Presión adecuada en llantas'],
      ['desgaste_llantas', 'Sin desgaste irregular'],
      ['tuercas_ajustadas', 'Tuercas ajustadas'],
      ['suspension_fisuras', 'Suspensión sin fisuras'],
    ],
  },
  {
    titulo: 'Acople y quinta rueda',
    icono: 'link',
    campos: [
      ['quinta_rueda', 'Quinta rueda lubricada'],
      ['pasador_rey', 'Pasador rey asegurado'],
      ['mangueras_aire', 'Mangueras de aire y cable eléctrico'],
      ['seguro_acople', 'Seguro del acople verificado'],
    ],
  },
  {
    titulo: 'Dirección y transmisión',
    icono: 'settings',
    campos: [
      ['volante', 'Volante sin juego excesivo'],
      ['sin_fugas', 'Sin fugas hidráulicas'],
      ['cambios_suave', 'Cambios entran suavemente'],
      ['sin_ruidos', 'Sin ruidos anormales en diferencial'],
    ],
  },
  {
    titulo: 'Sistema eléctrico y señalización',
    icono: 'lightbulb',
    campos: [
      ['luces_altas_bajas', 'Luces altas y bajas'],
      ['direccionales', 'Direccionales'],
      ['luces_freno', 'Luces de freno'],
      ['luces_remolque', 'Luces del remolque'],
      ['testigo_tablero', 'Testigos del tablero'],
      ['pito', 'Pito / bocina'],
      ['alarma_retroceso', 'Alarma de retroceso'],
    ],
  },
  {
    titulo: 'Cabina y elementos obligatorios',
    icono: 'health_and_safety',
    campos: [
      ['cinturon_seguridad', 'Cinturón de seguridad'],
      ['espejos', 'Espejos ajustados'],
      ['extintor_cabezote', 'Extintor cabezote vigente'],
      ['extintor_trailer', 'Extintor tráiler vigente'],
      ['botiquin', 'Botiquín completo'],
      ['triangulos_reflectivos', 'Triángulos reflectivos'],
      ['kit_carretera', 'Kit de carretera'],
    ],
  },
  {
    titulo: 'Otros',
    icono: 'checklist',
    campos: [
      ['senalizacion_conduzco', 'Señalización "Conduzco"'],
      ['estado_carpa', 'Estado de la carpa'],
      ['placas_visibles', 'Placas visibles'],
    ],
  },
]
const ITEMS = SECCIONES.flatMap((s) => s.campos.map(([campo]) => campo))
const ETIQUETAS = Object.fromEntries(SECCIONES.flatMap((s) => s.campos))

// Frenos y llantas: si no cumplen, el backend avisa al propietario y al admin (no bloquea el viaje)
const CRITICOS = ['presion_frenos', 'freno_parqueo', 'abs_sintestigo', 'prueba_freno', 'presion_llantas', 'desgaste_llantas', 'tuercas_ajustadas']

/** 'No Cumple', 'No Cumple: obs.' o (registros viejos) la observación sola */
function noCumple(valor) {
  const t = String(valor ?? '').trim().toLowerCase()
  return t !== '' && !['cumple', 'si', 'sí', 'ok', 'n/a'].includes(t) && !t.startsWith('no aplica')
}
const textoItem = (valor) => String(valor ?? '').trim()

function fallasDe(registro) {
  const fallas = ITEMS.filter((c) => noCumple(registro?.[c]))
  return { total: fallas.length, criticos: fallas.filter((c) => CRITICOS.includes(c)).map((c) => ETIQUETAS[c]) }
}

// ── Perfil ──

const esGestion = computed(() => ['administrador', 'propietario'].includes(useUsuario.perfile))
const misPlacas = computed(() =>
  String(useUsuario.user?.placa_asignada || '')
    .split(',')
    .map((p) => p.trim().toUpperCase())
    .filter(Boolean),
)

const avisar = (mensaje) => {
  $q.notify({ type: 'warning', message: mensaje, position: 'bottom' })
  return false
}

// ── Lista ──

const POR_PAGINA = 30
const preoperacionales = ref([])
const cargandoLista = ref(false)
const filtroPlaca = ref('')
const soloFallas = ref(false)
const limite = ref(POR_PAGINA)

const placasFiltro = computed(() =>
  [...new Set([...misPlacas.value, ...preoperacionales.value.map((p) => p.placa)])].filter(Boolean).sort(),
)

const filtrados = computed(() =>
  preoperacionales.value.filter(
    (p) => (!filtroPlaca.value || p.placa === filtroPlaca.value) && (!soloFallas.value || fallasDe(p).total > 0),
  ),
)
const mostrados = computed(() => filtrados.value.slice(0, limite.value))

watch([filtroPlaca, soloFallas], () => {
  limite.value = POR_PAGINA
})

async function cargarLista() {
  cargandoLista.value = true
  try {
    preoperacionales.value = await usePreop.listar()
  } finally {
    cargandoLista.value = false
  }
}

// ── Detalle ──

const detalle = ref(null)
const mostrarDetalle = ref(false)
const fallasDetalle = computed(() => fallasDe(detalle.value))
const fallasSeccion = (seccion) => seccion.campos.filter((campo) => noCumple(detalle.value?.[campo[0]])).length

function verDetalle(registro) {
  detalle.value = registro
  mostrarDetalle.value = true
}

// ── Viajes que esperan preoperacional (con copia local para llenarlo sin señal) ──

const viajesAbiertos = ref([])
const odometros = ref({})
const copiaLocalDel = ref('') // fecha de la copia local cuando se está usando
const claveCache = computed(() => `preop_viajes_${useUsuario.user?.email || ''}`)

async function cargarViajes() {
  const r = await usePreop.obtenerViajesPendientes()
  if (r) {
    viajesAbiertos.value = r.viajes
    odometros.value = r.odometros
    copiaLocalDel.value = ''
    guardarCache(claveCache.value, { ...r, guardado: new Date().toISOString() })
    return
  }
  const copia = leerCache(claveCache.value)
  if (copia) {
    viajesAbiertos.value = copia.viajes || []
    odometros.value = copia.odometros || {}
    copiaLocalDel.value = copia.guardado || ''
  }
}

// ── Guardados en el celular ──

const pendientes = ref([])
const sincronizando = ref(false)
const hayPorEnviar = computed(() => pendientes.value.some((p) => p.estado === 'pendiente'))

async function cargarPendientes() {
  try {
    pendientes.value = await listarPendientes('preoperacional')
  } catch {
    pendientes.value = []
  }
}

async function enviarAhora() {
  if (navigator.onLine === false) return avisar('Todavía no hay señal. Se enviará solo cuando vuelva.')
  sincronizando.value = true
  try {
    await sincronizarPendientes()
  } finally {
    sincronizando.value = false
  }
}

const porDescartar = ref(null)

function descartarPendiente(p) {
  porDescartar.value = p
}

async function confirmarDescarte() {
  const p = porDescartar.value
  porDescartar.value = null
  if (!p) return
  try {
    await eliminarPendiente(p.id)
  } catch (e) {
    $q.notify({ type: 'negative', message: `No se pudo borrar: ${e.message}`, position: 'bottom' })
  }
  await cargarPendientes()
}

// Cuando el sincronizador termina (en cualquier pantalla) se refresca todo
async function alSincronizar() {
  await cargarPendientes()
  if (navigator.onLine !== false) await Promise.all([cargarLista(), cargarViajes()])
}

// ── Formulario ──

const vacio = () => ({
  codigo_viaje: null,
  placa: '',
  odometro: null,
  galones: '',
  ...Object.fromEntries(ITEMS.map((campo) => [campo, 'Cumple'])),
  archivos: [],
})

const dialogForm = ref(false)
const modo = ref('crear') // 'crear' | 'editar' | 'corregir'
const formulario = ref(vacio())
const editando = ref(null) // consecutivo (editar) o pendiente del celular (corregir)
const guardando = ref(false)
const errorGuardar = ref('')

const tituloFormulario = computed(
  () => ({ crear: 'Nuevo preoperacional', editar: `Editar ${editando.value}`, corregir: 'Corregir preoperacional guardado' })[modo.value],
)
const etiquetaGuardar = computed(() => (modo.value === 'editar' ? 'Guardar cambios' : 'Guardar preoperacional'))
const linkActual = computed(() => (modo.value === 'editar' ? detalle.value?.link || '' : ''))
const archivosGuardados = computed(() => (modo.value === 'corregir' ? editando.value?.payload?._archivos?.length || 0 : 0))

const etiquetaViaje = (v) =>
  `${v.consecutivo} — ${v.placa} — ${v.destino || 'sin destino'}${v.cliente_nombre ? ` (${v.cliente_nombre})` : ''}`

/** Viajes elegibles, sin los que ya tienen un preoperacional guardado en el celular */
const opcionesViaje = computed(() => {
  const propio = modo.value === 'corregir' ? editando.value?.payload?.codigo_viaje : null
  const enCelular = new Set(pendientes.value.map((p) => p.payload.codigo_viaje).filter((c) => c !== propio))
  return viajesAbiertos.value.filter((v) => !enCelular.has(v.consecutivo)).map((v) => ({ label: etiquetaViaje(v), value: v.consecutivo, placa: v.placa }))
})

const viajeElegido = computed(() => viajesAbiertos.value.find((v) => v.consecutivo === formulario.value.codigo_viaje))
// La placa sale del viaje (al corregir, si el viaje ya no aparece, se conserva la guardada)
const placaFormulario = computed(() => viajeElegido.value?.placa || formulario.value.placa || '')
const odometroActual = computed(() => Number(odometros.value[placaFormulario.value]) || 0)

const hintViaje = computed(() => {
  if (copiaLocalDel.value) return `Sin señal: viajes guardados el ${formatoFecha(copiaLocalDel.value, true)}`
  return opcionesViaje.value.length ? '' : 'No hay viajes abiertos sin preoperacional. Primero solicite el anticipo del viaje.'
})
const hintOdometro = computed(() =>
  odometroActual.value ? `Odómetro actual del vehículo: ${formatoMiles(odometroActual.value)} km` : 'Kilometraje del tablero',
)
const errorOdometro = computed(() => {
  const km = formulario.value.odometro
  return km && odometroActual.value && km < odometroActual.value
    ? `No puede ser menor al actual (${formatoMiles(odometroActual.value)} km)`
    : ''
})

/** '45,5' o '45.5' → 45.5 ; vacío o inválido → null */
function aDecimal(texto) {
  const limpio = String(texto ?? '').trim().replace(',', '.')
  if (!limpio || !/^\d+(\.\d+)?$/.test(limpio)) return null
  return Number(limpio)
}
const errorGalones = computed(() => {
  const texto = String(formulario.value.galones ?? '').trim()
  if (!texto) return ''
  const n = aDecimal(texto)
  return n === null ? 'Escriba solo el número, ej. 45,5' : n > 300 ? 'Revise los galones: parece demasiado' : ''
})

const fallasCriticasForm = computed(() => CRITICOS.filter((c) => noCumple(formulario.value[c])).map((c) => ETIQUETAS[c]))

function abrirCrear(codigo = null) {
  if (!opcionesViaje.value.length) {
    return avisar('No tiene viajes pendientes de preoperacional. El preoperacional va amarrado a un viaje: primero solicite el anticipo.')
  }
  modo.value = 'crear'
  editando.value = null
  errorGuardar.value = ''
  formulario.value = vacio()
  // Con un solo viaje pendiente (lo normal para el conductor) se deja elegido
  formulario.value.codigo_viaje = codigo || (opcionesViaje.value.length === 1 ? opcionesViaje.value[0].value : null)
  dialogForm.value = true
}

function abrirEditar(registro) {
  modo.value = 'editar'
  editando.value = registro.consecutivo
  errorGuardar.value = ''
  formulario.value = {
    ...vacio(),
    ...Object.fromEntries(ITEMS.map((campo) => [campo, textoItem(registro[campo])])),
    codigo_viaje: registro.codigo_viaje,
    placa: registro.placa,
    odometro: Number(registro.odometro) || null,
    galones: String(registro.galones ?? '').replace('.', ','),
  }
  dialogForm.value = true
}

function abrirCorregir(pendiente) {
  const p = pendiente.payload
  modo.value = 'corregir'
  editando.value = pendiente
  errorGuardar.value = pendiente.error || ''
  formulario.value = {
    ...vacio(),
    ...Object.fromEntries(ITEMS.map((campo) => [campo, p[campo] ?? 'Cumple'])),
    codigo_viaje: p.codigo_viaje || null,
    placa: p.placa || '',
    odometro: Number(p.odometro) || null,
    galones: String(p.galones ?? '').replace('.', ','),
  }
  dialogForm.value = true
}

/** Síncrona: devuelve el primer error o '' */
function validar() {
  const f = formulario.value
  if (modo.value !== 'editar') {
    if (!f.codigo_viaje) return 'Seleccione el viaje'
    if (!placaFormulario.value) return 'El viaje no tiene placa'
    if (!f.odometro) return 'Escriba el odómetro'
    if (errorOdometro.value) return `El odómetro ${errorOdometro.value.charAt(0).toLowerCase()}${errorOdometro.value.slice(1)}`
  }
  // Al editar registros viejos sin galones no se obliga
  if (modo.value !== 'editar' && !String(f.galones ?? '').trim()) return 'Escriba los galones que tiene ahora el tanque'
  if (errorGalones.value) return errorGalones.value
  return ''
}

/** Datos planos (sirven para FormData y para guardarlos en el celular) */
function armarPayload() {
  const f = formulario.value
  return {
    codigo_viaje: f.codigo_viaje,
    placa: placaFormulario.value,
    odometro: String(f.odometro ?? ''),
    galones: String(aDecimal(f.galones) ?? ''),
    ...Object.fromEntries(ITEMS.map((campo) => [campo, f[campo] || 'Cumple'])),
  }
}

function aFormData(datos, archivos = []) {
  const fd = new FormData()
  Object.entries(datos).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== '') fd.append(k, String(v))
  })
  archivos.forEach((a) => fd.append('archivos', a))
  return fd
}

async function guardar() {
  errorGuardar.value = ''
  const error = validar()
  if (error) return avisar(error)

  guardando.value = true
  try {
    if (modo.value === 'editar') await guardarEdicion()
    else if (modo.value === 'corregir') await guardarCorreccion()
    else await guardarNuevo()
  } catch (e) {
    // Error del backend o del celular: el formulario sigue abierto con lo que llenó
    errorGuardar.value = e.message
    $q.notify({ type: 'negative', message: e.message, position: 'bottom', timeout: 5000 })
  } finally {
    guardando.value = false
  }
}

async function guardarNuevo() {
  const payload = armarPayload()
  if (navigator.onLine === false) return guardarEnCelular(payload)
  try {
    await usePreop.crear(aFormData(payload, formulario.value.archivos))
  } catch (e) {
    // Sin respuesta del servidor (señal mala aunque el celular diga que hay red): se guarda en el celular
    if (e.sinConexion) return guardarEnCelular(payload)
    throw e
  }
  dialogForm.value = false
  await Promise.all([cargarLista(), cargarViajes()])
}

async function guardarEnCelular(payload) {
  const archivos = await guardarArchivosOffline(formulario.value.archivos)
  await guardarPendiente('preoperacional', { ...payload, _archivos: archivos, _guardado: new Date().toISOString() })
  dialogForm.value = false
  await cargarPendientes()
  $q.notify({
    type: 'warning',
    icon: 'cloud_off',
    message: 'Sin señal: el preoperacional quedó guardado en el celular. Se enviará solo cuando vuelva la señal.',
    position: 'bottom',
    timeout: 6000,
  })
}

async function guardarCorreccion() {
  const item = editando.value
  // Los archivos nuevos se guardan en el celular junto con los que ya tenía
  const nuevos = await guardarArchivosOffline(formulario.value.archivos)
  const payload = {
    ...armarPayload(),
    _archivos: [...(item.payload._archivos || []), ...nuevos],
    _guardado: item.payload._guardado || new Date().toISOString(),
  }
  await actualizarPendiente(item.id, payload)
  // Ya quedaron guardados: si se vuelve a intentar no se duplican
  item.payload = payload
  formulario.value.archivos = []

  if (navigator.onLine === false) {
    dialogForm.value = false
    await cargarPendientes()
    return avisar('Corregido. Se enviará cuando vuelva la señal.')
  }
  try {
    await enviarPendiente({ id: item.id, tipo: 'preoperacional', payload })
  } catch (e) {
    if (e.rechazado) throw e // el backend sigue rechazándolo: el formulario queda abierto con el mensaje
    dialogForm.value = false
    await cargarPendientes()
    return avisar('Corregido, pero no hay buena señal. Se enviará solo.')
  }
  $q.notify({ type: 'positive', message: `Preoperacional del viaje ${payload.codigo_viaje} enviado`, position: 'bottom' })
  dialogForm.value = false
  await Promise.all([cargarPendientes(), cargarLista(), cargarViajes()])
}

async function guardarEdicion() {
  const f = formulario.value
  const datos = {
    galones: String(aDecimal(f.galones) ?? ''),
    ...Object.fromEntries(ITEMS.map((campo) => [campo, f[campo] || 'Cumple'])),
  }
  const consecutivo = editando.value
  await usePreop.editar(consecutivo, aFormData(datos, f.archivos))
  dialogForm.value = false
  await cargarLista()
  // El detalle queda abierto con los datos nuevos
  const actualizado = preoperacionales.value.find((p) => p.consecutivo === consecutivo)
  if (actualizado) detalle.value = actualizado
}

// ── Viene desde Viajes con ?viaje=V-12 ──

let listo = false

function abrirDesdeRuta() {
  const codigo = String(route.query.viaje || '').trim().toUpperCase()
  if (!codigo) return
  // Se quita de la URL para que no se vuelva a abrir al recargar
  const resto = { ...route.query }
  delete resto.viaje
  router.replace({ query: resto })

  if (opcionesViaje.value.some((o) => o.value === codigo)) return abrirCrear(codigo)
  if (pendientes.value.some((p) => p.payload.codigo_viaje === codigo)) {
    return avisar(`El preoperacional del viaje ${codigo} ya está guardado en el celular, esperando señal.`)
  }
  avisar(`El viaje ${codigo} no está pendiente de preoperacional (ya lo tiene, está cerrado o no es de sus placas).`)
}

watch(
  () => route.query.viaje,
  (valor) => {
    if (valor && listo) abrirDesdeRuta()
  },
)

// ── Inicio ──

onMounted(async () => {
  window.addEventListener(EVENTO_PENDIENTES, alSincronizar)
  await cargarPendientes()
  await Promise.all([cargarLista(), cargarViajes()])
  listo = true
  abrirDesdeRuta()
  // Por si quedó algo guardado de otra vez y ya hay señal
  if (hayPorEnviar.value) sincronizarPendientes()
})

onBeforeUnmount(() => {
  window.removeEventListener(EVENTO_PENDIENTES, alSincronizar)
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
.pendientes-box {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 12px;
  padding: 10px 12px;
}
.pendiente-error {
  border-color: #fca5a5 !important;
  background: #fef2f2;
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
.seccion-form {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
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
.fila-falla {
  background: #fef2f2;
  padding-left: 8px;
  padding-right: 8px;
  border-radius: 6px;
}
.fila-critica {
  border-left: 4px solid #dc2626;
}
</style>
