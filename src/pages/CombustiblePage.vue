<template>
  <q-page padding class="bg-grey-2 pagina-con-fab">
    <q-tabs
      v-model="pestana"
      dense
      align="justify"
      class="bg-white rounded-borders q-mb-md"
      active-color="primary"
      indicator-color="primary"
      @update:model-value="alCambiarPestana"
    >
      <q-tab name="tanqueos" icon="local_gas_station" label="Tanqueos" />
      <q-tab name="mes" icon="insights" label="Rendimiento del mes" />
    </q-tabs>

    <!-- ═════════════ PESTAÑA: TANQUEOS ═════════════ -->
    <template v-if="pestana === 'tanqueos'">
      <div class="filter-bar q-mb-md">
        <div class="filter-scroll row no-wrap q-gutter-x-sm q-pb-xs">
          <q-chip
            v-for="opcion in opcionesEstado"
            :key="opcion.valor"
            clickable
            :color="filtroEstado === opcion.valor ? 'primary' : 'grey-2'"
            :text-color="filtroEstado === opcion.valor ? 'white' : 'grey-8'"
            class="filter-chip"
            @click="cambiarEstado(opcion.valor)"
          >
            {{ opcion.etiqueta }}
          </q-chip>
        </div>

        <div v-if="placasChips.length > 1" class="filter-scroll row no-wrap q-gutter-x-sm q-pt-sm">
          <q-chip
            clickable
            :color="!filtroPlaca ? 'secondary' : 'grey-2'"
            :text-color="!filtroPlaca ? 'white' : 'grey-8'"
            class="filter-chip"
            @click="cambiarPlaca(null)"
          >
            Todas las placas
          </q-chip>
          <q-chip
            v-for="placa in placasChips"
            :key="placa"
            clickable
            :color="filtroPlaca === placa ? 'secondary' : 'grey-2'"
            :text-color="filtroPlaca === placa ? 'white' : 'grey-8'"
            class="filter-chip"
            @click="cambiarPlaca(placa)"
          >
            {{ placa }}
          </q-chip>
        </div>
      </div>

      <div v-if="!mostrados.length && !cargandoLista" class="text-center text-grey-6 q-py-xl">
        <q-icon name="local_gas_station" size="48px" />
        <div class="q-mt-sm">{{ textoVacio }}</div>
      </div>

      <q-card
        v-for="c in mostrados"
        :key="c.consecutivo"
        flat
        class="viaje-card q-mb-sm cursor-pointer"
        @click="verDetalles(c.consecutivo)"
      >
        <q-card-section class="q-py-sm">
          <div class="row items-center no-wrap">
            <span class="placa-badge">{{ c.placa }}</span>
            <span class="text-weight-bold q-ml-sm">{{ c.consecutivo }}</span>
            <q-icon v-if="c.alerta === 'si'" name="warning" color="negative" size="18px" class="q-ml-xs">
              <q-tooltip>Rendimiento bajo</q-tooltip>
            </q-icon>
            <q-space />
            <q-badge :color="colorEstado(c.estado_factura)" :label="nombreEstado(c.estado_factura)" />
          </div>
          <div class="row items-center q-mt-xs text-body2">
            <span>{{ formatoGalones(c.galones_cargados) }} gal · {{ formatoPeso(c.valor_pagado) }}</span>
            <q-space />
            <span class="text-weight-medium" :class="claseTexto(c.rendimiento_real, c.rendimiento_esperado)">
              {{ rendimientoCorto(c) }}
            </span>
          </div>
          <div class="row items-center text-caption text-grey-7">
            <span>{{ formatoFecha(c.fecha_registro) }} · {{ formatoMiles(c.odometro_actual) }} km</span>
            <q-space />
            <span class="ellipsis">{{ c.usuario }}</span>
          </div>
        </q-card-section>
      </q-card>

      <div v-if="cargandoLista && !mostrados.length" class="text-center q-py-lg">
        <q-spinner color="primary" size="32px" />
      </div>

      <div v-if="hayMas" class="text-center q-my-md">
        <q-btn outline rounded color="primary" label="Cargar más" :loading="cargandoLista" @click="cargarMas" />
      </div>
    </template>

    <!-- ═════════════ PESTAÑA: RENDIMIENTO DEL MES ═════════════ -->
    <template v-else>
      <div class="filter-bar q-mb-md row q-col-gutter-sm">
        <div class="col-6">
          <q-input
            v-if="placasDisponibles.length <= 1"
            :model-value="placaMes || 'Sin placa'"
            label="Placa"
            outlined
            dense
            readonly
          />
          <q-select
            v-else
            v-model="placaMes"
            :options="placasDisponibles"
            label="Placa"
            outlined
            dense
            @update:model-value="cargarMes"
          />
        </div>
        <div class="col-6">
          <q-input
            v-model="mesSeleccionado"
            type="month"
            label="Mes"
            outlined
            dense
            stack-label
            :max="mesActual"
            @update:model-value="cargarMes"
          />
        </div>
      </div>

      <div v-if="cargandoMes" class="text-center q-py-lg">
        <q-spinner color="primary" size="32px" />
      </div>

      <template v-else-if="datosMes">
        <q-card flat class="viaje-card q-mb-md">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <span class="placa-badge">{{ datosMes.placa }}</span>
              <span class="q-ml-sm text-subtitle2 text-capitalize">{{ nombreMes(datosMes.mes) }}</span>
              <q-space />
              <q-badge v-if="datosMes.alerta === 'si'" color="negative" label="Rendimiento bajo" />
            </div>

            <div class="rendimiento-caja q-mb-md" :class="claseCaja(datosMes.rendimiento, datosMes.rendimiento_esperado)">
              <template v-if="tieneRendimiento(datosMes.rendimiento)">
                <div class="text-caption">Rendimiento acumulado del mes</div>
                <div class="text-h5 text-weight-bold">{{ formatoMiles(datosMes.rendimiento) }} km/gl</div>
                <div class="text-caption">
                  Esperado {{ formatoMiles(datosMes.rendimiento_esperado) }} km/gl ·
                  {{ textoDiferencia(datosMes.rendimiento, datosMes.rendimiento_esperado) }}
                </div>
              </template>
              <template v-else>
                <div class="text-body2">Aún no se puede calcular el rendimiento del mes.</div>
                <div class="text-caption">
                  Se necesitan al menos 2 tanqueos en el mes. Esperado: {{ formatoMiles(datosMes.rendimiento_esperado) }} km/gl
                </div>
              </template>
            </div>

            <Fila etiqueta="Km recorridos" :valor="`${formatoMiles(datosMes.km_recorridos)} km`" />
            <Fila
              v-if="datosMes.odometro_inicial !== null"
              etiqueta="Odómetro"
              :valor="`${formatoMiles(datosMes.odometro_inicial)} → ${formatoMiles(datosMes.odometro_final)} km`"
            />
            <Fila etiqueta="Galones cargados en el mes" :valor="`${formatoGalones(datosMes.galones_cargados)} gal`" />
            <Fila etiqueta="Galones usados en el cálculo" :valor="`${formatoGalones(datosMes.galones_rendimiento)} gal`" />
            <Fila etiqueta="Valor pagado" :valor="formatoPeso(datosMes.valor_pagado)" />
            <Fila etiqueta="Tanqueos" :valor="datosMes.registros" />
            <div class="text-caption text-grey-6 q-mt-sm">
              El cálculo no cuenta los galones del primer tanqueo del mes: esos se gastan en kilómetros anteriores.
            </div>
          </q-card-section>
        </q-card>

        <div class="seccion-titulo">Tanqueos del mes</div>
        <div v-if="!tanqueosMes.length" class="text-center text-grey-6 q-py-lg">No hay tanqueos en este mes</div>
        <q-card
          v-for="c in tanqueosMes"
          :key="c.consecutivo"
          flat
          class="viaje-card q-mb-sm cursor-pointer"
          @click="verDetalles(c.consecutivo)"
        >
          <q-card-section class="q-py-sm">
            <div class="row items-center no-wrap">
              <span class="text-weight-bold">{{ c.consecutivo }}</span>
              <span class="text-caption text-grey-7 q-ml-sm">{{ formatoFecha(c.fecha_registro) }}</span>
              <q-icon v-if="c.alerta === 'si'" name="warning" color="negative" size="18px" class="q-ml-xs" />
              <q-space />
              <q-badge :color="colorEstado(c.estado_factura)" :label="nombreEstado(c.estado_factura)" />
            </div>
            <div class="row items-center text-body2 q-mt-xs">
              <span>{{ formatoMiles(c.odometro_actual) }} km · {{ formatoGalones(c.galones_cargados) }} gal</span>
              <q-space />
              <span class="text-weight-medium" :class="claseTexto(c.rendimiento_real, c.rendimiento_esperado)">
                {{ rendimientoCorto(c) }}
              </span>
            </div>
          </q-card-section>
        </q-card>
      </template>

      <div v-else class="text-center text-grey-6 q-py-xl">
        <q-icon name="insights" size="48px" />
        <div class="q-mt-sm">{{ placaMes ? 'No se pudo cargar el rendimiento' : 'No tiene placas asignadas' }}</div>
      </div>
    </template>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" label="Tanqueo" @click="abrirCrear" />
    </q-page-sticky>

    <!-- ═════════════ DETALLE ═════════════ -->
    <q-dialog v-model="mostrarDetalles" :maximized="$q.screen.lt.md">
      <q-card v-if="detalle" style="width: 600px; max-width: 100vw">
        <q-card-section class="row items-center q-pb-sm sticky-header">
          <span class="placa-badge-lg">{{ detalle.placa }}</span>
          <div class="q-ml-md">
            <div class="text-h6">{{ detalle.consecutivo }}</div>
            <q-badge :color="colorEstado(detalle.estado_factura)" :label="nombreEstado(detalle.estado_factura)" />
          </div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-sm">
          <q-banner v-if="detalle.alerta === 'si'" dense rounded class="bg-red-1 text-red-10 q-mb-md">
            <template #avatar><q-icon name="warning" /></template>
            Rendimiento bajo: {{ formatoMiles(detalle.rendimiento_real) }} km/gl frente a
            {{ formatoMiles(detalle.rendimiento_esperado) }} km/gl esperados.
          </q-banner>

          <div class="seccion-titulo">Tanqueo</div>
          <Fila etiqueta="Fecha" :valor="formatoFecha(detalle.fecha_registro)" />
          <Fila etiqueta="Registró" :valor="detalle.usuario" />
          <Fila etiqueta="Odómetro" :valor="`${formatoMiles(detalle.odometro_actual)} km`" />
          <Fila etiqueta="Km desde el tanqueo anterior" :valor="`${formatoMiles(detalle.km_recorridos)} km`" />
          <Fila etiqueta="Galones" :valor="`${formatoGalones(detalle.galones_cargados)} gal`" />
          <Fila etiqueta="Valor pagado" :valor="formatoPeso(detalle.valor_pagado)" />
          <Fila etiqueta="Precio por galón" :valor="formatoPeso(detalle.precio_por_galon)" />
          <Fila etiqueta="¿Llenó el tanque?" :valor="detalle.tanque_lleno === 'no' ? 'No (parcial)' : 'Sí'" />

          <div class="seccion-titulo q-mt-md">Rendimiento</div>
          <template v-if="tieneRendimiento(detalle.rendimiento_real)">
            <Fila
              etiqueta="Real"
              :valor="`${formatoMiles(detalle.rendimiento_real)} km/gl`"
              :clase="claseTexto(detalle.rendimiento_real, detalle.rendimiento_esperado)"
            />
            <Fila etiqueta="Esperado" :valor="`${formatoMiles(detalle.rendimiento_esperado)} km/gl`" />
            <Fila
              etiqueta="Diferencia"
              :valor="textoDiferencia(detalle.rendimiento_real, detalle.rendimiento_esperado)"
              :clase="claseTexto(detalle.rendimiento_real, detalle.rendimiento_esperado)"
            />
          </template>
          <template v-else>
            <Fila etiqueta="Esperado" :valor="`${formatoMiles(detalle.rendimiento_esperado)} km/gl`" />
            <div class="text-caption text-grey-7 q-py-xs">
              {{
                detalle.tanque_lleno === 'no'
                  ? 'Tanqueo parcial: el rendimiento se calcula en el próximo tanqueo lleno.'
                  : 'Sin rendimiento: no había un tanque lleno anterior con qué comparar.'
              }}
            </div>
          </template>
          <Fila v-if="tieneValor(detalle.km_desde_lleno)" etiqueta="Km desde el último lleno" :valor="`${formatoMiles(detalle.km_desde_lleno)} km`" />
          <Fila v-if="tieneValor(detalle.galones_acumulados)" etiqueta="Galones acumulados" :valor="`${formatoGalones(detalle.galones_acumulados)} gal`" />

          <div class="seccion-titulo q-mt-md">Factura</div>
          <Fila
            etiqueta="Estado"
            :valor="nombreEstado(detalle.estado_factura)"
            :clase="estadoDe(detalle.estado_factura) === 'legalizado' ? 'text-positive' : 'text-orange-9'"
          />
          <Fila etiqueta="Número de factura" :valor="detalle.numero_factura" />
          <div class="row q-gutter-sm q-mt-xs">
            <q-btn
              v-if="detalle.link_factura"
              outline
              size="sm"
              icon="receipt"
              label="Ver factura"
              @click="abrirVisor(detalle.link_factura, `Factura ${detalle.consecutivo}`, { prefijo: `${detalle.consecutivo} - ` })"
            />
            <span v-else class="text-caption text-grey-6">Sin documentos</span>
          </div>
        </q-card-section>

        <q-card-actions v-if="esGestion" align="right" class="q-pa-md bg-grey-1 sticky-footer">
          <q-btn flat color="grey-8" icon="edit" label="Editar" @click="abrirEditar" />
          <q-space />
          <q-btn
            v-if="estadoDe(detalle.estado_factura) === 'pendiente'"
            unelevated
            color="positive"
            icon="task_alt"
            label="Legalizar"
            @click="abrirLegalizar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ═════════════ REGISTRAR / EDITAR ═════════════ -->
    <q-dialog v-model="dialogFormulario" persistent :maximized="$q.screen.lt.md">
      <q-card style="width: 560px; max-width: 100vw">
        <q-card-section class="bg-grey-1 row items-center">
          <div>
            <div class="text-h6">{{ esEdicion ? `Editar ${consecutivoEditando}` : 'Registrar tanqueo' }}</div>
            <div v-if="esEdicion" class="text-caption">El rendimiento se recalcula al guardar</div>
          </div>
          <q-space />
          <q-btn flat round icon="close" :disable="guardando" v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-if="opcionesPlacaFormulario.length === 1"
            :model-value="formulario.placa"
            label="Placa"
            outlined
            dense
            readonly
          />
          <q-select
            v-else
            v-model="formulario.placa"
            :options="opcionesPlacaFormulario"
            label="Placa"
            outlined
            dense
            :hint="opcionesPlacaFormulario.length ? '' : 'No tiene vehículos disponibles'"
          />

          <CampoNumero
            v-model="formulario.odometro_actual"
            label="Odómetro"
            sufijo="km"
            :hint="ayudaOdometro"
          />

          <q-input
            :model-value="formulario.galones"
            label="Galones cargados"
            inputmode="decimal"
            suffix="gal"
            hint="Con decimales si los tiene, ej. 117,883"
            outlined
            dense
            bottom-slots
            @update:model-value="escribirGalones"
          />

          <CampoNumero
            v-model="formulario.valor_pagado"
            label="Valor pagado"
            moneda
            :minimo-sugerido="1000"
            hint="Valor completo, ej. 1.850.000"
          />

          <div v-if="precioGalon" class="precio-galon" :class="{ 'precio-raro': precioFueraDeRango }">
            Precio por galón: <b>{{ formatoPeso(precioGalon) }}</b>
            <div v-if="precioFueraDeRango" class="text-caption">
              Se ve fuera de lo normal: revise los galones y el valor.
            </div>
          </div>

          <div>
            <q-checkbox v-model="formulario.tanque_lleno" true-value="si" false-value="no" label="¿Llenó el tanque?" />
            <div class="text-caption text-grey-7 q-pl-sm">
              Si no llenó, el rendimiento se calcula en el próximo tanqueo lleno
            </div>
          </div>

          <CampoArchivos
            v-model="formulario.archivos"
            :label="esEdicion ? 'Agregar fotos de la factura (opcional)' : 'Fotos de la factura (obligatorio)'"
            multiple
            accept="image/*, application/pdf"
            :link-actual="esEdicion ? detalle?.link_factura || '' : ''"
          />

          <!-- Solo gestión: con el número, el tanqueo queda legalizado de una vez -->
          <q-input
            v-if="!esEdicion && esGestion"
            v-model.trim="formulario.numero_factura"
            label="Número de factura (opcional)"
            hint="Si lo escribe, el tanqueo queda legalizado"
            outlined
            dense
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-8" :disable="guardando" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            :label="esEdicion ? 'Guardar cambios' : 'Registrar'"
            :loading="guardando"
            @click="guardarFormulario"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ═════════════ RESULTADO (rendimiento calculado) ═════════════ -->
    <q-dialog v-model="dialogResultado">
      <q-card v-if="resultado" style="width: 420px; max-width: 95vw">
        <q-card-section class="row items-center">
          <q-icon
            :name="resultado.alerta === 'si' ? 'warning' : 'check_circle'"
            :color="resultado.alerta === 'si' ? 'negative' : 'positive'"
            size="28px"
          />
          <div class="q-ml-sm">
            <div class="text-h6">{{ resultado.titulo }}</div>
            <div class="text-caption">{{ resultado.placa }} · {{ resultado.consecutivo }}</div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <!-- Sin cálculo el backend manda rendimiento_real 0: no debe pintarse como malo -->
          <div
            class="rendimiento-caja q-mb-md"
            :class="claseCaja(resultado.rendimiento_calculado ? resultado.rendimiento_real : '', resultado.rendimiento_esperado)"
          >
            <template v-if="resultado.rendimiento_calculado">
              <div class="text-caption">Rendimiento</div>
              <div class="text-h5 text-weight-bold">{{ formatoMiles(resultado.rendimiento_real) }} km/gl</div>
              <div v-if="resultado.rendimiento_esperado" class="text-caption">
                Esperado {{ formatoMiles(resultado.rendimiento_esperado) }} km/gl ·
                {{ textoDiferencia(resultado.rendimiento_real, resultado.rendimiento_esperado) }}
              </div>
            </template>
            <div v-else class="text-body2">
              {{ resultado.tanque_lleno === 'no' ? 'Tanqueo parcial: el' : 'El' }} rendimiento se calculará en el próximo tanqueo lleno.
            </div>
          </div>

          <q-banner v-if="resultado.alerta === 'si'" dense rounded class="bg-red-1 text-red-10 q-mb-sm">
            <template #avatar><q-icon name="warning" /></template>
            Rendimiento bajo. Se avisó al propietario.
          </q-banner>

          <Fila etiqueta="Precio por galón" :valor="formatoPeso(resultado.precio_por_galon)" />
          <Fila etiqueta="Km desde el tanqueo anterior" :valor="`${formatoMiles(resultado.km_recorridos)} km`" />

          <q-banner
            v-for="(aviso, i) in resultado.avisos"
            :key="i"
            dense
            rounded
            class="bg-orange-1 text-orange-10 q-mt-sm"
          >
            {{ aviso }}
          </q-banner>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn unelevated color="primary" label="Entendido" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ═════════════ LEGALIZAR ═════════════ -->
    <q-dialog v-model="dialogLegalizar" persistent>
      <q-card style="width: 380px; max-width: 95vw">
        <q-card-section class="bg-grey-1">
          <div class="text-h6">Legalizar factura</div>
          <div class="text-caption">{{ detalle?.placa }} · {{ detalle?.consecutivo }} · {{ formatoPeso(detalle?.valor_pagado) }}</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model.trim="numeroFactura" label="Número de factura" outlined dense autofocus />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-8" :disable="guardando" v-close-popup />
          <q-btn unelevated color="positive" label="Legalizar" :loading="guardando" @click="guardarLegalizar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useQuasar } from 'quasar'
