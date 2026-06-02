  <!-- <q-page class="q-pa-md"> -->
    <!-- <q-card-section>
      <div class="row items-center q-col-gutter-md">
        <div class="col-12 col-md-auto">
          <q-btn-group spread>
            <q-btn
              v-for="(config, tipo) in filtrosConfig"
              :key="tipo"
              :label="tipo === 'todos' ? 'Todos' : config.titulo.split(' ').pop()"
              :icon="config.icono"
              :color="config.color"
              @click="cargarListaPor(tipo)"
              :outline="tipoLista !== tipo"
              size="sm"
            />
          </q-btn-group>
        </div>

        <div class="col-12 col-md-auto" v-if="tipoLista !== 'todos' && !filtroActual.esFiltroTexto">
          <q-btn-toggle
            v-model="ordenActual"
            toggle-color="primary"
            :options="opcionesOrdenamiento"
            @update:model-value="cargarViajes"
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

    <div class="text-h6 q-mb-md">Viajes</div>
    <div class="row q-gutter-sm q-mb-md">
      <q-btn
        v-for="estado in ['solicitado', 'completado', 'aprobado', 'facturado']"
        :key="estado"
        :color="colorEstado(estado)"
        :outline="!(tipoLista === 'estado_viaje' && valorFiltroTexto === estado)"
        size="sm"
        @click="
          () => {
            tipoLista = 'estado_viaje'
            valorFiltroTexto = estado
            cargarViajes()
          }
        "
      >
        {{ estado }} ({{ conteoEstados[estado] }})
      </q-btn>

      <q-btn
        size="sm"
        color="primary"
        :outline="tipoLista !== 'todos'"
        @click="cargarListaPor('todos')"
        label="Todos"
      />
    </div>

    <div class="text-subtitle1 q-mb-sm q-px-md">
      <q-icon :name="filtroActual.icono" :color="filtroActual.color" />
      {{ filtroActual.titulo }}
      <span v-if="filtroActual.esFiltroTexto && valorFiltroTexto">
        — {{ obtenerEtiquetaFiltroTexto(valorFiltroTexto) }}
      </span>
    </div>

    <q-list bordered separator>
      <q-item
        v-for="viaje in viajes"
        :key="viaje.consecutivo"
        clickable
        @click="verDetalles(viaje.consecutivo)"
      >
        <q-item-section>
          <q-item-label>{{ viaje.consecutivo }} — {{ viaje.placa }}</q-item-label>
          <q-item-label caption>{{ viaje.cliente }} · {{ viaje.destino }}</q-item-label>
          <q-item-label caption v-if="viaje.valorFiltro !== undefined">
            {{ viaje.valorFiltro }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-badge :color="colorEstado(viaje.estado_viaje)" :label="viaje.estado_viaje" />
        </q-item-section>
      </q-item>
    </q-list>

    <q-btn color="primary" label="Crear viaje" class="q-mt-md" @click="abrirCrear" /> -->
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

    <div v-if="tipoLista !== 'todos' && !filtroActual.esFiltroTexto" class="row no-wrap q-gutter-x-sm q-mt-sm">
      <q-chip
        v-for="op in opcionesOrdenamiento"
        :key="op.value"
        clickable size="sm"
        :color="ordenActual === op.value ? 'secondary' : 'transparent'"
        :text-color="ordenActual === op.value ? 'white' : 'grey-7'"
        :outline="ordenActual !== op.value"
        @click="ordenActual = op.value; cargarViajes()"
      >
        {{ op.label }}
      </q-chip>
    </div>

    <div v-if="filtroActual.esFiltroTexto" class="q-mt-sm">
      <q-select
        v-model="valorFiltroTexto"
        :options="opcionesFiltroTexto"
        option-value="valor" option-label="etiqueta"
        dense outlined rounded emit-value map-options
        @update:model-value="actualizarValorFiltro"
      />
    </div>
  </div>

  <!-- Chips de estado con conteo -->
  <div class="filter-scroll row no-wrap q-gutter-x-sm q-mb-md">
    <q-chip
      v-for="estado in ['solicitado', 'completado', 'aprobado', 'facturado']"
      :key="estado"
      clickable
      :color="tipoLista === 'estado_viaje' && valorFiltroTexto === estado ? colorEstado(estado) : 'grey-2'"
      :text-color="tipoLista === 'estado_viaje' && valorFiltroTexto === estado ? 'white' : 'grey-8'"
      class="filter-chip"
      @click="tipoLista = 'estado_viaje'; valorFiltroTexto = estado; cargarViajes()"
    >
      {{ estado }}
      <q-badge
        floating rounded
        :color="colorEstado(estado)"
        style="top: -4px; right: -4px; font-size: 10px;"
      >
        {{ conteoEstados[estado] }}
      </q-badge>
    </q-chip>
    <q-chip
      clickable
      :color="tipoLista === 'todos' ? 'primary' : 'grey-2'"
      :text-color="tipoLista === 'todos' ? 'white' : 'grey-8'"
      class="filter-chip"
      @click="cargarListaPor('todos')"
    >
      Todos
    </q-chip>
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
      {{ viajes.length }}
    </q-badge>
  </div>

  <!-- Cards -->
  <div class="q-gutter-y-sm">
    <q-card
      v-for="v in viajes"
      :key="v.consecutivo"
      flat bordered
      class="viaje-card cursor-pointer"
      @click="verDetalles(v.consecutivo)"
    >
      <q-card-section class="q-pa-md">

        <div class="row items-center q-mb-sm">
          <div class="placa-badge q-mr-sm">{{ v.placa }}</div>
          <span class="text-caption text-grey-6">#{{ v.consecutivo }}</span>
          <q-space />
          <q-badge
            :color="colorEstado(v.estado_viaje)"
            text-color="white"
            rounded
          >
            {{ v.estado_viaje }}
          </q-badge>
        </div>

        <div class="row items-start q-gutter-x-sm">
          <div class="col">
            <div class="text-caption text-grey-5">Cliente</div>
            <div class="text-body2 text-weight-medium ellipsis">{{ v.cliente }}</div>
          </div>
          <div class="col">
            <div class="text-caption text-grey-5">Destino</div>
            <div class="text-body2 ellipsis">{{ v.destino }}</div>
          </div>
        </div>

        <div class="row items-center q-mt-sm" style="border-top: 1px solid rgba(0,0,0,0.06); padding-top: 8px;">
          <q-icon name="event" size="13px" color="grey-5" class="q-mr-xs" />
          <span class="text-caption text-grey-5">{{ formatFecha(v.fecha_inicio) }}</span>
          <q-space />
          <q-icon name="chevron_right" color="grey-4" size="16px" />
        </div>

      </q-card-section>
    </q-card>
  </div>

  <q-page-sticky position="bottom-right" :offset="[18, 18]">
    <q-btn fab icon="add" color="primary" @click="abrirCrear" />
  </q-page-sticky>
<!-- </q-page> -->


    <!-- ───────────── DETALLE ───────────── -->
    <!-- <q-dialog v-model="mostrarDetalles" persistent>
      <q-card style="min-width: 350px; max-width: 600px">
        <q-card-section>
          <div class="text-h6">Detalle del viaje</div>
        </q-card-section>

        <q-card-section class="q-pt-none" v-if="detalleViaje">
          <div class="q-pa-md">
            <div
              v-for="(val, key) in camposDetalle"
              :key="key"
              class="row q-mb-sm items-center"
              :class="{
                'bg-green-1 q-pa-sm rounded-borders': key === 'ganancia_viaje_real',
              }"
            >
              <div
                class="col-5 text-weight-bold"
                :class="{
                  'text-h6 text-weight-bolder': key === 'ganancia_viaje_real',
                }"
              >
                {{ val.label }}:
              </div>

              <div class="col-7" :class="obtenerClaseValor(detalleViaje[key], key)">                <template v-if="key.startsWith('link_')">
                  <q-btn
                    v-if="detalleViaje[key]"
                    outline
                    color="orange"
                    icon="folder"
                    label="Ver archivos"
                    size="sm"
                    @click="abrirVisor(detalleViaje[key], val.label)"
                  />

                  <span v-else>—</span>
                </template>

                <template v-else>
                  {{ formatearValor(detalleViaje[key], key) }}
                </template>
              </div>
            </div>
          </div>

          <q-card-actions align="right">
            <q-btn
              v-if="detalleViaje.estado_viaje === 'solicitado'"
              color="orange"
              label="Cerrar viaje (conductor)"
              @click="abrirCerrarConductor"
            />
            <q-btn
              v-if="
                detalleViaje.estado_viaje === 'completado' &&
                (perfilUsuario === 'propietario' || perfilUsuario === 'administrador')
              "
              color="blue"
              label="Aprobar (propietario)"
              @click="abrirAprobarPropietario"
            />
            <q-btn
              v-if="
                detalleViaje.estado_viaje === 'aprobado' &&
                (perfilUsuario === 'propietario' || perfilUsuario === 'administrador')
              "
              color="purple"
              label="Facturar viaje"
              @click="abrirFacturar"
            />
            <q-btn
              v-if="
                detalleViaje.estado_viaje === 'facturado' &&
                detalleViaje.estado_saldo_cliente !== 'pagado' &&
                (perfilUsuario === 'propietario' || perfilUsuario === 'administrador')
              "
              color="green"
              label="Completar saldo"
              @click="completarSaldo"
              :loading="cargando"
            />
          </q-card-actions>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog> -->

