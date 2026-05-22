<template>
  <q-page class="flex flex-center">

  <div>
    GPS position: <strong>{{ position }}</strong>
  </div>

  </q-page>
</template>

<script setup>

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Geolocation } from '@capacitor/geolocation'

const position = ref(null)
let geoId = null

async function getHighAccuracyPosition() {
  try {
    let bestPosition = null

    for (let i = 0; i < 5; i++) { // intenta varias veces (calentar GPS)
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      })

      console.log('Intento', i, pos.coords.accuracy)

      // guardamos la mejor (menor accuracy)
      if (!bestPosition || pos.coords.accuracy < bestPosition.coords.accuracy) {
        bestPosition = pos
      }

      // si ya es buena, salimos antes
      if (pos.coords.accuracy < 50) break

      await new Promise(r => setTimeout(r, 1500))
    }

    position.value = bestPosition
    console.log('Mejor posición:', bestPosition)

  } catch (error) {
    console.error('Error GPS:', error)
  }
}

onMounted(() => {
  getHighAccuracyPosition()

  geoId = Geolocation.watchPosition(
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    },
    (newPosition, err) => {
      if (err) {
        console.log('Error watch:', err)
        return
      }

      if (newPosition.coords.accuracy > 200) return

      position.value = newPosition
      console.log('Nueva posición buena:', newPosition.coords.accuracy)
    }
  )
})

onBeforeUnmount(() => {
  if (geoId) {
    Geolocation.clearWatch({ id: geoId })
  }
})

// ese codigo funcionará en el cel, probarlo, si no este de abajo pero está a 1 km de estar exacto
// import { ref, onMounted, onBeforeUnmount } from 'vue'
// import { Geolocation } from '@capacitor/geolocation'
// // import { useQuasar } from 'quasar'
//  const position = ref('determining...')

//     function getCurrentPosition() {
//       Geolocation.getCurrentPosition().then(newPosition => {
//         console.log('Current', newPosition)
//         position.value = newPosition
//       })
//     }

//     let geoId

//     onMounted(() => {
//       getCurrentPosition()

//       // we start listening
//       geoId = Geolocation.watchPosition({}, (newPosition, err) => {
//         console.log('New GPS position')
//         console.log(err)
//         position.value = newPosition
//       })
//     })

//     onBeforeUnmount(() => {
//       // we do cleanup
//       Geolocation.clearWatch(geoId)
//     })

defineOptions({
  name: 'gpsPage'
})

</script>
