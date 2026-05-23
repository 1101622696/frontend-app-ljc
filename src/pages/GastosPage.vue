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
            @update:model-value="cargarGastos"
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
          v-for="gasto in gastos"
          :key="gasto.consecutivo"
          clickable
          @click="verDetalles(gasto.consecutivo)"
        >
          <q-item-section>
            <q-item-label>{{ gasto.consecutivo }} - {{ gasto.placa }}</q-item-label>
            <q-item-label caption v-if="gasto.valorFiltro !== undefined">
              {{ obtenerEtiquetaValor(gasto.valorFiltro) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <div>
      <q-dialog v-model="mostrarDetalles" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Detalles del Gasto</div>
          </q-card-section>

          <q-card-section class="q-pt-none" v-if="detallesGasto">
            <div class="q-pa-md">
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">consecutivo:</div>
                <div class="col-8">{{ detallesGasto.consecutivo }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Fecha de registro:</div>
                <div class="col-8">{{ detallesGasto.fecha_registro }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Placa:</div>
                <div class="col-8">{{ detallesGasto.placa }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Tipo de gasto:</div>
                <div class="col-8">{{ detallesGasto.tipo_gasto }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Código de referencia:</div>
                <div class="col-8">{{ detallesGasto.codigo_referencia }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Valor del gasto:</div>
                <div class="col-8">{{ detallesGasto.valor_gasto }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Descripción:</div>
                <div class="col-8">{{ detallesGasto.descripcion }}</div>
              </div>
            </div>

            <q-card-actions align="right">
              <q-btn
                class="option-button"
                :disable="
                  ['viaje', 'nomina_viajes', 'nomina_salario', 'combustible'].includes(
                    detallesGasto?.tipo_gasto,
                  )
                "
                @click="editar(detallesGasto)"
              >
                ✏️

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
            </q-card-actions>
          </q-card-section>

          <q-card-actions align="right">
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
    </div>

    <q-btn color="primary" :label="'Registrar nuevo'" class="q-mt-md" @click="abrir" />
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

  valorgastoFormatted.value = formatearNumero(
    gasto.valor_gasto || 0
  )

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
    console.log('Detalles obtenidos:', detalle)

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

  cargarGastos()
}

function actualizarValorFiltro(nuevoValor) {
  // console.log(`Cambiando valor del filtro a: ${nuevoValor}`);
  valorFiltroTexto.value = nuevoValor
  cargarGastos()
}

function obtenerEtiquetaValor(valor) {
  // Implementa la lógica para formatear el valor según el tipo de filtro
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

// function mostrarMensajeExito(mensaje) {
//   $q.notify({
//     type: 'positive',
//     message: mensaje,
//     position: 'bottom-right',
//   })
// }

defineOptions({
  name: 'GastosPage',
})
</script>