import { useStoreCombustible } from '../stores/combustible'
import { useStoreUsuarios } from '../stores/usuarios'
import { useStoreVehiculos } from '../stores/vehiculos'
import { useVisorArchivos } from '../composables/useVisorArchivos'
import CampoArchivos from 'components/CampoArchivos.vue'
import CampoNumero from 'components/viajes/CampoNumero.vue'
import { formatoPeso, formatoMiles, formatoFecha, hoyISO } from '../utils/formato'

defineOptions({ name: 'CombustiblePage' })

const $q = useQuasar()
const useCombustible = useStoreCombustible()
const useUsuario = useStoreUsuarios()
const useVehiculo = useStoreVehiculos()

// Visor de archivos (con pellizco), montado una sola vez en MainLayout
const { abrirArchivos: abrirVisor } = useVisorArchivos()

// ── Componente pequeño: fila "etiqueta: valor" ──

const Fila = (props) =>
  h('div', { class: 'detalle-fila' }, [
    h('span', { class: 'detalle-label' }, props.etiqueta),
    h('span', { class: ['detalle-valor', props.clase] }, props.valor === '' || props.valor === undefined || props.valor === null ? '—' : props.valor),
  ])
Fila.props = ['etiqueta', 'valor', 'clase']

// ── Perfil y placas ──

