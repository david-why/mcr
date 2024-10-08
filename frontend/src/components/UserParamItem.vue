<script setup lang="ts">
import type { UserParameter } from '@/params'
import params from '@/params'
import { userParams } from '@/store'
import { DeleteOutlined } from '@ant-design/icons-vue'

const props = defineProps({ deletable: { type: Boolean, default: true } })

const item = defineModel<UserParameter>({ required: true })

function deleteParam(id: string) {
  if (!props.deletable) return
  const index = userParams.value.findIndex((p) => p.id === id)
  userParams.value.splice(index, 1)
}

function changeImportance(value: number | [number, number]) {
  item.value.importance = value as number
}

function changeArgument(id: string, value: number | [number, number]) {
  item.value.args[id] = value as number
}

const param = params.find((p) => p.id === item.value.id)!
</script>

<template>
  <AListItem>
    <AListItemMeta>
      <template #title>
        <div style="display: flex; width: 100%; align-items: center">
          <span style="font-size: 18px">{{ param.name }}</span>
          <span style="flex: 1 0 0"></span>
          <span @click="deleteParam(item.id)" class="hide-print">
            <ATooltip title="Delete this parameter">
              <DeleteOutlined style="color: red; font-size: 16px"></DeleteOutlined>
            </ATooltip>
          </span>
        </div>
      </template>
      <template #description>
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
    </AListItemMeta>
  </AListItem>
</template>
