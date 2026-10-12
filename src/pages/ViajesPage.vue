<template>
  <q-page padding class="bg-grey-2">
    <!-- ───────────── FILTROS ───────────── -->
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
          <q-badge v-if="opcion.cantidad" rounded color="white" text-color="grey-9" class="q-ml-xs">
            {{ opcion.cantidad }}
          </q-badge>
        </q-chip>
      </div>

      <q-select
        v-if="placasFiltro.length > 1"
        v-model="filtroPlaca"
        :options="placasFiltro"
        label="Placa"
        dense
        outlined
        clearable
        emit-value
        map-options
        class="q-mt-sm"
        @update:model-value="recargar"
      />
    </div>

    <!-- ───────────── LISTA ───────────── -->
    <div v-if="!viajes.length && !cargandoLista" class="text-center text-grey-6 q-py-xl">
      <q-icon name="local_shipping" size="48px" />
      <div class="q-mt-sm">No hay viajes {{ filtroEstado ? 'en este estado' : '' }}</div>
    </div>

    <q-card
      v-for="viaje in viajes"
      :key="viaje.consecutivo"
      flat
      class="viaje-card q-mb-sm cursor-pointer"
      @click="verDetalles(viaje.consecutivo)"
    >
      <q-card-section class="q-py-sm">
        <div class="row items-center no-wrap">
          <span class="placa-badge">{{ viaje.placa }}</span>
          <span class="text-weight-bold q-ml-sm">{{ viaje.consecutivo }}</span>
          <q-space />
          <q-badge :color="colorEstado(viaje.estado_viaje)" :label="nombreEstado(viaje.estado_viaje)" />
        </div>
        <div class="text-body2 q-mt-xs ellipsis">{{ viaje.cliente_nombre }} · {{ soloCiudad(viaje.destino) }}</div>
        <div class="row items-center text-caption text-grey-7">
          <span>{{ formatoFecha(viaje.fecha_inicio) }} · {{ viaje.usuario }}</span>
          <q-space />
          <span v-if="siguientePaso(viaje)" class="text-orange-9 text-weight-medium">{{ siguientePaso(viaje) }}</span>
        </div>
      </q-card-section>
    </q-card>

    <div v-if="hayMas" class="text-center q-my-md">
      <q-btn outline rounded color="primary" label="Cargar más" :loading="cargandoLista" @click="cargarMas" />
    </div>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" label="Anticipo" @click="abrirCrear" />
    </q-page-sticky>

    <!-- ───────────── DETALLE ───────────── -->
    <q-dialog v-model="mostrarDetalles" :maximized="$q.screen.lt.md">
      <q-card v-if="detalle" style="width: 640px; max-width: 100vw">
        <q-card-section class="row items-center q-pb-sm sticky-header">
          <span class="placa-badge-lg">{{ detalle.placa }}</span>
          <div class="q-ml-md">
            <div class="text-h6">{{ detalle.consecutivo }}</div>
            <q-badge :color="colorEstado(detalle.estado_viaje)" :label="nombreEstado(detalle.estado_viaje)" />
          </div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-sm">
          <!-- Paso pendiente -->
          <q-banner v-if="siguientePaso(detalle)" dense rounded class="bg-orange-1 text-orange-10 q-mb-md">
            <template #avatar><q-icon name="pending_actions" /></template>
            {{ siguientePaso(detalle) }}
          </q-banner>

          <!-- General -->
          <div class="seccion-titulo">Viaje</div>
          <Fila etiqueta="Cliente" :valor="detalle.cliente_nombre" />
          <Fila etiqueta="Destino" :valor="detalle.destino" />
          <Fila etiqueta="Conductor" :valor="detalle.usuario" />
          <Fila etiqueta="Fecha inicio" :valor="formatoFecha(detalle.fecha_inicio)" />
          <Fila v-if="detalle.fecha_fin_viaje" etiqueta="Fecha fin" :valor="formatoFecha(detalle.fecha_fin_viaje)" />

          <!-- Anticipo -->
          <div class="seccion-titulo q-mt-md">Anticipo del conductor</div>
          <Fila etiqueta="Solicitado" :valor="formatoPeso(detalle.valor_anticipo_conductor)" />
          <Fila
            etiqueta="Consignado"
            :valor="detalle.valor_anticipo_consignado ? formatoPeso(detalle.valor_anticipo_consignado) : 'Pendiente'"
            :clase="detalle.valor_anticipo_consignado ? '' : 'text-orange-9'"
          />
          <Fila v-if="detalle.fecha_consignacion" etiqueta="Fecha consignación" :valor="formatoFecha(detalle.fecha_consignacion)" />

          <!-- Preoperacional -->
          <div class="seccion-titulo q-mt-md">Preoperacional</div>
          <Fila
            etiqueta="Estado"
            :valor="detalle.estado_preoperacional === 'realizado' ? `Realizado (${detalle.consecutivo_preoperacional || ''})` : 'Pendiente'"
            :clase="detalle.estado_preoperacional === 'realizado' ? 'text-positive' : 'text-orange-9'"
          />
          <Fila v-if="detalle.odometro_preoperacional" etiqueta="Odómetro" :valor="`${formatoMiles(detalle.odometro_preoperacional)} km`" />

          <!-- Carga -->
          <template v-if="detalle.kilos_cargue">
            <div class="seccion-titulo q-mt-md">Carga</div>
            <Fila etiqueta="Kilos cargue" :valor="formatoKilos(detalle.kilos_cargue)" />
            <Fila etiqueta="Kilos descargue" :valor="formatoKilos(detalle.kilos_descargue)" />
            <Fila etiqueta="Diferencia" :valor="formatoKilos(detalle.diferencia_kg)" />
            <Fila etiqueta="Valor tonelada inicial" :valor="formatoPeso(detalle.valor_tonelada_inicial)" />
            <Fila etiqueta="Valor tonelada final" :valor="formatoPeso(detalle.valor_tonelada_final)" />
            <Fila etiqueta="Valor estimado del viaje" :valor="formatoPeso(detalle.valor_viaje_estimado)" />
          </template>
          <Fila v-else etiqueta="Valor tonelada inicial" :valor="formatoPeso(detalle.valor_tonelada_inicial)" />

          <!-- Conductor -->
          <template v-if="detalle.diez_pcto !== '' && detalle.diez_pcto !== undefined">
            <div class="seccion-titulo q-mt-md">Cuentas con el conductor</div>
            <Fila etiqueta="10 % del conductor" :valor="formatoPeso(detalle.diez_pcto)" />
            <div class="detalle-fila cursor-pointer" @click="verGastos = verGastos === 'conductor' ? '' : 'conductor'">
              <span class="detalle-label">Gastos del conductor <q-icon :name="verGastos === 'conductor' ? 'expand_less' : 'expand_more'" /></span>
              <span class="detalle-valor text-primary">{{ formatoPeso(detalle.total_gastos_conductor) }}</span>
            </div>
            <ListaGastos v-if="verGastos === 'conductor'" :gastos="gastosDe('conductor')" :puede-legalizar="esGestion" @ver="abrirVisor" @legalizar="abrirLegalizar" />
            <Fila etiqueta="Saldo del anticipo" :valor="formatoPeso(detalle.saldo_anticipo_conductor)" />
            <div class="ganancia-banner q-mt-sm" :class="Number(detalle.saldo_pendiente_conductor) >= 0 ? 'ganancia-positiva' : 'ganancia-negativa'">
              <div class="text-caption">
                {{ Number(detalle.saldo_pendiente_conductor) >= 0 ? 'Saldo a favor del conductor' : 'El conductor queda debiendo' }}
              </div>
              <div class="text-h6">{{ formatoPeso(Math.abs(Number(detalle.saldo_pendiente_conductor) || 0)) }}</div>
              <div class="text-caption">Se cruza en la nómina{{ detalle.liquidado === 'si' ? ' (ya liquidado)' : '' }}</div>
            </div>
          </template>

          <!-- Propietario y cliente (no los ve el conductor) -->
          <template v-if="esGestion && ['aprobado', 'facturado', 'pagado'].includes(detalle.estado_viaje)">
            <div class="seccion-titulo q-mt-md">Propietario</div>
            <div class="detalle-fila cursor-pointer" @click="verGastos = verGastos === 'propietario' ? '' : 'propietario'">
              <span class="detalle-label">Gastos del propietario <q-icon :name="verGastos === 'propietario' ? 'expand_less' : 'expand_more'" /></span>
              <span class="detalle-valor text-primary">{{ formatoPeso(detalle.total_gastos_propietario) }}</span>
            </div>
            <ListaGastos v-if="verGastos === 'propietario'" :gastos="gastosDe('propietario')" puede-legalizar @ver="abrirVisor" @legalizar="abrirLegalizar" />
            <Fila etiqueta="Ganancia estimada" :valor="formatoPeso(detalle.ganancia_viaje_estimada)" />
            <Fila v-if="detalle.ganancia_viaje_real !== ''" etiqueta="Ganancia real" :valor="formatoPeso(detalle.ganancia_viaje_real)" clase="text-positive text-weight-bold" />

            <div class="seccion-titulo q-mt-md">Cliente</div>
            <Fila etiqueta="Anticipo del cliente" :valor="formatoPeso(detalle.valor_anticipo_cliente)" />
            <Fila etiqueta="Rete fuente" :valor="formatoPeso(detalle.descuento_rete_fuente)" />
            <Fila etiqueta="Rete ICA" :valor="formatoPeso(detalle.descuento_rete_ica)" />
            <Fila etiqueta="Saldo por cobrar" :valor="formatoPeso(detalle.saldo_pendiente_cliente_real)" clase="text-weight-bold" />
            <Fila etiqueta="Estado del pago" :valor="detalle.estado_saldo_cliente === 'pagado' ? `Pagado ${formatoFecha(detalle.fecha_pago_cliente)}` : 'Pendiente'" />

            <template v-if="detalle.valor_viaje_real">
              <div class="seccion-titulo q-mt-md">Facturación</div>
              <Fila etiqueta="Factura" :valor="detalle.num_factura_cliente" />
              <Fila etiqueta="Valor facturado" :valor="formatoPeso(detalle.valor_viaje_real)" />
              <Fila v-if="detalle.notas_facturacion" etiqueta="Notas" :valor="detalle.notas_facturacion" />
              <Fila v-if="Number(detalle.ajuste_diez_pcto_pendiente)" etiqueta="Ajuste 10 % para nómina" :valor="formatoPeso(detalle.ajuste_diez_pcto_pendiente)" clase="text-orange-9" />
            </template>

            <div class="seccion-titulo q-mt-md">Comparado con lo prometido</div>
            <Fila etiqueta="Por precio de la tonelada" :valor="formatoPeso(detalle.diferencia_precio)" :clase="claseSigno(detalle.diferencia_precio)" />
            <Fila etiqueta="Por merma (kilos perdidos)" :valor="formatoPeso(-Number(detalle.valor_merma || 0))" :clase="claseSigno(-Number(detalle.valor_merma || 0))" />
            <Fila v-if="detalle.diferencia_facturacion !== ''" etiqueta="Facturado vs. estimado" :valor="formatoPeso(detalle.diferencia_facturacion)" :clase="claseSigno(detalle.diferencia_facturacion)" />
          </template>

          <!-- Documentos -->
          <div class="seccion-titulo q-mt-md">Documentos</div>
          <div class="row q-gutter-sm">
            <q-btn v-if="detalle.link_consignacion" outline size="sm" icon="receipt" label="Consignación" @click="abrirVisor(detalle.link_consignacion, 'Consignación')" />
            <q-btn v-if="detalle.link_manifiesto" outline size="sm" icon="description" label="Manifiesto" @click="abrirVisor(detalle.link_manifiesto, 'Manifiesto')" />
            <q-btn v-if="detalle.link_gastos_conductor" outline size="sm" icon="folder" label="Gastos conductor" @click="abrirVisor(detalle.link_gastos_conductor, 'Gastos conductor')" />
            <q-btn v-if="esGestion && detalle.link_gastos_propietario" outline size="sm" icon="folder" label="Gastos propietario" @click="abrirVisor(detalle.link_gastos_propietario, 'Gastos propietario')" />
            <span v-if="!detalle.link_consignacion && !detalle.link_manifiesto && !detalle.link_gastos_conductor" class="text-caption text-grey-6">Sin documentos</span>
          </div>
        </q-card-section>

        <!-- Acciones según estado y perfil -->
        <q-card-actions align="right" class="q-pa-md bg-grey-1 sticky-footer">
          <q-btn v-if="esAdmin && puedeEditar" flat color="grey-8" icon="edit" label="Editar" @click="abrirEditar" />
          <q-space />
          <q-btn v-if="detalle.estado_viaje === 'solicitado' && esGestion" unelevated color="green" icon="payments" label="Consignar anticipo" @click="abrirConsignar" />
          <q-btn
            v-if="['solicitado', 'anticipo_consignado'].includes(detalle.estado_viaje) && detalle.estado_preoperacional !== 'realizado'"
            unelevated
            color="teal"
            icon="fact_check"
            label="Hacer preoperacional"
            :to="{ name: 'PreoperacionalesPage', query: { viaje: detalle.consecutivo } }"
          />
          <q-btn v-if="puedeCerrar" unelevated color="orange" icon="flag" label="Cerrar viaje" @click="abrirCerrar" />
          <q-btn v-if="detalle.estado_viaje === 'completado' && esGestion" unelevated color="blue" icon="task_alt" label="Aprobar" @click="abrirAprobar" />
          <q-btn v-if="detalle.estado_viaje === 'aprobado' && esGestion" unelevated color="purple" icon="receipt_long" label="Facturar" @click="abrirFacturar" />
          <q-btn v-if="detalle.estado_viaje === 'facturado' && esGestion" unelevated color="positive" icon="price_check" label="Cliente pagó" @click="abrirPago" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ───────────── 1. SOLICITAR ANTICIPO ───────────── -->
    <q-dialog v-model="dialogCrear" persistent :maximized="$q.screen.lt.md">
      <q-card style="width: 560px; max-width: 100vw">
        <q-card-section class="bg-grey-1"><div class="text-h6">Solicitar anticipo</div></q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-if="esConductor && misPlacas.length === 1" :model-value="misPlacas[0]" label="Placa" outlined dense readonly />
          <q-select v-else v-model="formCrear.placa" :options="placasCrear" label="Placa" outlined dense emit-value map-options @update:model-value="cargarConductores" />
          <q-select
            v-if="!esConductor"
            v-model="formCrear.correo_conductor"
            :options="conductoresOpciones"
            label="Conductor"
            outlined
            dense
            emit-value
            map-options
            :disable="!formCrear.placa"
            :hint="formCrear.placa && !conductoresOpciones.length ? 'Esta placa no tiene conductor activo' : ''"
          />
          <q-select v-model="formCrear.cliente" :options="clientesOpciones" label="Cliente" outlined dense emit-value map-options use-input input-debounce="0" @filter="filtrarClientes" />
          <CampoDestino v-model="formCrear.destino" />
          <q-input v-model="formCrear.fecha_inicio" type="date" label="Fecha de inicio" outlined dense stack-label />
          <CampoNumero v-model="formCrear.valor_anticipo_conductor" label="Anticipo que necesita" moneda />
          <CampoNumero v-model="formCrear.valor_tonelada_inicial" label="Valor de la tonelada (lo que dijo el cliente)" moneda :minimo-sugerido="1000" hint="Valor completo, ej. 154.000" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn unelevated color="primary" label="Solicitar" :loading="guardando" @click="guardarCrear" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ───────────── 2. CONSIGNAR ANTICIPO ───────────── -->
    <q-dialog v-model="dialogConsignar" persistent>
      <q-card style="width: 480px; max-width: 95vw">
        <q-card-section class="bg-grey-1">
          <div class="text-h6">Consignar anticipo</div>
          <div class="text-caption">{{ detalle?.consecutivo }} · pidió {{ formatoPeso(detalle?.valor_anticipo_conductor) }}</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <CampoNumero v-model="formConsignar.valor" label="Valor consignado" moneda hint="Puede ser menor a lo que pidió" />
          <q-input v-model="formConsignar.fecha" type="date" label="Fecha de la consignación" outlined dense stack-label />
          <CampoArchivos v-model="formConsignar.comprobante" label="Comprobante de la consignación (obligatorio)" multiple accept="image/*, application/pdf" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn unelevated color="green" label="Registrar consignación" :loading="guardando" @click="guardarConsignar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ───────────── 4. CERRAR VIAJE ───────────── -->
    <q-dialog v-model="dialogCerrar" persistent :maximized="$q.screen.lt.md">
      <q-card style="width: 640px; max-width: 100vw">
        <q-card-section class="bg-grey-1 row items-center">
          <div>
            <div class="text-h6">Cerrar viaje {{ detalle?.consecutivo }}</div>
            <div class="text-caption">Anticipo consignado: {{ formatoPeso(detalle?.valor_anticipo_consignado) }}</div>
          </div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="formCarga.fecha_fin_viaje" type="date" label="Fecha de fin del viaje" outlined dense stack-label />
          <CampoNumero v-model="formCarga.kilos_cargue" label="Kilos de cargue" sufijo="kg" hint="Como aparece en el tiquete de báscula, ej. 34.310" />
          <CampoNumero v-model="formCarga.kilos_descargue" label="Kilos de descargue" sufijo="kg" hint="Tiquete de báscula del descargue" />
          <CampoNumero v-model="formCarga.valor_tonelada_final" label="Valor de la tonelada final" moneda :minimo-sugerido="1000" hint="Valor completo, ej. 154.000" />
          <div v-if="valorEstimadoCierre" class="text-body2 text-grey-8">
            Valor estimado del viaje: <b>{{ formatoPeso(valorEstimadoCierre) }}</b> · Su 10 %: <b>{{ formatoPeso(valorEstimadoCierre * 0.1) }}</b>
          </div>

          <q-separator />
          <GastosViaje ref="refGastosCierre" v-model="gastosConductor" quien="conductor" titulo="Mis gastos del viaje" :existentes="existentesConductor" />

          <q-separator />
          <CampoArchivos v-model="formCarga.manifiesto" label="Manifiesto (puede subir varias fotos)" multiple accept="image/*, application/pdf" :link-actual="detalle?.link_manifiesto || ''" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn unelevated color="orange" label="Cerrar viaje" :loading="guardando" @click="guardarCerrar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ───────────── 5. APROBAR ───────────── -->
    <q-dialog v-model="dialogAprobar" persistent :maximized="$q.screen.lt.md">
      <q-card style="width: 680px; max-width: 100vw">
        <q-card-section class="bg-grey-1 row items-center">
          <div class="text-h6">Aprobar viaje {{ detalle?.consecutivo }}</div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <div class="text-subtitle2 text-grey-8">Revise y corrija lo del conductor si hace falta</div>
          <q-input v-model="formCarga.fecha_fin_viaje" type="date" label="Fecha de fin" outlined dense stack-label />
          <CampoNumero v-model="formCarga.kilos_cargue" label="Kilos de cargue" sufijo="kg" />
          <CampoNumero v-model="formCarga.kilos_descargue" label="Kilos de descargue" sufijo="kg" />
          <CampoNumero v-model="formCarga.valor_tonelada_final" label="Valor de la tonelada final" moneda :minimo-sugerido="1000" />
          <GastosViaje v-model="gastosConductor" quien="conductor" titulo="Gastos del conductor" :existentes="existentesConductor" :exigir-soporte="false" />

          <q-separator spaced />
          <div class="text-subtitle2 text-grey-8">Lo del propietario</div>
          <CampoNumero v-model="formAprobar.valor_anticipo_cliente" label="Anticipo que pagó el cliente" moneda hint="0 si el cliente no dio anticipo" />
          <GastosViaje ref="refGastosPropietario" v-model="gastosPropietario" quien="propietario" titulo="Gastos del propietario" :existentes="existentesPropietario" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn unelevated color="blue" label="Aprobar" :loading="guardando" @click="guardarAprobar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ───────────── 6. FACTURAR ───────────── -->
    <q-dialog v-model="dialogFacturar" persistent>
      <q-card style="width: 480px; max-width: 95vw">
        <q-card-section class="bg-grey-1">
          <div class="text-h6">Facturar {{ detalle?.consecutivo }}</div>
          <div class="text-caption">Valor estimado: {{ formatoPeso(detalle?.valor_viaje_estimado) }}</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <CampoNumero v-model="formFacturar.valor_viaje_real" label="Valor facturado al cliente" moneda hint="El 10 % del conductor y las retenciones se recalculan con este valor" />
          <q-input v-model.trim="formFacturar.num_factura_cliente" label="Número de factura" outlined dense />
          <q-input v-model.trim="formFacturar.notas_facturacion" label="Notas (opcional)" type="textarea" autogrow outlined dense />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn unelevated color="purple" label="Facturar" :loading="guardando" @click="guardarFacturar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ───────────── 7. PAGO DEL CLIENTE ───────────── -->
    <q-dialog v-model="dialogPago" persistent>
      <q-card style="width: 420px; max-width: 95vw">
        <q-card-section class="bg-grey-1">
          <div class="text-h6">Pago del cliente</div>
          <div class="text-caption">{{ detalle?.cliente_nombre }} · saldo {{ formatoPeso(detalle?.saldo_pendiente_cliente_real) }}</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="formPago.fecha" type="date" label="Fecha del pago" outlined dense stack-label />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn unelevated color="positive" label="Registrar pago" :loading="guardando" @click="guardarPago" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ───────────── EDITAR (admin) ───────────── -->
    <q-dialog v-model="dialogEditar" persistent :maximized="$q.screen.lt.md">
      <q-card style="width: 680px; max-width: 100vw">
        <q-card-section class="bg-grey-1 row items-center">
          <div>
            <div class="text-h6">Editar {{ detalle?.consecutivo }}</div>
            <div class="text-caption">Se recalcula todo al guardar</div>
          </div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-select v-model="formEditar.cliente" :options="clientesOpciones" label="Cliente" outlined dense emit-value map-options use-input input-debounce="0" @filter="filtrarClientes" />
          <CampoDestino v-model="formEditar.destino" />
          <q-input v-model="formEditar.fecha_inicio" type="date" label="Fecha de inicio" outlined dense stack-label />
          <CampoNumero v-model="formEditar.valor_anticipo_conductor" label="Anticipo solicitado" moneda />
          <CampoNumero v-model="formEditar.valor_tonelada_inicial" label="Valor tonelada inicial" moneda :minimo-sugerido="1000" />
          <CampoNumero v-if="detalle?.estado_viaje !== 'solicitado'" v-model="formEditar.valor_anticipo_consignado" label="Anticipo consignado" moneda />

          <template v-if="['completado', 'aprobado'].includes(detalle?.estado_viaje)">
            <q-separator spaced />
            <q-input v-model="formCarga.fecha_fin_viaje" type="date" label="Fecha de fin" outlined dense stack-label />
            <CampoNumero v-model="formCarga.kilos_cargue" label="Kilos de cargue" sufijo="kg" />
            <CampoNumero v-model="formCarga.kilos_descargue" label="Kilos de descargue" sufijo="kg" />
            <CampoNumero v-model="formCarga.valor_tonelada_final" label="Valor tonelada final" moneda :minimo-sugerido="1000" />
            <GastosViaje v-model="gastosConductor" quien="conductor" titulo="Gastos del conductor" :existentes="existentesConductor" :exigir-soporte="false" />
          </template>

          <template v-if="detalle?.estado_viaje === 'aprobado'">
            <q-separator spaced />
            <CampoNumero v-model="formAprobar.valor_anticipo_cliente" label="Anticipo del cliente" moneda />
            <GastosViaje v-model="gastosPropietario" quien="propietario" titulo="Gastos del propietario" :existentes="existentesPropietario" :exigir-soporte="false" />
          </template>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn unelevated color="primary" label="Guardar cambios" :loading="guardando" @click="guardarEditar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ───────────── LEGALIZAR FACTURA DE UN GASTO ───────────── -->
    <q-dialog v-model="dialogLegalizar">
      <q-card style="width: 380px; max-width: 95vw">
        <q-card-section class="text-h6">Legalizar factura</q-card-section>
        <q-card-section>
          <div class="text-caption q-mb-sm">{{ gastoLegalizar?.tipo_gasto }} · {{ gastoLegalizar?.quien }} · {{ formatoPeso(gastoLegalizar?.valor) }}</div>
          <q-input v-model.trim="numeroFacturaGasto" label="Número de factura electrónica" outlined dense />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn unelevated color="primary" label="Legalizar" :loading="guardando" @click="guardarLegalizar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useStoreViajes } from '../stores/viajes'
