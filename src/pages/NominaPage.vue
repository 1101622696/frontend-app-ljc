<template>
  <q-page padding class="bg-grey-2">
    <q-tabs v-if="esGestion" v-model="pestana" dense align="justify" class="bg-white rounded-borders q-mb-md" active-color="primary" indicator-color="primary">
      <q-tab name="pendientes" icon="pending_actions" label="Por liquidar" />
      <q-tab name="historial" icon="history" label="Historial" />
    </q-tabs>

    <!-- ───────────── POR LIQUIDAR (o "lo que llevo" del conductor) ───────────── -->
    <template v-if="pestana === 'pendientes' || !esGestion">
      <div v-if="!pendientes.length && !cargando" class="text-center text-grey-6 q-py-lg">No hay conductores para mostrar</div>

      <q-card v-for="c in pendientes" :key="c.email" flat class="tarjeta q-mb-sm">
        <q-card-section class="q-pb-sm">
          <div class="row items-center no-wrap">
            <div class="avatar-chip q-mr-sm">{{ iniciales(c.nombre) }}</div>
            <div class="col">
              <div class="text-body1 text-weight-medium">{{ esGestion ? c.nombre : 'Lo que llevo' }}</div>
              <div class="text-caption text-grey-7">{{ c.placas || 'Sin placa' }}</div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <div class="metrica-chip">
                <div class="metrica-label">Viajes por liquidar</div>
                <div class="metrica-valor">{{ c.viajes_por_liquidar }} · {{ formatoPeso(c.saldo_viajes) }}</div>
              </div>
            </div>
            <div class="col-6">
              <div class="metrica-chip">
                <div class="metrica-label">Salario {{ c.mes }}</div>
                <div class="metrica-valor" :class="c.salario_mes_pagado ? 'text-positive' : 'text-orange-9'">
                  {{ c.salario_mes_pagado ? 'Pagado' : 'Pendiente' }}
                </div>
              </div>
            </div>
            <div v-if="c.ajustes_diez_pcto" class="col-6">
              <div class="metrica-chip">
                <div class="metrica-label">Ajustes 10 % (facturación)</div>
                <div class="metrica-valor">{{ formatoPeso(c.ajustes_diez_pcto) }}</div>
              </div>
            </div>
            <div v-if="c.prestamos_por_descontar" class="col-6">
              <div class="metrica-chip">
                <div class="metrica-label">Préstamos por descontar</div>
                <div class="metrica-valor text-negative">{{ formatoPeso(c.prestamos_por_descontar) }}</div>
              </div>
            </div>
            <div v-if="c.arrastre_anterior" class="col-6">
              <div class="metrica-chip">
                <div class="metrica-label">Deuda de la nómina anterior</div>
                <div class="metrica-valor text-negative">{{ formatoPeso(c.arrastre_anterior) }}</div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions v-if="esGestion" align="right" class="q-pt-none">
          <q-btn
            unelevated
            color="teal"
            icon="local_shipping"
            label="Liquidar viajes"
            size="sm"
            :disable="!c.viajes_por_liquidar && !c.ajustes_diez_pcto"
            @click="abrirLiquidar(c)"
          />
          <q-btn unelevated color="blue" icon="payments" label="Pagar salario" size="sm" @click="abrirSalario(c)" />
        </q-card-actions>
        <q-card-actions v-else align="right" class="q-pt-none">
          <q-btn flat color="primary" icon="visibility" label="Ver detalle de viajes" size="sm" @click="abrirVistaConductor(c)" />
        </q-card-actions>
      </q-card>
    </template>

    <!-- ───────────── HISTORIAL ───────────── -->
    <template v-if="pestana === 'historial' || !esGestion">
      <div class="row items-center q-mt-md q-mb-sm">
        <div class="text-subtitle1 text-weight-medium">{{ esGestion ? 'Nóminas registradas' : 'Mis nóminas' }}</div>
        <q-space />
        <q-btn-toggle
          v-model="filtroTipo"
          dense
          no-caps
          unelevated
          toggle-color="primary"
          color="white"
          text-color="grey-8"
          :options="[
            { label: 'Todas', value: '' },
            { label: 'Viajes', value: 'viajes' },
            { label: 'Salario', value: 'salario' },
          ]"
          @update:model-value="cargarHistorial"
        />
      </div>

      <div v-if="!historial.length && !cargando" class="text-center text-grey-6 q-py-lg">Sin nóminas registradas</div>

      <q-card
        v-for="n in historial"
        :key="n.consecutivo_nomina"
        flat
        class="tarjeta q-mb-sm cursor-pointer"
        @click="verDetalle(n)"
      >
        <q-card-section class="q-py-sm">
          <div class="row items-center no-wrap">
            <q-badge :color="n.tipo === 'salario' ? 'blue' : 'teal'" :label="n.tipo === 'salario' ? 'Salario' : 'Viajes'" />
            <span class="text-weight-medium q-ml-sm ellipsis">{{ n.nombre }}</span>
            <q-space />
            <span class="text-caption text-grey-6">{{ n.consecutivo_nomina }}</span>
          </div>
          <div class="row items-center q-mt-xs">
            <span class="text-caption text-grey-7">
              {{ n.tipo === 'salario' ? `Mes ${n.mes}` : `${n.total_viajes_mes || 0} viaje(s)` }} · {{ formatoFecha(n.fecha_pago) }}
            </span>
            <q-space />
            <span class="text-body2 text-weight-bold">{{ formatoPeso(n.valor_pagado) }}</span>
          </div>
          <div v-if="Number(n.saldo_siguiente) < 0" class="text-caption text-negative text-right">
            Pasa a la siguiente: {{ formatoPeso(n.saldo_siguiente) }}
          </div>
        </q-card-section>
      </q-card>
    </template>

    <!-- ───────────── LIQUIDAR VIAJES / VISTA DEL CONDUCTOR ───────────── -->
    <q-dialog v-model="dialogLiquidar" :persistent="esGestion" :maximized="$q.screen.lt.md">
      <q-card style="width: 600px; max-width: 100vw">
        <q-card-section class="bg-grey-1 row items-center">
          <div>
            <div class="text-h6">{{ esGestion ? 'Liquidar viajes' : 'Mis viajes por liquidar' }}</div>
            <div class="text-caption">{{ conductorActual?.nombre }}</div>
          </div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-card-section v-if="calculo">
          <div v-if="!calculo.viajes_disponibles.length && !calculo.ajustes.length" class="text-grey-6">
            No hay viajes aprobados pendientes de liquidar.
          </div>

          <div v-if="calculo.viajes_disponibles.length" class="seccion-titulo">Viajes</div>
          <div v-for="v in viajesDetalle" :key="v.consecutivo" class="row items-center no-wrap q-py-xs borde-abajo">
            <q-checkbox
              v-if="esGestion"
              :model-value="seleccion.includes(v.consecutivo)"
              dense
              class="q-mr-sm"
              @update:model-value="(m) => alternarViaje(v.consecutivo, m)"
            />
            <div class="col">
              <div class="text-body2">{{ v.consecutivo }} · {{ v.placa }} · {{ v.destino }}</div>
              <div class="text-caption text-grey-7">
                10 %: {{ formatoPeso(v.diez_pcto) }} · saldo anticipo: {{ formatoPeso(v.saldo_anticipo_conductor) }}
              </div>
            </div>
            <div class="text-body2 text-weight-medium" :class="v.saldo_pendiente_conductor < 0 ? 'text-negative' : ''">
              {{ formatoPeso(v.saldo_pendiente_conductor) }}
            </div>
          </div>

          <template v-if="calculo.ajustes.length">
            <div class="seccion-titulo q-mt-md">Ajustes del 10 % (viajes facturados después de liquidar)</div>
            <div v-for="a in calculo.ajustes" :key="a.consecutivo" class="row q-py-xs borde-abajo">
              <span class="col text-body2">{{ a.consecutivo }} · {{ a.placa }}</span>
              <span class="text-body2">{{ formatoPeso(a.ajuste) }}</span>
            </div>
          </template>

          <div class="seccion-titulo q-mt-md">Resumen</div>
          <Fila etiqueta="10 % de los viajes" :valor="formatoPeso(calculo.diez_pcto_total_mes)" />
          <Fila etiqueta="Saldo de los anticipos (se resta)" :valor="formatoPeso(calculo.saldo_anticipo_total_mes)" />
          <Fila v-if="calculo.ajustes_diez_pcto" etiqueta="Ajustes del 10 %" :valor="formatoPeso(calculo.ajustes_diez_pcto)" />
          <Fila v-if="calculo.arrastre_anterior" etiqueta="Deuda de la nómina anterior" :valor="formatoPeso(calculo.arrastre_anterior)" clase="text-negative" />
          <Total :calculo="calculo" />

          <template v-if="esGestion">
            <q-input v-model="notas" label="Notas (opcional)" outlined dense class="q-mt-md" />
            <CampoArchivos v-model="comprobante" class="q-mt-sm" label="Comprobante del pago (opcional)" multiple accept="image/*, application/pdf" />
          </template>
        </q-card-section>
        <q-card-section v-else class="flex flex-center q-py-xl"><q-spinner size="32px" color="primary" /></q-card-section>

        <q-card-actions v-if="esGestion" align="right">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn
            unelevated
            color="teal"
            label="Registrar liquidación"
            :loading="guardando"
            :disable="!calculo || (!calculo.viajes.length && !calculo.ajustes.length) || (calculo.viajes_disponibles.length > 0 && !seleccion.length)"
            @click="guardarLiquidar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ───────────── PAGAR SALARIO ───────────── -->
    <q-dialog v-model="dialogSalario" persistent :maximized="$q.screen.lt.md">
      <q-card style="width: 520px; max-width: 100vw">
        <q-card-section class="bg-grey-1 row items-center">
          <div>
            <div class="text-h6">Pagar salario</div>
            <div class="text-caption">{{ conductorActual?.nombre }}</div>
          </div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-input v-model="mesSalario" type="month" label="Mes" outlined dense stack-label @update:model-value="calcularSalario" />

          <div v-if="errorCalculo" class="text-negative q-mt-md">{{ errorCalculo }}</div>
          <template v-else-if="calculo">
            <q-banner v-if="calculo.ya_pagada" dense rounded class="bg-orange-1 text-orange-10 q-mt-md">
              El salario de {{ calculo.mes }} ya se pagó ({{ calculo.ya_pagada }}).
            </q-banner>
            <div class="seccion-titulo q-mt-md">Resumen</div>
            <Fila etiqueta="Salario base" :valor="formatoPeso(calculo.salario_base)" />
            <Fila etiqueta="Seguridad social" :valor="formatoPeso(calculo.sso)" />
            <Fila
              v-for="p in calculo.prestamos"
              :key="p.consecutivo"
              :etiqueta="`Préstamo ${p.consecutivo}`"
              :valor="formatoPeso(-p.valor_prestado)"
              clase="text-negative"
            />
            <Fila v-if="calculo.arrastre_anterior" etiqueta="Deuda de la nómina anterior" :valor="formatoPeso(calculo.arrastre_anterior)" clase="text-negative" />
            <Total :calculo="calculo" />

            <q-input v-model="notas" label="Notas (opcional)" outlined dense class="q-mt-md" />
            <CampoArchivos v-model="comprobante" class="q-mt-sm" label="Comprobante del pago (opcional)" multiple accept="image/*, application/pdf" />
          </template>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn
            unelevated
            color="blue"
            label="Registrar salario"
            :loading="guardando"
            :disable="!calculo || Boolean(calculo.ya_pagada) || Boolean(errorCalculo)"
            @click="guardarSalario"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ───────────── DETALLE DE UNA NÓMINA ───────────── -->
    <q-dialog v-model="dialogDetalle">
      <q-card v-if="detalle" style="width: 520px; max-width: 95vw">
        <q-card-section class="row items-center">
          <div>
            <div class="text-h6">{{ detalle.consecutivo_nomina }}</div>
            <div class="text-caption">{{ detalle.nombre }} · {{ detalle.tipo === 'salario' ? `Salario ${detalle.mes}` : 'Viajes' }}</div>
          </div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <template v-if="detalle.tipo === 'viajes'">
            <Fila etiqueta="Viajes" :valor="detalle.viajes_liquidados || '—'" />
            <Fila etiqueta="10 % de los viajes" :valor="formatoPeso(detalle.diez_pcto_total_mes)" />
            <Fila etiqueta="Saldo de los anticipos" :valor="formatoPeso(detalle.saldo_anticipo_total_mes)" />
            <Fila v-if="Number(detalle.ajustes_diez_pcto)" etiqueta="Ajustes del 10 %" :valor="formatoPeso(detalle.ajustes_diez_pcto)" />
          </template>
          <template v-else>
            <Fila etiqueta="Salario base" :valor="formatoPeso(detalle.salario_base)" />
            <Fila etiqueta="Seguridad social" :valor="formatoPeso(detalle.sso)" />
            <Fila v-if="Number(detalle.total_prestamos)" :etiqueta="`Préstamos (${detalle.prestamos_descontados})`" :valor="formatoPeso(-detalle.total_prestamos)" clase="text-negative" />
          </template>
          <Fila v-if="Number(detalle.arrastre_anterior)" etiqueta="Deuda anterior" :valor="formatoPeso(detalle.arrastre_anterior)" clase="text-negative" />
          <Fila etiqueta="Total" :valor="formatoPeso(detalle.total_nomina)" />
          <Fila etiqueta="Pagado" :valor="formatoPeso(detalle.valor_pagado)" clase="text-weight-bold" />
          <Fila v-if="Number(detalle.saldo_siguiente) < 0" etiqueta="Pasa a la siguiente" :valor="formatoPeso(detalle.saldo_siguiente)" clase="text-negative" />
          <Fila etiqueta="Fecha" :valor="formatoFecha(detalle.fecha_pago)" />
          <Fila v-if="detalle.notas" etiqueta="Notas" :valor="detalle.notas" />
        </q-card-section>
        <q-card-actions v-if="detalle.link_comprobante">
          <q-btn outline size="sm" icon="receipt" label="Comprobante" @click="abrirVisor(detalle.link_comprobante, 'Comprobante de pago')" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useQuasar } from 'quasar'