const esAdmin = computed(() => useUsuario.perfile === 'administrador')
const esConductor = computed(() => useUsuario.perfile === 'conductor')
const esGestion = computed(() => ['administrador', 'propietario'].includes(useUsuario.perfile))

const normalizarPlaca = (p) => String(p ?? '').replace(/\s+/g, '').toUpperCase()

const misPlacas = computed(() =>
  String(useUsuario.user?.placa_asignada || '')
    .split(',')
    .map(normalizarPlaca)
    .filter(Boolean),
)

// GET api/vehiculos: el backend ya devuelve solo los vehículos del usuario (todos, si es admin)
const vehiculos = ref([])

async function cargarVehiculos() {
  const lista = await useVehiculo.obtenerVehiculos()
  vehiculos.value = Array.isArray(lista) ? lista : []
}

const vehiculoDe = (placa) => vehiculos.value.find((v) => normalizarPlaca(v.placa) === normalizarPlaca(placa))

/** Placas con las que el usuario puede trabajar */
const placasDisponibles = computed(() => {
  if (esConductor.value) return misPlacas.value
  const deVehiculos = [...new Set(vehiculos.value.map((v) => normalizarPlaca(v.placa)).filter(Boolean))].sort()
  if (deVehiculos.length) return deVehiculos
  return esAdmin.value ? [] : misPlacas.value
})

