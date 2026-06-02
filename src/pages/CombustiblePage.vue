<template>
  <q-page padding class="bg-grey-2">
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
          @click="ordenActual = op.value;cargarCombustibles();"
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
        {{ combustibles.length }}
      </q-badge>
    </div>

    <!-- Cards de combustible -->
    <div class="q-gutter-y-sm">
      <q-card
        v-for="c in combustibles"
        :key="c.consecutivo"
        flat
        bordered
        class="combustible-card cursor-pointer"
        @click="verDetalles(c.consecutivo)"
      >
        <q-card-section class="q-pa-md">
          <!-- Fila superior: placa + alerta + fecha -->
          <div class="row items-center q-mb-sm">
            <div class="placa-badge q-mr-sm">{{ c.placa }}</div>
            <span class="text-caption text-grey-6">#{{ c.consecutivo }}</span>
            <q-space />
            <q-badge v-if="c.alerta === 'si'" color="negative" text-color="white" rounded>
              <q-icon name="warning" size="11px" class="q-mr-xs" />
              Alerta
            </q-badge>
            <q-badge v-else color="green-1" text-color="green-9" rounded>OK</q-badge>
          </div>

          <!-- Fila de métricas principales -->
          <div class="row q-gutter-x-sm q-mb-sm">
            <div class="metrica-chip col">
              <div class="metrica-label">Galones</div>
              <div class="metrica-valor">{{ c.galones_cargados }}</div>
            </div>
            <div class="metrica-chip col">
              <div class="metrica-label">Valor pagado</div>
              <div class="metrica-valor">{{ formatPeso(c.valor_pagado) }}</div>
            </div>
            <div class="metrica-chip col">
              <div class="metrica-label">$/Galón</div>
              <div class="metrica-valor">{{ formatPeso(c.precio_por_galon) }}</div>
            </div>
          </div>

          <!-- Fila de rendimiento -->
          <div class="row q-gutter-x-sm">
            <div class="metrica-chip col" :class="claseRendimiento(c.diferencia_rendimiento)">
              <div class="metrica-label">Rendimiento real</div>
              <div class="metrica-valor">{{ c.rendimiento_real }} km/gl</div>
            </div>
            <div class="metrica-chip col">
              <div class="metrica-label">Esperado</div>
              <div class="metrica-valor">8 km/gl</div>
            </div>
            <div class="metrica-chip col">
              <div class="metrica-label">Km recorridos</div>
              <div class="metrica-valor">{{ c.km_recorridos }}</div>
            </div>
          </div>

          <!-- Footer: odómetro + fecha -->
          <div
            class="row items-center q-mt-sm"
            style="border-top: 1px solid rgba(0, 0, 0, 0.06); padding-top: 8px"
          >
            <q-icon name="speed" size="14px" color="grey-5" class="q-mr-xs" />
            <span class="text-caption text-grey-6">Odómetro: {{ c.odometro_actual }}</span>
            <q-space />
            <span class="text-caption text-grey-5">{{ formatFecha(c.fecha_registro) }}</span>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div>

