<script setup lang="ts">
import type { UserParameter } from '@/params'
import params from '@/params'

const item = defineModel<UserParameter>({ required: true })

function changeImportance(value: number | [number, number]) {
  item.value.importance = value as number
}

function changeArgument(id: string, value: number | [number, number]) {
  item.value.args[id] = value as number
}

const param = params.find((p) => p.id === item.value.id)!
</script>

<template>
  <div style="color: rgba(0, 0, 0, 0.88)">
    <p>
      Importance<span class="print-only">: {{ item.importance }}%</span>
    </p>
    <ASlider
      :min="0"
      :max="100"
      :step="5"
      :value="item.importance"
      @change="changeImportance"
      class="hide-print"
    ></ASlider>
    <template v-for="arg in param.arguments" :key="arg.id">
      <p>
        {{ arg.name }}<span class="print-only">: {{ item.args[arg.id] }}</span>
      </p>
      <ASlider
        :min="arg.min"
        :max="arg.max"
        :step="arg.step || 1"
        :value="item.args[arg.id]"
        @change="changeArgument(arg.id, $event)"
        class="hide-print"
      ></ASlider>
    </template>
  </div>
</template>