<q-dialog v-model="mostrarDetalles" persistent>
  <q-card style="min-width: 350px; max-width: 95vw; width: 500px; border-radius: 16px !important;">

    <!-- Header -->
    <q-card-section class="q-pb-sm">
      <div class="row items-center">
        <div>
          <div class="text-subtitle1 text-weight-medium">Detalle del viaje</div>
          <div class="text-caption text-grey-6" v-if="detalleViaje">
            #{{ detalleViaje.consecutivo }} · {{ formatFecha(detalleViaje.fecha_inicio) }}
          </div>
        </div>
        <q-space />
        <q-badge
          v-if="detalleViaje"
          :color="colorEstado(detalleViaje.estado_viaje)"
          text-color="white"
          rounded
        >
          {{ detalleViaje.estado_viaje }}
        </q-badge>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section class="q-pt-md" v-if="detalleViaje" style="max-height: 65vh; overflow-y: auto;">

      <!-- Placa + ruta -->
      <div class="row items-center q-mb-md">
        <div class="placa-badge-lg q-mr-md">{{ detalleViaje.placa }}</div>
        <div>
          <div class="text-body2 text-weight-medium">{{ detalleViaje.cliente }}</div>
          <div class="text-caption text-grey-6">
            <q-icon name="arrow_forward" size="12px" />
            {{ detalleViaje.destino }}
          </div>
        </div>
      </div>

      <!-- Ganancia real destacada si existe -->
      <div
        v-if="detalleViaje.ganancia_viaje_real"
        class="ganancia-banner q-mb-md"
        :class="Number(detalleViaje.ganancia_viaje_real) >= 0 ? 'ganancia-positiva' : 'ganancia-negativa'"
      >
        <div class="text-caption" style="opacity: 0.7;">Ganancia real</div>
        <div class="text-h6 text-weight-bold">
          {{ formatearValor(detalleViaje.ganancia_viaje_real, 'ganancia_viaje_real') }}
        </div>
      </div>

      <!-- Sección: Info general -->
      <div class="seccion-titulo">Info general</div>
      <div class="detalle-fila">
        <span class="detalle-label">Creado por</span>
        <span class="detalle-valor">{{ detalleViaje.usuario || '—' }}</span>
      </div>
      <div class="detalle-fila">
        <span class="detalle-label">Fecha creación</span>
        <span class="detalle-valor">{{ formatFecha(detalleViaje.fecha_creacion) }}</span>
      </div>
      <div class="detalle-fila">
        <span class="detalle-label">Fecha fin</span>
        <span class="detalle-valor">{{ formatFecha(detalleViaje.fecha_fin_viaje) }}</span>
      </div>
      <div class="detalle-fila">
        <span class="detalle-label">Liquidado</span>
        <q-badge
          :color="detalleViaje.liquidado ? 'green-1' : 'orange-1'"
          :text-color="detalleViaje.liquidado ? 'green-9' : 'orange-9'"
          rounded
        >
          {{ detalleViaje.liquidado ? 'Sí' : 'No' }}
        </q-badge>
      </div>

      <!-- Sección: Toneladas -->
      <div class="seccion-titulo q-mt-md">Toneladas</div>
      <div class="row q-gutter-sm q-mb-sm">
        <div class="metrica-chip col">
          <div class="metrica-label">Inicio</div>
          <div class="metrica-valor">{{ detalleViaje.toneladas_inicio || '—' }}</div>
        </div>
        <div class="metrica-chip col">
          <div class="metrica-label">Descargue</div>
          <div class="metrica-valor">{{ detalleViaje.toneladas_descargue || '—' }}</div>
        </div>
        <div class="metrica-chip col" :class="Number(detalleViaje.diferencia_kg) < 0 ? 'rendimiento-malo' : ''">
          <div class="metrica-label">Diferencia kg</div>
          <div class="metrica-valor">{{ detalleViaje.diferencia_kg || '—' }}</div>
        </div>
      </div>
      <div class="row q-gutter-sm q-mb-sm">
        <div class="metrica-chip col">
          <div class="metrica-label">Valor ton. inicial</div>
          <div class="metrica-valor">{{ formatearValor(detalleViaje.valor_tonelada_inicial, 'valor_tonelada_inicial') }}</div>
        </div>
        <div class="metrica-chip col">
          <div class="metrica-label">Valor ton. final</div>
          <div class="metrica-valor">{{ formatearValor(detalleViaje.valor_tonelada_final, 'valor_tonelada_final') }}</div>
        </div>
      </div>

      <!-- Sección: Cliente -->
      <div class="seccion-titulo q-mt-md">Valores cliente</div>
      <div class="detalle-fila">
        <span class="detalle-label">Anticipo cliente</span>
        <span class="detalle-valor">{{ formatearValor(detalleViaje.valor_anticipo_cliente, 'valor_anticipo_cliente') }}</span>
      </div>
      <div class="detalle-fila">
        <span class="detalle-label">Saldo sin descuento</span>
        <span class="detalle-valor">{{ formatearValor(detalleViaje.saldo_pendiente_cliente_sin_descuento, 'saldo_pendiente_cliente_sin_descuento') }}</span>
      </div>
      <div class="detalle-fila">
        <span class="detalle-label">Saldo real</span>
        <span class="detalle-valor" :class="obtenerClaseValor(detalleViaje.saldo_pendiente_cliente_real, 'saldo_pendiente_cliente_real')">
          {{ formatearValor(detalleViaje.saldo_pendiente_cliente_real, 'saldo_pendiente_cliente_real') }}
        </span>
      </div>
      <div class="detalle-fila">
        <span class="detalle-label">Rete fuente</span>
        <span class="detalle-valor">{{ formatearValor(detalleViaje.descuento_rete_fuente, 'descuento_rete_fuente') }}</span>
      </div>
      <div class="detalle-fila">
        <span class="detalle-label">Rete ICA</span>
        <span class="detalle-valor">{{ formatearValor(detalleViaje.descuento_rete_ica, 'descuento_rete_ica') }}</span>
      </div>
      <div class="detalle-fila">
        <span class="detalle-label">Total descuentos</span>
        <span class="detalle-valor">{{ formatearValor(detalleViaje.total_descuentos_cliente, 'total_descuentos_cliente') }}</span>
      </div>
      <div class="detalle-fila">
        <span class="detalle-label">Estado saldo</span>
        <q-badge
          :color="detalleViaje.estado_saldo_cliente === 'pagado' ? 'green-1' : 'orange-1'"
          :text-color="detalleViaje.estado_saldo_cliente === 'pagado' ? 'green-9' : 'orange-9'"
          rounded
        >
          {{ detalleViaje.estado_saldo_cliente || '—' }}
        </q-badge>
      </div>

      <!-- Sección: Facturación -->
      <div class="seccion-titulo q-mt-md">Facturación</div>
      <div class="row q-gutter-sm q-mb-sm">
        <div class="metrica-chip col">
          <div class="metrica-label">Estimado</div>
          <div class="metrica-valor">{{ formatearValor(detalleViaje.valor_viaje_estimado, 'valor_viaje_estimado') }}</div>
        </div>
        <div class="metrica-chip col">
          <div class="metrica-label">Real</div>
          <div class="metrica-valor">{{ formatearValor(detalleViaje.valor_viaje_real, 'valor_viaje_real') }}</div>
        </div>
        <div class="metrica-chip col" :class="Number(detalleViaje.diferencia_facturacion) < 0 ? 'rendimiento-malo' : 'rendimiento-bueno'">
          <div class="metrica-label">Diferencia</div>
          <div class="metrica-valor">{{ formatearValor(detalleViaje.diferencia_facturacion, 'diferencia_facturacion') }}</div>
        </div>
      </div>
      <div class="detalle-fila">
        <span class="detalle-label">N° factura cliente</span>
        <span class="detalle-valor">{{ detalleViaje.num_factura_cliente || '—' }}</span>
      </div>
      <div class="detalle-fila" v-if="detalleViaje.notas_facturacion">
        <span class="detalle-label">Notas</span>
        <span class="detalle-valor">{{ detalleViaje.notas_facturacion }}</span>
      </div>

      <!-- Sección: Conductor -->
      <div class="seccion-titulo q-mt-md">Conductor</div>
      <div class="detalle-fila">
        <span class="detalle-label">10% viaje</span>
        <span class="detalle-valor">{{ formatearValor(detalleViaje.diez_pcto, 'diez_pcto') }}</span>
      </div>
      <div class="detalle-fila">
        <span class="detalle-label">Anticipo</span>
        <span class="detalle-valor">{{ formatearValor(detalleViaje.valor_anticipo_conductor, 'valor_anticipo_conductor') }}</span>
      </div>
      <div class="detalle-fila">
        <span class="detalle-label">Saldo anticipo</span>
        <span class="detalle-valor">{{ formatearValor(detalleViaje.saldo_anticipo_conductor, 'saldo_anticipo_conductor') }}</span>
      </div>
      <div class="detalle-fila">
        <span class="detalle-label">Gastos conductor</span>
        <span class="detalle-valor">{{ formatearValor(detalleViaje.total_gastos_conductor, 'total_gastos_conductor') }}</span>
      </div>
      <div class="detalle-fila">
        <span class="detalle-label">Saldo pendiente</span>
        <span class="detalle-valor" :class="obtenerClaseValor(detalleViaje.saldo_pendiente_conductor, 'saldo_pendiente_conductor')">
          {{ formatearValor(detalleViaje.saldo_pendiente_conductor, 'saldo_pendiente_conductor') }}
        </span>
      </div>

      <!-- Sección: Propietario y ganancia -->
      <div class="seccion-titulo q-mt-md">Propietario y ganancia</div>
      <div class="detalle-fila">
        <span class="detalle-label">Gastos propietario</span>
        <span class="detalle-valor">{{ formatearValor(detalleViaje.total_gastos_propietario, 'total_gastos_propietario') }}</span>
      </div>
      <div class="detalle-fila">
        <span class="detalle-label">Ganancia estimada</span>
        <span class="detalle-valor">{{ formatearValor(detalleViaje.ganancia_viaje_estimada, 'ganancia_viaje_estimada') }}</span>
      </div>

      <!-- Documentos -->
      <div class="seccion-titulo q-mt-md">Documentos</div>
      <div class="row q-gutter-sm q-mb-sm">
        <q-btn
          v-if="detalleViaje.link_manifiesto"
          outline color="secondary" icon="folder" label="Manifiesto" size="sm"
          @click="abrirVisor(detalleViaje.link_manifiesto, 'Manifiesto')"
        />
        <q-btn
          v-if="detalleViaje.link_gastos_conductor"
          outline color="secondary" icon="folder" label="Gastos conductor" size="sm"
          @click="abrirVisor(detalleViaje.link_gastos_conductor, 'Gastos conductor')"
        />
        <q-btn
          v-if="detalleViaje.link_gastos_propietario"
          outline color="secondary" icon="folder" label="Gastos propietario" size="sm"
          @click="abrirVisor(detalleViaje.link_gastos_propietario, 'Gastos propietario')"
        />
        <span v-if="!detalleViaje.link_manifiesto && !detalleViaje.link_gastos_conductor && !detalleViaje.link_gastos_propietario"
          class="text-caption text-grey-5">Sin documentos</span>
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

    <!-- Acciones según estado -->
    <q-card-actions class="q-pa-md" align="right">
      <q-btn
        v-if="detalleViaje?.estado_viaje === 'solicitado'"
        color="orange" label="Cerrar viaje" icon="check" size="sm"
        @click="abrirCerrarConductor"
      />
      <q-btn
        v-if="detalleViaje?.estado_viaje === 'completado' && ['propietario','administrador'].includes(perfilUsuario)"
        color="blue" label="Aprobar" icon="thumb_up" size="sm"
        @click="abrirAprobarPropietario"
      />
      <q-btn
        v-if="detalleViaje?.estado_viaje === 'aprobado' && ['propietario','administrador'].includes(perfilUsuario)"
        color="purple" label="Facturar" icon="receipt" size="sm"
        @click="abrirFacturar"
      />
      <q-btn
        v-if="detalleViaje?.estado_viaje === 'facturado' && detalleViaje?.estado_saldo_cliente !== 'pagado' && ['propietario','administrador'].includes(perfilUsuario)"
        color="green" label="Completar saldo" icon="payments" size="sm"
        @click="completarSaldo" :loading="cargando"
      />
      <q-btn flat label="Cerrar" color="primary" v-close-popup />
    </q-card-actions>

  </q-card>