import { useStoreNominas } from '../stores/nomina'
import { useStoreUsuarios } from '../stores/usuarios'
import { useVisorArchivos } from '../composables/useVisorArchivos'
import CampoArchivos from 'components/CampoArchivos.vue'
import { formatoPeso, formatoFecha } from '../utils/formato'

defineOptions({ name: 'NominaPage' })

const $q = useQuasar()
const useNomina = useStoreNominas()
const useUsuario = useStoreUsuarios()

// Visor de archivos (con pellizco), montado una sola vez en MainLayout
const { abrirArchivos: abrirVisor } = useVisorArchivos()

// ── Piezas de vista ──

const Fila = (p) =>
  h('div', { class: 'detalle-fila' }, [
    h('span', { class: 'detalle-label' }, p.etiqueta),
    h('span', { class: ['detalle-valor', p.clase] }, p.valor),
  ])
Fila.props = ['etiqueta', 'valor', 'clase']

const Total = ({ calculo }) =>
  h('div', { class: ['ganancia-banner q-mt-sm', calculo.total_nomina >= 0 ? 'ganancia-positiva' : 'ganancia-negativa'] }, [
    h('div', { class: 'text-caption' }, calculo.total_nomina >= 0 ? 'A pagar' : 'El conductor queda debiendo'),
    h('div', { class: 'text-h6' }, formatoPeso(calculo.total_nomina >= 0 ? calculo.valor_pagado : -calculo.saldo_siguiente)),
    calculo.total_nomina < 0 ? h('div', { class: 'text-caption' }, 'Se paga $ 0 y la diferencia se descuenta en la siguiente nómina') : null,
  ])
