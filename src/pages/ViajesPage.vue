<template>
  <q-page class="q-pa-md">
    <q-card-section>
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

        <!-- Ordenamiento asc/desc para filtros numéricos/fecha -->
        <div class="col-12 col-md-auto" v-if="tipoLista !== 'todos' && !filtroActual.esFiltroTexto">
          <q-btn-toggle
            v-model="ordenActual"
            toggle-color="primary"
            :options="opcionesOrdenamiento"
            @update:model-value="cargarViajes"
          />
        </div>

        <!-- Select para filtros de texto -->
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

    <!-- Lista de viajes -->
    <div class="text-h6 q-mb-md">Viajes</div>
    <!-- Botones de estado con conteo -->
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

    <q-btn color="primary" label="Crear viaje" class="q-mt-md" @click="abrirCrear" />

    <!-- ───────────── DETALLE ───────────── -->
    <q-dialog v-model="mostrarDetalles" persistent>
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

              <div class="col-7" :class="obtenerClaseValor(detalleViaje[key], key)">
                <!-- LINKS DRIVE -->
                <template v-if="key.startsWith('link_')">
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

                <!-- CAMPOS NORMALES -->
                <template v-else>
                  {{ formatearValor(detalleViaje[key], key) }}
                </template>
              </div>
            </div>
          </div>

          <!-- Botón de acción según estado -->
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
              filled
              v-model="formularioCrear.placa"
              label="Tu placa"
              :dense="dense"
              disable
            />

            <!-- Propietario y Admin: select con opciones -->
            <q-select
              v-else
              filled
              v-model="formularioCrear.placa"
              label="Placa"
              :options="placasOptions"
              :dense="dense"
            />

            <q-select
              filled
              v-model="formularioCrear.cliente"
              label="Cliente"
              :options="clientesOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              :dense="dense"
            />
            <q-input filled v-model.trim="formularioCrear.destino" label="Destino" :dense="dense" />
            <q-input
              filled
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
              filled
              v-model="anticipoFormatted"
              label="Anticipo conductor"
              :dense="dense"
              @update:model-value="formatearAnticipo"
            />

            <q-input
              filled
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
              filled
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
              filled
              v-model.number="formularioConductor.toneladas_inicio"
              label="Toneladas inicio"
              type="number"
              :dense="dense"
            />
            <q-input
              filled
              v-model.number="formularioConductor.toneladas_descargue"
              label="Toneladas descargue"
              type="number"
              :dense="dense"
            />
            <q-input
              filled
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
                filled
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
              filled
              v-model.number="formularioPropietario.toneladas_inicio"
              label="Toneladas inicio"
              type="number"
              :dense="dense"
            />
            <q-input
              filled
              v-model.number="formularioPropietario.toneladas_descargue"
              label="Toneladas descargue"
              type="number"
              :dense="dense"
            />
            <q-input
              filled
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
              @update:tipoFactura="(v) => (formularioPropietario.tipo_factura_descargue_conductor = v)"
              @update:archivo="(v) => (formularioPropietario.descargue_conductor_archivos = v)"
              :dense="dense"
            />

            <CampoGasto
              label="Comisión conductor"
              :valorInicial="formularioPropietario.comision_conductor"
              :tipoFacturaInicial="formularioPropietario.tipo_factura_comision_conductor"
              @update:valor="(v) => (formularioPropietario.comision_conductor = v)"
              @update:tipoFactura="(v) => (formularioPropietario.tipo_factura_comision_conductor = v)"
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
              filled
              v-model.number="formularioFacturar.valor_viaje_real"
              label="Valor viaje real"
              type="number"
              :dense="dense"
            />
            <q-input
              filled
              v-model.trim="formularioFacturar.notas_facturacion"
              label="Notas facturación"
              type="textarea"
              :dense="dense"
            />
            <q-input
              filled
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