import { useStoreUsuarios } from '../stores/usuarios'
import { useStoreVehiculos } from '../stores/vehiculos'
import { useVisorArchivos } from '../composables/useVisorArchivos'
import CampoArchivos from 'components/CampoArchivos.vue'
import CampoNumero from 'components/viajes/CampoNumero.vue'
import CampoDestino from 'components/CampoDestino.vue'
import GastosViaje, { agregarGastosAFormData, gastosDesdeLista, existentesDesdeLista } from 'components/viajes/GastosViaje.vue'
import { formatoPeso, formatoKilos, formatoMiles, formatoFecha, hoyISO } from '../utils/formato'
import { soloCiudad } from '../composables/useCiudades'

defineOptions({ name: 'ViajesPage' })

const $q = useQuasar()
const useViaje = useStoreViajes()
const useUsuario = useStoreUsuarios()
const useVehiculo = useStoreVehiculos()

// Visor de archivos (con pellizco), montado una sola vez en MainLayout
const { abrirArchivos: abrirVisor } = useVisorArchivos()

// ── Componentes pequeños de la vista ──

const Fila = (props) =>
  h('div', { class: 'detalle-fila' }, [
    h('span', { class: 'detalle-label' }, props.etiqueta),
    h('span', { class: ['detalle-valor', props.clase] }, props.valor === '' || props.valor === undefined || props.valor === null ? '—' : props.valor),
  ])
