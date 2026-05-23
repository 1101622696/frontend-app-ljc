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
    </q-card-section>

    <div>
      <q-dialog v-model="mostrarDetalles" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Detalles del Cliente</div>
          </q-card-section>

          <q-card-section class="q-pt-none" v-if="detallesCliente">
            <div class="q-pa-md">
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Código:</div>
                <div class="col-8">{{ detallesCliente.codigo }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Nombre de la empresa:</div>
                <div class="col-8">{{ detallesCliente.empresa }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">NIT:</div>
                <div class="col-8">{{ detallesCliente.nit }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Estado:</div>
                <div class="col-8">{{ detallesCliente.estado }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Viajes:</div>
                <div class="col-8">{{ detallesCliente.viajes }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Teléfono:</div>
                <div class="col-8">{{ detallesCliente.telefono }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Email:</div>
                <div class="col-8">{{ detallesCliente.email }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Frecuencia de pago:</div>
                <div class="col-8">{{ detallesCliente.tipo_pago }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Rete fuente:</div>
                <div class="col-8">{{ detallesCliente.rete_fuente }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Rete ICA:</div>
                <div class="col-8">{{ detallesCliente.rete_ica }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Fecha de creación:</div>
                <div class="col-8">{{ detallesCliente.fecha_creacion }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Valor total del viaje estimado:</div>
                <div class="col-8">{{ detallesCliente.total_valor_viaje_estimado }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Valor total del viaje real:</div>
                <div class="col-8">{{ detallesCliente.total_valor_viaje_real }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Ganancia total del viaje:</div>
                <div class="col-8">{{ detallesCliente.total_ganancia_viaje }}</div>
              </div>
            </div>

            <div class="row q-mb-md">
              <div class="col-4 text-weight-bold">Activación:</div>
              <div class="col-8">
                <q-toggle
                  v-model="isActive"
                  :color="detallesCliente.estado === 'activo' ? 'grey' : 'primary'"
                  @update:model-value="cambiarEstado"
                />
              </div>
            </div>
            <q-card-actions align="right">
              <q-btn class="option-button" @click="editar(detallesCliente)"> ✏️ </q-btn>
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

    <q-btn color="primary" :label="'Registrar nuevo'" class="q-mt-md" @click="abrir" />
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

// async function guardar() {
//   cargando.value = true

//   if (!validar()) {
//     cargando.value = false
//     return
//   }

//   try {
//     const formData = new FormData()

//     Object.entries(formulario.value).forEach(([key, value]) => {
//       if (value !== null && value !== undefined && value !== '') {
//         formData.append(key, value)
//       }
//     })

//     let response

//     if (props.esEdicion) {
//       response = await useCliente.putCliente(formulario.value.codigo, formulario.value)
//     } else {
//       response = await useCliente.postCliente(formulario.value)
//     }

//     console.log('Respuesta exitosa:', response)

//     cerrar()
//     cargarClientes()
//     alert.value = false
//     resetearFormulario()
//   } catch (error) {
//     console.error('Error al guardar:', error)
//     mostrarMensajeError('Error al guardar el cliente')
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
    console.log('Detalles obtenidos:', detalle)

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

  cargarClientes()
}

function actualizarValorFiltro(nuevoValor) {
  // console.log(`Cambiando valor del filtro a: ${nuevoValor}`);
  valorFiltroTexto.value = nuevoValor
  cargarClientes()
}

function obtenerEtiquetaValor(valor) {
  // Implementa la lógica para formatear el valor según el tipo de filtro
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

// function mostrarMensajeExito(mensaje) {
//   $q.notify({
//     type: 'positive',
//     message: mensaje,
//     position: 'bottom-right',
//   })
// }

defineOptions({
  name: 'ClientesPage',
})
</script>
