<template>
  <q-page padding class="bg-grey-2">
    <!-- Saludo -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h6 text-weight-bold">Hola, {{ primerNombre }}</div>
        <div class="text-caption text-grey-7">{{ formatoFecha(hoyISO()) }} · {{ nombrePerfil }}</div>
      </div>
      <q-btn flat round icon="refresh" :loading="cargando" @click="cargar" />
    </div>

    <div v-if="cargando && !cargado" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-sm text-grey-7">Cargando…</div>
    </div>

    <template v-else>
      <!-- ═════════ CONDUCTOR ═════════ -->
      <template v-if="esConductor">
        <!-- Viaje en curso y qué sigue -->
        <q-card flat class="tarjeta q-mb-md">
          <q-card-section>
            <div class="text-overline text-grey-7">Mi viaje</div>
            <template v-if="viajeActual">
              <div class="row items-center q-gutter-sm q-mb-xs">
                <span class="placa-badge">{{ viajeActual.placa }}</span>
                <span class="text-weight-bold">{{ viajeActual.consecutivo }}</span>
                <q-badge :color="colorEstado(viajeActual.estado_viaje)" :label="nombreEstado(viajeActual.estado_viaje)" />
              </div>
              <div class="text-body2">{{ viajeActual.cliente_nombre }} → {{ viajeActual.destino || '—' }}</div>
              <div class="text-caption text-grey-7">Desde {{ formatoFecha(viajeActual.fecha_inicio) }}</div>
              <q-banner dense rounded class="q-mt-sm" :class="pasoConductor.clase">
                <template #avatar><q-icon :name="pasoConductor.icono" /></template>
                {{ pasoConductor.texto }}
              </q-banner>
            </template>
            <div v-else class="text-body2 text-grey-8">No tiene viajes abiertos.</div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              v-if="viajeActual && pasoConductor.preoperacional"
              unelevated color="teal" icon="fact_check" label="Hacer preoperacional"
              :to="{ name: 'PreoperacionalesPage', query: { viaje: viajeActual.consecutivo } }"
            />
            <q-btn
              v-if="viajeActual"
              flat color="primary" label="Ver viaje"
              :to="{ name: 'ViajesPage', query: { viaje: viajeActual.consecutivo } }"
            />
            <q-btn v-else unelevated color="primary" icon="add" label="Solicitar viaje" :to="{ name: 'ViajesPage' }" />
          </q-card-actions>
        </q-card>

        <!-- Plata pendiente -->
        <div class="row q-col-gutter-sm q-mb-md">
          <div class="col-6">
            <q-card flat class="tarjeta full-height cursor-pointer" @click="ir('NominaPage')">
              <q-card-section>
                <div class="text-caption text-grey-7">Por liquidar ({{ miNomina?.viajes_por_liquidar || 0 }} viajes)</div>
                <div class="text-h6 text-weight-bold" :class="claseSigno(saldoConductor)">{{ formatoPeso(saldoConductor) }}</div>
                <div v-if="miNomina?.arrastre_anterior" class="text-caption text-negative">
                  Incluye deuda anterior {{ formatoPeso(miNomina.arrastre_anterior) }}
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-6">
            <q-card flat class="tarjeta full-height cursor-pointer" @click="ir('PrestamosPage')">
              <q-card-section>
                <div class="text-caption text-grey-7">Préstamos por descontar</div>
                <div class="text-h6 text-weight-bold">{{ formatoPeso(prestamos.por_descontar) }}</div>
                <div v-if="prestamos.totales?.pendiente" class="text-caption text-orange-9">
                  {{ prestamos.totales.pendiente }} solicitud(es) en espera
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Accesos rápidos -->
        <div class="text-overline text-grey-7">Registrar</div>
        <div class="row q-col-gutter-sm q-mb-md">
          <div v-for="a in accesosConductor" :key="a.ruta" class="col-4">
            <q-card flat class="tarjeta text-center cursor-pointer acceso" @click="ir(a.ruta)">
              <q-icon :name="a.icono" size="28px" :color="a.color" />
              <div class="text-caption q-mt-xs">{{ a.texto }}</div>
            </q-card>
          </div>
        </div>
      </template>

      <!-- ═════════ ADMINISTRADOR / PROPIETARIO ═════════ -->
      <template v-else>
        <div class="text-overline text-grey-7">Pendientes de viajes</div>
        <div class="row q-col-gutter-sm q-mb-md">
          <div v-for="t in tareasViajes" :key="t.estado" class="col-6 col-sm-3">
            <q-card
              flat
              class="tarjeta full-height cursor-pointer"
              :class="{ 'tarjeta-activa': t.cantidad > 0 }"
              @click="ir('ViajesPage')"
            >
              <q-card-section class="q-pa-sm">
                <div class="row items-center no-wrap">
                  <q-icon :name="t.icono" :color="t.cantidad ? t.color : 'grey-5'" size="22px" class="q-mr-sm" />
                  <div class="text-h5 text-weight-bold" :class="t.cantidad ? '' : 'text-grey-5'">{{ t.cantidad }}</div>
                </div>
                <div class="text-caption text-grey-8">{{ t.texto }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Lista de lo que hay que hacer, en orden de urgencia -->
        <q-card flat class="tarjeta q-mb-md">
          <q-card-section class="q-pb-none">
            <div class="text-subtitle1 text-weight-bold">Por hacer</div>
          </q-card-section>
          <q-list separator>
            <q-item v-for="p in porHacer" :key="p.clave" clickable @click="p.accion()">
              <q-item-section avatar>
                <q-icon :name="p.icono" :color="p.color" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ p.titulo }}</q-item-label>
                <q-item-label caption>{{ p.detalle }}</q-item-label>
              </q-item-section>
              <q-item-section side><q-icon name="chevron_right" /></q-item-section>
            </q-item>
            <q-item v-if="!porHacer.length">
              <q-item-section avatar><q-icon name="check_circle" color="positive" /></q-item-section>
              <q-item-section class="text-grey-8">Todo al día</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </template>

      <!-- ═════════ TODOS: documentos de los vehículos ═════════ -->
      <q-card v-if="alertasDocumentos.length || alertaLicencia" flat class="tarjeta q-mb-md">
        <q-card-section class="q-pb-none">
          <div class="text-subtitle1 text-weight-bold">Documentos</div>
        </q-card-section>
        <q-list separator>
          <q-item v-if="alertaLicencia">
            <q-item-section avatar><q-icon name="badge" :color="alertaLicencia.color" /></q-item-section>
            <q-item-section>
              <q-item-label>Mi licencia de conducción</q-item-label>
              <q-item-label caption :class="`text-${alertaLicencia.color}`">{{ alertaLicencia.texto }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-for="d in alertasDocumentos" :key="d.clave" clickable @click="ir('VehiculosPage')">
            <q-item-section avatar><q-icon name="description" :color="d.color" /></q-item-section>
            <q-item-section>
              <q-item-label><span class="placa-badge q-mr-sm">{{ d.placa }}</span>{{ d.documento }}</q-item-label>
              <q-item-label caption :class="`text-${d.color}`">{{ d.texto }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>

      <!-- ═════════ TODOS: últimos viajes ═════════ -->
      <div class="row items-center q-mb-xs">
        <div class="text-overline text-grey-7 col">Últimos viajes</div>
        <q-btn flat dense no-caps color="primary" label="Ver todos" :to="{ name: 'ViajesPage' }" />
      </div>
      <q-card
        v-for="v in ultimosViajes"
        :key="v.consecutivo"
        flat
        class="viaje-card q-mb-sm cursor-pointer"
        @click="abrirViaje(v.consecutivo)"
      >
        <q-card-section class="q-py-sm">
          <div class="row items-center no-wrap">
            <span class="placa-badge">{{ v.placa }}</span>
            <span class="q-ml-sm text-weight-bold">{{ v.consecutivo }}</span>
            <q-space />
            <q-badge :color="colorEstado(v.estado_viaje)" :label="nombreEstado(v.estado_viaje)" />
          </div>
          <div class="text-caption text-grey-8 ellipsis q-mt-xs">
            {{ formatoFecha(v.fecha_inicio) }} · {{ v.cliente_nombre }} → {{ v.destino || '—' }}
          </div>
        </q-card-section>
      </q-card>
      <div v-if="!ultimosViajes.length" class="text-center text-grey-7 q-pa-md">Aún no hay viajes.</div>
    </template>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreUsuarios } from '../stores/usuarios'
import { useStoreViajes } from '../stores/viajes'
import { useStoreVehiculos } from '../stores/vehiculos'
import { useStoreNominas } from '../stores/nomina'
import { useStorePrestamos } from '../stores/prestamos'
import { useStoreMantenimiento } from '../stores/mantenimientos'
import { formatoPeso, formatoFecha, hoyISO } from '../utils/formato'

defineOptions({ name: 'HomePage' })

// Inicio según el perfil, armado con las mismas consultas de cada pantalla
// (el backend ya filtra por placas: cada quien recibe solo lo suyo).

const router = useRouter()
const useUsuario = useStoreUsuarios()
const useViaje = useStoreViajes()
const useVehiculo = useStoreVehiculos()
const useNomina = useStoreNominas()
const usePrestamo = useStorePrestamos()
const useMantenimiento = useStoreMantenimiento()

const esConductor = computed(() => useUsuario.esConductor)
const esAdmin = computed(() => useUsuario.esAdmin)

const primerNombre = computed(() => String(useUsuario.user?.nombre || '').trim().split(/\s+/)[0] || '')
const nombrePerfil = computed(
  () => ({ administrador: 'Administrador', propietario: 'Propietario', conductor: 'Conductor' })[useUsuario.perfile] || ''
)

/** Placas del usuario, sin espacios ('SNT473, STA778' → ['SNT473', 'STA778']) */
const misPlacas = computed(() =>
  String(useUsuario.user?.placa_asignada || '')
    .split(',')
    .map((p) => p.replace(/\s+/g, '').toUpperCase())
    .filter(Boolean)
)

// ── Estados del viaje (mismos de ViajesPage) ──

const ESTADOS = [
  { valor: 'solicitado', etiqueta: 'Solicitado', color: 'grey-7' },
  { valor: 'anticipo_consignado', etiqueta: 'Consignado', color: 'teal' },
  { valor: 'completado', etiqueta: 'Por aprobar', color: 'orange' },
  { valor: 'aprobado', etiqueta: 'Aprobado', color: 'blue' },
  { valor: 'facturado', etiqueta: 'Facturado', color: 'purple' },
  { valor: 'pagado', etiqueta: 'Pagado', color: 'positive' },
]
const nombreEstado = (e) => ESTADOS.find((x) => x.valor === e)?.etiqueta || e
const colorEstado = (e) => ESTADOS.find((x) => x.valor === e)?.color || 'grey'
const claseSigno = (n) => (Number(n) > 0 ? 'text-positive' : Number(n) < 0 ? 'text-negative' : '')

// ── Datos ──

const cargando = ref(false)
const cargado = ref(false)
const viajes = ref([])
const conteo = ref({})
const vehiculos = ref([])
const pendientesNomina = ref([])
const prestamos = ref({ datos: [], totales: {}, por_descontar: 0 })
const mantenimientos = ref([])

async function cargar() {
  cargando.value = true
  try {
    const consultas = [
      useViaje.listarViajes({ limite: 50 }),
      useVehiculo.obtenerVehiculos(),
      useNomina.obtenerPendientes(),
      usePrestamo.listarPrestamos(),
    ]
    // Mantenimientos solo para quien los gestiona (el conductor recibiría 403)
    if (!esConductor.value) {
      consultas.push(useMantenimiento.listarMantenimientos({ esAdmin: esAdmin.value, placas: misPlacas.value }))
    }
    const [rViajes, rVehiculos, rNomina, rPrestamos, rMant] = await Promise.all(consultas)
    viajes.value = rViajes?.datos || []
    conteo.value = rViajes?.conteo || {}
    vehiculos.value = Array.isArray(rVehiculos) ? rVehiculos : []
    pendientesNomina.value = Array.isArray(rNomina) ? rNomina : []
    prestamos.value = rPrestamos || { datos: [], totales: {}, por_descontar: 0 }
    mantenimientos.value = Array.isArray(rMant) ? rMant : []
    cargado.value = true
  } finally {
    cargando.value = false
  }
}

const ir = (nombre) => router.push({ name: nombre })
const abrirViaje = (consecutivo) => router.push({ name: 'ViajesPage', query: { viaje: consecutivo } })

const ultimosViajes = computed(() => viajes.value.slice(0, 5))

// ── Conductor ──

/** El viaje abierto más reciente del conductor (la lista ya viene más reciente primero) */
const viajeActual = computed(() =>
  viajes.value.find(
    (v) => ['solicitado', 'anticipo_consignado', 'completado'].includes(v.estado_viaje) &&
      (!v.correo_usuario || v.correo_usuario === useUsuario.user?.email)
  ) || null
)

/** Qué le toca hacer al conductor con su viaje */
const pasoConductor = computed(() => {
  const v = viajeActual.value
  if (!v) return { texto: '', icono: '', clase: '' }
  const preop = v.estado_preoperacional === 'realizado'
  if (v.estado_viaje === 'completado') {
    return { texto: 'Viaje cerrado. El propietario lo está revisando.', icono: 'hourglass_top', clase: 'bg-blue-1 text-blue-9' }
  }
  if (!preop) {
    return {
      texto: v.estado_viaje === 'solicitado'
        ? 'Haga el preoperacional mientras consignan el anticipo.'
        : 'Anticipo consignado. Falta el preoperacional para poder cerrar el viaje.',
      icono: 'fact_check',
      clase: 'bg-orange-1 text-orange-10',
      preoperacional: true,
    }
  }
  if (v.estado_viaje === 'solicitado') {
    return { texto: 'Preoperacional listo. Esperando la consignación del anticipo.', icono: 'hourglass_top', clase: 'bg-grey-3' }
  }
  return { texto: 'Todo listo: al descargar, cierre el viaje con kilos y gastos.', icono: 'flag', clase: 'bg-green-1 text-green-10' }
})

const miNomina = computed(() => pendientesNomina.value[0] || null)
/** Lo que el conductor tiene por cobrar en viajes (puede ser negativo si debe) */
const saldoConductor = computed(() => {
  const n = miNomina.value
  if (!n) return 0
  return (n.saldo_viajes || 0) + (n.ajustes_diez_pcto || 0) + (n.arrastre_anterior || 0)
})

const accesosConductor = [
  { ruta: 'CombustiblePage', texto: 'Combustible', icono: 'local_gas_station', color: 'red-7' },
  { ruta: 'SolicitudesPage', texto: 'Solicitud', icono: 'build_circle', color: 'orange-8' },
  { ruta: 'PreoperacionalesPage', texto: 'Preoperacional', icono: 'fact_check', color: 'teal' },
]

// ── Administrador / propietario ──

const tareasViajes = computed(() => [
  { estado: 'solicitado', texto: 'Anticipos por consignar', icono: 'payments', color: 'green' },
  { estado: 'completado', texto: 'Viajes por aprobar', icono: 'task_alt', color: 'orange' },
  { estado: 'aprobado', texto: 'Por facturar', icono: 'receipt_long', color: 'purple' },
  { estado: 'facturado', texto: 'Por cobrar al cliente', icono: 'price_check', color: 'blue' },
].map((t) => ({ ...t, cantidad: conteo.value[t.estado] || 0 })))

/** Tareas concretas con a dónde ir, lo más urgente primero */
const porHacer = computed(() => {
  const lista = []

  // Viajes que esperan algo del propietario
  const urgentes = { solicitado: 'Consignar anticipo', completado: 'Aprobar viaje' }
  viajes.value
    .filter((v) => urgentes[v.estado_viaje])
    .forEach((v) =>
      lista.push({
        clave: `v-${v.consecutivo}`,
        icono: v.estado_viaje === 'solicitado' ? 'payments' : 'task_alt',
        color: v.estado_viaje === 'solicitado' ? 'green' : 'orange',
        titulo: `${urgentes[v.estado_viaje]} · ${v.consecutivo} (${v.placa})`,
        detalle: `${v.usuario || ''} · ${v.cliente_nombre || ''}${v.estado_viaje === 'solicitado' ? ` · pide ${formatoPeso(v.valor_anticipo_conductor)}` : ''}`,
        accion: () => abrirViaje(v.consecutivo),
      })
    )

  // Préstamos solicitados
  const prestamosPendientes = prestamos.value.totales?.pendiente || 0
  if (prestamosPendientes) {
    lista.push({
      clave: 'prestamos',
      icono: 'request_quote',
      color: 'deep-orange',
      titulo: `${prestamosPendientes} préstamo(s) por desembolsar o rechazar`,
      detalle: 'Préstamos',
      accion: () => ir('PrestamosPage'),
    })
  }

  // Nómina: viajes por liquidar y salario del mes sin pagar
  pendientesNomina.value.forEach((n) => {
    if (n.viajes_por_liquidar > 0) {
      lista.push({
        clave: `nv-${n.email}`,
        icono: 'groups',
        color: 'indigo',
        titulo: `${n.nombre}: ${n.viajes_por_liquidar} viaje(s) por liquidar`,
        detalle: `Saldo ${formatoPeso((n.saldo_viajes || 0) + (n.ajustes_diez_pcto || 0) + (n.arrastre_anterior || 0))}`,
        accion: () => ir('NominaPage'),
      })
    }
    if (!n.salario_mes_pagado && (n.salario_base || 0) > 0) {
      lista.push({
        clave: `ns-${n.email}`,
        icono: 'event_available',
        color: 'indigo-4',
        titulo: `${n.nombre}: salario de ${n.mes} sin pagar`,
        detalle: `Base ${formatoPeso(n.salario_base)} + SSO ${formatoPeso(n.sso)}`,
        accion: () => ir('NominaPage'),
      })
    }
  })

  // Mantenimientos con factura pendiente
  const sinFactura = mantenimientos.value.filter((m) => String(m.estado_factura || '').toLowerCase() !== 'legalizado').length
  if (sinFactura) {
    lista.push({
      clave: 'mant',
      icono: 'build',
      color: 'brown',
      titulo: `${sinFactura} mantenimiento(s) sin factura legalizada`,
      detalle: 'Mantenimientos',
      accion: () => ir('MantenimientoPage'),
    })
  }

  return lista
})

// ── Documentos (todos los perfiles) ──

const DOCUMENTOS = [
  { campo: 'soat', nombre: 'SOAT' },
  { campo: 'tecnico', nombre: 'Técnico-mecánica' },
  { campo: 'poliza', nombre: 'Póliza' },
]

/** Texto y color según días al vencimiento */
function avisoVencimiento(dias) {
  if (dias === null || dias === undefined || dias === '') return null
  const d = Number(dias)
  if (d < 0) return { texto: `Vencido hace ${-d} día(s)`, color: 'negative' }
  if (d === 0) return { texto: 'Vence hoy', color: 'negative' }
  if (d <= 30) return { texto: `Vence en ${d} día(s)`, color: 'orange-9' }
  return null
}

const alertasDocumentos = computed(() => {
  const lista = []
  vehiculos.value
    .filter((v) => String(v.estado || 'activo').toLowerCase() === 'activo')
    .forEach((v) =>
      DOCUMENTOS.forEach((doc) => {
        const aviso = avisoVencimiento(v[`dias_${doc.campo}`])
        if (aviso) lista.push({ clave: `${v.placa}-${doc.campo}`, placa: v.placa, documento: doc.nombre, dias: Number(v[`dias_${doc.campo}`]), ...aviso })
      })
    )
  return lista.sort((a, b) => a.dias - b.dias)
})

/** Licencia del propio usuario (si la tiene registrada) */
const alertaLicencia = computed(() => {
  const fecha = useUsuario.user?.fecha_vencimiento_licencia
  if (!fecha || !/^\d{4}-\d{2}-\d{2}/.test(String(fecha))) return null
  const dias = Math.round((new Date(`${String(fecha).slice(0, 10)}T00:00:00`) - new Date(`${hoyISO()}T00:00:00`)) / 86400000)
  return avisoVencimiento(dias)
})

onMounted(cargar)
</script>

<style scoped>
.tarjeta {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}
.tarjeta-activa {
  border-color: #fdba74;
  background: #fff7ed;
}
.acceso {
  padding: 14px 4px;
}
.acceso:active,
.viaje-card:active {
  opacity: 0.85;
}
.viaje-card {
  border: 1px solid #e5e7eb !important;
  border-radius: 12px !important;
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
</style>
