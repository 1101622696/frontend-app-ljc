<template>
  <q-page padding class="bg-grey-2">
    <q-tabs v-model="vista" dense align="left" active-color="primary" indicator-color="primary" class="q-mb-md text-grey-8" no-caps>
      <q-tab name="vehiculo" icon="local_shipping" label="Por vehículo" />
      <q-tab name="flota" icon="view_module" label="Flota del mes" />
    </q-tabs>

    <!-- ═════════════ POR VEHÍCULO ═════════════ -->
    <template v-if="vista === 'vehiculo'">
      <div class="filter-bar q-mb-md">
        <div class="row q-col-gutter-sm">
          <div class="col-7">
            <q-select v-model="placa" :options="opcionesPlaca" label="Placa" outlined dense emit-value map-options @update:model-value="cargarVehiculo" />
          </div>
          <div class="col-5">
            <q-select v-model="anio" :options="opcionesAnio" label="Año" outlined dense emit-value map-options @update:model-value="cargarVehiculo" />
          </div>
        </div>
      </div>

      <div v-if="!placa && !iniciando" class="text-center text-grey-6 q-py-xl">
        <q-icon name="local_shipping" size="48px" />
        <div class="q-mt-sm">No tiene vehículos para consultar</div>
      </div>

      <template v-else-if="total">
        <!-- Total del año -->
        <q-card flat class="viaje-card q-mb-md">
          <q-card-section class="q-pb-sm">
            <div class="row items-center no-wrap">
              <span class="placa-badge">{{ total.placa }}</span>
              <span class="text-subtitle1 text-weight-bold q-ml-sm">Total {{ total.anio }}</span>
              <q-space />
              <q-btn flat round dense icon="refresh" :loading="useResumen.loading" @click="cargarVehiculo" />
            </div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <div class="metrica-chip">
                  <div class="metrica-label">Ingresos facturados</div>
                  <div class="metrica-valor text-positive">{{ formatoPeso(total.total_ingresos) }}</div>
                </div>
              </div>
              <div class="col-6">
                <div class="metrica-chip">
                  <div class="metrica-label">Gastos</div>
                  <div class="metrica-valor text-negative">{{ formatoPeso(total.total_gastos) }}</div>
                </div>
              </div>
            </div>
            <div class="ganancia-banner q-mt-sm" :class="claseBanner(total.diferencia)">
              <div class="text-caption">{{ Number(total.diferencia) >= 0 ? 'Ganancia del año' : 'Pérdida del año' }}</div>
              <div class="text-h6">{{ formatoPeso(total.diferencia) }}</div>
              <div class="text-caption">{{ total.viajes }} viaje(s) facturado(s)</div>
            </div>
            <q-banner v-if="total.viajes_por_facturar" dense rounded class="bg-blue-1 text-blue-10 q-mt-sm">
              <template #avatar><q-icon name="info" /></template>
              Por facturar: {{ formatoPeso(total.ingresos_estimados) }} en {{ total.viajes_por_facturar }} viaje(s) aprobado(s).
              No se cuenta en los ingresos hasta que se facture.
            </q-banner>
          </q-card-section>
        </q-card>

        <!-- Meses: tabla en pantalla grande -->
        <q-card v-if="$q.screen.gt.sm" flat class="viaje-card">
          <q-markup-table flat dense separator="horizontal" class="tabla-resumen">
            <thead>
              <tr>
                <th class="text-left">Mes</th>
                <th class="text-right">Ingresos</th>
                <th v-for="c in CAMPOS_GASTO" :key="c.campo" class="text-right">{{ c.corta }}</th>
                <th class="text-right">Total gastos</th>
                <th class="text-right">Diferencia</th>
                <th class="text-right">Por facturar</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="r in [...meses, total]"
                :key="r.mes"
                class="cursor-pointer"
                :class="{ 'fila-total': r.mes === 'TOTAL', 'text-grey-5': !tieneMovimiento(r) }"
                @click="verMes(r)"
              >
                <td class="text-left">{{ nombreMes(r.mes) }}</td>
                <td class="text-right">{{ formatoPeso(r.total_ingresos) }}</td>
                <td v-for="c in CAMPOS_GASTO" :key="c.campo" class="text-right">{{ formatoPeso(r[c.campo]) }}</td>
                <td class="text-right">{{ formatoPeso(r.total_gastos) }}</td>
                <td class="text-right text-weight-bold" :class="claseSigno(r.diferencia)">{{ formatoPeso(r.diferencia) }}</td>
                <td class="text-right text-blue-8">{{ r.ingresos_estimados ? formatoPeso(r.ingresos_estimados) : '' }}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card>

        <!-- Meses: tarjetas en el celular -->
        <template v-else>
          <q-card
            v-for="r in meses"
            :key="r.mes"
            flat
            class="viaje-card q-mb-sm cursor-pointer"
            :class="{ 'sin-movimiento': !tieneMovimiento(r) }"
            @click="verMes(r)"
          >
            <q-card-section class="q-py-sm">
              <div class="row items-center no-wrap">
                <span class="text-weight-bold">{{ nombreMes(r.mes) }}</span>
                <q-space />
                <span v-if="tieneMovimiento(r)" class="text-weight-bold" :class="claseSigno(r.diferencia)">{{ formatoPeso(r.diferencia) }}</span>
                <span v-else class="text-caption text-grey-6">Sin movimiento</span>
              </div>
              <div v-if="tieneMovimiento(r)" class="row items-center text-caption text-grey-7">
                <span>Ingresos {{ formatoPeso(r.total_ingresos) }}</span>
                <q-space />
                <span>Gastos {{ formatoPeso(r.total_gastos) }}</span>
              </div>
              <div v-if="r.viajes_por_facturar" class="text-caption text-blue-8">
                Por facturar {{ formatoPeso(r.ingresos_estimados) }}
              </div>
            </q-card-section>
          </q-card>
        </template>
      </template>
    </template>

    <!-- ═════════════ FLOTA DEL MES ═════════════ -->
    <template v-else>
      <div class="filter-bar q-mb-md">
        <div class="row q-col-gutter-sm">
          <div class="col-7">
            <q-select v-model="mesFlota" :options="opcionesMes" label="Mes" outlined dense emit-value map-options @update:model-value="cargarFlota" />
          </div>
          <div class="col-5">
            <q-select v-model="anioFlota" :options="opcionesAnio" label="Año" outlined dense emit-value map-options @update:model-value="cargarFlota" />
          </div>
        </div>
      </div>

      <div v-if="!flota.length && !useResumen.loading" class="text-center text-grey-6 q-py-xl">
        <q-icon name="view_module" size="48px" />
        <div class="q-mt-sm">No hay vehículos para este mes</div>
      </div>

      <template v-else-if="flota.length">
        <!-- Totales de la flota -->
        <q-card flat class="viaje-card q-mb-md">
          <q-card-section>
            <div class="row items-center no-wrap q-mb-sm">
              <span class="text-subtitle1 text-weight-bold">Flota · {{ nombreMes(mesFlota) }} {{ anioFlota }}</span>
              <q-space />
              <q-btn flat round dense icon="refresh" :loading="useResumen.loading" @click="cargarFlota" />
            </div>
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <div class="metrica-chip">
                  <div class="metrica-label">Ingresos facturados</div>
                  <div class="metrica-valor text-positive">{{ formatoPeso(totalFlota.total_ingresos) }}</div>
                </div>
              </div>
              <div class="col-6">
                <div class="metrica-chip">
                  <div class="metrica-label">Gastos</div>
                  <div class="metrica-valor text-negative">{{ formatoPeso(totalFlota.total_gastos) }}</div>
                </div>
              </div>
            </div>
            <div class="ganancia-banner q-mt-sm" :class="claseBanner(totalFlota.diferencia)">
              <div class="text-caption">{{ Number(totalFlota.diferencia) >= 0 ? 'Ganancia de la flota' : 'Pérdida de la flota' }}</div>
              <div class="text-h6">{{ formatoPeso(totalFlota.diferencia) }}</div>
              <div class="text-caption">{{ totalFlota.viajes }} viaje(s) facturado(s)</div>
            </div>
            <div class="q-mt-sm">
              <Fila v-for="c in CAMPOS_GASTO" :key="c.campo" :etiqueta="c.etiqueta" :valor="formatoPeso(totalFlota[c.campo])" />
            </div>
            <q-banner v-if="totalFlota.viajes_por_facturar" dense rounded class="bg-blue-1 text-blue-10 q-mt-sm">
              <template #avatar><q-icon name="info" /></template>
              Por facturar: {{ formatoPeso(totalFlota.ingresos_estimados) }} en {{ totalFlota.viajes_por_facturar }} viaje(s) aprobado(s).
            </q-banner>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              outline
              color="primary"
              icon="save"
              label="Guardar cierre del mes"
              :loading="guardando"
              :disable="!flota.some(tieneMovimiento)"
              @click="guardarCierreFlota"
            />
          </q-card-actions>
        </q-card>

        <!-- Un vehículo por tarjeta -->
        <q-card
          v-for="r in flota"
          :key="r.placa"
          flat
          class="viaje-card q-mb-sm cursor-pointer"
          :class="{ 'sin-movimiento': !tieneMovimiento(r) }"
          @click="verMes(r)"
        >
          <q-card-section class="q-py-sm">
            <div class="row items-center no-wrap">
              <span class="placa-badge">{{ r.placa }}</span>
              <span class="text-caption text-grey-7 q-ml-sm">{{ r.viajes }} viaje(s)</span>
              <q-space />
              <span v-if="tieneMovimiento(r)" class="text-weight-bold" :class="claseSigno(r.diferencia)">{{ formatoPeso(r.diferencia) }}</span>
              <span v-else class="text-caption text-grey-6">Sin movimiento</span>
            </div>
            <div v-if="tieneMovimiento(r)" class="row items-center text-caption text-grey-7 q-mt-xs">
              <span>Ingresos {{ formatoPeso(r.total_ingresos) }}</span>
              <q-space />
              <span>Gastos {{ formatoPeso(r.total_gastos) }}</span>
            </div>
            <div v-if="r.viajes_por_facturar" class="text-caption text-blue-8">
              Por facturar {{ formatoPeso(r.ingresos_estimados) }}
            </div>
          </q-card-section>
        </q-card>
      </template>
    </template>

    <!-- ═════════════ DETALLE DE UN MES ═════════════ -->
    <q-dialog v-model="dialogMes">
      <q-card v-if="mesDetalle" style="width: 460px; max-width: 95vw">
        <q-card-section class="row items-center no-wrap">
          <span class="placa-badge-lg">{{ mesDetalle.placa }}</span>
          <div class="q-ml-md text-h6">{{ nombreMes(mesDetalle.mes) }} {{ mesDetalle.anio }}</div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="seccion-titulo">Ingresos</div>
          <Fila etiqueta="Facturado" :valor="formatoPeso(mesDetalle.total_ingresos)" clase="text-positive" />
          <Fila etiqueta="Viajes facturados" :valor="String(mesDetalle.viajes ?? 0)" />

          <div class="seccion-titulo q-mt-md">Gastos</div>
          <Fila v-for="c in CAMPOS_GASTO" :key="c.campo" :etiqueta="c.etiqueta" :valor="formatoPeso(mesDetalle[c.campo])" />
          <Fila etiqueta="Total gastos" :valor="formatoPeso(mesDetalle.total_gastos)" clase="text-negative text-weight-bold" />
          <div class="text-caption text-grey-6 q-mt-xs">Mantenimientos incluye SOAT, técnico-mecánica, póliza e impuesto.</div>

          <div class="ganancia-banner q-mt-md" :class="claseBanner(mesDetalle.diferencia)">
            <div class="text-caption">Diferencia (ingresos − gastos)</div>
            <div class="text-h6">{{ formatoPeso(mesDetalle.diferencia) }}</div>
          </div>

          <q-banner v-if="mesDetalle.viajes_por_facturar" dense rounded class="bg-blue-1 text-blue-10 q-mt-sm">
            <template #avatar><q-icon name="info" /></template>
            Por facturar: {{ formatoPeso(mesDetalle.ingresos_estimados) }} en {{ mesDetalle.viajes_por_facturar }} viaje(s) aprobado(s).
            Es informativo: no está en los ingresos.
          </q-banner>
        </q-card-section>
        <q-card-actions v-if="mesDetalle.mes !== 'TOTAL'" align="right">
          <q-btn outline color="primary" icon="save" label="Guardar cierre del mes" :loading="guardando" @click="guardarCierreMes(mesDetalle)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch, h } from 'vue'
