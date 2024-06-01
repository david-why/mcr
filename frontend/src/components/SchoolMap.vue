<script setup lang="ts">
import type { School } from '@/types'
import { LMap, LMarker, LTileLayer } from '@vue-leaflet/vue-leaflet'

defineProps<{ school: School }>()
</script>

<template>
  <LMap ref="map" :center="[37.0902, -95.7129]" :zoom="4" :use-global-leaflet="false">
    <LTileLayer
      url="https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png "
      layer-type="base"
      name="OpenStreetMap"
      attribution="&copy; OpenStreetMap contributors"
    ></LTileLayer>
    <LMarker :lat-lng="[school.latitude, school.longitude]"></LMarker>
  </LMap>
</template>