</q-dialog>

    <!-- ───────────── CREAR VIAJE ───────────── -->
    <q-dialog v-model="dialogCrear" persistent>
      <q-card style="width: 600px">
        <q-card-section style="background-color: #f5f5f5">
          <div class="text-h6">Crear viaje</div>
        </q-card-section>

        <div class="q-pa-md">
          <div class="q-gutter-md">
            <!-- Conductor: muestra la placa pero no puede cambiarla -->
            <q-input
              v-if="perfilUsuario === 'conductor'"
              outlined
              rounded
              v-model="formularioCrear.placa"
              label="Tu placa"
              :dense="dense"
              disable
            />

            <!-- Propietario y Admin: select con opciones -->
            <q-select
              v-else
              outlined
              rounded
              v-model="formularioCrear.placa"
              label="Placa"
              :options="placasOptions"
              :dense="dense"
            />

            <q-select
              outlined
              rounded
              v-model="formularioCrear.cliente"
              label="Cliente"
              :options="clientesOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              :dense="dense"
            />
            <q-input
              outlined
              rounded
              v-model.trim="formularioCrear.destino"
              label="Destino"
              :dense="dense"
            />
            <q-input
              outlined
              rounded
              v-model="formularioCrear.fecha_inicio"
              label="Fecha inicio"
              :dense="dense"
              readonly
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="formularioCrear.fecha_inicio" mask="YYYY-MM-DD" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input
              outlined
              rounded
              v-model="anticipoFormatted"
              label="Anticipo conductor"
              :dense="dense"
              @update:model-value="formatearAnticipo"
            />

            <q-input
              outlined
              rounded
              v-model="toneladaFormatted"
              label="Valor tonelada inicial"
              :dense="dense"
              @update:model-value="formatearTonelada"
            />
          </div>
        </div>

        <q-card-actions align="right">
          <q-btn color="primary" label="Crear" @click="guardarCrear" :loading="cargando" />
          <q-btn flat label="Cancelar" @click="dialogCrear = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ───────────── CERRAR CONDUCTOR ───────────── -->
    <q-dialog v-model="dialogCerrarConductor" persistent>
      <q-card style="width: 600px">
        <q-card-section style="background-color: #f5f5f5">
          <div class="text-h6">Cerrar viaje — Conductor</div>
        </q-card-section>

        <div class="q-pa-md">
          <div class="q-gutter-md">
            <q-input
              outlined
              rounded
              v-model="formularioConductor.fecha_fin_viaje"
              label="Fecha fin"
              :dense="dense"
              readonly
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="formularioConductor.fecha_fin_viaje" mask="YYYY-MM-DD" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input
              outlined
              rounded
              v-model.number="formularioConductor.toneladas_inicio"
              label="Toneladas inicio"
              type="number"
              :dense="dense"
            />
            <q-input
              outlined
              rounded
              v-model.number="formularioConductor.toneladas_descargue"
              label="Toneladas descargue"
              type="number"
              :dense="dense"
            />
            <q-input
              outlined
              rounded
              v-model="toneladaFinalFormatted"
              label="Valor tonelada final"
              :dense="dense"
              @update:model-value="formatearToneladaFinal"
            />
            <q-separator label="Gastos conductor" label-color="grey-7" />

            <CampoGasto
              label="Peajes"
              @update:valor="(v) => (formularioConductor.peajes_conductor = v)"
              @update:tipoFactura="(v) => (formularioConductor.tipo_factura_peajes_conductor = v)"
              @update:archivo="(v) => (formularioConductor.peajes_conductor_archivos = v)"
              :dense="dense"
            />
            <CampoGasto
              label="Lavadas"
              @update:valor="(v) => (formularioConductor.lavadas_conductor = v)"
              @update:tipoFactura="(v) => (formularioConductor.tipo_factura_lavadas_conductor = v)"
              @update:archivo="(v) => (formularioConductor.lavadas_conductor_archivos = v)"
              :dense="dense"
            />
            <CampoGasto
              label="Parqueadero"
              @update:valor="(v) => (formularioConductor.parqueadero_conductor = v)"
              @update:tipoFactura="
                (v) => (formularioConductor.tipo_factura_parqueadero_conductor = v)
              "
              @update:archivo="(v) => (formularioConductor.parqueadero_conductor_archivos = v)"
              :dense="dense"
            />
            <CampoGasto
              label="Engrase"
              @update:valor="(v) => (formularioConductor.engrase_conductor = v)"
              @update:tipoFactura="(v) => (formularioConductor.tipo_factura_engrase_conductor = v)"
              @update:archivo="(v) => (formularioConductor.engrase_conductor_archivos = v)"
              :dense="dense"
            />
            <CampoGasto
              label="Fumigación"
              @update:valor="(v) => (formularioConductor.fumigacion_conductor = v)"
              @update:tipoFactura="
                (v) => (formularioConductor.tipo_factura_fumigacion_conductor = v)
              "
              @update:archivo="(v) => (formularioConductor.fumigacion_conductor_archivos = v)"
              :dense="dense"
            />
            <CampoGasto
              label="Cargue"
              @update:valor="(v) => (formularioConductor.cargue_conductor = v)"
              @update:tipoFactura="(v) => (formularioConductor.tipo_factura_cargue_conductor = v)"
              @update:archivo="(v) => (formularioConductor.cargue_conductor_archivos = v)"
              :dense="dense"
            />
            <CampoGasto
              label="Descargue"
              @update:valor="(v) => (formularioConductor.descargue_conductor = v)"
              @update:tipoFactura="
                (v) => (formularioConductor.tipo_factura_descargue_conductor = v)
              "
              @update:archivo="(v) => (formularioConductor.descargue_conductor_archivos = v)"
              :dense="dense"
            />
            <CampoGasto
              label="Comisión"
              :conArchivo="false"
              @update:valor="(v) => (formularioConductor.comision_conductor = v)"
              @update:tipoFactura="(v) => (formularioConductor.tipo_factura_comision_conductor = v)"
              @update:archivo="(v) => (formularioConductor.comision_conductor_archivos = v)"
              :dense="dense"
            />
            <CampoGasto
              label="Otro"
              @update:valor="(v) => (formularioConductor.otro_conductor = v)"
              @update:tipoFactura="(v) => (formularioConductor.tipo_factura_otro_conductor = v)"
              @update:archivo="(v) => (formularioConductor.otro_conductor_archivos = v)"
              :dense="dense"
            />

            <q-separator label="Manifiesto" label-color="grey-7" />
            <div>
              <div class="text-caption text-grey-7">Manifiesto (obligatorio)</div>
              <q-file
                outlined
                rounded
                v-model="formularioConductor.manifiesto"
                label="Seleccionar archivo"
                :dense="dense"
              />
            </div>
          </div>
        </div>

        <q-card-actions align="right">
          <q-btn
            color="orange"
            label="Cerrar viaje"
            @click="guardarCerrarConductor"
            :loading="cargando"
          />
          <q-btn flat label="Cancelar" @click="dialogCerrarConductor = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ───────────── APROBAR PROPIETARIO ───────────── -->

    <q-dialog v-model="dialogAprobarPropietario" persistent>
      <q-card style="width: 600px">
        <q-card-section class="q-pb-none">
          <div class="text-subtitle2 q-mb-sm text-grey-8">Documentos del conductor</div>

          <div class="row q-gutter-sm">
            <q-btn
              v-if="detalleViaje?.link_manifiesto"
              outline
              color="teal"
              icon="description"
              label="Ver manifiesto"
              size="sm"
              @click="abrirVisor(detalleViaje.link_manifiesto, 'Manifiesto')"
            />

            <q-btn
              v-if="detalleViaje?.link_gastos_conductor"
              outline
              color="orange"
              icon="folder"
              label="Ver soportes gastos"
              size="sm"
              @click="abrirVisor(detalleViaje.link_gastos_conductor, 'Soportes gastos conductor')"
            />
          </div>
        </q-card-section>
        <q-separator class="q-my-sm" />

        <q-card-section style="background-color: #f5f5f5">
          <div class="text-h6">Aprobar viaje — Propietario</div>
        </q-card-section>
        <div class="q-pa-md">
          <div class="text-subtitle2 q-mb-sm text-grey-8">Verificar datos del conductor</div>
          <div class="q-gutter-md q-mb-md">
            <q-input
              outlined
              rounded
              v-model.number="formularioPropietario.toneladas_inicio"
              label="Toneladas inicio"
              type="number"
              :dense="dense"
            />
            <q-input
              outlined
              rounded
              v-model.number="formularioPropietario.toneladas_descargue"
              label="Toneladas descargue"
              type="number"
              :dense="dense"
            />
            <q-input
              outlined
              rounded
              v-model.number="formularioPropietario.valor_tonelada_final"
              label="Valor tonelada final"
              type="number"
              :dense="dense"
            />

            <CampoGasto
              label="Peajes conductor"
              :valorInicial="formularioPropietario.peajes_conductor"
              :tipoFacturaInicial="formularioPropietario.tipo_factura_peajes_conductor"
              @update:valor="(v) => (formularioPropietario.peajes_conductor = v)"
              @update:tipoFactura="(v) => (formularioPropietario.tipo_factura_peajes_conductor = v)"
              @update:archivo="(v) => (formularioPropietario.peajes_conductor_archivos = v)"
              :dense="dense"
            />

            <CampoGasto
              label="Lavadas conductor"
              :valorInicial="formularioPropietario.lavadas_conductor"
              :tipoFacturaInicial="formularioPropietario.tipo_factura_lavadas_conductor"
              @update:valor="(v) => (formularioPropietario.lavadas_conductor = v)"
              @update:tipoFactura="
                (v) => (formularioPropietario.tipo_factura_lavadas_conductor = v)
              "
              @update:archivo="(v) => (formularioPropietario.lavadas_conductor_archivos = v)"
              :dense="dense"
            />

            <CampoGasto
              label="Parqueadero conductor"
              :valorInicial="formularioPropietario.parqueadero_conductor"
              :tipoFacturaInicial="formularioPropietario.tipo_factura_parqueadero_conductor"
              @update:valor="(v) => (formularioPropietario.parqueadero_conductor = v)"
              @update:tipoFactura="
                (v) => (formularioPropietario.tipo_factura_parqueadero_conductor = v)
              "
              @update:archivo="(v) => (formularioPropietario.parqueadero_conductor_archivos = v)"
              :dense="dense"
            />

            <CampoGasto
              label="Engrase conductor"
              :valorInicial="formularioPropietario.engrase_conductor"
              :tipoFacturaInicial="formularioPropietario.tipo_factura_engrase_conductor"
              @update:valor="(v) => (formularioPropietario.engrase_conductor = v)"
              @update:tipoFactura="
                (v) => (formularioPropietario.tipo_factura_engrase_conductor = v)
              "
              @update:archivo="(v) => (formularioPropietario.engrase_conductor_archivos = v)"
              :dense="dense"
            />

            <CampoGasto
              label="Fumigación conductor"
              :valorInicial="formularioPropietario.fumigacion_conductor"
              :tipoFacturaInicial="formularioPropietario.tipo_factura_fumigacion_conductor"
              @update:valor="(v) => (formularioPropietario.fumigacion_conductor = v)"
              @update:tipoFactura="
                (v) => (formularioPropietario.tipo_factura_fumigacion_conductor = v)
              "
              @update:archivo="(v) => (formularioPropietario.fumigacion_conductor_archivos = v)"
              :dense="dense"
            />

            <CampoGasto
              label="Cargue conductor"
              :valorInicial="formularioPropietario.cargue_conductor"
              :tipoFacturaInicial="formularioPropietario.tipo_factura_cargue_conductor"
              @update:valor="(v) => (formularioPropietario.cargue_conductor = v)"
              @update:tipoFactura="(v) => (formularioPropietario.tipo_factura_cargue_conductor = v)"
              @update:archivo="(v) => (formularioPropietario.cargue_conductor_archivos = v)"
              :dense="dense"
            />

            <CampoGasto
              label="Descargue conductor"
              :valorInicial="formularioPropietario.descargue_conductor"
              :tipoFacturaInicial="formularioPropietario.tipo_factura_descargue_conductor"
              @update:valor="(v) => (formularioPropietario.descargue_conductor = v)"
              @update:tipoFactura="
                (v) => (formularioPropietario.tipo_factura_descargue_conductor = v)
              "
              @update:archivo="(v) => (formularioPropietario.descargue_conductor_archivos = v)"
              :dense="dense"
            />

            <CampoGasto
              label="Comisión conductor"
              :valorInicial="formularioPropietario.comision_conductor"
              :tipoFacturaInicial="formularioPropietario.tipo_factura_comision_conductor"
              @update:valor="(v) => (formularioPropietario.comision_conductor = v)"
              @update:tipoFactura="
                (v) => (formularioPropietario.tipo_factura_comision_conductor = v)
              "
              @update:archivo="(v) => (formularioPropietario.comision_conductor_archivos = v)"
              :dense="dense"
            />

            <CampoGasto
              label="Otro conductor"
              :valorInicial="formularioPropietario.otro_conductor"
              :tipoFacturaInicial="formularioPropietario.tipo_factura_otro_conductor"
              @update:valor="(v) => (formularioPropietario.otro_conductor = v)"
              @update:tipoFactura="(v) => (formularioPropietario.tipo_factura_otro_conductor = v)"
              @update:archivo="(v) => (formularioPropietario.otro_conductor_archivos = v)"
              :dense="dense"
            />
          </div>

          <q-separator label="Datos propietario" label-color="grey-7" class="q-my-md" />
          <div class="q-gutter-md">
            <q-input
              filled
              v-model="anticipoclienteFormatted"
              label="Anticipo cliente"
              :dense="dense"
              @update:model-value="formatearanticipocliente"
            />

            <CampoGasto
              label="Peajes propietario"
              @update:valor="(v) => (formularioPropietario.peajes_propietario = v)"
              @update:tipoFactura="
                (v) => (formularioPropietario.tipo_factura_peajes_propietario = v)
              "
              @update:archivo="(v) => (formularioPropietario.peajes_propietario_archivos = v)"
              :dense="dense"
            />

            <CampoGasto
              label="Parqueadero propietario"
              @update:valor="(v) => (formularioPropietario.parqueadero_propietario = v)"
              @update:tipoFactura="
                (v) => (formularioPropietario.tipo_factura_parqueadero_propietario = v)
              "
              @update:archivo="(v) => (formularioPropietario.parqueadero_propietario_archivos = v)"
              :dense="dense"
            />
            <CampoGasto
              label="Engrase propietario"
              @update:valor="(v) => (formularioPropietario.engrase_propietario = v)"
              @update:tipoFactura="
                (v) => (formularioPropietario.tipo_factura_engrase_propietario = v)
              "
              @update:archivo="(v) => (formularioPropietario.engrase_propietario_archivos = v)"
              :dense="dense"
            />
            <CampoGasto
              label="Fumigación propietario"
              @update:valor="(v) => (formularioPropietario.fumigacion_propietario = v)"
              @update:tipoFactura="
                (v) => (formularioPropietario.tipo_factura_fumigacion_propietario = v)
              "
              @update:archivo="(v) => (formularioPropietario.fumigacion_propietario_archivos = v)"
              :dense="dense"
            />
            <CampoGasto
              label="Cargue propietario"
              @update:valor="(v) => (formularioPropietario.cargue_propietario = v)"
              @update:tipoFactura="
                (v) => (formularioPropietario.tipo_factura_cargue_propietario = v)
              "
              @update:archivo="(v) => (formularioPropietario.cargue_propietario_archivos = v)"
              :dense="dense"
            />
            <CampoGasto
              label="Descargue propietario"
              @update:valor="(v) => (formularioPropietario.descargue_propietario = v)"
              @update:tipoFactura="
                (v) => (formularioPropietario.tipo_factura_descargue_propietario = v)
              "
              @update:archivo="(v) => (formularioPropietario.descargue_propietario_archivos = v)"
              :dense="dense"
            />
            <CampoGasto
              label="Comisión propietario"
              @update:valor="(v) => (formularioPropietario.comision_propietario = v)"
              @update:tipoFactura="
                (v) => (formularioPropietario.tipo_factura_comision_propietario = v)
              "
              @update:archivo="(v) => (formularioPropietario.comision_propietario_archivos = v)"
              :dense="dense"
            />
            <CampoGasto
              label="Otro"
              @update:valor="(v) => (formularioPropietario.otro_propietario = v)"
              @update:tipoFactura="(v) => (formularioPropietario.tipo_factura_otro_propietario = v)"
              @update:archivo="(v) => (formularioPropietario.otro_propietario_archivos = v)"
              :dense="dense"
            />
          </div>
        </div>
        <q-card-actions align="right">
          <q-btn
            color="blue"
            label="Aprobar"
            @click="guardarAprobarPropietario"
            :loading="cargando"
          />
          <q-btn flat label="Cancelar" @click="dialogAprobarPropietario = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog visor de archivos -->
    <q-dialog v-model="dialogVisor" persistent>
      <q-card style="width: 95vw; max-width: 600px; max-height: 90vh">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-subtitle1">{{ visorTitulo }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section style="overflow-y: auto; max-height: 75vh">
          <!-- Cargando -->
          <div v-if="cargandoVisor" class="text-center q-pa-lg">
            <q-spinner color="primary" size="3em" />
            <div class="text-grey-6 q-mt-sm">Cargando archivos...</div>
          </div>

          <!-- Archivos -->
          <div v-else class="q-gutter-md">
            <div v-for="archivo in archivosVisor" :key="archivo.id">
              <div class="text-caption text-grey-7 q-mb-xs">
                {{ archivo.name }}
              </div>

              <!-- Imagen -->
              <q-img
                v-if="archivo.mimeType?.startsWith('image/')"
                :src="`http://localhost:4000/api/viajes/drive-archivo/${archivo.id}`"
                spinner-color="primary"
                fit="contain"
                style="width: 100%; max-height: 500px"
              />

              <!-- PDF -->
              <iframe
                v-else-if="archivo.mimeType === 'application/pdf'"
                :src="`http://localhost:4000/api/viajes/drive-archivo/${archivo.id}`"
                style="width: 100%; height: 500px; border: none"
              />

              <!-- Otros -->
              <div v-else class="text-grey-6 q-pa-sm bg-grey-2 rounded-borders">
                {{ archivo.name }} (no previsualizable)
              </div>

              <q-separator class="q-my-md" />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

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

    <!-- ───────────── FACTURAR ───────────── -->
    <q-dialog v-model="dialogFacturar" persistent>
      <q-card style="width: 500px">
        <q-card-section style="background-color: #f5f5f5">
          <div class="text-h6">Facturar viaje</div>
        </q-card-section>

        <div class="q-pa-md">
          <div class="q-gutter-md">
            <q-input
              outlined
              rounded
              v-model="valorviajerealFormatted"
              label="Valor viaje real"
              :dense="dense"
              @update:model-value="formatearValorViajeReal"
            />
            <q-input
              outlined
              rounded
              v-model.trim="formularioFacturar.notas_facturacion"
              label="Notas facturación"
              type="textarea"
              :dense="dense"
            />
            <q-input
              outlined
              rounded
              v-model.trim="formularioFacturar.num_factura_cliente"
              label="Número factura cliente"
              :dense="dense"
            />
          </div>
        </div>

        <q-card-actions align="right">
          <q-btn color="purple" label="Facturar" @click="guardarFacturar" :loading="cargando" />
          <q-btn flat label="Cancelar" @click="dialogFacturar = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <div class="text-center q-mt-md" v-if="hayMas">
      <q-btn flat color="primary" label="Cargar más" :loading="cargando" @click="cargarMas" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useStoreViajes } from '../stores/viajes'