Fila.props = ['etiqueta', 'valor', 'clase']

const NOMBRE_TIPO = {
  peajes: 'Peajes', lavadas: 'Lavadas', parqueadero: 'Parqueadero', engrase: 'Engrase', fumigacion: 'Fumigación',
  cargue: 'Cargue', descargue: 'Descargue', comision: 'Comisión', otro: 'Otro',
}
const ListaGastos = (props, { emit }) =>
  h(
    'div',
    { class: 'lista-gastos q-mb-sm' },
    props.gastos.length
      ? props.gastos.map((g) =>
          h('div', { class: 'row items-center q-py-xs' }, [
            h('div', { class: 'col' }, [
              h('div', { class: 'text-body2' }, `${NOMBRE_TIPO[g.tipo_gasto] || g.tipo_gasto}${g.descripcion ? ` — ${g.descripcion}` : ''}`),
              h(
                'div',
                { class: 'text-caption text-grey-7' },
                `${g.tipo_factura === 'recibo_caja' ? 'Recibo de caja' : 'Factura electrónica'}${g.estado_factura === 'legalizado' ? ` · legalizada ${g.numero_factura || ''}` : ''}`
              ),
            ]),
            h('div', { class: 'text-body2 text-weight-medium q-mr-sm' }, formatoPeso(g.valor)),
            g.link_soporte
              ? h('button', { class: 'btn-mini', onClick: () => emit('ver', g.link_soporte, `Soportes ${g.quien}`) }, 'Ver')
              : null,
            props.puedeLegalizar && g.tipo_factura === 'factura_electronica' && g.estado_factura !== 'legalizado'
              ? h('button', { class: 'btn-mini q-ml-xs', onClick: () => emit('legalizar', g) }, 'Legalizar')
              : null,
          ])
        )
      : [h('div', { class: 'text-caption text-grey-6' }, 'Sin gastos')]
  )