// El backend valida las placas de propietario/conductor contra placa_asignada
const placasChips = computed(() => (esAdmin.value ? placasDisponibles.value : misPlacas.value))

// ── Formato y rendimiento ──

const tieneValor = (v) => v !== '' && v !== null && v !== undefined
const tieneRendimiento = (v) => tieneValor(v) && Number.isFinite(Number(v))

/** Galones con hasta 3 decimales: 117.883 → "117,883" */
const formatoGalones = (v) => (tieneValor(v) ? Number(v).toLocaleString('es-CO', { maximumFractionDigits: 3 }) : '—')

/** 'bueno' | 'regular' | 'malo' | ''. Malo = alerta del backend (más de 1 km/gl por debajo) */
function nivelRendimiento(real, esperado) {
  if (!tieneRendimiento(real) || !(Number(esperado) > 0)) return ''
  const r = Number(real)
  const e = Number(esperado)
  if (r < e - 1) return 'malo'
  if (r < e) return 'regular'
  return 'bueno'
}

const claseTexto = (real, esperado) =>
  ({ malo: 'text-negative', regular: 'text-orange-9', bueno: 'text-positive' })[nivelRendimiento(real, esperado)] || 'text-grey-7'

const claseCaja = (real, esperado) => `rendimiento-${nivelRendimiento(real, esperado) || 'neutro'}`