import { useStoreUsuarios } from '../stores/usuarios'
import { useQuasar } from 'quasar'
import { useStoreClientes } from '../stores/clientes'
import { useStoreVehiculos } from '../stores/vehiculos'
import CampoGasto from 'components/CampoGasto.vue'
import { TIPOS_FILTRO, CONFIG_FILTROS } from '../composables/filtrosviajes'
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

const useViaje = useStoreViajes()
const useUsuario = useStoreUsuarios()
const $q = useQuasar()

const paginaActual = ref(1)
const hayMas = ref(false)

const dense = ref(false)
const cargando = ref(false)
const viajes = ref([])
const todosLosViajes = ref([])
const useCliente = useStoreClientes()
const clientesOptions = ref([])

const useVehiculo = useStoreVehiculos()
const placasOptions = ref([])

const anticipoFormatted = ref('')
const toneladaFormatted = ref('')
const toneladaFinalFormatted = ref('')
const anticipoclienteFormatted = ref('')
const valorviajerealFormatted = ref('')

const mostrarDetalles = ref(false)
const detalleViaje = ref(null)

const dialogCrear = ref(false)
const dialogCerrarConductor = ref(false)
const dialogAprobarPropietario = ref(false)
const dialogFacturar = ref(false)

const perfilUsuario = computed(() => useUsuario.perfile)