ListaGastos.props = ['gastos', 'puedeLegalizar']
ListaGastos.emits = ['ver', 'legalizar']

// ── Perfil ──

const esAdmin = computed(() => useUsuario.perfile === 'administrador')
const esConductor = computed(() => useUsuario.perfile === 'conductor')
const esGestion = computed(() => ['administrador', 'propietario'].includes(useUsuario.perfile))
const misPlacas = computed(() =>
  String(useUsuario.user?.placa_asignada || '')
    .split(',')
    .map((p) => p.trim().toUpperCase())
    .filter(Boolean),
)

// ── Estados ──

const ESTADOS = [
  { valor: 'solicitado', etiqueta: 'Solicitado', color: 'grey-7' },
  { valor: 'anticipo_consignado', etiqueta: 'Consignado', color: 'teal' },
  { valor: 'completado', etiqueta: 'Por aprobar', color: 'orange' },
  { valor: 'aprobado', etiqueta: 'Aprobado', color: 'blue' },
  { valor: 'facturado', etiqueta: 'Facturado', color: 'purple' },
  { valor: 'pagado', etiqueta: 'Pagado', color: 'positive' },
]
const nombreEstado = (e) => ESTADOS.find((x) => x.valor === e)?.etiqueta || e
const colorEstado = (e) => ESTADOS.find((x) => x.valor === e)?.color || 'grey'

