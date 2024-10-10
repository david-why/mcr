<script setup lang="ts">
import { isTouring } from '@/store'
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{
  options: { label: string; options: { label: string; value: string }[] }[]
  checked: string[]
}>()
const emit = defineEmits<{
  'update:checked': [string[]]
}>()
const open = defineModel<boolean>('open', { required: true })

const isChecked = ref<Record<string, boolean>>({})

watch(
  () => props.checked,
  (value, oldValue) => {
    if (JSON.stringify(value) === JSON.stringify(oldValue)) {
      return
    }
    const newChecked = props.options.reduce(
      (acc, group) => {
        group.options.forEach((option) => {
          acc[option.value] = value.includes(option.value)
        })
        return acc
      },
      {} as Record<string, boolean>
    )
    if (JSON.stringify(newChecked) === JSON.stringify(isChecked.value)) {
      return
    }
    isChecked.value = newChecked
  },
  { immediate: true }
)

watch(
  () => Object.assign({}, isChecked.value),
  (value, oldValue) => {
    if (JSON.stringify(value) === JSON.stringify(oldValue)) {
      return
    }
    if (!isTouring.value) {
      emit(
        'update:checked',
        Object.keys(value).filter((key) => value[key])
      )
    }
  },
  { deep: true }
)

function closeModal() {
  if (!isTouring.value) {
    open.value = false
  }
}

onMounted(() => {})
</script>

<template>
  <!-- class used in tour -->
  <AModal
    v-model:open="open"
    style="width: 800px"
    title="Select parameters"
    class="select-modal"
    :closable="!isTouring"
    :mask-closable="!isTouring"
  >
    <div v-for="group in options" :key="group.label">
      <span
        ><b>{{ group.label }}</b></span
      >
      <div>
        <ACheckbox
          v-for="option in group.options"
          :key="option.value"
          v-model:checked="isChecked[option.value]"
          >{{ option.label }}</ACheckbox
        >
      </div>
      <div style="padding-bottom: 16px"></div>
    </div>
    <template #footer>
      <AButton type="primary" @click="closeModal">OK</AButton>
    </template>
  </AModal>
</template>