function textoDiferencia(real, esperado) {
  if (!tieneRendimiento(real) || !(Number(esperado) > 0)) return ''
  const d = Math.round((Number(real) - Number(esperado)) * 100) / 100
  if (d === 0) return 'igual al esperado'
  return `${formatoMiles(Math.abs(d))} km/gl ${d > 0 ? 'por encima' : 'por debajo'}`
}

function rendimientoCorto(c) {
  if (tieneRendimiento(c.rendimiento_real)) return `${formatoMiles(c.rendimiento_real)} km/gl`
  return c.tanque_lleno === 'no' ? 'Parcial' : 'Sin rendimiento'
}

// ── Estados de factura (en minúscula; registros viejos sin estado cuentan como pendientes) ──

const ESTADOS = [
  { valor: 'pendiente', etiqueta: 'Pendiente', color: 'orange' },
  { valor: 'legalizado', etiqueta: 'Legalizado', color: 'positive' },
]
const estadoDe = (e) => (String(e || '').toLowerCase() === 'legalizado' ? 'legalizado' : 'pendiente')
const nombreEstado = (e) => ESTADOS.find((x) => x.valor === estadoDe(e))?.etiqueta
const colorEstado = (e) => ESTADOS.find((x) => x.valor === estadoDe(e))?.color

const opcionesEstado = [{ valor: '', etiqueta: 'Todos' }, ...ESTADOS]

// ─────────────────────────────────────────────────────────────
// Lista
//
// El backend no tiene un listado paginado para propietario/conductor, así que la fuente cambia:
//   'pagina' → admin sin filtros: GET /api/combustible?pagina&limite
//   'estado' → admin con estado: GET /filtrados (todo de una vez; se muestra por partes)
//   'meses'  → propietario/conductor, o admin con placa: el resumen por placa sirve de índice
//              de meses y cada "Cargar más" trae el mes siguiente con /rendimiento-mensual
//              (que sí trae estado de factura, rendimiento esperado y factura de cada tanqueo).
// Los filtros que no cambian la fuente se aplican en pantalla, sin otra petición.
// ─────────────────────────────────────────────────────────────

const PASO = 25

const registros = ref([])
const cantidadVisible = ref(PASO)
const cargandoLista = ref(false)
const filtroEstado = ref('')
const filtroPlaca = ref(null)
const fuente = ref({ modo: '', clave: '', pagina: 0, hayMasServidor: false, meses: [], indiceMes: 0 })
let idCarga = 0 // descarta respuestas de una carga anterior si el usuario cambió de filtro

const numeroConsecutivo = (c) => parseInt(String(c ?? '').replace(/\D/g, ''), 10) || 0

/** Más reciente primero: fecha y, el mismo día, consecutivo mayor */
const compararRecientes = (a, b) => {
  const fa = String(a.fecha_registro || '')
  const fb = String(b.fecha_registro || '')
  if (fa !== fb) return fa < fb ? 1 : -1
  return numeroConsecutivo(b.consecutivo) - numeroConsecutivo(a.consecutivo)
}

const filtrados = computed(() =>
  registros.value
    .filter((r) => !filtroEstado.value || estadoDe(r.estado_factura) === filtroEstado.value)
    .filter((r) => !filtroPlaca.value || normalizarPlaca(r.placa) === filtroPlaca.value)
    .sort(compararRecientes),
)

const mostrados = computed(() => filtrados.value.slice(0, cantidadVisible.value))

const fuenteTieneMas = computed(() => {
  const f = fuente.value
  if (f.modo === 'pagina') return f.hayMasServidor
  if (f.modo === 'meses') return f.indiceMes < f.meses.length
  return false
})

const hayMas = computed(() => filtrados.value.length > cantidadVisible.value || fuenteTieneMas.value)