async function cargarMas() {
  paginaActual.value++
  await cargarViajes()
}

const tipoLista = ref(TIPOS_FILTRO.TODOS)
const ordenActual = ref('desc')
const valorFiltroTexto = ref(null)

const filtrosConfig = computed(() => CONFIG_FILTROS)
const filtroActual = computed(() => CONFIG_FILTROS[tipoLista.value])

const formularioCrear = ref({
  placa: '',
  cliente: '',
  destino: '',
  fecha_inicio: '',
  valor_anticipo_conductor: '',
  valor_tonelada_inicial: '',
})

const formularioConductor = ref({
  fecha_fin_viaje: '',
  toneladas_inicio: '',
  toneladas_descargue: '',
  valor_tonelada_final: '',
  peajes_conductor: 0,
  tipo_factura_peajes_conductor: '',
  peajes_conductor_archivos: null,
  lavadas_conductor: 0,
  tipo_factura_lavadas_conductor: '',
  lavadas_conductor_archivos: null,
  parqueadero_conductor: 0,
  tipo_factura_parqueadero_conductor: '',
  parqueadero_conductor_archivos: null,
  engrase_conductor: 0,
  tipo_factura_engrase_conductor: '',
  engrase_conductor_archivos: null,
  fumigacion_conductor: 0,
  tipo_factura_fumigacion_conductor: '',
  fumigacion_conductor_archivos: null,
  cargue_conductor: 0,
  tipo_factura_cargue_conductor: '',
  cargue_conductor_archivos: null,
  descargue_conductor: 0,
  tipo_factura_descargue_conductor: '',
  descargue_conductor_archivos: null,
  comision_conductor: 0,
  tipo_factura_comision_conductor: '',
  comision_conductor_archivos: null,
  otro_conductor: 0,
  tipo_factura_otro_conductor: '',
  otro_conductor_archivos: null,
  manifiesto: null,
})
const formularioPropietario = ref({
  valor_anticipo_cliente: '',
  peajes_propietario: '',
  peajes_propietario_archivos: null,
})

