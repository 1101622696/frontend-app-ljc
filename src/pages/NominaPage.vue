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
            @update:model-value="cargarNomina"
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
          v-for="nomina in nominas"
          :key="nomina.consecutivo_nomina"
          clickable
          @click="verDetalles(nomina.consecutivo_nomina)"
        >
          <q-item-section>
            <q-item-label>{{ nomina.consecutivo_nomina }} - {{ nomina.nombre }}</q-item-label>
            <q-item-label caption v-if="nomina.valorFiltro !== undefined">
              {{ obtenerEtiquetaValor(nomina.valorFiltro) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <div>
      <q-dialog v-model="mostrarDetalles" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Detalles de la nómina</div>
          </q-card-section>

          <q-card-section class="q-pt-none" v-if="detallesNomina">
            <div class="q-pa-md">
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Consecutivo:</div>
                <div class="col-8">{{ detallesNomina.consecutivo_nomina }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Mes:</div>
                <div class="col-8">{{ detallesNomina.mes }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Correo:</div>
                <div class="col-8">{{ detallesNomina.id_conductor }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Conductor:</div>
                <div class="col-8">{{ detallesNomina.nombre }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Salario Base:</div>
                <div class="col-8">{{ formatearCOP(detallesNomina.salario_base) }}</div>
              </div>
                            <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Seguridad Social:</div>
                <div class="col-8">{{ formatearCOP(detallesNomina.sso) }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Total de viajes realizados en este período:</div>
                <div class="col-8">{{ detallesNomina.total_viajes_mes }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">10% hechos en este período:</div>
                <div class="col-8">{{ formatearCOP(detallesNomina.diez_pcto_total_mes) }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Saldo anticipo del mes:</div>
                <div class="col-8">{{ formatearCOP(detallesNomina.saldo_anticipo_total_mes) }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Total de préstamos:</div>
                <div class="col-8">{{ formatearCOP(detallesNomina.total_prestamos) }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Nómina Pagada:</div>
                <div class="col-8">{{ formatearCOP(detallesNomina.total_nomina) }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Fecha que se realizó el pago:</div>
                <div class="col-8">{{ detallesNomina.fecha_pago }}</div>
              </div>
              <div class="row q-mb-md">
                <div class="col-4 text-weight-bold">Tipo de nómina:</div>
                <div class="col-8">{{ detallesNomina.tipo }}</div>
              </div>                                                                                                  
            </div>

          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cerrar" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

    </div>

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
    console.log('Detalles obtenidos:', detalle)

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

  cargarNomina()
}

function actualizarValorFiltro(nuevoValor) {
  // console.log(`Cambiando valor del filtro a: ${nuevoValor}`);
  valorFiltroTexto.value = nuevoValor
  cargarNomina()
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

      response = await useNomina.obtenerNominaFiltrados(
        tipoLista.value,
        valorFiltroTexto.value
      )

    }

    // Ordenamientos
    else if (tipoLista.value !== TIPOS_FILTRO.TODOS) {

      response = await useNomina.obtenerNominaOrdenados(
        filtroActual.value.campoOrden,
        ordenActual.value
      )

    }

    else {

      response = await useNomina.obtenerNominas()

    }

    if (Array.isArray(response)) {

      nominas.value = response.map((item) => {

        const result = {
          consecutivo_nomina: item['consecutivo_nomina'] || '',
          nombre: item['nombre'] || '',
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

onMounted(() => {
  cargarNomina()
})

defineOptions({
  name: 'NominaPage',
})
</script>

