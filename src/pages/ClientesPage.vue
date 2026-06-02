<template>
  <q-page class="flex flex-center">
    <!-- <q-card-section>
      <div class="row items-center q-col-gutter-md">
        <div class="col-12 col-md-auto">
          <q-btn-group spread>
            <q-btn
              v-for="(config, tipo) in filtrosConfig"
              :key="tipo"
              :label="tipo === 'todos' ? 'Todos' : `Por ${config.titulo.split(' ').pop()}`"
              :icon="config.icono"
              :color="config.color"
              @click="cargarListaPor(tipo)"
              :outline="tipoLista !== tipo"
            />
          </q-btn-group>
        </div>

        <div class="col-12 col-md-auto" v-if="tipoLista !== 'todos' && !filtroActual.esFiltroTexto">
          <q-btn-toggle
            v-model="ordenActual"
            toggle-color="primary"
            :options="opcionesOrdenamiento"
            @update:model-value="cargarClientes"
          />
        </div>

        <div class="col-12 col-md-auto" v-if="filtroActual.esFiltroTexto">
          <q-select
            v-model="valorFiltroTexto"
            :options="opcionesFiltroTexto"
            option-value="valor"
            option-label="etiqueta"
            dense
            outlined
            emit-value
            map-options
            @update:model-value="actualizarValorFiltro"
          />
        </div>
      </div>
    </q-card-section>

    <q-card-section>
      <div class="text-h6 q-mb-md">
        <q-icon :name="filtroActual.icono" :color="filtroActual.color" />
        {{ filtroActual.titulo }}
        <span v-if="filtroActual.esFiltroTexto && valorFiltroTexto">
          - {{ obtenerEtiquetaFiltroTexto(valorFiltroTexto) }}
        </span>
      </div>

      <q-list bordered separator>
        <q-item
          v-for="cliente in clientes"
          :key="cliente.codigo"
          clickable
          @click="verDetalles(cliente.codigo)"
        >
          <q-item-section>
            <q-item-label>{{ cliente.codigo }} - {{ cliente.empresa }}</q-item-label>
            <q-item-label caption v-if="cliente.valorFiltro !== undefined">
              {{ obtenerEtiquetaValor(cliente.valorFiltro) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section> -->

  <!-- Barra de filtros -->
    <div class="filter-bar q-mb-md">
      <div class="filter-scroll row no-wrap q-gutter-x-sm q-pb-xs">
        <q-chip
          v-for="(config, tipo) in filtrosConfig"
          :key="tipo"
          clickable
          :icon="config.icono"
          :color="tipoLista === tipo ? 'primary' : 'grey-2'"
          :text-color="tipoLista === tipo ? 'white' : 'grey-8'"
          :outline="false"
          class="filter-chip"
          @click="cargarListaPor(tipo)"
        >
          {{ tipo === 'todos' ? 'Todos' : config.titulo.split(' ').pop() }}
        </q-chip>
      </div>

      <!-- Ordenamiento (solo si aplica) -->
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
          @click="ordenActual = op.value; cargarClientes()"
        >
          {{ op.label }}
        </q-chip>
      </div>

      <!-- Select de filtro texto -->
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

    <!-- Encabezado de sección -->
    <div class="row items-center q-mb-sm">
      <q-icon :name="filtroActual.icono" :color="filtroActual.color" size="20px" />
      <span class="text-subtitle1 text-weight-medium q-ml-xs">
        {{ filtroActual.titulo }}
        <span v-if="filtroActual.esFiltroTexto && valorFiltroTexto">
          · {{ obtenerEtiquetaFiltroTexto(valorFiltroTexto) }}
        </span>
      </span>
      <q-badge
        color="blue-1"
        text-color="blue-9"
        class="q-ml-auto"
        rounded
      >
        {{ clientes.length }}
      </q-badge>
    </div>

    <!-- Lista de clientes -->
    <div class="q-gutter-y-sm">
      <q-card
        v-for="cliente in clientes"
        :key="cliente.codigo"
        flat
        bordered
        class="cliente-card cursor-pointer"
        @click="verDetalles(cliente.codigo)"
      >
        <q-card-section horizontal class="items-center q-pa-md">

          <!-- Avatar con iniciales -->
          <div class="avatar-chip q-mr-md">
            {{ iniciales(cliente.empresa) }}
          </div>

          <!-- Info principal -->
          <div class="col">
            <div class="text-body2 text-weight-medium ellipsis">
              {{ cliente.empresa }}
            </div>
            <div class="text-caption text-grey-6 q-mt-xs" style="font-family: monospace">
              {{ cliente.codigo }}
            </div>
            <div class="row items-center q-gutter-x-sm q-mt-xs" v-if="cliente.valorFiltro !== undefined">
              <q-badge
                :color="colorEstado(cliente)"
                text-color="white"
                rounded
                class="text-caption"
              >
                {{ obtenerEtiquetaValor(cliente.valorFiltro) }}
              </q-badge>
            </div>
          </div>

          <q-icon name="chevron_right" color="grey-4" />
        </q-card-section>
      </q-card>
    </div>
    
    <div>
<q-dialog v-model="mostrarDetalles" persistent>
  <q-card
    style="min-width:350px; max-width:95vw; width:500px; border-radius:16px !important;"
  >

    <!-- Header -->
    <q-card-section class="q-pb-sm">
      <div
        class="row items-center"
        v-if="detallesCliente"
      >
        <div class="avatar-chip q-mr-md">
          {{ detallesCliente.empresa?.substring(0,2).toUpperCase() }}
        </div>

        <div class="col">
          <div class="text-subtitle1 text-weight-medium">
            {{ detallesCliente.empresa }}
          </div>

          <div class="text-caption text-grey-6">
            {{ detallesCliente.nit }}
          </div>
        </div>

        <q-badge
          :color="detallesCliente.estado === 'activo' ? 'green-1' : 'red-1'"
          :text-color="detallesCliente.estado === 'activo' ? 'green-8' : 'red-8'"
          rounded
        >
          {{ detallesCliente.estado }}
        </q-badge>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section
      v-if="detallesCliente"
      class="q-pt-md"
      style="max-height:65vh; overflow-y:auto"
    >

      <!-- Banner -->
      <div class="ganancia-banner ganancia-positiva q-mb-md">
        <div
          class="text-caption"
          style="opacity:.7"
        >
          Cliente registrado
        </div>

        <div class="text-h6 text-weight-bold">
          {{ detallesCliente.empresa }}
        </div>
      </div>

      <!-- Información General -->
      <div class="seccion-titulo">
        Información general
      </div>

      <div class="detalle-fila">
        <span class="detalle-label">Código</span>
        <span class="detalle-valor">
          {{ detallesCliente.codigo }}
        </span>
      </div>

      <div class="detalle-fila">
        <span class="detalle-label">Empresa</span>
        <span class="detalle-valor">
          {{ detallesCliente.empresa }}
        </span>
      </div>

      <div class="detalle-fila">
        <span class="detalle-label">NIT</span>
        <span class="detalle-valor">
          {{ detallesCliente.nit }}
        </span>
      </div>

      <div class="detalle-fila">
        <span class="detalle-label">Estado</span>
        <span class="detalle-valor">
          {{ detallesCliente.estado }}
        </span>
      </div>

      <div class="detalle-fila">
        <span class="detalle-label">Fecha creación</span>
        <span class="detalle-valor">
          {{ formatFecha(detallesCliente.fecha_creacion) }}
        </span>
      </div>

      <!-- Contacto -->
      <div class="seccion-titulo q-mt-md">
        Contacto
      </div>

      <div class="detalle-fila">
        <span class="detalle-label">Teléfono</span>
        <span class="detalle-valor">
          {{ detallesCliente.telefono }}
        </span>
      </div>

      <div class="detalle-fila">
        <span class="detalle-label">Email</span>
        <span class="detalle-valor">
          {{ detallesCliente.email }}
        </span>
      </div>

      <!-- Facturación -->
      <div class="seccion-titulo q-mt-md">
        Facturación
      </div>

      <div class="detalle-fila">
        <span class="detalle-label">Frecuencia pago</span>
        <span class="detalle-valor">
          {{ detallesCliente.tipo_pago }}
        </span>
      </div>

      <div class="detalle-fila">
        <span class="detalle-label">Rete fuente</span>
        <span class="detalle-valor">
          {{ detallesCliente.rete_fuente }}
        </span>
      </div>

      <div class="detalle-fila">
        <span class="detalle-label">Rete ICA</span>
        <span class="detalle-valor">
          {{ detallesCliente.rete_ica }}
        </span>
      </div>

      <!-- Indicadores -->
      <div class="seccion-titulo q-mt-md">
        Indicadores
      </div>

      <div class="row q-gutter-sm q-mb-sm">

        <div class="metrica-chip col">
          <div class="metrica-label">Viajes</div>
          <div class="metrica-valor">
            {{ detallesCliente.viajes }}
          </div>
        </div>

        <div class="metrica-chip col">
          <div class="metrica-label">Estado</div>
          <div class="metrica-valor">
            {{ detallesCliente.estado }}
          </div>
        </div>

      </div>

      <!-- Resumen financiero -->
      <div class="seccion-titulo q-mt-md">
        Resumen financiero
      </div>

      <div class="detalle-fila">
        <span class="detalle-label">Valor estimado</span>
        <span class="detalle-valor">
          {{ formatPeso(detallesCliente.total_valor_viaje_estimado) }}
        </span>
      </div>

      <div class="detalle-fila">
        <span class="detalle-label">Valor real</span>
        <span class="detalle-valor">
          {{ formatPeso(detallesCliente.total_valor_viaje_real) }}
        </span>
      </div>

      <div class="detalle-fila">
        <span class="detalle-label">Ganancia total</span>
        <span class="detalle-valor text-positive">
          {{ formatPeso(detallesCliente.total_ganancia_viaje) }}
        </span>
      </div>

      <!-- Configuración -->
      <div class="seccion-titulo q-mt-md">
        Configuración
      </div>

      <div class="detalle-fila">
        <span class="detalle-label">Activación</span>

        <q-toggle
          v-model="isActive"
          :color="detallesCliente.estado === 'activo' ? 'grey' : 'primary'"
          @update:model-value="cambiarEstado"
        />
      </div>

    </q-card-section>

    <q-separator />

    <q-card-actions class="q-pa-md">

      <q-btn
        flat
        round
        icon="edit"
        color="grey-7"
        @click="editar(detallesCliente)"
      />

      <q-space />

      <q-btn
        flat
        label="Cerrar"
        color="primary"
        v-close-popup
      />

    </q-card-actions>

  </q-card>
</q-dialog>
      <q-dialog v-model="alert" persistent>
        <q-card class="bg-grey-2">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6 text-weight-bold">
              {{ accion == 1 ? 'Agregar Cliente' : 'Editar Cliente' }}
            </div>
          </q-card-section>

          <q-card-section class="q-pa-md">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input
                  outlined
                  rounded
                  v-model.trim="formulario.empresa"
                  label="Nombre de la empresa"
                  :dense="dense"
                />
              </div>

              <div class="col-12">
                <q-input
                  outlined
                  rounded
                  v-model.trim="formulario.nit"
                  label="NIT"
                  :dense="dense"
                />
              </div>
              <div class="col-12">
                <q-input
                  outlined
                  rounded
                  v-model.trim="formulario.telefono"
                  label="Teléfono"
                  :dense="dense"
                />
              </div>
              <div class="col-12">
                <q-input
                  outlined
                  rounded
                  v-model.trim="formulario.email"
                  label="Email"
                  :dense="dense"
                />
              </div>

              <div class="col-12">
                <q-select
                  outlined
                  rounded
                  v-model="formulario.tipo_pago"
                  label="Frecuencia de pago:"
                  :options="tipoPagoOptions"
                />
              </div>

              <div class="col-12">
                <q-select
                  outlined
                  rounded
                  v-model="formulario.rete_fuente"
                  label="Rete Fuente:"
                  :options="reteFuenteOptions"
                />
              </div>

              <div class="col-12">
                <q-input
                  outlined
                  rounded
                  v-model.trim="formulario.rete_ica"
                  label="Rete ICA"
                  :dense="dense"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn @click="guardar" color="accent" class="text-white" :loading="useCliente.loading">
              {{ esEdicion ? 'Actualizar' : 'Agregar' }}
              <template v-slot:loading>
                <q-spinner color="white" size="1em" />
              </template>
            </q-btn>
            <q-btn label="Cerrar" color="black" outline @click="cerrar()" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>

    <!-- <q-btn color="primary" :label="'Registrar nuevo'" class="q-mt-md" @click="abrir" /> -->
  
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" @click="abrir" />
    </q-page-sticky>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useStoreClientes } from '../stores/clientes'
import { useQuasar } from 'quasar'
import { TIPOS_FILTRO, CONFIG_FILTROS } from '../composables/filtrosclientes'

const useCliente = useStoreClientes()
const alert = ref(false)
const accion = ref(1)
const $q = useQuasar()

const estadoInicial = {
  empresa: '',
  nit: '',
  telefono: '',
  email: '',
  tipo_pago: '',
  rete_fuente: '',
  rete_ica: '',
}

const formulario = ref({ ...estadoInicial })
const cargando = ref(false)

const tipoLista = ref(TIPOS_FILTRO.TODOS)
const ordenActual = ref('desc')
const clientes = ref([])
const valorFiltroTexto = ref(null)

const detallesCliente = ref(null)
const mostrarDetalles = ref(false)

const tipoPagoOptions = ['Quincenal', 'Mensual']
const reteFuenteOptions = ['si', 'no']

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
      response = await useCliente.putCliente(formulario.value.codigo, dataEnviar)
    } else {
      response = await useCliente.postCliente(dataEnviar)
    }
    console.log('Respuesta exitosa:', response)

    cerrar()
    cargarClientes()
    resetearFormulario()
  } catch (error) {
    console.error('Error completo:', error)
    mostrarMensajeError('Error al guardar el cliente')
  } finally {
    cargando.value = false
  }
}