const formularioFacturar = ref({
  valor_viaje_real: '',
  notas_facturacion: '',
  num_factura_cliente: '',
})

// ── Helpers UI ──
function colorEstado(estado) {
  const mapa = {
    solicitado: 'green',
    completado: 'orange',
    aprobado: 'blue',
    facturado: 'purple',
  }
  return mapa[estado] || 'grey'
}

function mostrarMensajeError(mensaje) {
  $q.notify({
    type: 'negative',
    message: mensaje,
    position: 'bottom-right',
  })
}

const opcionesOrdenamiento = computed(() => {
  if (tipoLista.value === 'todos') return []
  return [
    { label: filtroActual.value.etiquetaDesc, value: 'desc' },
    { label: filtroActual.value.etiquetaAsc, value: 'asc' },
  ]
})

const opcionesFiltroTexto = computed(() => {
  return filtroActual.value?.esFiltroTexto ? filtroActual.value.opcionesFiltro || [] : []
})

function obtenerEtiquetaFiltroTexto(valor) {
  if (filtroActual.value?.esFiltroTexto && filtroActual.value.opcionesFiltro) {
    const opcion = filtroActual.value.opcionesFiltro.find((o) => o.valor === valor)
    return opcion ? opcion.etiqueta : valor
  }
  return valor
}