const textoVacio = computed(() => {
  if (cargandoLista.value) return ''
  if (!esAdmin.value && !misPlacas.value.length) return 'No tiene placas asignadas'
  return filtroEstado.value || filtroPlaca.value ? 'No hay tanqueos con este filtro' : 'Aún no hay tanqueos registrados'
})

function modoActual() {
  if (!esAdmin.value || filtroPlaca.value) return 'meses'
  return filtroEstado.value ? 'estado' : 'pagina'
}

/** Placas que se piden al backend en modo 'meses' (el filtro de placa del no-admin se aplica en pantalla) */
const placasAlcance = () => (esAdmin.value ? [filtroPlaca.value] : misPlacas.value)

function claveFuente() {
  const modo = modoActual()
  if (modo === 'meses') return `meses|${placasAlcance().join(',')}`
  if (modo === 'estado') return `estado|${filtroEstado.value}`
  return 'pagina'
}

/** Agrega filas sin repetir consecutivos (un mes reintentado no duplica) */
function agregar(filas) {
  const vistos = new Set(registros.value.map((r) => r.consecutivo))
  const nuevas = (filas || []).filter((f) => f?.consecutivo && !vistos.has(f.consecutivo))
  registros.value = [...registros.value, ...nuevas]
}

/** Trae de la fuente hasta llenar lo visible con los filtros actuales, o hasta que se acabe */
async function traerDeFuente(id) {
  const meta = cantidadVisible.value
  while (filtrados.value.length < meta && fuenteTieneMas.value) {
    const f = fuente.value
    if (f.modo === 'pagina') {
      const r = await useCombustible.listarCombustibles({ pagina: f.pagina + 1, limite: PASO })
      if (id !== idCarga) return
      if (r.fallo) return // el aviso ya salió; "Cargar más" sigue visible para reintentar
      f.pagina++
      f.hayMasServidor = r.hayMas
      agregar(r.datos)
    } else {
      const { mes, placas } = f.meses[f.indiceMes]
      const respuestas = await Promise.all(placas.map((p) => useCombustible.rendimientoMensual(p, mes)))
      if (id !== idCarga) return
      respuestas.forEach((r) => r && agregar(r.tanqueos))
      if (respuestas.some((r) => !r)) return // no avanza el mes: "Cargar más" lo reintenta
      f.indiceMes++
    }
  }
}

/** Índice de meses con tanqueos por placa, a partir del resumen (fila liviana) */
async function armarIndiceMeses(id) {
  const indices = await Promise.all(placasAlcance().map((p) => useCombustible.resumenPorPlaca(p)))
  if (id !== idCarga) return
  const porMes = new Map()
  indices.forEach((filas) =>
    (filas || []).forEach((f) => {
      const mes = String(f.fecha_registro || '').slice(0, 7)
      if (!/^\d{4}-\d{2}$/.test(mes)) return
      if (!porMes.has(mes)) porMes.set(mes, new Set())
      porMes.get(mes).add(f.placa)
    }),
  )
  fuente.value.meses = [...porMes.keys()]
    .sort()
    .reverse()
    .map((mes) => ({ mes, placas: [...porMes.get(mes)] }))
}

async function recargar() {
  const id = ++idCarga
  const modo = modoActual()
  registros.value = []
  cantidadVisible.value = PASO
  fuente.value = { modo, clave: claveFuente(), pagina: 0, hayMasServidor: modo === 'pagina', meses: [], indiceMes: 0 }
  cargandoLista.value = true
  try {
    if (modo === 'estado') {
      const lista = await useCombustible.listarPorEstadoFactura(filtroEstado.value)
      if (id !== idCarga) return
      agregar(lista)
    } else {
      if (modo === 'meses') {
        if (!placasAlcance().length) return
        await armarIndiceMeses(id)
        if (id !== idCarga) return
      }
      await traerDeFuente(id)
    }
  } finally {
    if (id === idCarga) cargandoLista.value = false
  }
}

/** Después de cambiar un filtro: solo recarga si cambia la fuente; si no, filtra en pantalla */
async function aplicarFiltros() {
  if (claveFuente() !== fuente.value.clave) return recargar()
  cantidadVisible.value = PASO
  const id = idCarga
  cargandoLista.value = true
  try {
    await traerDeFuente(id)
  } finally {
    if (id === idCarga) cargandoLista.value = false
  }
}

function cambiarEstado(valor) {
  if (filtroEstado.value === valor) return
  filtroEstado.value = valor
  aplicarFiltros()
}

function cambiarPlaca(placa) {
  if (filtroPlaca.value === placa) return
  filtroPlaca.value = placa
  aplicarFiltros()
}

async function cargarMas() {
  if (cargandoLista.value) return
  cantidadVisible.value += PASO
  const id = idCarga
  cargandoLista.value = true
  try {
    await traerDeFuente(id)
  } finally {
    if (id === idCarga) cargandoLista.value = false
  }
}

// ─────────────────────────────────────────────────────────────
// Detalle
// ─────────────────────────────────────────────────────────────

const detalle = ref(null)
const mostrarDetalles = ref(false)

async function verDetalles(consecutivo) {
  const data = await useCombustible.obtenerCombustible(consecutivo)
  if (!data) return null
  detalle.value = data
  mostrarDetalles.value = true
  return data
}

// ── Utilidades de guardado ──

const guardando = ref(false)

async function ejecutar(fn) {
  guardando.value = true
  try {
    await fn()
    return true
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message, position: 'bottom', timeout: 5000 })
    return false
  } finally {
    guardando.value = false
  }
}

const avisar = (mensaje) => {
  $q.notify({ type: 'warning', message: mensaje, position: 'bottom' })
  return false
}

// ─────────────────────────────────────────────────────────────
// Registrar / editar
// ─────────────────────────────────────────────────────────────

const dialogFormulario = ref(false)
const esEdicion = ref(false)
const consecutivoEditando = ref('')