<q-dialog v-model="mostrarDetalles" persistent>
  <q-card style="min-width: 350px; max-width: 95vw; border-radius: 16px !important;">

    <!-- Header -->
    <q-card-section class="q-pb-sm">
      <div class="row items-center">
        <div>
          <div class="text-subtitle1 text-weight-medium">Detalles del Combustible</div>
          <div class="text-caption text-grey-6" v-if="detallesCombustible">
            #{{ detallesCombustible.consecutivo }} · {{ formatFecha(detallesCombustible.fecha_registro) }}
          </div>
        </div>
        <q-space />
        <q-badge
          v-if="detallesCombustible"
          :color="detallesCombustible.alerta === 'si' ? 'negative' : 'green-1'"
          :text-color="detallesCombustible.alerta === 'si' ? 'white' : 'green-9'"
          rounded
        >
          <q-icon
            :name="detallesCombustible.alerta === 'si' ? 'warning' : 'check_circle'"
            size="11px"
            class="q-mr-xs"
          />
          {{ detallesCombustible.alerta === 'si' ? 'Alerta' : 'OK' }}
        </q-badge>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section class="q-pt-md" v-if="detallesCombustible">

      <!-- Placa destacada -->
      <div class="row justify-center q-mb-md">
        <div class="placa-badge-lg">{{ detallesCombustible.placa }}</div>
      </div>

      <!-- Métricas principales -->
      <div class="row q-gutter-sm q-mb-md">
        <div class="metrica-chip col">
          <div class="metrica-label">Galones</div>
          <div class="metrica-valor">{{ detallesCombustible.galones_cargados }}</div>
        </div>
        <div class="metrica-chip col">
          <div class="metrica-label">Valor pagado</div>
          <div class="metrica-valor">{{ formatPeso(detallesCombustible.valor_pagado) }}</div>
        </div>
        <div class="metrica-chip col">
          <div class="metrica-label">$/Galón</div>
          <div class="metrica-valor">{{ formatPeso(detallesCombustible.precio_por_galon) }}</div>
        </div>
      </div>

      <!-- Rendimiento -->
      <div class="row q-gutter-sm q-mb-md">
        <div class="metrica-chip col" :class="claseRendimiento(detallesCombustible.diferencia_rendimiento)">
          <div class="metrica-label">Rendimiento real</div>
          <div class="metrica-valor">{{ detallesCombustible.rendimiento_real }} km/gl</div>
        </div>
        <div class="metrica-chip col">
          <div class="metrica-label">Esperado</div>
          <div class="metrica-valor">{{ detallesCombustible.rendimiento_esperado }} km/gl</div>
        </div>
        <div class="metrica-chip col" :class="claseRendimiento(detallesCombustible.diferencia_rendimiento)">
          <div class="metrica-label">Diferencia</div>
          <div class="metrica-valor">{{ detallesCombustible.diferencia_rendimiento }}</div>
        </div>
      </div>

      <!-- Odómetro y km -->
      <div class="row q-gutter-sm q-mb-md">
        <div class="metrica-chip col">
          <div class="metrica-label">Odómetro</div>
          <div class="metrica-valor">{{ detallesCombustible.odometro_actual }} km</div>
        </div>
        <div class="metrica-chip col">
          <div class="metrica-label">Km recorridos</div>
          <div class="metrica-valor">{{ detallesCombustible.km_recorridos }} km</div>
        </div>
      </div>

      <q-separator class="q-mb-md" />

      <!-- Info de factura -->
      <div class="detalle-fila">
        <span class="detalle-label">Estado factura</span>
        <q-badge
          :color="detallesCombustible.estado_factura === 'legalizado' ? 'green-1' : 'orange-1'"
          :text-color="detallesCombustible.estado_factura === 'legalizado' ? 'green-9' : 'orange-9'"
          rounded
        >
          {{ detallesCombustible.estado_factura }}
        </q-badge>
      </div>
      <div class="detalle-fila" v-if="detallesCombustible.numero_factura">
        <span class="detalle-label">N° factura</span>
        <span class="detalle-valor">{{ detallesCombustible.numero_factura }}</span>
      </div>
      <div class="detalle-fila">
        <span class="detalle-label">Usuario</span>
        <span class="detalle-valor">{{ detallesCombustible.usuario }}</span>
      </div>
      <div class="detalle-fila">
        <span class="detalle-label">Correo</span>
        <span class="detalle-valor text-caption">{{ detallesCombustible.correo_usuario }}</span>
      </div>

      <q-separator class="q-my-md" />

      <!-- Legalización -->
      <div class="detalle-fila">
        <span class="detalle-label">Legalización</span>
        <q-toggle
          :model-value="detallesCombustible.estado_factura?.toLowerCase().trim() === 'legalizado'"
          :disable="detallesCombustible.estado_factura?.toLowerCase().trim() !== 'pendiente'"
          color="primary"
          @click="cambiarEstado"
        />
      </div>

      <q-input
        v-if="detallesCombustible.estado_factura === 'pendiente'"
        v-model="numeroFactura"
        label="Número de factura"
        dense
        outlined
        rounded
        class="q-mt-sm q-mb-md"
      />

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

    <!-- Acciones -->
    <q-separator />
    <q-card-actions class="q-pa-md">
      <q-btn
        outline
        color="secondary"
        icon="folder"
        label="Ver archivos"
        size="sm"
        @click="abrirVisor(detallesCombustible.link_factura, 'Documentos')"
      />
      <q-space />
      <q-btn
        flat
        round
        icon="edit"
        color="grey-7"
        :disable="['legalizado'].includes(detallesCombustible?.estado_factura)"
        @click="editar(detallesCombustible)"
      >
        <q-tooltip v-if="['legalizado'].includes(detallesCombustible?.estado_factura)">
          Este combustible no puede ser editado
        </q-tooltip>
      </q-btn>
      <q-btn flat label="Cerrar" color="primary" v-close-popup />
    </q-card-actions>

  </q-card>
