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
          @click="ordenActual = op.value; cargarMantenimientos()"
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
      <q-icon
        :name="filtroActual.icono"
        :color="filtroActual.color"
        size="20px"
      />

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
        {{ mantenimientos.length }}
      </q-badge>
    </div>

    <!-- Cards -->
    <div class="q-gutter-y-sm">
      <q-card
        v-for="mantenimiento in mantenimientos"
        :key="mantenimiento.consecutivo"
        flat
        bordered
        class="mantenimiento-card cursor-pointer"
        @click="verDetalles(mantenimiento.consecutivo)"
      >
        <q-card-section class="q-pa-md">

          <div class="row items-center q-mb-sm">
            <div class="avatar-chip q-mr-md">
              {{ mantenimiento.placa?.substring(0,2) }}
            </div>

            <div class="col">
              <div class="text-body2 text-weight-medium">
                {{ mantenimiento.placa }}
              </div>

              <div class="text-caption text-grey-6">
                #{{ mantenimiento.consecutivo }}
              </div>
            </div>

            <q-space />

            <q-badge
              color="blue-1"
              text-color="blue-9"
              rounded
              class="text-caption"
            >
              {{ mantenimiento.tipo_mantenimiento }}
            </q-badge>
          </div>

          <div class="row q-gutter-sm">
            <div class="metrica-chip col">
              <div class="metrica-label">Valor</div>
              <div class="metrica-valor">
                {{ formatPeso(mantenimiento.valor_mantenimiento) }}
              </div>
            </div>

            <div class="metrica-chip col">
              <div class="metrica-label">Odómetro</div>
              <div class="metrica-valor">
                {{ mantenimiento.odometro }}
              </div>
            </div>

            <div
              v-if="mantenimiento.valorFiltro !== undefined"
              class="metrica-chip col"
            >
              <div class="metrica-label">Categoría</div>
              <div class="metrica-valor">
                {{ obtenerEtiquetaValor(mantenimiento.valorFiltro) }}
              </div>
            </div>
          </div>

          <div
            class="row items-center q-mt-sm"
            style="border-top: 1px solid rgba(0,0,0,.06); padding-top:8px"
          >
            <q-icon
              name="event"
              size="13px"
              color="grey-5"
              class="q-mr-xs"
            />

            <span class="text-caption text-grey-5">
              {{ formatFecha(mantenimiento.fecha_creacion) }}
            </span>

            <q-space />

            <q-icon
              name="chevron_right"
              color="grey-4"
              size="16px"
            />
          </div>

        </q-card-section>
      </q-card>
    </div>

    <!-- Dialog Detalles -->
    <q-dialog v-model="mostrarDetalles" persistent>
      <q-card
        style="min-width: 350px; max-width:95vw; width:500px; border-radius:16px !important;"
      >

        <!-- Header -->
        <q-card-section class="q-pb-sm">
          <div
            class="row items-center"
            v-if="detallesMantenimiento"
          >
            <div class="avatar-chip q-mr-md">
              {{ detallesMantenimiento.placa?.substring(0,2) }}
            </div>

            <div class="col">
              <div class="text-subtitle1 text-weight-medium">
                {{ detallesMantenimiento.placa }}
              </div>

              <div class="text-caption text-grey-6">
                #{{ detallesMantenimiento.consecutivo }}
              </div>
            </div>

            <q-badge
              color="blue-1"
              text-color="blue-9"
              rounded
            >
              {{ detallesMantenimiento.tipo_mantenimiento }}
            </q-badge>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section
          class="q-pt-md"
          v-if="detallesMantenimiento"
          style="max-height:65vh; overflow-y:auto"
        >

          <!-- Banner -->
          <div class="ganancia-banner ganancia-positiva q-mb-md">
            <div
              class="text-caption"
              style="opacity:.7"
            >
              Valor del mantenimiento
            </div>

            <div class="text-h6 text-weight-bold">
              {{ formatPeso(detallesMantenimiento.valor_mantenimiento) }}
            </div>
          </div>

          <!-- General -->
          <div class="seccion-titulo">
            Información general
          </div>

          <div class="detalle-fila">
            <span class="detalle-label">Consecutivo</span>
            <span
              class="detalle-valor"
              style="font-family: monospace"
            >
              #{{ detallesMantenimiento.consecutivo }}
            </span>
          </div>

          <div class="detalle-fila">
            <span class="detalle-label">Placa</span>
            <span class="detalle-valor">
              {{ detallesMantenimiento.placa }}
            </span>
          </div>

          <div class="detalle-fila">
            <span class="detalle-label">Tipo</span>
            <span class="detalle-valor">
              {{ detallesMantenimiento.tipo_mantenimiento }}
            </span>
          </div>

          <div class="detalle-fila">
            <span class="detalle-label">Descripción</span>
            <span class="detalle-valor">
              {{ detallesMantenimiento.descripcion }}
            </span>
          </div>

          <div class="detalle-fila">
            <span class="detalle-label">Fecha creación</span>
            <span class="detalle-valor">
              {{ formatFecha(detallesMantenimiento.fecha_creacion) }}
            </span>
          </div>

          <!-- Métricas -->
          <div class="seccion-titulo q-mt-md">
            Valores
          </div>

          <div class="row q-gutter-sm q-mb-sm">
            <div class="metrica-chip col">
              <div class="metrica-label">Valor</div>
              <div class="metrica-valor">
                {{ formatPeso(detallesMantenimiento.valor_mantenimiento) }}
              </div>
            </div>

            <div class="metrica-chip col">
              <div class="metrica-label">Odómetro</div>
              <div class="metrica-valor">
                {{ detallesMantenimiento.odometro }}
              </div>
            </div>
          </div>

          <!-- Registro -->
          <div class="seccion-titulo q-mt-md">
            Registro
          </div>

          <div class="detalle-fila">
            <span class="detalle-label">Usuario</span>
            <span class="detalle-valor">
              {{ detallesMantenimiento.usuario }}
            </span>
          </div>

          <div class="detalle-fila">
            <span class="detalle-label">Correo</span>
            <span class="detalle-valor">
              {{ detallesMantenimiento.correo_usuario }}
            </span>
          </div>

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

        <q-separator />

        <q-card-actions class="q-pa-md">

          <q-btn
            outline
            color="secondary"
            icon="folder"
            label="Ver archivos"
            size="sm"
            @click="abrirVisor(detallesMantenimiento.link, 'Documentos')"
          />

          <q-space />

          <q-btn
            color="grey-7"        
            flat
            round
            icon="edit"
            label="Editar"
            @click="editar(detallesMantenimiento)"
          />

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
              {{ accion == 1 ? 'Agregar Mantenimiento' : 'Editar Mantenimiento' }}
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
                <q-select
                  outlined
                  rounded
                  v-model="formulario.tipo_mantenimiento"
                  label="Tipo de mantenimiento:"
                  :options="tipoMantenimientoOptions"
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

              <div class="col-12">
                <q-input
                  outlined
                  rounded
                  v-model="valmantenimientoFormatted"
                  label="Valor del mantenimiento"
                  :dense="dense"
                  @update:model-value="formatearValMantenimiento"
                />
              </div>

              <div class="col-12">
                <q-input
                  outlined
                  rounded
                  v-model="odometroFormatted"
                  label="Odómetro"
                  :dense="dense"
                  @update:model-value="formatearOdometro"
                />
              </div>

              <div class="col-12">
                <q-banner class="q-mt-lg q-mb-sm text-indigo">Adjuntar Archivos</q-banner>
                <q-file
                  label="Seleccionar archivos"
                  outlined
                  rounded
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
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              @click="guardar"
              color="accent"
              class="text-white"
              :loading="useMantenimiento.loading"
            >
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
import { useStoreMantenimiento } from '../stores/mantenimientos'
import { useStoreVehiculos } from '../stores/vehiculos'
import { useStoreUsuarios } from '../stores/usuarios'
import { useQuasar } from 'quasar'
import { TIPOS_FILTRO, CONFIG_FILTROS } from '../composables/filtrosmantenimientos'
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