// Función y no objeto: cada formulario estrena su arreglo de archivos
const vacio = () => ({
  placa: null,
  odometro_actual: null,
  galones: '',
  valor_pagado: null,
  tanque_lleno: 'si',
  archivos: [],
  numero_factura: '',
})
const formulario = ref(vacio())

const opcionesPlacaFormulario = computed(() => {
  const base = esConductor.value ? misPlacas.value : placasDisponibles.value
  // Al editar, la placa del registro siempre debe aparecer
  const actual = esEdicion.value ? normalizarPlaca(detalle.value?.placa) : ''
  return actual && !base.includes(actual) ? [actual, ...base] : base
})

/** '117,883' o '117.883' → 117.883 (un tanque no llega a mil galones: el punto es decimal) */
function leerGalones(texto) {
  let t = String(texto ?? '').replace(/\s/g, '')
  if (!t) return null
  if (t.includes(',') && t.includes('.')) t = t.replace(/\./g, '') // 1.117,5
  t = t.replace(',', '.')
  return /^\d+(\.\d+)?$/.test(t) ? Number(t) : NaN
}

function escribirGalones(valor) {
  formulario.value.galones = String(valor ?? '').replace(/[^\d.,]/g, '')
}

/**
 * Al backend van con coma decimal: su conversión lee '117.883' como 117 mil (miles con punto)
 * y '117,883' como 117,883.
 */
const galonesParaEnviar = (n) => String(n).replace('.', ',')

const galonesNumero = computed(() => leerGalones(formulario.value.galones))

const precioGalon = computed(() => {
  const g = galonesNumero.value
  const v = Number(formulario.value.valor_pagado)
  return g > 0 && v > 0 ? Math.round(v / g) : null
})

// Aviso suave (no bloquea): casi siempre es un error de dedo en galones o valor
const precioFueraDeRango = computed(() => precioGalon.value && (precioGalon.value < 5000 || precioGalon.value > 30000))

const odometroVehiculo = computed(() => {
  const v = vehiculoDe(formulario.value.placa)
  const n = Number(v?.odometro)
  return n > 0 ? n : null
})

const ayudaOdometro = computed(() => {
  if (esEdicion.value) return `Registrado: ${formatoMiles(detalle.value?.odometro_actual)} km`
  if (!formulario.value.placa) return 'Seleccione la placa'
  return odometroVehiculo.value ? `Odómetro actual del vehículo: ${formatoMiles(odometroVehiculo.value)} km` : 'Como aparece en el tablero'
})

function abrirCrear() {
  esEdicion.value = false
  consecutivoEditando.value = ''
  formulario.value = vacio()
  // El conductor (o quien tenga una sola placa) siempre la tiene precargada
  if (opcionesPlacaFormulario.value.length === 1) formulario.value.placa = opcionesPlacaFormulario.value[0]
  dialogFormulario.value = true
}

function abrirEditar() {
  const d = detalle.value
  esEdicion.value = true
  consecutivoEditando.value = d.consecutivo
  formulario.value = {
    ...vacio(),
    placa: normalizarPlaca(d.placa),
    odometro_actual: Number(d.odometro_actual) || null,
    galones: tieneValor(d.galones_cargados) ? galonesParaEnviar(Number(d.galones_cargados)) : '',
    valor_pagado: Number(d.valor_pagado) || null,
    tanque_lleno: d.tanque_lleno === 'no' ? 'no' : 'si',
  }
  dialogFormulario.value = true
}

/** Devuelve el primer error o '' (síncrona: de verdad bloquea el guardado) */
function validarFormulario() {
  const f = formulario.value
  if (!f.placa) return 'Seleccione la placa'
  if (!(f.odometro_actual > 0)) return 'Escriba el odómetro'
  if (!esEdicion.value && odometroVehiculo.value && f.odometro_actual < odometroVehiculo.value) {
    return `El odómetro no puede ser menor al actual del vehículo (${formatoMiles(odometroVehiculo.value)} km)`
  }
  const g = galonesNumero.value
  if (g === null) return 'Escriba los galones cargados'
  if (!(g > 0)) return 'Los galones no son válidos (ej. 117,883)'
  if (g >= 1000) return 'Revise los galones: parecen demasiados para un tanqueo'
  if (!(f.valor_pagado > 0)) return 'Escriba el valor pagado'
  if (f.valor_pagado < 1000) return 'Escriba el valor completo pagado, ej. 1.850.000'
  if (!esEdicion.value && !f.archivos.length) return 'Adjunte la foto de la factura'
  return ''
}

const dialogResultado = ref(false)
const resultado = ref(null)

async function guardarFormulario() {
  const error = validarFormulario()
  if (error) return avisar(error)

  const f = formulario.value
  const fd = new FormData()
  fd.append('placa', f.placa)
  fd.append('odometro_actual', String(f.odometro_actual))
  fd.append('galones_cargados', galonesParaEnviar(galonesNumero.value))
  fd.append('valor_pagado', String(f.valor_pagado))
  fd.append('tanque_lleno', f.tanque_lleno)
  f.archivos.forEach((archivo) => fd.append('archivos', archivo))

  if (esEdicion.value) return guardarEdicion(fd)

  await ejecutar(async () => {
    const r = await useCombustible.crearCombustible(fd)
    // Ya quedó guardado: desde aquí nada debe dejar el diálogo abierto (otro clic duplicaría el tanqueo)
    dialogFormulario.value = false
    const avisos = [...(r.advertencias || [])]

    // /crear no recibe el número de factura: si lo escribieron, se legaliza enseguida
    if (f.numero_factura && esGestion.value) {
      try {
        await useCombustible.legalizarCombustible(r.consecutivo, f.numero_factura)
      } catch (errorLegalizar) {
        avisos.push(`El tanqueo quedó registrado pero no se pudo legalizar: ${errorLegalizar.message}`)
      }
    }

    resultado.value = {
      titulo: 'Tanqueo registrado',
      placa: r.placa || f.placa,
      consecutivo: r.consecutivo,
      rendimiento_calculado: Boolean(r.rendimiento_calculado),
      rendimiento_real: r.rendimiento_real,
      rendimiento_esperado: r.rendimiento_esperado,
      alerta: r.alerta,
      tanque_lleno: r.tanque_lleno || f.tanque_lleno,
      precio_por_galon: r.precio_por_galon,
      km_recorridos: r.km_recorridos,
      avisos,
    }
    dialogResultado.value = true
    // El odómetro del vehículo cambió: se refresca para la ayuda del próximo registro
    await Promise.all([recargar(), cargarVehiculos(), recargarMesSiAplica()])
  })
}