import { useQuasar } from 'quasar'
import { useStoreResumen } from '../stores/resumen'
import { formatoPeso } from '../utils/formato'

defineOptions({ name: 'ResumenVehiculosPage' })

const $q = useQuasar()
const useResumen = useStoreResumen()

const Fila = (p) =>
  h('div', { class: 'detalle-fila' }, [
    h('span', { class: 'detalle-label' }, p.etiqueta),
    h('span', { class: ['detalle-valor', p.clase] }, p.valor),
  ])
Fila.props = ['etiqueta', 'valor', 'clase']

// ── Constantes ──

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

// Desglose de gastos tal como lo calcula el backend
const CAMPOS_GASTO = [
  { campo: 'total_combustible', etiqueta: 'Combustible', corta: 'Combustible' },
  { campo: 'total_nominas', etiqueta: 'Nómina', corta: 'Nómina' },
  { campo: 'total_mantenimientos', etiqueta: 'Mantenimientos', corta: 'Manten.' },
  { campo: 'total_gastos_viajes', etiqueta: 'Gastos de viajes', corta: 'Viajes' },
  { campo: 'total_otros', etiqueta: 'Otros', corta: 'Otros' },
]

const SUMABLES = ['total_ingresos', 'total_gastos', 'diferencia', 'viajes', 'ingresos_estimados', 'viajes_por_facturar', ...CAMPOS_GASTO.map((c) => c.campo)]

