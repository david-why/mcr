<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  min: number
  max: number
  step: number
  value?: number
}>()

const emit = defineEmits<{
  change: [value: number]
}>()

const actualValue = ref(props.value === undefined ? props.min : props.value)

watch(actualValue, (value) => {
  emit('change', value)
})
</script>

<template>
  <ASlider v-model:value="actualValue" :min="min" :max="max" :step="step"></ASlider>
</template>
