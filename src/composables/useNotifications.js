import { ref } from 'vue';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { useStoreUsuarios } from '../stores/usuarios';

export default function useNotifications() {
  const tokenFCM = ref(null);
  const useUsuario = useStoreUsuarios();
  const notificationsEnabled = ref(false);
  
  // Inicializa las notificaciones solo para móviles
  const inicializarNotificaciones = async () => {
    try {
      // Verificar que estamos en dispositivo nativo
      if (!Capacitor.isNativePlatform()) {
        console.log('Las notificaciones solo están disponibles en dispositivos móviles');
        return false;
      }
      
      return await inicializarNotificacionesNativas();
    } catch (error) {
      console.error('Error al inicializar notificaciones:', error);
      return false;
    }
  };
  
  // Para dispositivos móviles (Android/iOS)
  // const inicializarNotificacionesNativas = async () => {
  //   try {
  //     if (Capacitor.getPlatform() === 'android') {
  //       // Usar FirebaseMessaging para Android
  //       const { token } = await FirebaseMessaging.getToken();
  //       console.log('Token FCM obtenido:', token);
  //       tokenFCM.value = token;
        
  //       // Registrar para recibir notificaciones
  //       await FirebaseMessaging.requestPermissions();
        
  //       // Configurar listeners
  //       FirebaseMessaging.addListener('notificationReceived', (notification) => {
  //         console.log('Notificación recibida:', notification);
  //       });

  //       FirebaseMessaging.addListener('notificationActionPerformed', (notification) => {
  //         console.log('Acción realizada en notificación:', notification);
  //       });
  //     } else if (Capacitor.getPlatform() === 'ios') {
  //       // Usar PushNotifications para iOS
  //       const permissionStatus = await PushNotifications.requestPermissions();
        
  //       if (permissionStatus.receive !== 'granted') {
  //         console.log('Permiso de notificaciones denegado');
  //         return false;
  //       }
        
  //       // Registrar para recibir notificaciones
  //       await PushNotifications.register();
        
  //       // Configurar listeners
  //       PushNotifications.addListener('registration', async (token) => {
  //         console.log('Token de notificaciones obtenido:', token.value);
  //         tokenFCM.value = token.value;
  //       });

  //       PushNotifications.addListener('pushNotificationReceived', (notification) => {
  //         console.log('Notificación recibida:', notification);
  //       });

  //       PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
  //         console.log('Acción realizada en notificación:', notification);
  //       });
  //     }
      
  //     // Guardar token en backend
  //     if (tokenFCM.value) {
  //       await guardarTokenEnServidor(tokenFCM.value);
  //       notificationsEnabled.value = true;
  //       return true;
  //     }
      
  //     return false;
  //   } catch (error) {
  //     console.error('Error en notificaciones nativas:', error);
  //     return false;
  //   }
  // };

const inicializarNotificacionesNativas = async () => {
  try {
    if (Capacitor.getPlatform() === 'android') {
      // Solicitar permisos primero
      const permissions = await FirebaseMessaging.requestPermissions();
      console.log('Permisos de notificación:', permissions);
      
      if (permissions.receive !== 'granted') {
        console.log('Permisos de notificación denegados');
        return false;
      }
      
      // Obtener token
      // const { token } = await FirebaseMessaging.getToken();
      // console.log('Token FCM obtenido:', token);
      // tokenFCM.value = token;
      // Obtener token
const result = await FirebaseMessaging.getToken();
console.log('Resultado completo FCM:', result);
tokenFCM.value = result.token;

if (!result.token) {
  console.error('No se obtuvo token FCM');
  return false;
}
      
      // Configurar listeners
      FirebaseMessaging.addListener('notificationReceived', (notification) => {
        console.log('Notificación recibida:', notification);
      });

      FirebaseMessaging.addListener('notificationActionPerformed', (notification) => {
        console.log('Acción realizada en notificación:', notification);
      });
      
    } else if (Capacitor.getPlatform() === 'ios') {
      // Solicitar permisos para iOS
      const permissionStatus = await PushNotifications.requestPermissions();
      
      if (permissionStatus.receive !== 'granted') {
        console.log('Permiso de notificaciones denegado en iOS');
        return false;
      }
      
      // Registrar para recibir notificaciones
      await PushNotifications.register();
      
      // IMPORTANTE: Para iOS, el token se obtiene en el listener
      return new Promise((resolve) => {
        PushNotifications.addListener('registration', async (token) => {
          console.log('Token de notificaciones obtenido en iOS:', token.value);
          tokenFCM.value = token.value;
          
          // Guardar token y resolver promesa
          try {
            await guardarTokenEnServidor(token.value);
            notificationsEnabled.value = true;
            resolve(true);
          } catch (error) {
            console.error('Error al guardar token iOS:', error);
            resolve(false);
          }
        });

        PushNotifications.addListener('registrationError', (error) => {
          console.error('Error en registro de notificaciones iOS:', error);
          resolve(false);
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Notificación recibida en iOS:', notification);
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Acción realizada en notificación iOS:', notification);
        });
      });
    }
    
    // Para Android, guardar token aquí
    if (tokenFCM.value) {
      await guardarTokenEnServidor(tokenFCM.value);
      notificationsEnabled.value = true;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error en notificaciones nativas:', error);
    return false;
  }
};
  
  // Guardar token en el backend
  const guardarTokenEnServidor = async (token) => {
    try {
      const resultado = await useUsuario.registrarTokenFCM(token);
      return resultado;
    } catch (error) {
      console.error('Error al guardar token en el servidor:', error);
      throw error;
    }
  };
  
  return {
    tokenFCM,
    inicializarNotificaciones,
    notificationsEnabled
  };
}