const hoy = new Date()
const ANIO_ACTUAL = hoy.getFullYear()
const MES_ACTUAL = hoy.getMonth() + 1

const opcionesAnio = Array.from({ length: 5 }, (_, i) => ({ label: String(ANIO_ACTUAL - i), value: ANIO_ACTUAL - i }))
const opcionesMes = MESES.map((nombre, i) => ({ label: nombre, value: i + 1 }))

/** '03' | 3 → 'Marzo'; 'TOTAL' → 'Total' */
const nombreMes = (mes) => (String(mes).toUpperCase() === 'TOTAL' ? 'Total' : MESES[Number(mes) - 1] || String(mes))

const tieneMovimiento = (r) =>
  Number(r.total_gastos) !== 0 || Number(r.total_ingresos) !== 0 || Number(r.viajes) > 0 || Number(r.viajes_por_facturar) > 0

const claseSigno = (n) => (Number(n) > 0 ? 'text-positive' : Number(n) < 0 ? 'text-negative' : 'text-grey-7')
const claseBanner = (n) => (Number(n) >= 0 ? 'ganancia-positiva' : 'ganancia-negativa')

const vista = ref('vehiculo')
const iniciando = ref(true)

// ── Por vehículo ──

const vehiculos = ref([])
const placa = ref(null)
const anio = ref(ANIO_ACTUAL)
const filas = ref([])