async function guardarEdicion(fd) {
  const consecutivo = consecutivoEditando.value
  await ejecutar(async () => {
    const r = await useCombustible.editarCombustible(consecutivo, fd)
    dialogFormulario.value = false
    // El detalle recién leído trae el rendimiento esperado del vehículo (la respuesta de editar no)
    const d = await verDetalles(consecutivo)
    resultado.value = {
      titulo: 'Cambios guardados',
      placa: d?.placa || formulario.value.placa,
      consecutivo,
      rendimiento_calculado: Boolean(r.rendimiento_calculado),
      rendimiento_real: r.rendimiento_real,
      rendimiento_esperado: d?.rendimiento_esperado,
      alerta: r.alerta,
      tanque_lleno: r.tanque_lleno,
      precio_por_galon: r.precio_por_galon,
      km_recorridos: r.km_recorridos,
      avisos: [],
    }
    dialogResultado.value = true
    await Promise.all([recargar(), cargarVehiculos(), recargarMesSiAplica()])
  })
}

// ─────────────────────────────────────────────────────────────
// Legalizar (propietario/admin)
// ─────────────────────────────────────────────────────────────

const dialogLegalizar = ref(false)
const numeroFactura = ref('')

function abrirLegalizar() {
  numeroFactura.value = detalle.value?.numero_factura || ''
  dialogLegalizar.value = true
}

async function guardarLegalizar() {
  if (!numeroFactura.value) return avisar('Escriba el número de factura')
  const consecutivo = detalle.value.consecutivo
  await ejecutar(async () => {
    await useCombustible.legalizarCombustible(consecutivo, numeroFactura.value)
    dialogLegalizar.value = false
    await Promise.all([verDetalles(consecutivo), recargar(), recargarMesSiAplica()])
  })
}

// ─────────────────────────────────────────────────────────────
// Rendimiento del mes
// ─────────────────────────────────────────────────────────────

const pestana = ref('tanqueos')
const mesActual = hoyISO().slice(0, 7)
const mesSeleccionado = ref(mesActual)
const placaMes = ref(null)
const datosMes = ref(null)
const cargandoMes = ref(false)
let idMes = 0

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const nombreMes = (aaaamm) => {
  const [anio, mes] = String(aaaamm || '').split('-')
  return MESES[Number(mes) - 1] ? `${MESES[Number(mes) - 1]} ${anio}` : aaaamm
}

// El backend los ordena por odómetro (ascendente); en pantalla, el más reciente primero
const tanqueosMes = computed(() => [...(datosMes.value?.tanqueos || [])].sort(compararRecientes))

async function cargarMes() {
  if (!placaMes.value) placaMes.value = placasDisponibles.value[0] || null
  if (!placaMes.value || !/^\d{4}-\d{2}$/.test(mesSeleccionado.value || '')) return
  const id = ++idMes
  cargandoMes.value = true
  try {
    const data = await useCombustible.rendimientoMensual(placaMes.value, mesSeleccionado.value)
    if (id === idMes) datosMes.value = data
  } finally {
    if (id === idMes) cargandoMes.value = false
  }
}

function alCambiarPestana(valor) {
  if (valor === 'mes' && !datosMes.value) cargarMes()
}

/** Tras guardar algo, si ya se abrió la pestaña del mes, se refresca */
const recargarMesSiAplica = () => (datosMes.value ? cargarMes() : null)

// ── Inicio ──

onMounted(async () => {
  await cargarVehiculos()
  await recargar()
})
</script>

<style scoped>
.pagina-con-fab {
  padding-bottom: 88px; /* que el botón flotante no tape "Cargar más" */
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
}
.filter-scroll::-webkit-scrollbar {
  display: none;
}
.filter-chip {
  border-radius: 999px !important;
  font-size: 13px;
  flex-shrink: 0;
}
.viaje-card {
  border: 1px solid #e5e7eb !important;
  border-radius: 12px !important;
}
.viaje-card:active {
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
.rendimiento-caja {
  border-radius: 10px;
  padding: 10px 14px;
}
.rendimiento-bueno {
  background: #f0fdf4;
  color: #166534;
}
.rendimiento-regular {
  background: #fff7ed;
  color: #9a3412;
}
.rendimiento-malo {
  background: #fef2f2;
  color: #991b1b;
}
.rendimiento-neutro {
  background: #f3f4f6;
  color: #374151;
}
.precio-galon {
  background: #eff6ff;
  color: #1e3a8a;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
}
.precio-galon.precio-raro {
  background: #fff7ed;
  color: #9a3412;
}
.sticky-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 2;
}
.sticky-footer {
  position: sticky;
  bottom: 0;
  z-index: 2;
  flex-wrap: wrap;
  gap: 6px;
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
