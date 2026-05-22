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

    <!-- <TablaRegistros
      v-if="registrosActuales.length > 0"
      :registros="registrosActuales"
      :perfilUsuario="useUsuario.perfile"
      @ver-detalles="verDetalle"
      @editar="handleEditar"
      @ir-prevuelo="handleIrAPrevuelo"
      @ir-postvuelo="handleIrAPostvuelo"
      @guardar-formulario="guardarFormularioHome"
      @aprobar-directo="handleAprobarDirecto"
      @denegar-directo="handleDenegarDirecto"
      @cancelar-directo="handleCancelarDirecto"
      @enespera-directo="handleEnesperaDirecto"
    /> -->

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

// import { ref, computed, onMounted } from 'vue'
import { ref } from 'vue'
// import { useStoreUsuarios } from '../stores/usuarios'

// const useUsuario = useStoreUsuarios()

const cargando = ref(false)
// const mostrarFormulario = ref(false)
// const accionFormulario = ref('crear')
const filtroEstadisticaActivo = ref(null)
const pagina = ref(1)
const totalPaginas = ref(1)

// const tipoFormulario = ref(null)
// const datosFormulario = ref(null)
// const tab = ref(1)

// onMounted(async () => {
//   await cargarDatos()
// })

defineOptions({
  name: 'HomePage'
})

</script>
