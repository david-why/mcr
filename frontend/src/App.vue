<script setup lang="ts">
import data from '@/assets/data.json'
import params, { type UserParameter } from '@/params'
import { userParams } from '@/store'
import type { School } from '@/types'
import { computed, onMounted, ref, watch } from 'vue'

function dumpHash() {
  return JSON.stringify(userParams.value)
}

function loadHash(hash: string) {
  try {
    const parsed = JSON.parse(hash)
    userParams.value = parsed
  } catch (e) {
    console.error('Error parsing hash:', e)
  }
}

onMounted(() => {
  if (location.hash.length > 1) {
    loadHash(decodeURIComponent(location.hash.slice(1)))
  }
})

watch(
  userParams,
  () => {
    location.hash = '#' + dumpHash()
  },
  { deep: true }
)

const unchosenParams = computed(() => {
  return params.filter((param) => !userParams.value.find((p) => p.id === param.id))
})

const paramOptions = computed(() => {
  const groups: string[] = []
  for (const param of unchosenParams.value) {
    if (param.group && !groups.includes(param.group)) {
      groups.push(param.group)
    }
  }
  return [{ label: 'Select a parameter to add...', value: '' } as any].concat(
    groups.map((group) => ({
      label: group,
      options: unchosenParams.value
        .filter((param) => param.group === group)
        .map((param) => ({
          value: param.id,
          label: param.name
        }))
    }))
  )
})

const addParamValue = ref('')

watch(addParamValue, (value) => {
  if (value) {
    const args: Record<string, number> = {}
    for (const arg of params.find((param) => param.id === value)!.arguments) {
      args[arg.id] = arg.default === undefined ? arg.min : arg.default
    }
    userParams.value.push({ id: value, importance: 100, args })
    addParamValue.value = ''
  }
})

function updateItem(item: UserParameter) {
  const index = userParams.value.findIndex((p) => p.id === item.id)
  userParams.value[index] = item
}

const scoreMultiplier = computed(() => {
  return 100 / userParams.value.reduce((acc, param) => acc + param.importance, 0)
})

function calcScore(school: any) {
  let score = 0
  for (const param of userParams.value) {
    const paramData = params.find((p) => p.id === param.id)!
    score += paramData.func(school, param.args) * param.importance
  }
  if (!isFinite(scoreMultiplier.value)) return 100
  return Math.round(score * scoreMultiplier.value * 10) / 10
}

const scoredSchools = computed(() => {
  return data.schools.map((school) => ({
    ...school,
    score: calcScore(school)
  }))
})

const sortedSchools = computed(() => {
  return [...scoredSchools.value].sort((a, b) => b.score - a.score)
})

const chosenSchool = ref(data.schools[0])
const schoolModalOpen = ref(false)
</script>

<template>
  <div class="container">
    <header class="layout-header">
      <IconR style="height: 32px; padding-right: 12px"></IconR>
      <h1 class="header-title" style="color: #fffc">My College Ranking</h1>
    </header>
    <aside>
      <div style="padding: 0 12px">
        <ASelect
          :options="paramOptions"
          v-model:value="addParamValue"
          style="width: 100%; margin-top: 36px"
        ></ASelect>
        <AList
          :data-source="userParams"
          :locale="{ emptyText: 'Choose your parameters above!' }"
          size="large"
        >
          <template #renderItem="{ item }">
            <!-- this hack is needed because `item` is readonly here -->
            <UserParamItem :model-value="item" @update:model-value="updateItem"></UserParamItem>
          </template>
        </AList>
      </div>
    </aside>
    <main>
      <div style="padding: 24px; background: #fff">
        <AList
          class="school-list"
          :data-source="sortedSchools"
          :split="false"
          :row-key="(item: School) => item.slug"
        >
          <template #renderItem="{ item, index }">
            <AListItem class="school-list-item">
              <SchoolCard
                :school="item"
                :index="index"
                :score="item.score"
                @click="(chosenSchool = item), (schoolModalOpen = true)"
              ></SchoolCard>
            </AListItem>
          </template>
        </AList>
      </div>
    </main>
  </div>
  <IntroModal></IntroModal>
  <SchoolModal :school="chosenSchool" v-model:open="schoolModalOpen"></SchoolModal>
</template>

<style scoped>
/* Layout */
.container {
  display: grid;
  grid-template-columns: 350px 1fr;
  grid-template-rows: 64px 1fr;
  grid-template-areas: 'header header' 'aside main';
}
/* Header */
.layout-header {
  grid-area: header;
  width: 100%;
  background: #001529;
  display: flex;
  align-items: center;
  line-height: 64px;
  font-size: 14px;
  padding: 0 30px;
}
.header-title {
  font-size: 24px;
}
/* School list */
.school-list-item {
  padding-left: 0;
  padding-right: 0;
}
.school-list-item:nth-child(2n + 1) :deep(.school-list-card) {
  background: #f5f5f5;
}
@media screen and (max-width: 768px) {
  .container {
    grid-template-rows: 64px auto 1fr;
    grid-template-columns: 1fr;
    grid-template-areas: 'header' 'aside' 'main';
  }
}
</style>
