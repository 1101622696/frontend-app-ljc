<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated class="bg-[#003144]">
      <q-toolbar>
        <q-btn flat round dense icon="menu" @click="toggleSideMenu" />
        <q-toolbar-title>SVA</q-toolbar-title>
        <q-btn
          v-if="useUsuario.perfile !== 'piloto'"
          flat
          round
          dense
          icon="add_circle"
          @click="mostrarFormulario = true"
        />
      </q-toolbar>
    </q-header>

    <q-dialog v-model="mostrarFormulario">
      <q-card style="width: 700px">
        <q-card-section>
          <div class="text-h6">{{ esEdicion ? 'Editar' : 'Crear' }} Solicitud</div>
        </q-card-section>

        <SolicitudForm
          :datos="datosSolicitud"
          :esEdicion="esEdicion"
          @guardar="guardarCompletado"
          @cancelar="mostrarFormulario = false"
        />
      </q-card>
    </q-dialog>

    <q-drawer v-model="sideMenuOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>Sevicol Ltda</q-item-label>
        <EssentialLink v-for="link in filteredLinks" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container class="bg-grey-1">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { linksList } from '../router/link-list.js'
import EssentialLink from 'components/EssentialLink.vue'
import useUI from '../composables/useUI'
import { storeToRefs } from 'pinia'
import { useStoreUsuarios } from '../stores/usuarios'
import useNotifications from 'src/composables/useNotifications'
import SolicitudForm from '../components/SolicitudForm.vue'

// import { useRouter } from 'vue-router'
const useUsuario = useStoreUsuarios()

const uiStore = useUI()
const { sideMenuOpen } = storeToRefs(uiStore)
const { toggleSideMenu } = uiStore

// const router = useRouter()

// const { inicializarNotificaciones, notificationsEnabled } = useNotifications()
const { inicializarNotificaciones } = useNotifications()

const filteredLinks = computed(() => {
  return linksList.filter((link) => {
    if (!link.perfiles || link.perfiles.length === 0) return true
    return link.perfiles.includes(useUsuario.perfile)
  })
})

// onMounted(async () => {
//   // Solo si el usuario está autenticado
//   if (useUsuario.isAuthenticated) {
//     try {
//       // Verificar si ya están activadas las notificaciones
//       const tokenGuardado = localStorage.getItem('fcm-token');
//       if (!tokenGuardado || !notificationsEnabled.value) {
//         // Intentar inicializar notificaciones
//         await inicializarNotificaciones();
//       }
//     } catch (error) {
//       console.log('Error al verificar notificaciones:', error);
//     }
//   }
// })

onMounted(async () => {
  if (useUsuario.isAuthenticated) {
    console.log('Usuario autenticado, intentando inicializar notificaciones...')
    const resultado = await inicializarNotificaciones()
    console.log('Resultado inicialización:', resultado)
  }
})

const mostrarFormulario = ref(false)

async function guardarCompletado() {
  mostrarFormulario.value = false
}

// const logout = () => {
//   useUsuario.eliminarToken()
//   localStorage.removeItem('email')
//   localStorage.removeItem('fcm-token')
//   router.push('/')
// }

defineOptions({
  name: 'MainLayout',
})
</script>