function actualizarValorFiltro(nuevoValor) {
  valorFiltroTexto.value = nuevoValor
  cargarViajes()
}

function cargarListaPor(tipo) {
  tipoLista.value = tipo
  ordenActual.value = 'desc'
  const filtro = CONFIG_FILTROS[tipo]
  valorFiltroTexto.value = filtro.esFiltroTexto ? filtro.opcionesFiltro[0].valor : null
  cargarViajes()
}

const conteoEstados = computed(() => {
  const conteo = { solicitado: 0, completado: 0, aprobado: 0, facturado: 0 }
  todosLosViajes.value.forEach((v) => {
    if (conteo[v.estado_viaje] !== undefined) conteo[v.estado_viaje]++
  })
  return conteo
})

async function cargarViajes() {
  try {
    let response = []
    let hayMasData = false

    if (perfilUsuario.value === 'administrador') {
      if (tipoLista.value === TIPOS_FILTRO.TODOS) {
        const res = await useViaje.obtenerViajes(paginaActual.value)
        response = res.datos
        hayMasData = res.hayMas
      } else if (filtroActual.value.esFiltroTexto) {
        response = await useViaje.obtenerViajesFiltrados(
          filtroActual.value.campoDatos,
          valorFiltroTexto.value,
        )
      } else {
        response = await useViaje.obtenerViajesOrdenados(
          filtroActual.value.campoOrden,
          ordenActual.value,
        )
      }
    } else {
      const placasUsuario = useUsuario.user?.placa_asignada?.split(',').map((p) => p.trim()) || []
      let todosLosViajes = []
      for (const placa of placasUsuario) {
        const data = await useViaje.obtenerResumenPorPlaca(placa)
        const lista = data?.resumen?.total?.consecutivos || []
        todosLosViajes.push(...lista)
      }
      response = todosLosViajes
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
          cliente: item.cliente || '',
          destino: item.destino || '',
          fecha_inicio: item.fecha_inicio || '',
          estado_viaje: item.estado_viaje || '',
        }
        const campoDatos = filtroActual.value?.campoDatos
        if (campoDatos && item[campoDatos] !== undefined) {
          result.valorFiltro = item[campoDatos]
        }
        return result
      })

      if (paginaActual.value === 1) {
        viajes.value = nuevos
      } else {
        viajes.value = [...viajes.value, ...nuevos]
      }
    } else {
      viajes.value = []
    }
  } catch (error) {
    console.error(`Error al cargar viajes por ${tipoLista.value}:`, error)
    viajes.value = []
  }
}

watch([tipoLista, valorFiltroTexto], () => {
  paginaActual.value = 1
  cargarViajes() // o cargarCombustibles()
})

// ── Ver detalles ──
async function verDetalles(consecutivo) {
  try {
    const data = await useViaje.obtenerdatodeviaje(consecutivo)
    if (data) {
      detalleViaje.value = data
      mostrarDetalles.value = true
    }
  } catch (e) {
    console.error(e)
  }
}

// ── Crear ──
function abrirCrear() {
  formularioCrear.value = {
    placa: '',
    cliente: '',
    destino: '',
    fecha_inicio: '',
    valor_anticipo_conductor: '',
    valor_tonelada_inicial: '',
  }
  dialogCrear.value = true
}

async function guardarCrear() {
  const { cliente, destino, fecha_inicio, valor_anticipo_conductor, valor_tonelada_inicial } =
    formularioCrear.value
  if (
    !cliente ||
    !destino ||
    !fecha_inicio ||
    !valor_anticipo_conductor ||
    !valor_tonelada_inicial
  ) {
    mostrarMensajeError('Complete todos los campos')
    return
  }
  cargando.value = true
  try {
    const payload = { ...formularioCrear.value }
    if (perfilUsuario.value === 'conductor') delete payload.placa
    await useViaje.postViaje(payload)
    // mostrarMensajeExito('Viaje creado correctamente')
    dialogCrear.value = false
    await cargarViajes()
  } catch (e) {
    console.error('Error completo:', e)

    mostrarMensajeError(e.response?.data?.mensaje || e.message || 'Error al crear el viaje')
  } finally {
    cargando.value = false
  }
}

// ── Cerrar conductor ──
function abrirCerrarConductor() {
  mostrarDetalles.value = false
  formularioConductor.value = {
    fecha_fin_viaje: '',
    toneladas_inicio: '',
    toneladas_descargue: '',
    valor_tonelada_final: '',
    peajes_conductor: '',
    tipo_factura_peajes_conductor: '',
    peajes_conductor_archivos: null,
    lavadas_conductor: '',
    tipo_factura_lavadas_conductor: '',
    lavadas_conductor_archivos: null,
    comision_conductor: '',
    manifiesto: null,
  }
  dialogCerrarConductor.value = true
}

async function guardarCerrarConductor() {
  cargando.value = true
  try {
    const formData = new FormData()
    const f = formularioConductor.value

    Object.entries(f).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') return
      if (value instanceof File) {
        formData.append(key, value)
      } else {
        formData.append(key, value)
      }
    })

    await useViaje.putCerrarViajeConductor(detalleViaje.value.consecutivo, formData)
    // mostrarMensajeExito('Viaje cerrado correctamente')
    dialogCerrarConductor.value = false
    await cargarViajes()
  } catch (e) {
    console.error('Error completo:', e)

    mostrarMensajeError(e.response?.data?.mensaje || e.message || 'Error al cerrar el viaje')
  } finally {
    cargando.value = false
  }
}

