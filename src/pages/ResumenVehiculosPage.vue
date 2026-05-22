<template>
  <q-page class="q-pa-md">
    <!-- Formulario -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1">Generar resumen</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="q-gutter-md">
          <q-select filled v-model="filtroPlaca" label="Placa" :options="placasOptions" />

          <q-input filled v-model="filtroAnio" label="Año" type="number" />
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          color="primary"
          label="Resumen mensual"
          @click="generarMensual"
          :loading="cargando"
        />

        <q-btn color="secondary" label="Resumen anual" @click="generarAnual" :loading="cargando" />

        <q-btn outline color="grey" label="Ver guardado" @click="verResumenGuardado" />
      </q-card-actions>
    </q-card>

    <!-- Resultados -->
    <q-card v-if="resultados.length">
      <q-card-section>
        <div class="text-subtitle1">Resultados — {{ filtroPlaca }} {{ filtroAnio }}</div>
      </q-card-section>

      <q-list bordered separator>
        <q-item
          v-for="r in resultados"
          :key="`${r.mes}-${r.placa}`"
          clickable
          @click="verDetalle(r)"
        >
          <q-item-section>
            <q-item-label caption>
              Ingresos: {{ formatearPesos(r.total_ingresos) }} · Gastos:
              {{ formatearPesos(r.total_gastos) }}
            </q-item-label>

            <q-item-label caption>
              Ingresos: {{ r.total_ingresos }} · Gastos: {{ r.total_gastos }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-badge
              :color="r.diferencia >= 0 ? 'green' : 'red'"
              :label="formatearPesos(r.diferencia)"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <!-- Dialog detalle -->
    <q-dialog v-model="mostrarDetalle" persistent>
      <q-card style="min-width: 320px">
        <q-card-section>
          <div class="text-h6">
            {{ detalleResumen?.mes === 'TOTAL' ? 'Total anual' : `Mes ${detalleResumen?.mes}` }}
            — {{ detalleResumen?.placa }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none" v-if="detalleResumen">
          <div class="q-pa-sm">
            <div class="row q-mb-sm" v-for="(label, key) in camposResumen" :key="key">
              <div class="col-6 text-weight-bold text-caption">{{ label }}:</div>

              <div class="col-6 text-caption">
                {{ formatearPesos(detalleResumen[key]) }}
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStoreVehiculos } from '../stores/vehiculos'
import { useStoreUsuarios } from '../stores/usuarios'

const useVehiculo = useStoreVehiculos()
const useUsuario = useStoreUsuarios()

const filtroPlaca = ref('')
const filtroAnio = ref(new Date().getFullYear())

const resultados = ref([])
const cargando = ref(false)

const placasOptions = ref([])

const detalleResumen = ref(null)
const mostrarDetalle = ref(false)

const perfilUsuario = computed(() => useUsuario.perfile)

const camposResumen = {
  total_ingresos: 'Total ingresos',
  total_gastos: 'Total gastos',
  diferencia: 'Ganancia',
}

function verDetalle(r) {
  detalleResumen.value = r
  mostrarDetalle.value = true
}

function formatearPesos(valor) {
  const numero = Number(valor) || 0

  return numero.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

onMounted(async () => {
  const res = await useVehiculo.obtenerVehiculos()

  if (Array.isArray(res)) {
    if (perfilUsuario.value === 'administrador') {
      placasOptions.value = res.map((v) => v.placa)
    } else {
      const asignadas = useUsuario.user?.placa_asignada?.split(',').map((p) => p.trim()) || []

      placasOptions.value = asignadas
    }

    filtroPlaca.value = placasOptions.value[0] || ''
  }
})

async function generarMensual() {
  if (!filtroPlaca.value || !filtroAnio.value) return

  cargando.value = true

  try {
    await useVehiculo.postResumenVehiculoMensual({
      placa: filtroPlaca.value,
      anio: filtroAnio.value,
      mes: new Date().getMonth() + 1,
    })

    await verResumenGuardado()
  } finally {
    cargando.value = false
  }
}

async function generarAnual() {
  if (!filtroPlaca.value || !filtroAnio.value) return

  cargando.value = true

  try {
    await useVehiculo.postResumenVehiculoAnual({
      placa: filtroPlaca.value,
      anio: filtroAnio.value,
    })

    await verResumenGuardado()
  } finally {
    cargando.value = false
  }
}

async function verResumenGuardado() {
  const res = await useVehiculo.obtenerResumenVehiculo(filtroPlaca.value, filtroAnio.value)

  resultados.value = Array.isArray(res) ? res : []
}

defineOptions({
  name: 'ResumenVehiculosPage',
})
</script>