/** Qué falta en el viaje, dicho para quien lo está viendo */
function siguientePaso(v) {
  if (!v) return ''
  const preop = v.estado_preoperacional === 'realizado'
  switch (v.estado_viaje) {
    case 'solicitado':
      return esGestion.value ? 'Falta consignar el anticipo' : 'Esperando la consignación'
    case 'anticipo_consignado':
      return preop ? 'Listo para cerrar' : 'Falta el preoperacional'
    case 'completado':
      return esGestion.value ? 'Por aprobar' : 'En revisión'
    case 'aprobado':
      return esGestion.value ? 'Por facturar' : ''
    case 'facturado':
      return esGestion.value ? 'Por cobrar al cliente' : ''
    default:
      return ''
  }
}

const claseSigno = (n) => (Number(n) > 0 ? 'text-positive' : Number(n) < 0 ? 'text-negative' : '')

// ── Lista ──

const viajes = ref([])
const conteo = ref({})
const pagina = ref(1)
const hayMas = ref(false)
const cargandoLista = ref(false)
const filtroEstado = ref('')
const filtroPlaca = ref(null)
const vehiculos = ref([])

const opcionesEstado = computed(() => [
  { valor: '', etiqueta: 'Todos', cantidad: Object.values(conteo.value).reduce((a, b) => a + b, 0) },
  ...ESTADOS.map((e) => ({ ...e, cantidad: conteo.value[e.valor] || 0 })),
])