Total.props = ['calculo']

const iniciales = (nombre = '') =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')

// ── Estado ──

const esGestion = computed(() => ['administrador', 'propietario'].includes(useUsuario.perfile))
const pestana = ref('pendientes')
const cargando = ref(false)
const pendientes = ref([])
const historial = ref([])
const filtroTipo = ref('')

async function cargarPendientes() {
  pendientes.value = await useNomina.obtenerPendientes()
}

async function cargarHistorial() {
  historial.value = await useNomina.obtenerNominas({ tipo: filtroTipo.value })
}

async function recargar() {
  cargando.value = true
  try {
    await Promise.all([cargarPendientes(), cargarHistorial()])
  } finally {
    cargando.value = false
  }
}

// ── Liquidar viajes ──

const dialogLiquidar = ref(false)
const conductorActual = ref(null)
const calculo = ref(null)
const errorCalculo = ref('')
const seleccion = ref([])
const viajesDetalle = ref([])
const notas = ref('')
const comprobante = ref([])
const guardando = ref(false)

async function cargarCalculoViajes() {
  try {
    calculo.value = await useNomina.calcularNomina(conductorActual.value.email, { tipo: 'viajes', viajes: seleccion.value })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message, position: 'bottom' })
  }
}

async function abrirLiquidar(c) {
  conductorActual.value = c
  calculo.value = null
  notas.value = ''
  comprobante.value = []
  dialogLiquidar.value = true
  seleccion.value = []
  await cargarCalculoViajes()
  // La primera vez vienen todos: se guardan para mostrarlos aunque se desmarquen
  viajesDetalle.value = calculo.value?.viajes || []
  seleccion.value = viajesDetalle.value.map((v) => v.consecutivo)
}

