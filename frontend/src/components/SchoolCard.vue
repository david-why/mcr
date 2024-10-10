<script setup lang="ts">
import { isPrinting, isTouring } from '@/store'
import type { School } from '@/types'
import { notification } from 'ant-design-vue'
import { ref } from 'vue'

defineProps<{
  school: School
  index: number
  score: number
}>()

function truncate(text: string | null) {
  if (!text) return ''
  return text.length > 200 ? text.slice(0, 200) + '...' : text
}

function onClick() {
  if (isTouring.value) {
    notification.warn({ message: 'Please finish the tour first!', placement: 'topLeft' })
    return
  }
  modalOpen.value = true
}

const modalOpen = ref(false)
</script>

<template>
  <ACard class="school-list-card" :hoverable="!isPrinting" @click="onClick">
    <ACardMeta>
      <template #title>
        <span style="font-size: 18px">{{ school.name }} // Score: {{ score }}</span>
      </template>
      <template #avatar>
        <div
          class="ranking-number"
          :style="{
            background: index < 3 ? ['#ffd700', '#a0a0a0', '#b36700'][index] : '#e2e2e2',
            color: index < 3 ? '#fff' : undefined,
            printColorAdjust: index < 3 ? 'exact' : undefined
          }"
        >
          {{ index + 1 }}
        </div>
      </template>
      <template #description>
        <div class="school-description">{{ school.description }}</div>
        <div class="school-description-mobile">{{ truncate(school.description) }}</div>
      </template>
    </ACardMeta>
  </ACard>
  <SchoolModal v-model:open="modalOpen" :school="school"></SchoolModal>
</template>

<style scoped>
.school-list-card {
  width: 100%;
  break-inside: avoid;
}
.school-list-card :deep(.ant-card-meta-title) {
  white-space: normal;
}
.ranking-number {
  font-size: 24px;
  height: 54px;
  width: 54px;
  line-height: 54px;
  border-radius: 27px;
  text-align: center;
  font-weight: bold;
}
.school-list-card :deep(.ant-list-item-meta) {
  align-items: stretch;
}
.school-list-card :deep(.ant-list-item-meta-content) {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100%;
}
@media screen and (max-width: 768px) {
  .school-description {
    display: none;
  }
}
@media screen and (min-width: 769px) {
  .school-description-mobile {
    display: none;
  }
}
@media print {
  .school-description-mobile {
    display: none;
  }
}
</style>
