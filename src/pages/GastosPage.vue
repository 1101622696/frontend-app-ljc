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
          @click="ordenActual = op.value; cargarGastos()"
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
        {{ gastos.length }}
      </q-badge>
    </div>

    <!-- Cards -->
    <div class="q-gutter-y-sm">
      <q-card
        v-for="gasto in gastos"
        :key="gasto.consecutivo"
        flat
        bordered
        class="gastos-card cursor-pointer"
        @click="verDetalles(gasto.consecutivo)"
      >
        <q-card-section class="q-pa-md">
          <div class="row items-center q-mb-sm">
            <div class="avatar-chip q-mr-md">
              {{ gasto.placa?.substring(0, 2) }}
            </div>

            <div class="col">
              <div class="text-body2 text-weight-medium">
                {{ gasto.placa }}
              </div>

              <div class="text-caption text-grey-6">#{{ gasto.consecutivo }}</div>
            </div>

            <q-space />

            <q-badge color="red-1" text-color="red-8" rounded>
              {{ gasto.tipo_gasto }}
            </q-badge>
          </div>

          <div class="row q-gutter-sm">
            <div class="metrica-chip col">
              <div class="metrica-label">Valor</div>
              <div class="metrica-valor">
                {{ formatPeso(gasto.valor_gasto) }}
              </div>
            </div>

            <div class="metrica-chip col">
              <div class="metrica-label">Referencia</div>
              <div class="metrica-valor">
                {{ gasto.codigo_referencia || '-' }}
              </div>
            </div>

            <div v-if="gasto.valorFiltro !== undefined" class="metrica-chip col">
              <div class="metrica-label">Categoría</div>
              <div class="metrica-valor">
                {{ obtenerEtiquetaValor(gasto.valorFiltro) }}
              </div>
            </div>
          </div>

          <div
            class="row items-center q-mt-sm"
            style="border-top: 1px solid rgba(0, 0, 0, 0.06); padding-top: 8px"
          >
            <q-icon name="event" size="13px" color="grey-5" class="q-mr-xs" />

            <span class="text-caption text-grey-5">
              {{ formatFecha(gasto.fecha_registro) }}
            </span>

            <q-space />

            <q-icon name="chevron_right" color="grey-4" size="16px" />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Dialog -->
    <q-dialog v-model="mostrarDetalles" persistent>
      <q-card
        style="min-width: 350px; max-width: 95vw; width: 500px; border-radius: 16px !important"
      >
        <!-- Header -->
        <q-card-section class="q-pb-sm">
          <div class="row items-center" v-if="detallesGasto">
            <div class="avatar-chip q-mr-md">
              {{ detallesGasto.placa?.substring(0, 2) }}
            </div>

            <div class="col">
              <div class="row justify-center q-mb-md">
                <div class="placa-badge-lg">{{ detallesGasto.placa }}</div>
              </div>

              <div class="text-caption text-grey-6">#{{ detallesGasto.consecutivo }}</div>
            </div>

            <q-badge color="red-1" text-color="red-8" rounded>
              {{ detallesGasto.tipo_gasto }}
            </q-badge>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section
          v-if="detallesGasto"
          class="q-pt-md"
          style="max-height: 65vh; overflow-y: auto"
        >
          <!-- Banner -->
          <div class="ganancia-banner ganancia-negativa q-mb-md">
            <div class="text-caption" style="opacity: 0.7">Valor del gasto</div>

            <div class="text-h6 text-weight-bold">
              {{ formatPeso(detallesGasto.valor_gasto) }}
            </div>
          </div>

          <!-- General -->
          <div class="seccion-titulo">Información general</div>

          <div class="detalle-fila">
            <span class="detalle-label">Consecutivo</span>
            <span class="detalle-valor" style="font-family: monospace">
              #{{ detallesGasto.consecutivo }}
            </span>
          </div>

          <div class="detalle-fila">
            <span class="detalle-label">Placa</span>
            <span class="detalle-valor">
              {{ detallesGasto.placa }}
            </span>
          </div>

          <div class="detalle-fila">
            <span class="detalle-label">Tipo de gasto</span>
            <span class="detalle-valor">
              {{ detallesGasto.tipo_gasto }}
            </span>
          </div>

          <div class="detalle-fila">
            <span class="detalle-label">Descripción</span>
            <span class="detalle-valor">
              {{ detallesGasto.descripcion }}
            </span>
          </div>

          <!-- Valores -->
          <div class="seccion-titulo q-mt-md">Valores</div>

          <div class="row q-gutter-sm q-mb-sm">
            <div class="metrica-chip col">
              <div class="metrica-label">Valor</div>
              <div class="metrica-valor">
                {{ formatPeso(detallesGasto.valor_gasto) }}
              </div>
            </div>

            <div class="metrica-chip col">
              <div class="metrica-label">Referencia</div>
              <div class="metrica-valor">
                {{ detallesGasto.codigo_referencia || '-' }}
              </div>
            </div>
          </div>

          <!-- Registro -->
          <div class="seccion-titulo q-mt-md">Registro</div>

          <div class="detalle-fila">
            <span class="detalle-label">Fecha registro</span>
            <span class="detalle-valor">
              {{ formatFecha(detallesGasto.fecha_registro) }}
            </span>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions class="q-pa-md">
          <q-space />

          <q-btn
            flat
            round
            icon="edit"
            color="grey-7"
            label="Editar"
            :disable="
              ['viaje', 'nomina_viajes', 'nomina_salario', 'combustible'].includes(
                detallesGasto?.tipo_gasto,
              )
            "
            @click="editar(detallesGasto)"
          >
            <q-tooltip
              v-if="
                ['viaje', 'nomina_viajes', 'nomina_salario', 'combustible'].includes(
                  detallesGasto?.tipo_gasto,
                )
              "
            >
              Este gasto no puede ser editado
            </q-tooltip>
          </q-btn>

          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="alert" persistent>
      <q-card class="bg-grey-2">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6 text-weight-bold">
            {{ accion == 1 ? 'Agregar Gasto' : 'Editar Gasto' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-input
                v-if="perfilUsuario === 'conductor'"
                outlined
                rounded
                v-model="formulario.placa"
                label="Tu placa"
                :dense="dense"
                disable
              />

              <!-- Propietario y Admin: select con opciones -->
              <q-select
                v-else
                outlined
                rounded
                v-model="formulario.placa"
                label="Placa"
                :options="placasOptions"
                :dense="dense"
              />
            </div>

            <div class="col-12">
              <q-input
                outlined
                rounded
                v-model.trim="formulario.tipo_gasto"
                label="Tipo de gasto"
                :dense="dense"
              />
            </div>

            <div class="col-12">
              <q-input
                outlined
                rounded
                v-model="valorgastoFormatted"
                label="Valor del gasto"
                :dense="dense"
                @update:model-value="formatearValorGasto"
              />
            </div>

            <div class="col-12">
              <q-input
                outlined
                rounded
                v-model.trim="formulario.descripcion"
                label="Descripción"
                :dense="dense"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn @click="guardar" color="accent" class="text-white" :loading="useGasto.loading">
            {{ esEdicion ? 'Actualizar' : 'Agregar' }}
            <template v-slot:loading>
              <q-spinner color="white" size="1em" />
            </template>
          </q-btn>
          <q-btn label="Cerrar" color="black" outline @click="cerrar()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- </div> -->

    <!-- <q-btn color="primary" :label="'Registrar nuevo'" class="q-mt-md" @click="abrir" /> -->
   
     <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" @click="abrir" />
    </q-page-sticky>

  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useStoreGastos } from '../stores/gastos'
import { useStoreUsuarios } from '../stores/usuarios'
import { useStoreVehiculos } from '../stores/vehiculos'
import { useQuasar } from 'quasar'
import { TIPOS_FILTRO, CONFIG_FILTROS } from '../composables/filtrosgastos'

const useGasto = useStoreGastos()
const useUsuario = useStoreUsuarios()
const useVehiculo = useStoreVehiculos()
const alert = ref(false)
const accion = ref(1)
const $q = useQuasar()
const perfilUsuario = computed(() => useUsuario.perfile)

const estadoInicial = {
  placa: '',
  tipo_gasto: '',
  valor_gasto: '',
  descripcion: '',
}

const formulario = ref({ ...estadoInicial })
const cargando = ref(false)

const tipoLista = ref(TIPOS_FILTRO.TODOS)
const ordenActual = ref('desc')
const gastos = ref([])
const valorFiltroTexto = ref(null)

const detallesGasto = ref(null)
const mostrarDetalles = ref(false)

const valorgastoFormatted = ref('')

function formatearValorGasto(val) {
  valorgastoFormatted.value = formatearNumero(val)
  formulario.value.valor_gasto = Number(valorgastoFormatted.value.replace(/\./g, ''))
}

function formatearNumero(valor) {
  if (!valor) return ''
  const limpio = valor.toString().replace(/\D/g, '')
  return new Intl.NumberFormat('es-CO').format(limpio)
}

const placasOptions = ref([])

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
    }
    let response

    if (accion.value === 2) {
      response = await useGasto.putGasto(formulario.value.consecutivo, dataEnviar)
    } else {
      response = await useGasto.postGasto(dataEnviar)
    }

    console.log('Respuesta exitosa:', response)

    cerrar()
    cargarGastos()
    resetearFormulario()
  } catch (error) {
    console.error('Error completo:', error)
    mostrarMensajeError('Error al guardar el gasto')
  } finally {
    cargando.value = false
  }
}