const abrirVistaConductor = abrirLiquidar

async function alternarViaje(consecutivo, marcado) {
  seleccion.value = marcado ? [...seleccion.value, consecutivo] : seleccion.value.filter((c) => c !== consecutivo)
  if (!seleccion.value.length) {
    // Ninguno marcado: solo ajustes (si hay)
    calculo.value = { ...calculo.value, viajes: [], diez_pcto_total_mes: 0, saldo_anticipo_total_mes: 0, saldo_viajes: 0 }
    const total = calculo.value.ajustes_diez_pcto + calculo.value.arrastre_anterior
    Object.assign(calculo.value, { total_nomina: total, valor_pagado: Math.max(0, total), saldo_siguiente: Math.min(0, total) })
    return
  }
  await cargarCalculoViajes()
}

async function guardarLiquidar() {
  const fd = new FormData()
  fd.append('viajes', seleccion.value.join(','))
  if (notas.value) fd.append('notas', notas.value)
  comprobante.value.forEach((a) => fd.append('comprobante', a))

  guardando.value = true
  try {
    await useNomina.liquidarViajes(conductorActual.value.email, fd)
    dialogLiquidar.value = false
    await recargar()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message, position: 'bottom', timeout: 5000 })
  } finally {
    guardando.value = false
  }
}

