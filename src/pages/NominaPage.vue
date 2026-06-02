<template>
  <q-page padding class="bg-grey-2">
    <!-- Filtros -->
    <div class="filter-bar q-mb-md">
      <div class="filter-scroll row no-wrap q-gutter-x-sm q-pb-xs">
        <q-chip
          v-for="(config, tipo) in filtrosConfig"
          :key="tipo"
          clickable
          :icon="config.icono"
          :color="tipoLista === tipo ? 'primary' : 'grey-2'"
          :text-color="tipoLista === tipo ? 'white' : 'grey-8'"
          class="filter-chip"
          @click="cargarListaPor(tipo)"
        >
          {{ tipo === 'todos' ? 'Todos' : config.titulo.split(' ').pop() }}
        </q-chip>
      </div>

      <div
        v-if="tipoLista !== 'todos' && !filtroActual.esFiltroTexto"
        class="row no-wrap q-gutter-x-sm q-mt-sm"
      >
        <q-chip
          v-for="op in opcionesOrdenamiento"
          :key="op.value"
          clickable
          size="sm"
          :color="ordenActual === op.value ? 'secondary' : 'transparent'"
          :text-color="ordenActual === op.value ? 'white' : 'grey-7'"
          :outline="ordenActual !== op.value"
          @click="ordenActual = op.value; cargarNomina()"
          >
          {{ op.label }}
        </q-chip>
      </div>

      <div v-if="filtroActual.esFiltroTexto" class="q-mt-sm">
        <q-select
          v-model="valorFiltroTexto"
          :options="opcionesFiltroTexto"
          option-value="valor"
          option-label="etiqueta"
          dense
          outlined
          rounded
          emit-value
          map-options
          @update:model-value="actualizarValorFiltro"
        />
      </div>
    </div>

    <!-- Encabezado -->
    <div class="row items-center q-mb-sm">
      <q-icon :name="filtroActual.icono" :color="filtroActual.color" size="20px" />
      <span class="text-subtitle1 text-weight-medium q-ml-xs">
        {{ filtroActual.titulo }}
        <span v-if="filtroActual.esFiltroTexto && valorFiltroTexto">
          · {{ obtenerEtiquetaFiltroTexto(valorFiltroTexto) }}
        </span>
      </span>
      <q-badge color="blue-1" text-color="blue-9" class="q-ml-auto" rounded>
        {{ nominas.length }}
      </q-badge>
    </div>

    <!-- Cards -->
    <div class="q-gutter-y-sm">
      <q-card
        v-for="nomina in nominas"
        :key="nomina.consecutivo_nomina"
        flat
        bordered
        class="nomina-card cursor-pointer"
        @click="verDetalles(nomina.consecutivo_nomina)"
      >
        <q-card-section class="q-pa-md">
          <div class="row items-center q-mb-sm">
            <div class="avatar-chip q-mr-md">{{ iniciales(nomina.nombre) }}</div>
            <div class="col">
              <div class="text-body2 text-weight-medium ellipsis">{{ nomina.nombre }}</div>
              <div class="text-caption text-grey-6">
                #{{ nomina.consecutivo_nomina }} · {{ nomina.mes }}
              </div>
            </div>
            <q-space />
            <q-badge color="blue-1" text-color="blue-9" rounded class="text-caption">
              {{ nomina.tipo }}
            </q-badge>
          </div>

          <div class="row q-gutter-sm">
            <div class="metrica-chip col">
              <div class="metrica-label">Total nómina</div>
              <div class="metrica-valor">{{ formatearCOP(nomina.total_nomina) }}</div>
            </div>
            <div class="metrica-chip col">
              <div class="metrica-label">10% viajes</div>
              <div class="metrica-valor">{{ formatearCOP(nomina.diez_pcto_total_mes) }}</div>
            </div>
            <div class="metrica-chip col">
              <div class="metrica-label">Viajes</div>
              <div class="metrica-valor">{{ nomina.total_viajes_mes || '0' }}</div>
            </div>
          </div>

          <div
            class="row items-center q-mt-sm"
            style="border-top: 1px solid rgba(0, 0, 0, 0.06); padding-top: 8px"
          >
            <q-icon name="event" size="13px" color="grey-5" class="q-mr-xs" />
            <span class="text-caption text-grey-5">Pago: {{ formatFecha(nomina.fecha_pago) }}</span>
            <q-space />
            <q-icon name="chevron_right" color="grey-4" size="16px" />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Dialog detalles -->
    <q-dialog v-model="mostrarDetalles" persistent>
      <q-card
        style="min-width: 350px; max-width: 95vw; width: 500px; border-radius: 16px !important"
      >
        <!-- Header -->
        <q-card-section class="q-pb-sm">
          <div class="row items-center" v-if="detallesNomina">
            <div class="avatar-chip q-mr-md">{{ iniciales(detallesNomina.nombre) }}</div>
            <div class="col">
              <div class="text-subtitle1 text-weight-medium">{{ detallesNomina.nombre }}</div>
              <div class="text-caption text-grey-6">{{ detallesNomina.id_conductor }}</div>
            </div>
            <q-badge color="blue-1" text-color="blue-9" rounded>
              {{ detallesNomina.tipo }}
            </q-badge>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section
          class="q-pt-md"
          v-if="detallesNomina"
          style="max-height: 65vh; overflow-y: auto"
        >
          <!-- Banner total nómina -->
          <div class="ganancia-banner ganancia-positiva q-mb-md">
            <div class="text-caption" style="opacity: 0.7">Nómina pagada</div>
            <div class="text-h6 text-weight-bold">
              {{ formatearCOP(detallesNomina.total_nomina) }}
            </div>
          </div>

          <!-- Info general -->
          <div class="seccion-titulo">General</div>
          <div class="detalle-fila">
            <span class="detalle-label">Consecutivo</span>
            <span class="detalle-valor" style="font-family: monospace"
              >#{{ detallesNomina.consecutivo_nomina }}</span
            >
          </div>
          <div class="detalle-fila">
            <span class="detalle-label">Mes</span>
            <span class="detalle-valor">{{ detallesNomina.mes }}</span>
          </div>
          <div class="detalle-fila">
            <span class="detalle-label">Fecha de pago</span>
            <span class="detalle-valor">{{ formatFecha(detallesNomina.fecha_pago) }}</span>
          </div>
          <div class="detalle-fila">
            <span class="detalle-label">Tipo</span>
            <span class="detalle-valor">{{ detallesNomina.tipo }}</span>
          </div>

          <!-- Valores -->
          <div class="seccion-titulo q-mt-md">Desglose</div>
          <div class="row q-gutter-sm q-mb-sm">
            <div class="metrica-chip col">
              <div class="metrica-label">Salario base</div>
              <div class="metrica-valor">{{ formatearCOP(detallesNomina.salario_base) }}</div>
            </div>
            <div class="metrica-chip col">
              <div class="metrica-label">Seg. social</div>
              <div class="metrica-valor">{{ formatearCOP(detallesNomina.sso) }}</div>
            </div>
          </div>
          <div class="row q-gutter-sm q-mb-sm">
            <div class="metrica-chip col">
              <div class="metrica-label">Viajes del mes</div>
              <div class="metrica-valor">{{ detallesNomina.total_viajes_mes || '0' }}</div>
            </div>
            <div class="metrica-chip col">
              <div class="metrica-label">10% viajes</div>
              <div class="metrica-valor">
                {{ formatearCOP(detallesNomina.diez_pcto_total_mes) }}
              </div>
            </div>
          </div>
          <div class="detalle-fila">
            <span class="detalle-label">Saldo anticipo del mes</span>
            <span class="detalle-valor">{{
              formatearCOP(detallesNomina.saldo_anticipo_total_mes)
            }}</span>
          </div>
          <div class="detalle-fila">
            <span class="detalle-label">Total préstamos</span>
            <span
              class="detalle-valor"
              :class="Number(detallesNomina.total_prestamos) > 0 ? 'text-negative' : ''"
            >
              {{ formatearCOP(detallesNomina.total_prestamos) }}
            </span>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions class="q-pa-md" align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useStoreUsuarios } from '../stores/usuarios'
