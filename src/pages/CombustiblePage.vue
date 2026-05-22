<template>
  <q-page class="flex flex-center">
    <q-card-section>
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
            @update:model-value="cargarCombustibles"
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
          v-for="combustible in combustibles"
          :key="combustible.consecutivo"
          clickable
          @click="verDetalles(combustible.consecutivo)"
        >
          <q-item-section>
            <q-item-label>{{ combustible.consecutivo }} - {{ combustible.placa }}</q-item-label>
            <q-item-label caption v-if="combustible.valorFiltro !== undefined">
              {{ obtenerEtiquetaValor(combustible.valorFiltro, combustible) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <div>
      <q-dialog v-model="mostrarDetalles" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Detalles del Combustible</div>
          </q-card-section>

          <q-card-section class="q-pt-none" v-if="detallesCombustible">
            <div class="q-pa-md">
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Consecutivo:</div>
                <div class="col-8">{{ detallesCombustible.consecutivo }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Fecha de registro:</div>
                <div class="col-8">{{ detallesCombustible.fecha_registro }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Placa:</div>
                <div class="col-8">{{ detallesCombustible.placa }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Odómetro actual:</div>
                <div class="col-8">{{ detallesCombustible.odometro_actual }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Galones cargados:</div>
                <div class="col-8">{{ detallesCombustible.galones_cargados }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Valor pagado:</div>
                <div class="col-8">{{ detallesCombustible.valor_pagado }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Precio por galón:</div>
                <div class="col-8">{{ detallesCombustible.precio_por_galon }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Kilómetros recorridos:</div>
                <div class="col-8">{{ detallesCombustible.km_recorridos }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Rendimiento real:</div>
                <div class="col-8">{{ detallesCombustible.rendimiento_real }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Rendimiento esperado:</div>
                <div class="col-8">{{ detallesCombustible.rendimiento_esperado }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Diferencia de rendimiento:</div>
                <div class="col-8">{{ detallesCombustible.diferencia_rendimiento }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Alerta:</div>
                <div class="col-8">{{ detallesCombustible.alerta }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Correo usuario:</div>
                <div class="col-8">{{ detallesCombustible.correo_usuario }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Usuario:</div>
                <div class="col-8">{{ detallesCombustible.usuario }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Estado de la factura:</div>
                <div class="col-8">{{ detallesCombustible.estado_factura }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Número de factura:</div>
                <div class="col-8">{{ detallesCombustible.numero_factura }}</div>
              </div>

              <q-btn
                outline
                color="orange"
                icon="folder"
                label="Ver archivos"
                size="sm"
                @click="abrirVisor(detallesCombustible.link_factura, 'Documentos')"
              />
            </div>

            <div class="row q-mb-md">
              <div class="col-4 text-weight-bold">Legalización:</div>
              <div class="col-8">
                <q-toggle
                  :model-value="
                    detallesCombustible.estado_factura?.toLowerCase().trim() === 'legalizado'
                  "
                  :disable="
                    detallesCombustible.estado_factura?.toLowerCase().trim() !== 'pendiente'
                  "
                  color="primary"
                  @click="cambiarEstado"
                />
              </div>
            </div>

            <q-input
              v-if="detallesCombustible.estado_factura === 'pendiente'"
              v-model="numeroFactura"
              label="Número de factura"
              dense
            />

            <q-card-actions align="right">
              <q-btn
                class="option-button"
                :disable="
                  ['legalizado'].includes(
                    detallesCombustible?.estado_factura,
                  )
                "
                @click="editar(detallesCombustible)"
              >
                ✏️

                <q-tooltip
                  v-if="
                    ['legalizado'].includes(
                      detallesCombustible?.estado_factura,
                    )
                  "
                >
                  Este combustible no puede ser editado
                </q-tooltip>
              </q-btn>
            </q-card-actions>
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

          <q-card-actions align="right">
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
                  v-model.trim="formulario.odometro_actual"
                  label="Odómetro"
                  :dense="dense"
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

    <q-btn color="primary" :label="'Registrar nuevo'" class="q-mt-md" @click="abrir" />
<div class="text-center q-mt-md" v-if="hayMas">
  <q-btn
    flat
    color="primary"
    label="Cargar más"
    :loading="cargando"
    @click="cargarMas"
  />
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

function formatearValorpagado(val) {
  valorpagadoFormatted.value = formatearNumero(val)

  formulario.value.valor_pagado = Number(valorpagadoFormatted.value.replace(/\./g, ''))
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

// async function guardar() {
//   cargando.value = true

//   if (!validar()) {
//     cargando.value = false
//     return
//   }

//   try {
//     const formData = new FormData()

//     Object.entries(formulario.value).forEach(([key, value]) => {
//       if (key === 'archivos') {
//         value.forEach((file) => formData.append('archivos', file))
//       } else if (value !== null && value !== undefined && value !== '') {
//         formData.append(key, value)
//       }
//     })
//     let response

//     if (props.esEdicion) {
//       response = await useCombustible.putCombustible(formulario.value.placa, formData)
//     } else {
//       response = await useCombustible.postCombustible(formData)
//     }

//     console.log('Respuesta exitosa:', response)

//     cargarCombustibles()
//     cerrar()
//     alert.value = false
//     resetearFormulario()
//   } catch (error) {
//     console.error('Error al guardar:', error)
//     mostrarMensajeError('Error al guardar el combustible')
//   } finally {
//     cargando.value = false
//   }
// }

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

    valorpagadoFormatted.value = formatearNumero(
    combustible.valor_pagado || 0
  )

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
    console.log('Detalles obtenidos:', detalle)

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

  // Obtener el filtro actual basado en el tipo
  const filtro = CONFIG_FILTROS[tipo]

  // Asegurarnos de que hay un valor por defecto válido
  if (filtro.esFiltroTexto && filtro.opcionesFiltro?.length > 0) {
    // Usar el primer valor como valor por defecto
    valorFiltroTexto.value = filtro.opcionesFiltro[0].valor
    // console.log(`Tipo cambiado a ${tipo}, valor por defecto: ${valorFiltroTexto.value}`);
  } else {
    valorFiltroTexto.value = null
    // console.log(`Tipo cambiado a ${tipo}, sin valor por defecto`);
  }

  cargarCombustibles()
}

function actualizarValorFiltro(nuevoValor) {
  // console.log(`Cambiando valor del filtro a: ${nuevoValor}`);
  valorFiltroTexto.value = nuevoValor
  cargarCombustibles()
}

function obtenerEtiquetaValor(valor, item) {
  if (tipoLista.value === TIPOS_FILTRO.MES) {
    return `${Number(item.valor_pagado).toLocaleString('es-CO')} COP`
  }

  if (tipoLista.value === TIPOS_FILTRO.VALOR_PAGADO) {
    return `${valor} COP`
  } else if (tipoLista.value === TIPOS_FILTRO.PRECIO_POR_GALON) {
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

// async function cargarCombustibles() {
//   try {
//     let response = []
//     // ADMINISTRADOR
//     if (perfilUsuario.value === 'administrador') {
//       if (tipoLista.value === TIPOS_FILTRO.TODOS) {
//         response = await useCombustible.obtenerCombustible()
//       } else if (filtroActual.value.esFiltroTexto) {
//         response = await useCombustible.obtenerCombustiblesFiltrados(
//           filtroActual.value.campoDatos,
//           valorFiltroTexto.value,
//         )
//       } else {
//         response = await useCombustible.obtenerCombustiblesOrdenados(
//           filtroActual.value.campoOrden,
//           ordenActual.value,
//         )
//       }
//     }
//     // PROPIETARIO Y CONDUCTOR
//     else {
//       const placasUsuario = useUsuario.user?.placa_asignada?.split(',').map((p) => p.trim()) || []
//       let todosLosCombustibles = []
//       for (const placa of placasUsuario) {
//         const data = await useCombustible.obtenerResumenPorPlaca(placa)
//         const lista = data?.resumen?.total?.consecutivos || []
//         todosLosCombustibles.push(...lista)
//       }
//       response = todosLosCombustibles
//       // FILTROS TEXTO
//       if (filtroActual.value?.esFiltroTexto) {
//         response = response.filter((item) => {
//           const valor = item[filtroActual.value.campoDatos]

//           return String(valor).toLowerCase().includes(String(valorFiltroTexto.value).toLowerCase())
//         })
//       }
//       // ORDENAMIENTOS
//       else if (tipoLista.value !== TIPOS_FILTRO.TODOS) {
//         const campo = filtroActual.value.campoOrden

//         response.sort((a, b) => {
//           const valorA = parseFloat(a[campo]) || 0
//           const valorB = parseFloat(b[campo]) || 0
//           return ordenActual.value === 'desc' ? valorB - valorA : valorA - valorB
//         })
//       }
//     }
//     if (Array.isArray(response)) {
//       combustibles.value = response.map((item) => {
//         const result = {
//           consecutivo: item.consecutivo || '',
//           placa: item.placa || '',
//           valor_pagado: item.valor_pagado || 0,
//         }
//         const campoDatos = filtroActual.value?.campoDatos
//         if (campoDatos && item[campoDatos] !== undefined) {
//           result.valorFiltro = item[campoDatos]
//         }
//         if (tipoLista.value === TIPOS_FILTRO.MES) {
//           result.valorFiltro = item.valor_pagado
//         }
//         return result
//       })
//     } else {
//       console.error('Error en formato de respuesta:', response)
//       combustibles.value = []
//     }
//   } catch (error) {
//     console.error(`Error al cargar combustibles por ${tipoLista.value}:`, error)
//     combustibles.value = []
//   }
// }

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

      $q.notify({
        type: 'positive',
        message: 'Combustible legalizado correctamente',
      })
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
}

function mostrarMensajeError(mensaje) {
  $q.notify({
    type: 'negative',
    message: mensaje,
    position: 'bottom-right',
  })
}

// function mostrarMensajeExito(mensaje) {
//   $q.notify({
//     type: 'positive',
//     message: mensaje,
//     position: 'bottom-right',
//   })
// }

defineOptions({
  name: 'CombustiblePage',
})
</script>
