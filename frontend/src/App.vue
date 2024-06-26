<script setup lang="ts">
import data from '@/assets/data.json'
import params, { dumpHash, loadHash, type UserParameter } from '@/params'
import { userParams } from '@/store'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import { QuestionCircleOutlined, ShareAltOutlined } from '@ant-design/icons-vue'

const hasBackend = import.meta.env.VITE_SHARE_BACKEND

const currentHash = ref('')

function onHashChange() {
  if (location.hash === currentHash.value) return
  currentHash.value = location.hash
  userParams.value = loadHash(decodeURIComponent(location.hash.slice(1)))
}

onMounted(() => {
  if (location.hash.length > 1) {
    userParams.value = loadHash(decodeURIComponent(location.hash.slice(1)))
  }
  window.addEventListener('hashchange', onHashChange)
})

onUnmounted(() => {
  window.removeEventListener('hashchange', onHashChange)
})

watch(
  userParams,
  (value) => {
    location.hash = '#' + dumpHash(value)
  },
  { deep: true }
)

function shareRanking() {
  shareDrawerOpen.value = true
}

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

const helpModalOpen = ref(false)
const shareDrawerOpen = ref(false)
</script>

<template>
  <div class="container">
    <header class="layout-header">
      <IconR style="height: 32px; padding-right: 12px"></IconR>
      <span class="header-title">My College Ranking</span>
      <span style="flex: 1 0 0"></span>
      <span style="cursor: pointer" @click="helpModalOpen = true">
        <QuestionCircleOutlined style=""></QuestionCircleOutlined>
      </span>
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
            <!-- this hack (instead of v-model) is needed because `item` is readonly -->
            <UserParamItem
              :model-value="item"
              @update:model-value="updateItem"
              :key="item.id"
            ></UserParamItem>
          </template>
        </AList>
        <div style="text-align: right">
          <AButton v-if="hasBackend" @click="shareRanking">
            <ShareAltOutlined></ShareAltOutlined> Share rankings!
          </AButton>
        </div>
      </div>
    </aside>
    <main>
      <div style="padding: 24px; background: #fff">
        <AList class="school-list" :data-source="sortedSchools" :split="false">
          <template #renderItem="{ item, index }">
            <AListItem class="school-list-item">
              <SchoolCard :school="item" :index="index" :score="item.score"></SchoolCard>
            </AListItem>
          </template>
        </AList>
      </div>
    </main>
  </div>
  <IntroModal></IntroModal>
  <HelpModal v-model:open="helpModalOpen"></HelpModal>
  <ShareDrawer v-if="hasBackend" v-model:open="shareDrawerOpen"></ShareDrawer>
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
  padding: 0 30px;
  color: #fffc;
  font-size: 24px;
}
.header-title {
  font-weight: bold;
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
