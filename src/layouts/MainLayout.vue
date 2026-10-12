<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated class="bg-primary" style="padding-top: env(safe-area-inset-top)">
      <q-toolbar>
        <q-btn flat round dense icon="menu" @click="toggleSideMenu" />
        <q-toolbar-title>LJC</q-toolbar-title>

        <q-btn flat round dense icon="account_circle">
          <q-menu anchor="bottom right" self="top right">
            <q-list style="min-width: 220px">
              <q-item>
                <q-item-section>
                  <q-item-label>{{ useUsuario.user?.nombre || useUsuario.correo }}</q-item-label>
                  <q-item-label caption class="text-capitalize">{{ useUsuario.perfile }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="dialogPassword = true">
                <q-item-section avatar><q-icon name="lock_reset" /></q-item-section>
                <q-item-section>Cambiar contraseña</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="confirmarSalir">
                <q-item-section avatar><q-icon name="logout" /></q-item-section>
                <q-item-section>Cerrar sesión</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="sideMenuOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>LJC APP</q-item-label>
        <EssentialLink v-for="link in filteredLinks" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container class="bg-grey-1">
      <router-view />
    </q-page-container>

    <!-- Confirmar cierre de sesión -->
    <q-dialog v-model="dialogSalir">
      <q-card style="width: 360px; max-width: 92vw">
        <q-card-section>
          <div class="text-h6">Cerrar sesión</div>
          <div class="text-body2 text-grey-8 q-mt-sm">
            ¿Seguro que desea salir? Tendrá que ingresar de nuevo su correo y contraseña.
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn unelevated label="Salir" color="negative" @click="logout" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Cambio voluntario (menú) -->
    <CambiarPassword v-model="dialogPassword" />

    <!-- Cambio obligatorio (primer ingreso o contraseña temporal) -->
    <CambiarPassword
      :model-value="useUsuario.debeCambiarPassword"
      obligatorio
      @cambiada="recargarPagina"
      @salir="logout"
    />

    <!-- Visor de archivos (uno solo para toda la app): las páginas lo abren con useVisorArchivos() -->
    <VisorArchivos />
  </q-layout>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { linksList } from '../router/link-list.js'
import EssentialLink from 'components/EssentialLink.vue'
import CambiarPassword from 'components/CambiarPassword.vue'
import VisorArchivos from 'components/VisorArchivos.vue'
import { limpiarCacheArchivos } from '../composables/useVisorArchivos'
import useUI from '../composables/useUI'
import { storeToRefs } from 'pinia'
import { useStoreUsuarios } from '../stores/usuarios'
import { useRouter } from 'vue-router'

const router = useRouter()
const useUsuario = useStoreUsuarios()

const uiStore = useUI()
const { sideMenuOpen } = storeToRefs(uiStore)
const { toggleSideMenu } = uiStore

const dialogPassword = ref(false)
const dialogSalir = ref(false)

const filteredLinks = computed(() =>
  linksList.filter((link) => !link.perfiles?.length || link.perfiles.includes(useUsuario.perfile)),
)

// El backend respondió "debe cambiar la contraseña" (403): se muestra el diálogo obligatorio
const alDebeCambiar = () => {
  useUsuario.debeCambiarPassword = true
}

onMounted(async () => {
  window.addEventListener('ljc:debe-cambiar-password', alDebeCambiar)

  // Al abrir la app: refresca perfil y placas (por si el admin los cambió) sin pedir login
  await useUsuario.refrescarSesion()

  if (useUsuario.isAuthenticated && !useUsuario.debeCambiarPassword) {
    useUsuario.iniciarNotificaciones()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('ljc:debe-cambiar-password', alDebeCambiar)
})

function recargarPagina() {
  // Después de crear la contraseña, recarga la página actual con el token nuevo
  router.go(0)
}

function confirmarSalir() {
  dialogSalir.value = true
}

function logout() {
  dialogSalir.value = false
  limpiarCacheArchivos() // los archivos vistos no quedan para el siguiente usuario del celular
  useUsuario.eliminarToken()
  localStorage.removeItem('email')
  localStorage.removeItem('fcm-token')
  router.push('/')
}

defineOptions({
  name: 'MainLayout',
})
</script>