</q-dialog>

      <q-dialog v-model="alert" persistent>
        <q-card class="" style="width: 700px">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6 text-weight-bold">
              {{ accion == 1 ? 'Agregar Combustible' : 'Editar Combustible' }}
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
                  v-model="odometroactualFormatted"
                  label="Odómetro"
                  :dense="dense"
                  @update:model-value="formatearOdometroActual"
                />
              </div>

              <div class="col-12">
                <q-input
                  outlined
                  rounded
                  v-model.trim="formulario.galones_cargados"
                  label="Galones cargados"
                  :dense="dense"
                />
              </div>

              <div class="col-12">
                <q-input
                  rounded
                  outlined
                  v-model="valorpagadoFormatted"
                  label="Valor pagado"
                  :dense="dense"
                  @update:model-value="formatearValorpagado"
                />
              </div>
            </div>

            <div class="col-12">
              <q-banner class="q-mt-lg q-mb-sm text-indigo">Adjuntar Archivos</q-banner>
              <q-file
                label="Seleccionar archivos"
                rounded
                outlined
                multiple
                v-model="archivosSeleccionados"
                @update:model-value="manejarSeleccionArchivos"
                accept="image/*, application/pdf, .doc, .docx, .xls, .xlsx, .kml, .kmz"
                clearable
                style="max-width: 400px"
              />

              <div class="q-mt-md row q-col-gutter-sm">
                <q-chip
                  v-for="(archivo, index) in formulario.archivos"
                  :key="index"
                  removable
                  @remove="eliminarArchivo(index)"
                  class="q-ma-xs"
                >
                  {{ archivo.name }}
                  <q-tooltip
                    >{{ archivo.type }} - {{ (archivo.size / 1024).toFixed(2) }} KB</q-tooltip
                  >
                </q-chip>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              @click="guardar"
              color="accent"
              class="text-white"
              :loading="useCombustible.loading"
            >
              {{ accion === 2 ? 'Actualizar' : 'Agregar' }}
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

    <div class="text-center q-mt-md" v-if="hayMas">
      <q-btn flat color="primary" label="Cargar más" :loading="cargando" @click="cargarMas" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useStoreCombustible } from '../stores/combustible'
import { useQuasar } from 'quasar'
import { TIPOS_FILTRO, CONFIG_FILTROS } from '../composables/filtroscombustibles'
import { useStoreUsuarios } from '../stores/usuarios'
import { useStoreVehiculos } from '../stores/vehiculos'
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

const useCombustible = useStoreCombustible()
const useUsuario = useStoreUsuarios()
const useVehiculo = useStoreVehiculos()

const perfilUsuario = computed(() => useUsuario.perfile)

const alert = ref(false)
const accion = ref(1)
const $q = useQuasar()

const paginaActual = ref(1)
const hayMas = ref(false)

async function cargarMas() {
  paginaActual.value++
  await cargarCombustibles()
}

const valorpagadoFormatted = ref('')
const odometroactualFormatted = ref('')

function formatearValorpagado(val) {
  valorpagadoFormatted.value = formatearNumero(val)
  formulario.value.valor_pagado = Number(valorpagadoFormatted.value.replace(/\./g, ''))
}

function formatearOdometroActual(val) {
  odometroactualFormatted.value = formatearNumero(val)
  formulario.value.odometro_actual = Number(odometroactualFormatted.value.replace(/\./g, ''))
}

function formatearNumero(valor) {
  if (!valor) return ''
  const limpio = valor.toString().replace(/\D/g, '')
  return new Intl.NumberFormat('es-CO').format(limpio)
}

const estadoInicial = {
  placa: '',
  odometro_actual: '',
  galones_cargados: '',
  valor_pagado: '',
  archivos: [],
}

const numeroFactura = ref('')

const formulario = ref({ ...estadoInicial })
const cargando = ref(false)

const tipoLista = ref(TIPOS_FILTRO.TODOS)
const ordenActual = ref('desc')
const combustibles = ref([])
const valorFiltroTexto = ref(null)