const camposDetalle = {
  consecutivo: {
    label: 'Consecutivo',
  },

  placa: {
    label: 'Placa',
  },

  cliente: {
    label: 'Cliente',
  },

  destino: {
    label: 'Destino',
  },

  fecha_inicio: {
    label: 'Fecha inicio',
  },

  estado_viaje: {
    label: 'Estado',
  },

  usuario: {
    label: 'Creado por',
  },

  fecha_creacion: {
    label: 'Fecha creación',
  },

  valor_anticipo_cliente: {
    label: 'Valor anticipo del cliente',
    tipo: 'moneda',
  },

  saldo_pendiente_cliente_sin_descuento: {
    label: 'Saldo pendiente cliente sin descuento',
    tipo: 'moneda',
  },

  saldo_pendiente_cliente_real: {
    label: 'Saldo pendiente cliente real',
    tipo: 'moneda',
  },

  descuento_rete_fuente: {
    label: 'Descuento rete fuente',
    tipo: 'moneda',
  },

  descuento_rete_ica: {
    label: 'Descuento rete ICA',
    tipo: 'moneda',
  },

  total_descuentos_cliente: {
    label: 'Total descuentos cliente',
    tipo: 'moneda',
  },

  estado_saldo_cliente: {
    label: 'Estado saldo cliente',
  },

  valor_viaje_estimado: {
    label: 'Valor viaje estimado',
    tipo: 'moneda',
  },

  valor_viaje_real: {
    label: 'Valor viaje real',
    tipo: 'moneda',
  },

  diferencia_facturacion: {
    label: 'Diferencia facturación',
    tipo: 'moneda',
  },

  notas_facturacion: {
    label: 'Notas facturación',
  },

  num_factura_cliente: {
    label: 'Factura cliente',
  },

  toneladas_inicio: {
    label: 'Toneladas inicio',
  },

  toneladas_descargue: {
    label: 'Toneladas descargue',
  },

  diferencia_kg: {
    label: 'Diferencia kg',
  },

  valor_tonelada_inicial: {
    label: 'Valor tonelada inicial',
    tipo: 'moneda',
  },

  valor_tonelada_final: {
    label: 'Valor tonelada final',
    tipo: 'moneda',
  },

  diez_pcto: {
    label: '10% viaje',
    tipo: 'moneda',
  },

  valor_anticipo_conductor: {
    label: 'Anticipo conductor',
    tipo: 'moneda',
  },

  saldo_anticipo_conductor: {
    label: 'Saldo anticipo conductor',
    tipo: 'moneda',
  },

  total_gastos_conductor: {
    label: 'Gastos conductor',
    tipo: 'moneda',
  },

  saldo_pendiente_conductor: {
    label: 'Saldo pendiente conductor',
    tipo: 'moneda',
  },

  fecha_fin_viaje: {
    label: 'Fecha fin viaje',
  },

  total_gastos_propietario: {
    label: 'Gastos propietario',
    tipo: 'moneda',
  },

  ganancia_viaje_estimada: {
    label: 'Ganancia estimada',
    tipo: 'moneda',
  },

  ganancia_viaje_real: {
    label: 'Ganancia real',
    tipo: 'moneda',
  },

  link_manifiesto: {
    label: 'Manifiesto',
    tipo: 'link',
  },

  link_gastos_conductor: {
    label: 'Gastos conductor',
    tipo: 'link',
  },

  link_gastos_propietario: {
    label: 'Gastos propietario',
    tipo: 'link',
  },

  liquidado: {
    label: '¿Viaje liquidado?',
    tipo: 'boolean',
  },
}

// ── Formularios ──
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
    // Datos del viaje editables
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
    // mostrarMensajeExito('Viaje aprobado correctamente')
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
    // mostrarMensajeExito('Viaje facturado correctamente')
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
    // mostrarMensajeExito('Saldo completado correctamente')
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

  // quitar todo lo que no sea número
  const limpio = valor.toString().replace(/\D/g, '')

  // formatear con puntos
  return new Intl.NumberFormat('es-CO').format(limpio)
}

function formatearAnticipo(val) {
  anticipoFormatted.value = formatearNumero(val)

  // guardar número real en tu formulario
  formularioCrear.value.valor_anticipo_conductor = Number(
    anticipoFormatted.value.replace(/\./g, ''),
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

// function extraerFileId(link) {
//   const match = link.match(/\/d\/([a-zA-Z0-9_-]+)/)
//   return match ? match[1] : null
// }

// function extraerFolderId(link) {
//   const match = link.match(/folders\/([a-zA-Z0-9_-]+)/)
//   return match ? match[1] : null
// }

// async function verArchivo(link, titulo) {
//   visorTitulo.value = titulo
//   archivosVisor.value = []
//   cargandoVisor.value = true
//   dialogVisor.value = true

//   try {
//     const fileId = extraerFileId(link)
//     if (!fileId) return

//     const response = await useViaje.obtenerArchivosCarpeta(null, fileId)

//     archivosVisor.value = response
//   } catch (e) {
//     console.error(e)
//   } finally {
//     cargandoVisor.value = false
//   }
// }

// async function verCarpeta(link) {
//   visorTitulo.value = 'Soportes gastos conductor'
//   archivosVisor.value = []
//   cargandoVisor.value = true
//   dialogVisor.value = true

//   try {
//     const folderId = extraerFolderId(link)
//     if (!folderId) return

//     const response = await useViaje.obtenerArchivosCarpeta(folderId)

//     archivosVisor.value = response
//   } catch (e) {
//     console.error(e)
//   } finally {
//     cargandoVisor.value = false
//   }
// }

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

defineOptions({
  name: 'ViajesPage',
})
</script>