const opcionesPlaca = computed(() => vehiculos.value.map((v) => ({ label: v.placa, value: v.placa })))
const meses = computed(() => filas.value.filter((r) => r.mes !== 'TOTAL'))
const total = computed(() => filas.value.find((r) => r.mes === 'TOTAL') || null)

async function cargarVehiculo() {
  if (!placa.value || !/^\d{4}$/.test(String(anio.value))) {
    filas.value = []
    return
  }
  filas.value = await useResumen.resumenVehiculo(placa.value, anio.value)
}

// ── Flota del mes ──

const anioFlota = ref(ANIO_ACTUAL)
const mesFlota = ref(MES_ACTUAL)
const flota = ref([])
let flotaCargada = false

const totalFlota = computed(() => {
  const t = {}
  SUMABLES.forEach((campo) => {
    t[campo] = flota.value.reduce((s, r) => s + (Number(r[campo]) || 0), 0)
  })
  return t
})

async function cargarFlota() {
  flotaCargada = true
  flota.value = await useResumen.resumenFlota(anioFlota.value, mesFlota.value)
}

// La flota se calcula solo cuando el usuario abre esa vista
watch(vista, (v) => {
  if (v === 'flota' && !flotaCargada) cargarFlota()
})

// ── Detalle y cierre ──