import { useStoreNominas } from '../stores/nomina'
import { TIPOS_FILTRO, CONFIG_FILTROS } from '../composables/filtrosnomina'

const useNomina = useStoreNominas()
const useUsuario = useStoreUsuarios()
const perfilUsuario = computed(() => useUsuario.perfile)

const tipoLista = ref(TIPOS_FILTRO.TODOS)
const ordenActual = ref('desc')
const nominas = ref([])
const valorFiltroTexto = ref(null)

const detallesNomina = ref(null)
const mostrarDetalles = ref(false)

function formatearCOP(valor) {
  return `$ ${Number(valor || 0).toLocaleString('es-CO')} COP`
}

async function verDetalles(consecutivo) {
  try {
    const detalle = await useNomina.obtenerdatodenomina(consecutivo)
    // console.log('Detalles obtenidos:', detalle)

    if (detalle) {
      detallesNomina.value = {
        consecutivo_nomina: detalle['consecutivo_nomina'] || '',
        mes: detalle['mes'] || '',
        id_conductor: detalle['id_conductor'] || '',
        nombre: detalle['nombre'] || '',
        salario_base: detalle['salario_base'] || '',
        sso: detalle['sso'] || '',
        total_viajes_mes: detalle['total_viajes_mes'] || '',
        diez_pcto_total_mes: detalle['diez_pcto_total_mes'] || '',
        saldo_anticipo_total_mes: detalle['saldo_anticipo_total_mes'] || '',
        total_prestamos: detalle['total_prestamos'] || '',
        total_nomina: detalle['total_nomina'] || '',
        fecha_pago: detalle['fecha_pago'] || '',
        tipo: detalle['tipo'] || '',
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

  const filtro = CONFIG_FILTROS[tipo]

  if (filtro.esFiltroTexto && filtro.opcionesFiltro?.length > 0) {
    valorFiltroTexto.value = filtro.opcionesFiltro[0].valor
  } else {
    valorFiltroTexto.value = null
  }

  cargarNomina()
}

function actualizarValorFiltro(nuevoValor) {
  valorFiltroTexto.value = nuevoValor
  cargarNomina()
}

// function obtenerEtiquetaValor(valor) {
//   if (tipoLista.value === TIPOS_FILTRO.VALOR) {
//     return `$ ${Number(valor).toLocaleString('es-CO')} COP`
//   }

//   return valor
// }

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

async function cargarNomina() {
  try {
    let response

    // Conductor: solo sus nóminas
    if (perfilUsuario.value === 'conductor') {
      const data = await useNomina.obtenerResumenNominaPorEmail()

      response = data?.resumen?.total?.consecutivos || []
    }

    // Filtros de texto
    else if (filtroActual.value?.esFiltroTexto) {
      response = await useNomina.obtenerNominaFiltrados(tipoLista.value, valorFiltroTexto.value)
    }

    // Ordenamientos
    else if (tipoLista.value !== TIPOS_FILTRO.TODOS) {
      response = await useNomina.obtenerNominaOrdenados(
        filtroActual.value.campoOrden,
        ordenActual.value,
      )
    } else {
      response = await useNomina.obtenerNominas()
    }

    if (Array.isArray(response)) {
      nominas.value = response.map((item) => {
        const result = {
          consecutivo_nomina: item['consecutivo_nomina'] || '',
          nombre: item['nombre'] || '',
          diez_pcto_total_mes: item['diez_pcto_total_mes'] || '',
          total_nomina: item['total_nomina'] || '',
          fecha_pago: item['fecha_pago'] || '',
          mes: item['mes'] || '',
          total_viajes_mes: item['total_viajes_mes'] || '',
        }

        const campoDatos = filtroActual.value?.campoDatos

        if (campoDatos && item[campoDatos] !== undefined) {
          result.valorFiltro = item[campoDatos]
        }

        return result
      })
    } else {
      console.error('Error en formato de respuesta:', response)
      nominas.value = []
    }
  } catch (error) {
    console.error(`Error al cargar nóminas por ${tipoLista.value}:`, error)
    nominas.value = []
  }
}

function iniciales(nombre) {
  if (!nombre) return '?'
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function formatFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

onMounted(() => {
  cargarNomina()
})

defineOptions({
  name: 'NominaPage',
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

.nomina-card {
  border: 1px solid #e5e7eb !important;
  border-radius: 12px !important;
  transition: border-color 0.15s;
}

.nomina-card:active {
  opacity: 0.85;
}
</style>