const detallesCombustible = ref(null)
const mostrarDetalles = ref(false)

const placasOptions = ref([])

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
    const formData = new FormData()

    Object.entries(formulario.value).forEach(([key, value]) => {
      if (key === 'archivos' && Array.isArray(value)) {
        value.forEach((file) => {
          formData.append('archivos', file)
        })
      } else if (Array.isArray(value)) {
        formData.append(key, value.join(','))
      } else if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value)
      }
    })

    let response

    if (accion.value === 2) {
      response = await useCombustible.putCombustible(formulario.value.consecutivo, formData)
    } else {
      response = await useCombustible.postCombustible(formData)
    }

    console.log('Respuesta exitosa:', response)

    cerrar()
    cargarCombustibles()
    resetearFormulario()
  } catch (error) {
    console.error('Error completo:', error)
    mostrarMensajeError('Error al guardar el combustible')
  } finally {
    cargando.value = false
  }
}

function editar(combustible) {
  accion.value = 2

  formulario.value = {
    ...estadoInicial,
    ...combustible,
  }

  valorpagadoFormatted.value = formatearNumero(combustible.valor_pagado || 0)

  odometroactualFormatted.value = formatearNumero(combustible.odometro_actual || 0)

  alert.value = true
}

async function validar() {
  let verificado = true

  const { placa, odometro_actual, galones_cargados } = formulario.value

  if (placa === '') {
    mostrarMensajeError('Diligencie la placa')
    verificado = false
  }
  if (odometro_actual === '') {
    mostrarMensajeError('Diligencie el odometro actual')
    verificado = false
  }
  if (galones_cargados === '') {
    mostrarMensajeError('Diligencie los galones cargados')
    verificado = false
  }

  return verificado
}