const useMantenimiento = useStoreMantenimiento()
const useVehiculo = useStoreVehiculos()
const useUsuario = useStoreUsuarios()

const alert = ref(false)
const accion = ref(1)
const $q = useQuasar()
const valmantenimientoFormatted = ref('')
const odometroFormatted = ref('')

const estadoInicial = {
  placa: '',
  tipo_mantenimiento: '',
  descripcion: '',
  valor_mantenimiento: '',
  odometro: '',
  archivos: [],
}

const formulario = ref({ ...estadoInicial })
const cargando = ref(false)

const tipoLista = ref(TIPOS_FILTRO.TODOS)
const ordenActual = ref('desc')
const mantenimientos = ref([])
const valorFiltroTexto = ref(null)

const detallesMantenimiento = ref(null)
const mostrarDetalles = ref(false)

const placasOptions = ref([])
const perfilUsuario = computed(() => useUsuario.perfile)

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

const tipoMantenimientoOptions = ['Correctivo', 'Preventivo']

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
      response = await useMantenimiento.putMantenimiento(formulario.value.consecutivo, formData)
    } else {
      response = await useMantenimiento.postMantenimiento(formData)
    }

    console.log('Respuesta exitosa:', response)

    cerrar()
    cargarMantenimientos()
    resetearFormulario()
  } catch (error) {
    console.error('Error completo:', error)
    mostrarMensajeError('Error al guardar el mantenimiento')
  } finally {
    cargando.value = false
  }
}

