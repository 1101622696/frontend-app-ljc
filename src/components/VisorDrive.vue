<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card style="min-width: 340px; max-width: 600px; width: 100%">

      <!-- Header -->
      <q-card-section class="row items-center q-pb-none">
        <q-icon name="folder_open" color="orange" size="sm" class="q-mr-sm" />
        <span class="text-subtitle1 text-weight-medium">{{ titulo }}</span>
        <q-space />
        <q-btn icon="close" flat round dense @click="$emit('update:modelValue', false)" />
      </q-card-section>

      <q-separator class="q-mt-sm" />

      <!-- Cargando -->
      <q-card-section v-if="cargando" class="flex flex-center q-py-xl">
        <q-spinner color="primary" size="40px" />
      </q-card-section>

      <!-- Error -->
      <q-card-section v-else-if="error">
        <q-banner class="bg-red-1 text-red-8" rounded>
          <template #avatar>
            <q-icon name="error_outline" />
          </template>
          {{ error }}
        </q-banner>
      </q-card-section>

      <!-- Sin archivos -->
      <q-card-section v-else-if="archivos.length === 0" class="text-center text-grey-6 q-py-xl">
        <q-icon name="folder_off" size="40px" class="q-mb-sm" />
        <div>Sin archivos</div>
      </q-card-section>

      <!-- Lista de archivos -->
      <q-card-section v-else class="q-pt-sm">
        <div class="row q-gutter-sm">
          <div
            v-for="archivo in archivos"
            :key="archivo.id"
            class="col-12"
          >
            <!-- Imagen: mostrar preview -->
            <div v-if="esImagen(archivo.mimeType)">
              <div class="text-caption text-grey-7 q-mb-xs">
                <q-icon name="image" size="14px" class="q-mr-xs" />{{ archivo.name }}
              </div>
              <img
                :src="urlArchivo(archivo.id)"
                :alt="archivo.name"
                style="max-width: 100%; max-height: 320px; border-radius: 8px; object-fit: contain"
                @error="onImageError($event)"
              />
            </div>

            <!-- PDF: mostrar en iframe -->
            <div v-else-if="esPdf(archivo.mimeType)">
              <div class="text-caption text-grey-7 q-mb-xs">
                <q-icon name="picture_as_pdf" size="14px" color="red" class="q-mr-xs" />{{ archivo.name }}
              </div>
              <iframe
                :src="urlArchivo(archivo.id)"
                style="width: 100%; height: 400px; border: none; border-radius: 8px"
              />
            </div>

            <!-- Otros: botón de descarga -->
            <q-item
              v-else
              clickable
              :href="urlArchivo(archivo.id)"
              target="_blank"
              class="rounded-borders bg-grey-1"
            >
              <q-item-section avatar>
                <q-icon :name="iconoMime(archivo.mimeType)" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ archivo.name }}</q-item-label>
                <q-item-label caption>{{ labelMime(archivo.mimeType) }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="open_in_new" size="18px" color="grey-5" />
              </q-item-section>
            </q-item>

          </div>
        </div>
      </q-card-section>

    </q-card>
  </q-dialog>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  titulo: { type: String, default: 'Archivos' },
  archivos: { type: Array, default: () => [] },
  cargando: Boolean,
  error: { type: String, default: null },
  urlArchivo: { type: Function, required: true },
  esImagen: { type: Function, required: true },
  // esPDF: { type: Function, required: true },
  esPdf: { type: Function, required: true },
})

defineEmits(['update:modelValue'])

const onImageError = (e) => {
  e.target.style.display = 'none'
}

const iconoMime = (mimeType) => {
  if (!mimeType) return 'insert_drive_file'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'table_chart'
  if (mimeType.includes('document') || mimeType.includes('word')) return 'description'
  if (mimeType.includes('video')) return 'videocam'
  return 'insert_drive_file'
}

const labelMime = (mimeType) => {
  if (!mimeType) return 'Archivo'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'Hoja de cálculo'
  if (mimeType.includes('document') || mimeType.includes('word')) return 'Documento'
  if (mimeType.includes('video')) return 'Video'
  if (mimeType.includes('pdf')) return 'PDF'
  return 'Archivo'
}
</script>