const placasFiltro = computed(() => vehiculos.value.map((v) => ({ label: v.placa, value: v.placa })))

async function cargarViajes() {
  cargandoLista.value = true
  try {
    const r = await useViaje.listarViajes({ estado: filtroEstado.value, placa: filtroPlaca.value || '', pagina: pagina.value })
    viajes.value = pagina.value === 1 ? r.datos : [...viajes.value, ...r.datos]
    hayMas.value = r.hayMas
    conteo.value = r.conteo || {}
  } finally {
    cargandoLista.value = false
  }
}

function recargar() {
  pagina.value = 1
  return cargarViajes()
}

function cambiarEstado(valor) {
  filtroEstado.value = valor
  recargar()
}

function cargarMas() {
  pagina.value++
  cargarViajes()
}

// ── Detalle ──

const detalle = ref(null)
const mostrarDetalles = ref(false)
const verGastos = ref('')

async function verDetalles(consecutivo) {
  const data = await useViaje.obtenerdatodeviaje(consecutivo)
  if (!data) return
  detalle.value = data
  verGastos.value = ''
  mostrarDetalles.value = true
}

const gastosDe = (quien) => (detalle.value?.gastos || []).filter((g) => g.quien === quien)
const existentesConductor = computed(() => existentesDesdeLista(detalle.value?.gastos, 'conductor'))
const existentesPropietario = computed(() => existentesDesdeLista(detalle.value?.gastos, 'propietario'))

const puedeCerrar = computed(() => {
  const v = detalle.value
  if (!v || v.estado_viaje !== 'anticipo_consignado' || v.estado_preoperacional !== 'realizado') return false
  return esGestion.value || v.correo_usuario === useUsuario.user?.email
})

const puedeEditar = computed(
  () => detalle.value && !['facturado', 'pagado'].includes(detalle.value.estado_viaje) && detalle.value.liquidado !== 'si',
)

/** Después de una acción: refresca la lista y el detalle */
async function despuesDeGuardar(consecutivo) {
  await recargar()
  await verDetalles(consecutivo)
}

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

// ── Clientes y conductores ──

const clientes = ref([])
const clientesOpciones = ref([])
const conductoresOpciones = ref([])

function filtrarClientes(texto, actualizar) {
  actualizar(() => {
    const t = texto.toLowerCase()
    clientesOpciones.value = clientes.value.filter((c) => c.label.toLowerCase().includes(t))
  })
}

async function cargarClientes() {
  const lista = await useViaje.obtenerClientesOpciones()
  clientes.value = lista.map((c) => ({ label: c.empresa, value: c.codigo }))
  clientesOpciones.value = clientes.value
}

async function cargarConductores() {
  formCrear.value.correo_conductor = null
  conductoresOpciones.value = []
  const placa = formCrear.value.placa
  if (!placa || esConductor.value) return
  const lista = esAdmin.value
    ? await useUsuario.listarUsuario()
    : await useUsuario.obtenerUsuariosPorPropietario(useUsuario.user?.email)
  conductoresOpciones.value = (Array.isArray(lista) ? lista : [])
    .filter(
      (u) =>
        u.perfil === 'conductor' &&
        String(u.estado || '').toLowerCase() === 'activo' &&
        String(u.placa_asignada || '').toUpperCase().split(',').map((p) => p.trim()).includes(placa),
    )
    .map((u) => ({ label: u.nombre, value: u.email }))
  if (conductoresOpciones.value.length === 1) formCrear.value.correo_conductor = conductoresOpciones.value[0].value
}

// ─────────────────────────────────────────────────────────────
// 1. Solicitar anticipo
// ─────────────────────────────────────────────────────────────

const dialogCrear = ref(false)
const formCrear = ref({})
const placasCrear = computed(() => {
  const placas = esConductor.value ? misPlacas.value : vehiculos.value.map((v) => v.placa)
  return placas.map((p) => ({ label: p, value: p }))
})

function abrirCrear() {
  formCrear.value = {
    placa: esConductor.value && misPlacas.value.length === 1 ? misPlacas.value[0] : null,
    correo_conductor: null,
    cliente: null,
    destino: '',
    fecha_inicio: hoyISO(),
    valor_anticipo_conductor: null,
    valor_tonelada_inicial: null,
  }
  conductoresOpciones.value = []
  dialogCrear.value = true
}

async function guardarCrear() {
  const f = formCrear.value
  if (!f.placa) return avisar('Seleccione la placa')
  if (!esConductor.value && !f.correo_conductor) return avisar('Seleccione el conductor')
  if (!f.cliente) return avisar('Seleccione el cliente')
  if (!f.destino) return avisar('Elija la ciudad de destino')
  if (!f.fecha_inicio) return avisar('Seleccione la fecha de inicio')
  if (!(f.valor_anticipo_conductor > 0)) return avisar('Escriba el valor del anticipo')
  if (!(f.valor_tonelada_inicial >= 1000)) return avisar('Escriba el valor completo de la tonelada, ej. 154.000')

  const ok = await ejecutar(async () => {
    const r = await useViaje.postViaje(f)
    dialogCrear.value = false
    await recargar()
    if (r?.consecutivo) await verDetalles(r.consecutivo)
  })
  return ok
}