async function verDetalles(consecutivo) {
  try {
    const detalle = await useCombustible.obtenerdatosdecombustible(consecutivo)
    // console.log('Detalles obtenidos:', detalle)

    if (detalle) {
      detallesCombustible.value = {
        consecutivo: detalle['consecutivo'] || '',
        fecha_registro: detalle['fecha_registro'] || '',
        placa: detalle['placa'] || '',
        odometro_actual: detalle['odometro_actual'] || '',
        galones_cargados: detalle['galones_cargados'] || '',
        valor_pagado: detalle['valor_pagado'] || '',
        precio_por_galon: detalle['precio_por_galon'] || '',
        km_recorridos: detalle['km_recorridos'] || '',
        rendimiento_real: detalle['rendimiento_real'] || '',
        rendimiento_esperado: detalle['rendimiento_esperado'] || '',
        diferencia_rendimiento: detalle['diferencia_rendimiento'] || '',
        alerta: detalle['alerta'] || '',
        correo_usuario: detalle['correo_usuario'] || '',
        usuario: detalle['usuario'] || '',
        estado_factura: detalle['estado_factura'] || '',
        numero_factura: detalle['numero_factura'] || '',
        link_factura: detalle['link_factura'] || '',
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

watch([tipoLista, valorFiltroTexto, ordenActual], async () => {
  paginaActual.value = 1
  await cargarCombustibles()
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

  cargarCombustibles()
}

function actualizarValorFiltro(nuevoValor) {
  valorFiltroTexto.value = nuevoValor
  cargarCombustibles()
}

// function obtenerEtiquetaValor(valor, item) {
//   if (tipoLista.value === TIPOS_FILTRO.MES) {
//     return `${Number(item.valor_pagado).toLocaleString('es-CO')} COP`
//   }

//   if (tipoLista.value === TIPOS_FILTRO.VALOR_PAGADO) {
//     return `${valor} COP`
//   } else if (tipoLista.value === TIPOS_FILTRO.PRECIO_POR_GALON) {
//     return `${valor} COP`
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

async function cargarCombustibles() {
  try {
    let response = []
    let hayMasData = false

    if (perfilUsuario.value === 'administrador') {
      if (tipoLista.value === TIPOS_FILTRO.TODOS) {
        const res = await useCombustible.obtenerCombustible(paginaActual.value)
        response = res.datos
        hayMasData = res.hayMas
      } else if (filtroActual.value.esFiltroTexto) {
        response = await useCombustible.obtenerCombustiblesFiltrados(
          filtroActual.value.campoDatos,
          valorFiltroTexto.value,
        )
      } else {
        response = await useCombustible.obtenerCombustiblesOrdenados(
          filtroActual.value.campoOrden,
          ordenActual.value,
        )
      }
    } else {
      const placasUsuario = useUsuario.user?.placa_asignada?.split(',').map((p) => p.trim()) || []
      let todosLosCombustibles = []
      for (const placa of placasUsuario) {
        const data = await useCombustible.obtenerResumenPorPlaca(placa)
        const lista = data?.resumen?.total?.consecutivos || []
        todosLosCombustibles.push(...lista)
      }
      response = todosLosCombustibles
      if (filtroActual.value?.esFiltroTexto) {
        response = response.filter((item) => {
          const valor = item[filtroActual.value.campoDatos]
          return String(valor).toLowerCase().includes(String(valorFiltroTexto.value).toLowerCase())
        })
      } else if (tipoLista.value !== TIPOS_FILTRO.TODOS) {
        const campo = filtroActual.value.campoOrden
        response.sort((a, b) => {
          const valorA = parseFloat(a[campo]) || 0
          const valorB = parseFloat(b[campo]) || 0
          return ordenActual.value === 'desc' ? valorB - valorA : valorA - valorB
        })
      }
    }

    hayMas.value = hayMasData

    if (Array.isArray(response)) {
      const nuevos = response.map((item) => {
        const result = {
          consecutivo: item.consecutivo || '',
          placa: item.placa || '',
          valor_pagado: item.valor_pagado || 0,
          galones_cargados: item.galones_cargados || 0,
          alerta: item.alerta || 0,
          precio_por_galon: item.precio_por_galon || 0,
          diferencia_rendimiento: item.diferencia_rendimiento || 0,
          rendimiento_real: item.rendimiento_real || 0,
          km_recorridos: item.km_recorridos || 0,
          odometro_actual: item.odometro_actual || 0,
          fecha_registro: item.fecha_registro || 0,
        }
        const campoDatos = filtroActual.value?.campoDatos
        if (campoDatos && item[campoDatos] !== undefined) {
          result.valorFiltro = item[campoDatos]
        }
        if (tipoLista.value === TIPOS_FILTRO.MES) {
          result.valorFiltro = item.valor_pagado
        }
        return result
      })

      if (paginaActual.value === 1) {
        combustibles.value = nuevos
      } else {
        combustibles.value = [...combustibles.value, ...nuevos]
      }
    } else {
      combustibles.value = []
    }
  } catch (error) {
    console.error(`Error al cargar combustibles por ${tipoLista.value}:`, error)
    combustibles.value = []
  }
}

onMounted(async () => {
  await cargarCombustibles()
  await cargarPlacas()
})

const cambiarEstado = async () => {
  try {
    if (detallesCombustible.value.estado_factura === 'pendiente') {
      if (!numeroFactura.value) {
        $q.notify({
          type: 'warning',
          message: 'Debes ingresar número de factura',
        })
        return
      }

      await useCombustible.putLegalizarCombustible(detallesCombustible.value.consecutivo, {
        numero_factura: numeroFactura.value,
      })

      detallesCombustible.value.estado_factura = 'legalizado'
    }
  } catch (error) {
    console.error('Error:', error)

    $q.notify({
      type: 'negative',
      message: error.response?.data?.mensaje || 'Error al legalizar',
    })
  }
}

function manejarSeleccionArchivos(files) {
  if (files) {
    // Si es array de archivos
    if (Array.isArray(files)) {
      files.forEach((file) => {
        // Verificar si el archivo ya existe en la lista (evitar duplicados)
        const existeArchivo = formulario.value.archivos.some(
          (a) => a.name === file.name && a.size === file.size && a.type === file.type,
        )

        if (!existeArchivo) {
          formulario.value.archivos.push(file)
        }
      })
    }
    // Si es un solo archivo
    else if (files instanceof File) {
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
  valorpagadoFormatted.value = ''
  odometroactualFormatted.value = ''
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

function claseRendimiento(diferencia) {
  if (!diferencia) return ''
  return Number(diferencia) < 0 ? 'rendimiento-malo' : 'rendimiento-bueno'
}

defineOptions({
  name: 'CombustiblePage',
})
</script>

<style scoped>
.combustible-card {
  border-radius: 12px !important;
  transition: border-color 0.15s;
}
.combustible-card:active {
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
