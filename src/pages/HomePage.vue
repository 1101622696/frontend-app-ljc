<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-xs-6 col-sm-6 col-md-3" v-for="stat in stats" :key="stat.label">
        <q-card
          class="q-pa-sm cursor-pointer"
          :class="{ 'bg-primary-1': filtroEstadisticaActivo === stat.filtro }"
          @click="filtrarPorEstadistica(stat.filtro)"
        >
          <div class="text-grey-8 text-subtitle2">
            <i :class="stat.icon" class="q-mr-sm" />{{ stat.label }}
          </div>
          <div class="text-h5 text-bold">{{ stat.value }}</div>
        </q-card>
      </div>
    </div>

    <div v-if="cargando" class="text-center q-pa-md">
      <q-spinner color="primary" size="3em" />
      <q-item-label class="q-mt-sm">Cargando datos...</q-item-label>
    </div>

    <div v-else class="text-center q-pa-md">
      <q-icon name="info" color="grey" size="3em" />
      <p>No hay datos disponibles para mostrar.</p>
    </div>

    <q-btn flat round dense icon="clean" @click="limpiarFiltros" />

    <div class="row justify-center q-mt-md" v-if="totalPaginas > 1">
      <q-pagination
        v-model="pagina"
        :max="totalPaginas"
        color="primary"
        direction-links
        boundary-links
        @update:model-value="cargarDatos"
      />
    </div>
  </q-page>
</template>

<script setup>

import { ref } from 'vue'

const cargando = ref(false)

const filtroEstadisticaActivo = ref(null)
const pagina = ref(1)
const totalPaginas = ref(1)

defineOptions({
  name: 'HomePage'
})

</script>