// ─────────────────────────────────────────────────────────────
// 2. Consignar anticipo
// ─────────────────────────────────────────────────────────────

const dialogConsignar = ref(false)
const formConsignar = ref({})

function abrirConsignar() {
  formConsignar.value = { valor: Number(detalle.value.valor_anticipo_conductor) || null, fecha: hoyISO(), comprobante: [] }
  dialogConsignar.value = true
}

async function guardarConsignar() {
  const f = formConsignar.value
  if (!(f.valor > 0)) return avisar('Escriba el valor consignado')
  if (!f.comprobante.length) return avisar('Adjunte el comprobante')

  const fd = new FormData()
  fd.append('valor_anticipo_consignado', String(f.valor))
  fd.append('fecha_consignacion', f.fecha || '')
  f.comprobante.forEach((a) => fd.append('comprobante', a))

  const consecutivo = detalle.value.consecutivo
  await ejecutar(async () => {
    await useViaje.consignarAnticipo(consecutivo, fd)
    dialogConsignar.value = false
    await despuesDeGuardar(consecutivo)
  })
}

// ─────────────────────────────────────────────────────────────
// Datos de carga (se usan en cerrar, aprobar y editar)
// ─────────────────────────────────────────────────────────────

const formCarga = ref({})
const gastosConductor = ref({})
const gastosPropietario = ref({})
const refGastosCierre = ref(null)
const refGastosPropietario = ref(null)

function cargarFormCarga() {
  const v = detalle.value
  formCarga.value = {
    fecha_fin_viaje: v.fecha_fin_viaje || hoyISO(),
    kilos_cargue: Number(v.kilos_cargue) || null,
    kilos_descargue: Number(v.kilos_descargue) || null,
    valor_tonelada_final: Number(v.valor_tonelada_final) || Number(v.valor_tonelada_inicial) || null,
    manifiesto: [],
  }
  gastosConductor.value = gastosDesdeLista(v.gastos, 'conductor')
  gastosPropietario.value = gastosDesdeLista(v.gastos, 'propietario')
}

const valorEstimadoCierre = computed(() => {
  const kilos = Number(formCarga.value.kilos_descargue) || 0
  const precio = Number(formCarga.value.valor_tonelada_final) || 0
  return kilos && precio >= 1000 ? Math.round((kilos / 1000) * precio) : 0
})

function validarCarga({ obligatorio }) {
  const f = formCarga.value
  if (obligatorio && !f.fecha_fin_viaje) return 'Seleccione la fecha de fin'
  if (obligatorio && !f.kilos_cargue) return 'Escriba los kilos de cargue'
  if (obligatorio && !f.kilos_descargue) return 'Escriba los kilos de descargue'
  if (f.kilos_cargue && f.kilos_cargue < 10000) return 'Los kilos de cargue parecen incompletos (ej. 34.310)'
  if (f.kilos_descargue && f.kilos_descargue < 10000) return 'Los kilos de descargue parecen incompletos (ej. 34.270)'
  if (obligatorio && !f.valor_tonelada_final) return 'Escriba el valor de la tonelada final'
  if (f.valor_tonelada_final && f.valor_tonelada_final < 1000) return 'Escriba el valor completo de la tonelada, ej. 154.000'
  return ''
}

function agregarCarga(fd) {
  const f = formCarga.value
  if (f.fecha_fin_viaje) fd.append('fecha_fin_viaje', f.fecha_fin_viaje)
  if (f.kilos_cargue) fd.append('kilos_cargue', String(f.kilos_cargue))
  if (f.kilos_descargue) fd.append('kilos_descargue', String(f.kilos_descargue))
  if (f.valor_tonelada_final) fd.append('valor_tonelada_final', String(f.valor_tonelada_final))
}

// ─────────────────────────────────────────────────────────────
// 4. Cerrar viaje
// ─────────────────────────────────────────────────────────────

const dialogCerrar = ref(false)

function abrirCerrar() {
  cargarFormCarga()
  dialogCerrar.value = true
}

async function guardarCerrar() {
  const errorCarga = validarCarga({ obligatorio: true })
  if (errorCarga) return avisar(errorCarga)
  const errorGastos = refGastosCierre.value?.validar()
  if (errorGastos) return avisar(errorGastos)
  if (!formCarga.value.manifiesto.length && !detalle.value.link_manifiesto) return avisar('Adjunte el manifiesto')

  const fd = new FormData()
  agregarCarga(fd)
  agregarGastosAFormData(fd, gastosConductor.value, 'conductor')
  formCarga.value.manifiesto.forEach((a) => fd.append('manifiesto', a))

  const consecutivo = detalle.value.consecutivo
  await ejecutar(async () => {
    await useViaje.putCerrarViajeConductor(consecutivo, fd)
    dialogCerrar.value = false
    await despuesDeGuardar(consecutivo)
  })
}

// ─────────────────────────────────────────────────────────────
// 5. Aprobar
// ─────────────────────────────────────────────────────────────

const dialogAprobar = ref(false)
const formAprobar = ref({})

function abrirAprobar() {
  cargarFormCarga()
  formAprobar.value = { valor_anticipo_cliente: Number(detalle.value.valor_anticipo_cliente) || 0 }
  dialogAprobar.value = true
}

