<script setup lang="ts">
import type { School } from '@/types'

defineProps<{
  school: School
  index: number
  score: number
}>()

const emit = defineEmits<{
  click: []
}>()

function truncate(text: string | null) {
  if (!text) return ''
  return text.length > 200 ? text.slice(0, 200) + '...' : text
}

function onClick() {
  emit('click')
}
</script>

<template>
  <ACard class="school-list-card" hoverable @click="onClick">
    <ACardMeta>
      <template #title>
        <span style="font-size: 18px">{{ school.name }} // Score: {{ score }}</span>
      </template>
      <template #avatar>
        <div
          class="ranking-number"
          :style="{
            background: index < 3 ? ['#ffd700', '#a0a0a0', '#b36700'][index] : '#e2e2e2',
            color: index < 3 ? '#fff' : undefined
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
</template>

<style scoped>
.school-list-card {
  width: 100%;
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
</style>