function editar(gasto) {
  accion.value = 2

  formulario.value = {
    ...estadoInicial,
    ...gasto,
  }

  valorgastoFormatted.value = formatearNumero(gasto.valor_gasto || 0)

  alert.value = true
}

async function validar() {
  let verificado = true

  const { placa, tipo_gasto, valor_gasto } = formulario.value

  if (placa === '') {
    mostrarMensajeError('Seleccione la placa')
    verificado = false
  }
  if (tipo_gasto === '') {
    mostrarMensajeError('Seleccione un tipo de gasto')
    verificado = false
  }
  if (valor_gasto === '') {
    mostrarMensajeError('Seleccione el valor del gasto')
    verificado = false
  }

  return verificado
}

async function verDetalles(consecutivo) {
  try {
    const detalle = await useGasto.obtenerdatosdelgasto(consecutivo)
    // console.log('Detalles obtenidos:', detalle)

    if (detalle) {
      detallesGasto.value = {
        consecutivo: detalle['consecutivo'] || '',
        fecha_registro: detalle['fecha_registro'] || '',
        placa: detalle['placa'] || '',
        tipo_gasto: detalle['tipo_gasto'] || '',
        codigo_referencia: detalle['codigo_referencia'] || '',
        valor_gasto: detalle['valor_gasto'] || '',
        descripcion: detalle['descripcion'] || '',
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

  cargarGastos()
}

function actualizarValorFiltro(nuevoValor) {
  valorFiltroTexto.value = nuevoValor
  cargarGastos()
}

function obtenerEtiquetaValor(valor) {
  if (tipoLista.value === TIPOS_FILTRO.TODOS) {
    return `${valor}`
  } else if (tipoLista.value === TIPOS_FILTRO.VALOR_GASTO) {
    return `${valor} COP`
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

async function cargarGastos() {
  try {
    let response = []
    // ADMINISTRADOR
    if (perfilUsuario.value === 'administrador') {
      if (tipoLista.value === TIPOS_FILTRO.TODOS) {
        response = await useGasto.obtenerGastos()
      } else {
        response = await useGasto.obtenerGastosOrdenados(
          filtroActual.value.campoOrden,
          ordenActual.value,
        )
      }
    }
    // PROPIETARIO Y CONDUCTOR
    else {
      const placasUsuario = useUsuario.user?.placa_asignada?.split(',').map((p) => p.trim()) || []
      let todosLosGastos = []
      for (const placa of placasUsuario) {
        const data = await useGasto.obtenerResumenPorPlaca(placa)
        const lista = data?.resumen?.total?.consecutivos || []
        todosLosGastos.push(...lista)
      }
      response = todosLosGastos
      // FILTROS TEXTO
      if (filtroActual.value?.esFiltroTexto) {
        response = response.filter((item) => {
          const valor = item[filtroActual.value.campoDatos]

          return String(valor).toLowerCase().includes(String(valorFiltroTexto.value).toLowerCase())
        })
      }
      // ORDENAMIENTOS
      else if (tipoLista.value !== TIPOS_FILTRO.TODOS) {
        const campo = filtroActual.value.campoOrden

        response.sort((a, b) => {
          const valorA = parseFloat(a[campo]) || 0
          const valorB = parseFloat(b[campo]) || 0
          return ordenActual.value === 'desc' ? valorB - valorA : valorA - valorB
        })
      }
    }
    if (Array.isArray(response)) {
      gastos.value = response.map((item) => {
        const result = {
          consecutivo: item.consecutivo || '',
          placa: item.placa || '',
          tipo_gasto: item.tipo_gasto || '',
          valor_gasto: item.valor_gasto || '',
          codigo_referencia: item.codigo_referencia || '',
          fecha_registro: item.fecha_registro || '',
        }
        const campoDatos = filtroActual.value?.campoDatos
        if (campoDatos && item[campoDatos] !== undefined) {
          result.valorFiltro = item[campoDatos]
        }
        return result
      })
    } else {
      console.error('Error en formato de respuesta:', response)
      gastos.value = []
    }
  } catch (error) {
    console.error(`Error al cargar gastos por ${tipoLista.value}:`, error)
    gastos.value = []
  }
}

async function cargarPlacas() {
  try {
    // Conductor no necesita cargar placas, ya tiene la suya
    if (perfilUsuario.value === 'conductor') {
      formulario.value.placa = useUsuario.user?.placa_asignada || ''
      return
    }

    const response = await useVehiculo.obtenerVehiculos()
    if (!Array.isArray(response)) return

    if (perfilUsuario.value === 'administrador') {
      placasOptions.value = response.map((v) => v.placa)
    } else if (perfilUsuario.value === 'propietario') {
      const placasAsignadas =
        useUsuario.user?.placa_asignada?.split(',').map((p) => p.trim().toUpperCase()) || []
      placasOptions.value = response
        .filter((v) => placasAsignadas.includes(v.placa.toUpperCase()))
        .map((v) => v.placa)
    }
  } catch (e) {
    console.error(e)
  }
}

onMounted(async () => {
  await cargarGastos()
  await cargarPlacas()
})

function resetearFormulario() {
  formulario.value = { ...estadoInicial }
  accion.value = 1
}

function mostrarMensajeError(mensaje) {
  $q.notify({
    type: 'negative',
    message: mensaje,
    position: 'bottom-right',
  })
}

function formatPeso(valor) {
  if (!valor) return '-'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor)
}

function formatFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

defineOptions({
  name: 'GastosPage',
})
</script>

<style scoped>
.gastos-card {
  border-radius: 12px !important;
  transition: border-color 0.15s;
}
.gastos-card:active {
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
</style>