async function guardarAprobar() {
  const errorCarga = validarCarga({ obligatorio: false })
  if (errorCarga) return avisar(errorCarga)
  const errorGastos = refGastosPropietario.value?.validar()
  if (errorGastos) return avisar(errorGastos)

  const fd = new FormData()
  agregarCarga(fd)
  agregarGastosAFormData(fd, gastosConductor.value, 'conductor')
  agregarGastosAFormData(fd, gastosPropietario.value, 'propietario')
  fd.append('valor_anticipo_cliente', String(formAprobar.value.valor_anticipo_cliente || 0))

  const consecutivo = detalle.value.consecutivo
  await ejecutar(async () => {
    await useViaje.putAprobarPropietario(consecutivo, fd)
    dialogAprobar.value = false
    await despuesDeGuardar(consecutivo)
  })
}

// ─────────────────────────────────────────────────────────────
// 6. Facturar
// ─────────────────────────────────────────────────────────────

const dialogFacturar = ref(false)
const formFacturar = ref({})

function abrirFacturar() {
  formFacturar.value = {
    valor_viaje_real: Number(detalle.value.valor_viaje_estimado) || null,
    num_factura_cliente: '',
    notas_facturacion: '',
  }
  dialogFacturar.value = true
}

async function guardarFacturar() {
  const f = formFacturar.value
  if (!(f.valor_viaje_real > 0)) return avisar('Escriba el valor facturado')
  if (!f.num_factura_cliente) return avisar('Escriba el número de factura')

  const consecutivo = detalle.value.consecutivo
  await ejecutar(async () => {
    await useViaje.putFacturarViaje(consecutivo, f)
    dialogFacturar.value = false
    await despuesDeGuardar(consecutivo)
  })
}

// ─────────────────────────────────────────────────────────────
// 7. Pago del cliente
// ─────────────────────────────────────────────────────────────

const dialogPago = ref(false)
const formPago = ref({})

function abrirPago() {
  formPago.value = { fecha: hoyISO() }
  dialogPago.value = true
}

async function guardarPago() {
  const consecutivo = detalle.value.consecutivo
  await ejecutar(async () => {
    await useViaje.putCompletarSaldo(consecutivo, { fecha_pago_cliente: formPago.value.fecha })
    dialogPago.value = false
    await despuesDeGuardar(consecutivo)
  })
}

// ─────────────────────────────────────────────────────────────
// Editar (admin)
// ─────────────────────────────────────────────────────────────

const dialogEditar = ref(false)
const formEditar = ref({})

function abrirEditar() {
  const v = detalle.value
  formEditar.value = {
    cliente: v.cliente,
    destino: v.destino,
    fecha_inicio: v.fecha_inicio,
    valor_anticipo_conductor: Number(v.valor_anticipo_conductor) || null,
    valor_tonelada_inicial: Number(v.valor_tonelada_inicial) || null,
    valor_anticipo_consignado: Number(v.valor_anticipo_consignado) || null,
  }
  cargarFormCarga()
  formAprobar.value = { valor_anticipo_cliente: Number(v.valor_anticipo_cliente) || 0 }
  dialogEditar.value = true
}

async function guardarEditar() {
  const v = detalle.value
  const cerrado = ['completado', 'aprobado'].includes(v.estado_viaje)
  if (cerrado) {
    const errorCarga = validarCarga({ obligatorio: false })
    if (errorCarga) return avisar(errorCarga)
  }
  const f = formEditar.value
  if (f.valor_tonelada_inicial && f.valor_tonelada_inicial < 1000) return avisar('Escriba el valor completo de la tonelada inicial')

  const fd = new FormData()
  Object.entries(f).forEach(([k, valor]) => {
    if (valor !== null && valor !== undefined && valor !== '') fd.append(k, String(valor))
  })
  if (cerrado) {
    agregarCarga(fd)
    agregarGastosAFormData(fd, gastosConductor.value, 'conductor')
  }
  if (v.estado_viaje === 'aprobado') {
    agregarGastosAFormData(fd, gastosPropietario.value, 'propietario')
    fd.append('valor_anticipo_cliente', String(formAprobar.value.valor_anticipo_cliente || 0))
  }

  await ejecutar(async () => {
    await useViaje.putViaje(v.consecutivo, fd)
    dialogEditar.value = false
    await despuesDeGuardar(v.consecutivo)
  })
}

// ─────────────────────────────────────────────────────────────
// Legalizar factura de un gasto
// ─────────────────────────────────────────────────────────────

const dialogLegalizar = ref(false)
const gastoLegalizar = ref(null)
const numeroFacturaGasto = ref('')

function abrirLegalizar(gasto) {
  gastoLegalizar.value = gasto
  numeroFacturaGasto.value = ''
  dialogLegalizar.value = true
}

async function guardarLegalizar() {
  if (!numeroFacturaGasto.value) return avisar('Escriba el número de factura')
  const g = gastoLegalizar.value
  const consecutivo = detalle.value.consecutivo
  await ejecutar(async () => {
    await useViaje.putLegalizarFactura(consecutivo, {
      tipo_gasto: g.tipo_gasto,
      quien: g.quien,
      numero_factura: numeroFacturaGasto.value,
    })
    dialogLegalizar.value = false
    await verDetalles(consecutivo)
  })
}

// ── Inicio ──

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  const lista = await useVehiculo.obtenerVehiculos()
  vehiculos.value = Array.isArray(lista) ? lista : []
  await Promise.all([cargarViajes(), cargarClientes()])

  // Desde el inicio se llega con ?viaje=V-12: abre ese viaje y limpia la URL
  const codigo = String(route.query.viaje || '').trim().toUpperCase()
  if (codigo) {
    const resto = { ...route.query }
    delete resto.viaje
    router.replace({ query: resto })
    await verDetalles(codigo)
  }
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
.ganancia-banner {
  border-radius: 10px;
  padding: 10px 14px;
}
.ganancia-positiva {
  background: #f0fdf4;
  color: #166534;
}
.ganancia-negativa {
  background: #fef2f2;
  color: #991b1b;
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

<!-- Sin scoped: los usan los componentes funcionales Fila y ListaGastos -->
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
.lista-gastos {
  background: #f9fafb;
  border-radius: 8px;
  padding: 6px 10px;
}
.btn-mini {
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  font-size: 12px;
  padding: 2px 8px;
}
</style>
