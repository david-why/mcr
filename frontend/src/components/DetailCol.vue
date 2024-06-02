<script setup lang="ts">
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
defineProps<{
  name: string
  value: string
  tooltip?: string
  tooltipPlacement?: 'title' | 'detail'
}>()
</script>

<template>
  <ACol :xl="4" :lg="8" :sm="12" :span="24">
    <div class="detail-name">
      {{ name }}
      <ATooltip v-if="tooltip && tooltipPlacement !== 'detail'" :title="tooltip">
        <QuestionCircleOutlined></QuestionCircleOutlined>
      </ATooltip>
    </div>
    <div class="detail-text" style="display: flex; align-items: center">
      {{ value }}
      <template v-if="tooltip && tooltipPlacement === 'detail'">
        <span style="flex: 0 0 4px"></span>
        <ATooltip :title="tooltip">
          <QuestionCircleOutlined style="font-size: 20px"></QuestionCircleOutlined>
        </ATooltip>
      </template>
    </div>
  </ACol>
</template>

<style scoped>
.detail-name {
  font-size: 18px;
}
.detail-text {
  font-size: 32px;
}
</style>