const dialogMes = ref(false)
const mesDetalle = ref(null)
const guardando = ref(false)

function verMes(r) {
  mesDetalle.value = r
  dialogMes.value = true
}

/** No tiene sentido cerrar un mes que aún no empieza */
const esMesFuturo = (a, m) => Number(a) > ANIO_ACTUAL || (Number(a) === ANIO_ACTUAL && Number(m) > MES_ACTUAL)

async function guardarCierreMes(r) {
  if (esMesFuturo(r.anio, r.mes)) {
    $q.notify({ type: 'warning', message: 'Ese mes todavía no ha empezado', position: 'bottom' })
    return
  }
  guardando.value = true
  try {
    await useResumen.guardarCierreMes(r.placa, r.anio, Number(r.mes))
    $q.notify({ type: 'positive', message: `Cierre de ${nombreMes(r.mes)} ${r.anio} guardado para ${r.placa}`, position: 'bottom' })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message, position: 'bottom', timeout: 5000 })
  } finally {
    guardando.value = false
  }
}

function guardarCierreFlota() {
  if (esMesFuturo(anioFlota.value, mesFlota.value)) {
    $q.notify({ type: 'warning', message: 'Ese mes todavía no ha empezado', position: 'bottom' })
    return
  }
  const conMovimiento = flota.value.filter(tieneMovimiento)
  $q.dialog({
    title: 'Guardar cierre del mes',
    message: `Se guardará el resumen de ${nombreMes(mesFlota.value)} ${anioFlota.value} de ${conMovimiento.length} vehículo(s) en la hoja. Si ya existía, se actualiza.`,
    cancel: { flat: true, label: 'Cancelar', color: 'grey-8' },
    ok: { unelevated: true, label: 'Guardar', color: 'primary' },
  }).onOk(async () => {
    guardando.value = true
    const fallidos = []
    try {
      // Uno por uno: el backend usa un candado sobre la hoja
      for (const r of conMovimiento) {
        try {
          await useResumen.guardarCierreMes(r.placa, anioFlota.value, mesFlota.value)
        } catch (e) {
          fallidos.push(`${r.placa}: ${e.message}`)
        }
      }
    } finally {
      guardando.value = false
    }
    if (fallidos.length) {
      $q.notify({ type: 'negative', message: `No se guardó: ${fallidos.join(' · ')}`, position: 'bottom', timeout: 8000 })
    } else {
      $q.notify({ type: 'positive', message: `Cierre guardado para ${conMovimiento.length} vehículo(s)`, position: 'bottom' })
    }
  })
}

onMounted(async () => {
  try {
    vehiculos.value = await useResumen.listarVehiculos()
    placa.value = vehiculos.value[0]?.placa || null
    await cargarVehiculo()
  } finally {
    iniciando.value = false
  }
})
</script>

<style scoped>
.filter-bar {
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 12px;
}
.viaje-card {
  border: 1px solid #e5e7eb !important;
  border-radius: 12px !important;
}
.viaje-card:active {
  opacity: 0.85;
}
.sin-movimiento {
  opacity: 0.6;
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
.metrica-chip {
  background: #f9fafb;
  border-radius: 8px;
  padding: 8px 10px;
}
.metrica-label {
  font-size: 10px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.metrica-valor {
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
.ganancia-positiva {
  background: #f0fdf4;
  color: #166534;
}
.ganancia-negativa {
  background: #fef2f2;
  color: #991b1b;
}
.fila-total {
  font-weight: 700;
  background: #f3f4f6;
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