// ── Aprobar propietario ──
async function abrirAprobarPropietario() {
  mostrarDetalles.value = false
  dialogAprobarPropietario.value = true // ← abrir primero para que monte los componentes

  const gastos = await useViaje.obtenerGastos(detalleViaje.value.consecutivo)

  const getGasto = (tipo, quien) => {
    const g = gastos.find((g) => g.tipo_gasto === tipo && g.quien === quien)
    return g ? Number(g.valor) || 0 : 0
  }
  const getTipoFactura = (tipo, quien) => {
    const g = gastos.find((g) => g.tipo_gasto === tipo && g.quien === quien)
    return g ? g.tipo_factura || '' : ''
  }

  // Esperar a que Vue monte los componentes del dialog
  await nextTick()

  formularioPropietario.value = {
    toneladas_inicio: detalleViaje.value.toneladas_inicio || '',
    toneladas_descargue: detalleViaje.value.toneladas_descargue || '',
    valor_tonelada_final: detalleViaje.value.valor_tonelada_final || '',
    // Gastos conductor desde hoja separada
    peajes_conductor: getGasto('peajes', 'conductor'),
    tipo_factura_peajes_conductor: getTipoFactura('peajes', 'conductor'),
    lavadas_conductor: getGasto('lavadas', 'conductor'),
    tipo_factura_lavadas_conductor: getTipoFactura('lavadas', 'conductor'),
    parqueadero_conductor: getGasto('parqueadero', 'conductor'),
    tipo_factura_parqueadero_conductor: getTipoFactura('parqueadero', 'conductor'),
    engrase_conductor: getGasto('engrase', 'conductor'),
    tipo_factura_engrase_conductor: getTipoFactura('engrase', 'conductor'),
    fumigacion_conductor: getGasto('fumigacion', 'conductor'),
    tipo_factura_fumigacion_conductor: getTipoFactura('fumigacion', 'conductor'),
    cargue_conductor: getGasto('cargue', 'conductor'),
    descargue_conductor: getGasto('descargue', 'conductor'),
    tipo_factura_descargue_conductor: getTipoFactura('descargue', 'conductor'),
    comision_conductor: getGasto('comision', 'conductor'),
    tipo_factura_comision_conductor: getTipoFactura('comision', 'conductor'),
    tipo_factura_cargue_conductor: getTipoFactura('cargue', 'conductor'),
    otro_conductor: getGasto('otro', 'conductor'),
    tipo_factura_otro_conductor: getTipoFactura('otro', 'conductor'),
    // Datos propietario vacíos
    valor_anticipo_cliente: '',
    peajes_propietario: 0,
    peajes_propietario_archivos: null,
    lavadas_propietario: 0,
    parqueadero_propietario: 0,
    engrase_propietario: 0,
    fumigacion_propietario: 0,
    cargue_propietario: 0,
    descargue_propietario: 0,
    comision_propietario: 0,
  }

  dialogAprobarPropietario.value = true
}

async function guardarAprobarPropietario() {
  cargando.value = true
  try {
    const formData = new FormData()
    const f = formularioPropietario.value

    Object.entries(f).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') return
      formData.append(key, value)
    })

    await useViaje.putAprobarPropietario(detalleViaje.value.consecutivo, formData)
    dialogAprobarPropietario.value = false
    await cargarViajes()
  } catch (e) {
    console.error('Error completo:', e)

    mostrarMensajeError(e.response?.data?.mensaje || e.message || 'Error al aprobar el viaje')
  } finally {
    cargando.value = false
  }
}

// ── Facturar ──
function abrirFacturar() {
  mostrarDetalles.value = false
  formularioFacturar.value = {
    valor_viaje_real: '',
    notas_facturacion: '',
    num_factura_cliente: '',
  }
  dialogFacturar.value = true
}

async function guardarFacturar() {
  if (!formularioFacturar.value.valor_viaje_real) {
    mostrarMensajeError('Ingrese el valor real del viaje')
    return
  }
  cargando.value = true
  try {
    await useViaje.putFacturarViaje(detalleViaje.value.consecutivo, formularioFacturar.value)
    dialogFacturar.value = false
    await cargarViajes()
  } catch (e) {
    console.error('Error completo:', e)

    mostrarMensajeError(e.response?.data?.mensaje || e.message || 'Error al facturar el viaje')
  } finally {
    cargando.value = false
  }
}

// ── Completar saldo ──
async function completarSaldo() {
  cargando.value = true
  try {
    await useViaje.putCompletarSaldo(detalleViaje.value.consecutivo)
    mostrarDetalles.value = false
    await cargarViajes()
  } catch (e) {
    console.error('Error completo:', e)

    mostrarMensajeError(e.response?.data?.mensaje || e.message || 'Error al completar saldo')
  } finally {
    cargando.value = false
  }
}

async function cargarClientes() {
  try {
    const response = await useCliente.obtenerClientes()
    if (Array.isArray(response)) {
      clientesOptions.value = response.map((c) => ({
        label: c.empresa,
        value: c.codigo,
      }))
    }
  } catch (e) {
    console.error(e)
  }
}

async function cargarPlacas() {
  try {
    // Conductor no necesita cargar placas, ya tiene la suya
    if (perfilUsuario.value === 'conductor') {
      formularioCrear.value.placa = useUsuario.user?.placa_asignada || ''
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
  await cargarViajes()
  await cargarClientes()
  await cargarPlacas()
})

function formatearNumero(valor) {
  if (!valor) return ''
  const limpio = valor.toString().replace(/\D/g, '')
  return new Intl.NumberFormat('es-CO').format(limpio)
}

function formatearAnticipo(val) {
  anticipoFormatted.value = formatearNumero(val)

  formularioCrear.value.valor_anticipo_conductor = Number(
    anticipoFormatted.value.replace(/\./g, ''),
  )
}

function formatearValorViajeReal(val) {
  valorviajerealFormatted.value = formatearNumero(val)

  formularioFacturar.value.valor_viaje_real = Number(
    valorviajerealFormatted.value.replace(/\./g, ''),
  )
}

function formatearTonelada(val) {
  toneladaFormatted.value = formatearNumero(val)
  formularioCrear.value.valor_tonelada_inicial = Number(toneladaFormatted.value.replace(/\./g, ''))
}

function formatearToneladaFinal(val) {
  toneladaFinalFormatted.value = formatearNumero(val)

  formularioConductor.value.valor_tonelada_final = Number(
    toneladaFinalFormatted.value.replace(/\./g, ''),
  )
}

function formatearanticipocliente(val) {
  anticipoclienteFormatted.value = formatearNumero(val)

  formularioPropietario.value.valor_anticipo_cliente = Number(
    anticipoclienteFormatted.value.replace(/\./g, ''),
  )
}

function obtenerClaseValor(valor, key) {
  // Destacar ganancia real
  if (key === 'ganancia_viaje_real') {
    return 'text-h5 text-weight-bold text-positive'
  }

  const numero = Number(valor)

  if (!isNaN(numero)) {
    if (numero < 0) {
      return 'text-negative text-weight-bold'
    }

    if (numero > 0) {
      return 'text-positive'
    }
  }

  return ''
}

function formatearValor(valor, key) {
  if (valor === null || valor === undefined || valor === '') {
    return '—'
  }

  const camposMoneda = [
    'valor_anticipo_cliente',
    'saldo_pendiente_cliente_sin_descuento',
    'saldo_pendiente_cliente_real',
    'descuento_rete_fuente',
    'descuento_rete_ica',
    'total_descuentos_cliente',
    'valor_viaje_estimado',
    'valor_viaje_real',
    'diferencia_facturacion',
    'diez_pcto',
    'valor_anticipo_conductor',
    'saldo_anticipo_conductor',
    'total_gastos_conductor',
    'saldo_pendiente_conductor',
    'total_gastos_propietario',
    'ganancia_viaje_estimada',
    'ganancia_viaje_real',
  ]

  if (camposMoneda.includes(key)) {
    return Number(valor).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    })
  }

  return valor
}

function formatFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}


defineOptions({
  name: 'ViajesPage',
})
</script>

<style scoped>

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

.cliente-card {
  border-radius: 12px !important;
  transition: border-color 0.15s;
}
.cliente-card:active {
  opacity: 0.85;
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

.viaje-card {
  border: 1px solid #E5E7EB !important;
  border-radius: 12px !important;
  transition: border-color 0.15s;
}
.viaje-card:active {
  opacity: 0.85;
}

.seccion-titulo {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #9CA3AF;
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}

.ganancia-banner {
  border-radius: 10px;
  padding: 12px 16px;
}
.ganancia-positiva {
  background: #F0FDF4;
  color: #166534;
}
.ganancia-negativa {
  background: #FEF2F2;
  color: #991b1b;
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
</style>