function editar(mantenimiento) {
  accion.value = 2

  formulario.value = {
    ...estadoInicial,
    ...mantenimiento,
  }

  valmantenimientoFormatted.value = formatearNumero(mantenimiento.valor_mantenimiento || 0)

  odometroFormatted.value = formatearNumero(mantenimiento.odometro || 0)

  alert.value = true
}

async function validar() {
  let verificado = true

  const { placa, tipo_mantenimiento, valor_mantenimiento, odometro } = formulario.value

  if (placa === '') {
    mostrarMensajeError('Seleccione la placa')
    verificado = false
  }
  if (tipo_mantenimiento === '') {
    mostrarMensajeError('Seleccione el tipo demantenimiento')
    verificado = false
  }
  if (valor_mantenimiento === '') {
    mostrarMensajeError('Diligencie el valor del mantenimiento')
    verificado = false
  }
  if (odometro === '') {
    mostrarMensajeError('Diligencie el odómetro actual del vehículo')
    verificado = false
  }
  return verificado
}

async function verDetalles(consecutivo) {
  try {
    const detalle = await useMantenimiento.obtenerdatodemantenimiento(consecutivo)
    // console.log('Detalles obtenidos:', detalle)

    if (detalle) {
      detallesMantenimiento.value = {
        consecutivo: detalle['consecutivo'] || '',
        placa: detalle['placa'] || '',
        tipo_mantenimiento: detalle['tipo_mantenimiento'] || '',
        descripcion: detalle['descripcion'] || '',
        valor_mantenimiento: detalle['valor_mantenimiento'] || '',
        odometro: detalle['odometro'] || '',
        correo_usuario: detalle['correo_usuario'] || '',
        usuario: detalle['usuario'] || '',
        fecha_creacion: detalle['fecha_creacion'] || '',
        link: detalle['link'] || '',
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

  cargarMantenimientos()
}

function actualizarValorFiltro(nuevoValor) {
  valorFiltroTexto.value = nuevoValor
  cargarMantenimientos()
}

function obtenerEtiquetaValor(valor) {
  if (tipoLista.value === TIPOS_FILTRO.VALOR) {
    return `$ ${Number(valor).toLocaleString('es-CO')} COP`
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

function formatearValMantenimiento(val) {
  valmantenimientoFormatted.value = formatearNumero(val)

  formulario.value.valor_mantenimiento = Number(valmantenimientoFormatted.value.replace(/\./g, ''))
}

function formatearOdometro(val) {
  odometroFormatted.value = formatearNumero(val)

  formulario.value.odometro = Number(odometroFormatted.value.replace(/\./g, ''))
}

function formatearNumero(valor) {
  if (!valor) return ''

  const limpio = valor.toString().replace(/\D/g, '')

  return new Intl.NumberFormat('es-CO').format(limpio)
}

async function cargarMantenimientos() {
  try {
    let response = []
    // ADMINISTRADOR
    if (perfilUsuario.value === 'administrador') {
      if (tipoLista.value === TIPOS_FILTRO.TODOS) {
        response = await useMantenimiento.obtenerMantenimientos()
      } else if (filtroActual.value.esFiltroTexto) {
        response = await useMantenimiento.obtenerMantenimientosFiltrados(
          filtroActual.value.campoDatos,
          valorFiltroTexto.value,
        )
      } else {
        response = await useMantenimiento.obtenerMantenimientosOrdenados(
          filtroActual.value.campoOrden,
          ordenActual.value,
        )
      }
    }
    // PROPIETARIO Y CONDUCTOR
    else {
      const placasUsuario = useUsuario.user?.placa_asignada?.split(',').map((p) => p.trim()) || []
      let todosLosMantenimientos = []
      for (const placa of placasUsuario) {
        const data = await useMantenimiento.obtenerResumenPorPlaca(placa)
        const lista = data?.resumen?.total?.consecutivos || []
        todosLosMantenimientos.push(...lista)
      }
      response = todosLosMantenimientos
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
      mantenimientos.value = response.map((item) => {
        const result = {
          consecutivo: item.consecutivo || '',
          placa: item.placa || '',
          tipo_mantenimiento: item.tipo_mantenimiento || 0,
          valor_mantenimiento: item.valor_mantenimiento || 0,
          odometro: item.odometro || 0,
          fecha_creacion: item.fecha_creacion || 0,
        }
        const campoDatos = filtroActual.value?.campoDatos
        if (campoDatos && item[campoDatos] !== undefined) {
          result.valorFiltro = item[campoDatos]
        }
        if (tipoLista.value === TIPOS_FILTRO.MES) {
          result.valorFiltro = item.valor_mantenimiento
        }
        return result
      })
    } else {
      console.error('Error en formato de respuesta:', response)
      mantenimientos.value = []
    }
  } catch (error) {
    console.error(`Error al cargar mantenimientos por ${tipoLista.value}:`, error)
    mantenimientos.value = []
  }
}

onMounted(async () => {
  await cargarPlacas()

  CONFIG_FILTROS[TIPOS_FILTRO.PLACA].opcionesFiltro = placasOptions.value.map((placa) => ({
    valor: placa,
    etiqueta: placa,
  }))

  cargarMantenimientos()
})

function manejarSeleccionArchivos(files) {
  if (files) {
    if (Array.isArray(files)) {
      files.forEach((file) => {
        const existeArchivo = formulario.value.archivos.some(
          (a) => a.name === file.name && a.size === file.size && a.type === file.type,
        )

        if (!existeArchivo) {
          formulario.value.archivos.push(file)
        }
      })
    } else if (files instanceof File) {
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
  valmantenimientoFormatted.value = ''
  odometroFormatted.value = ''
}

function mostrarMensajeError(mensaje) {
  $q.notify({
    type: 'negative',
    message: mensaje,
    position: 'bottom-right',
  })
}

function formatFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
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

defineOptions({
  name: 'MantenimientoPage',
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

.mantenimiento-card {
  border: 1px solid #e5e7eb !important;
  border-radius: 12px !important;
  transition: border-color 0.15s;
}

.mantenimiento-card:active {
  opacity: 0.85;
}
</style>