// ── Salario ──

const dialogSalario = ref(false)
const mesSalario = ref('')

async function calcularSalario() {
  calculo.value = null
  errorCalculo.value = ''
  try {
    calculo.value = await useNomina.calcularNomina(conductorActual.value.email, { tipo: 'salario', mes: mesSalario.value })
  } catch (e) {
    errorCalculo.value = e.message
  }
}

async function abrirSalario(c) {
  conductorActual.value = c
  mesSalario.value = c.mes
  notas.value = ''
  comprobante.value = []
  dialogSalario.value = true
  await calcularSalario()
}

async function guardarSalario() {
  const fd = new FormData()
  fd.append('mes', mesSalario.value)
  if (notas.value) fd.append('notas', notas.value)
  comprobante.value.forEach((a) => fd.append('comprobante', a))

  guardando.value = true
  try {
    await useNomina.pagarSalario(conductorActual.value.email, fd)
    dialogSalario.value = false
    await recargar()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message, position: 'bottom', timeout: 5000 })
  } finally {
    guardando.value = false
  }
}

// ── Detalle ──

const dialogDetalle = ref(false)
const detalle = ref(null)

function verDetalle(n) {
  detalle.value = n
  dialogDetalle.value = true
}

onMounted(recargar)
</script>

<style scoped>
.tarjeta {
  border: 1px solid #e5e7eb !important;
  border-radius: 12px !important;
}
.avatar-chip {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #eff6ff;
  color: #1e50a2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}
.metrica-chip {
  background: #f9fafb;
  border-radius: 8px;
  padding: 8px 10px;
}
.metrica-label {
  font-size: 11px;
  color: #6b7280;
}
.metrica-valor {
  font-size: 14px;
  font-weight: 600;
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
.borde-abajo {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
</style>

<!-- Sin scoped: los usan los componentes funcionales Fila y Total -->
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
  text-align: right;
  max-width: 60%;
}
.ganancia-banner {
  border-radius: 10px;
  padding: 10px 14px;
}
.ganancia-positiva {
  background: #f0fdf4;
  color: #166534;
}
.ganancia-negativa {
  background: #fef2f2;
  color: #991b1b;
}
</style>