function editar(cliente) {
  accion.value = 2

  formulario.value = {
    ...estadoInicial,
    ...cliente,
  }

  alert.value = true
}

async function validar() {
  let verificado = true

  const { empresa, nit, rete_fuente } = formulario.value

  if (empresa === '') {
    mostrarMensajeError('Diligencie la empresa')
    verificado = false
  }
  if (nit === '') {
    mostrarMensajeError('Diligencie el nit')
    verificado = false
  }
  if (rete_fuente === '') {
    mostrarMensajeError('Seleccione si aplica retefuente')
    verificado = false
  }

  return verificado
}

async function verDetalles(codigo) {
  try {
    const detalle = await useCliente.obtenerdatoscliente(codigo)
    // console.log('Detalles obtenidos:', detalle)

    if (detalle) {
      detallesCliente.value = {
        codigo: detalle['codigo'] || '',
        empresa: detalle['empresa'] || '',
        nit: detalle['nit'] || '',
        estado: detalle['estado'] || '',
        viajes: detalle['viajes'] || '',
        telefono: detalle['telefono'] || '',
        email: detalle['email'] || '',
        tipo_pago: detalle['tipo_pago'] || '',
        rete_fuente: detalle['rete_fuente'] || '',
        rete_ica: detalle['rete_ica'] || '',
        fecha_creacion: detalle['fecha_creacion'] || '',
        total_valor_viaje_estimado: detalle['total_valor_viaje_estimado'] || '',
        total_valor_viaje_real: detalle['total_valor_viaje_real'] || '',
        total_ganancia_viaje: detalle['total_ganancia_viaje'] || '',
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

  cargarClientes()
}

function actualizarValorFiltro(nuevoValor) {
  valorFiltroTexto.value = nuevoValor
  cargarClientes()
}

function obtenerEtiquetaValor(valor) {
  if (tipoLista.value === TIPOS_FILTRO.VIAJES) {
    return `${valor}`
  } else if (tipoLista.value === TIPOS_FILTRO.ESTADO) {
    return `${valor}`
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

async function cargarClientes() {
  try {
    let response

    if (tipoLista.value === TIPOS_FILTRO.TODOS) {
      response = await useCliente.obtenerClientes()
    } else if (filtroActual.value.esFiltroTexto) {
      response = await useCliente.obtenerClientesFiltrados(
        filtroActual.value.campoDatos,
        valorFiltroTexto.value,
      )
    } else {
      response = await useCliente.obtenerClientesOrdenados(
        filtroActual.value.campoOrden,
        ordenActual.value,
      )
    }

    if (Array.isArray(response)) {
      clientes.value = response.map((item) => {
        const result = {
          codigo: item['codigo'] || '',
          empresa: item['empresa'] || '',
        }

        const campoDatos = filtroActual.value?.campoDatos

        if (campoDatos && item[campoDatos] !== undefined) {
          result.valorFiltro = item[campoDatos]
        }

        return result
      })
    } else {
      clientes.value = []
    }
  } catch (error) {
    console.error(`Error al cargar clientes por ${tipoLista.value}:`, error)
    clientes.value = []
  }
}
onMounted(() => {
  cargarClientes()
})

const isActive = computed({
  get: () => detallesCliente.value && detallesCliente.value.estado === 'activo',
  set: () => {},
})
const cambiarEstado = async () => {
  try {
    if (detallesCliente.value.estado === 'activo') {
      await useCliente.putDesactivarCliente(detallesCliente.value.codigo)
      detallesCliente.value.estado = 'inactivo'
    } else {
      await useCliente.putActivarCliente(detallesCliente.value.codigo)
      detallesCliente.value.estado = 'activo'
    }
  } catch (error) {
    console.error('Error al cambiar estado del cliente:', error)
  }
}

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

function iniciales(empresa) {
  return empresa
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

function colorEstado(cliente) {
  // Ajusta esto según tu lógica de negocio
  if (!cliente.valorFiltro) return 'grey'
  if (cliente.valorFiltro < 0) return 'negative'
  if (cliente.valorFiltro < 30) return 'warning'
  return 'positive'
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
  name: 'ClientesPage',
})

</script>

<style scoped>
.cliente-card {
  border-radius: 12px !important;
  transition: border-color 0.15s;
}
.cliente-card:active {
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
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.detalle-fila:last-child {
  border-bottom: none;
}
.detalle-label {
  font-size: 13px;
  color: #9CA3AF;
}
.detalle-valor {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  text-align: right;
  max-width: 60%;
}
</style>
