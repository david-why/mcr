<script setup lang="ts">
import data from '@/assets/data.json'
import params, { dumpHash, loadHash, type UserParameter } from '@/params'
import { userParams } from '@/store'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import { QuestionCircleOutlined, ShareAltOutlined, PrinterOutlined } from '@ant-design/icons-vue'

const hasBackend = import.meta.env.VITE_SHARE_BACKEND

const isHome = ref(true)

const currentHash = ref('')
const fullPath = computed(() => {
  currentHash.value
  return location.href
})

const secondCounter = ref(0)
const secondTimer = ref(0)

function onHashChange() {
  if (location.hash === currentHash.value) return
  currentHash.value = location.hash
  userParams.value = loadHash(decodeURIComponent(location.hash.slice(1)))
}

onMounted(() => {
  if (location.hash.length > 1) {
    currentHash.value = location.hash
    userParams.value = loadHash(decodeURIComponent(location.hash.slice(1)))
  }
  window.addEventListener('hashchange', onHashChange)
  secondTimer.value = setInterval(() => {
    secondCounter.value++
  }, 1000)
})

onUnmounted(() => {
  window.removeEventListener('hashchange', onHashChange)
  if (secondTimer.value) {
    clearInterval(secondTimer.value)
  }
})

watch(
  userParams,
  (value) => {
    location.hash = '#' + dumpHash(value)
    if (value.length) {
      isHome.value = false
    }
  },
  { deep: true }
)

function goHome() {
  userParams.value = []
  isHome.value = true
}

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
const homeParamOptions = computed(() => {
  const params = paramOptions.value
  params.shift()
  return [{ label: 'Click here & start your ranking!', value: '' }].concat(params)
})

const homeLinks = computed(() => {
  return [
    { label: 'Best Academics', href: '#ov1e;ac2s' },
    { label: 'Best Life', href: '#ov1e;fo1e;ca23;sl2s' }
  ]
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
  <div class="container" v-if="!isHome">
    <header class="layout-header">
      <span style="display: flex; align-items: center; cursor: pointer" @click="goHome">
        <IconR style="height: 32px; padding-right: 12px"></IconR>
        <span class="header-title">My College Ranking</span>
      </span>
      <span style="flex: 1 0 0"></span>
      <span style="cursor: pointer" @click="helpModalOpen = true">
        <QuestionCircleOutlined></QuestionCircleOutlined>
      </span>
    </header>
    <aside class="layout-aside">
      <div>
        <h1 class="aside-title print-only">Parameters</h1>
        <div style="padding: 0 12px">
          <ASelect
            :options="paramOptions"
            v-model:value="addParamValue"
            style="width: 100%; margin-top: 36px"
            class="hide-print"
          ></ASelect>
        </div>
        <AList
          :data-source="userParams"
          :locale="{ emptyText: 'No parameters selected!' }"
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
        <div style="text-align: right; padding-right: 12px" class="hide-print">
          <ASpace>
            <AButton v-if="hasBackend" @click="shareRanking">
              <ShareAltOutlined></ShareAltOutlined> Share rankings!
            </AButton>
          </ASpace>
        </div>
      </div>
    </aside>
    <main class="layout-main">
      <div style="padding: 24px; background: #fff">
        <h1 class="main-title print-only">Schools</h1>
        <AList class="school-list" :data-source="sortedSchools" :split="false">
          <template #renderItem="{ item, index }">
            <AListItem class="school-list-item" :class="{ 'hide-print': index > 29 }">
              <SchoolCard :school="item" :index="index" :score="item.score"></SchoolCard>
            </AListItem>
          </template>
        </AList>
        <p class="more-schools print-only">
          For more colleges on this ranking, please visit: {{ fullPath }}
        </p>
      </div>
    </main>
  </div>
  <div class="home-container" v-else>
    <div class="home-header"></div>
    <div style="padding-top: 30vh"></div>
    <h1 class="home-title">
      <span class="home-title-text">
        <span v-for="(char, index) in 'My College Ranking'.split('')" :key="index">{{ char }}</span>
      </span>
    </h1>
    <div>
      <ASelect
        :options="homeParamOptions"
        v-model:value="addParamValue"
        class="home-select"
        size="large"
      ></ASelect>
    </div>
    <div class="home-links">
      <ASpace size="large">
        <!-- <template #split>
          <span style="border-right: 1px solid #bbb"></span>
        </template> -->
        <span style="font-size: 16px">Or try these:</span>
        <a
          class="home-link"
          v-for="{ label, href } in homeLinks"
          :key="href"
          :href="href"
          v-text="label"
        ></a>
      </ASpace>
    </div>
    <div class="home-spacer"></div>
    <div class="home-desc">
      <p>Create college rankings with your own set of parameters!</p>
      <p>Website created by David Wang</p>
      <p>
        Source code available on
        <ASpace>
          <a href="https://github.com/david-why/mcr" target="_blank" style="font-size: 16px"
            >GitHub</a
          >
        </ASpace>
      </p>
    </div>
  </div>
  <!-- <IntroModal></IntroModal> -->
  <HelpModal v-model:open="helpModalOpen"></HelpModal>
  <ShareDrawer v-if="hasBackend" v-model:open="shareDrawerOpen"></ShareDrawer>
</template>

<style scoped>
/* Home */
.home-container {
  font-size: 16px;
  text-align: center;
  /* padding-top: 30vh; */
}
.home-header {
  background: #001529;
  height: 32px;
  /* display: flex;
  padding: 8px 24px;
  color: white;
  background: #444; */
}
.home-title {
  font-size: 2.5em;
  text-align: center;
  word-spacing: 0.2em;
  /* padding: 18px 0; */
  /* color: white;
  background: #444; */
}
.home-title-text {
  background-image: linear-gradient(to right, #f50, #2db7f5);
  color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.home-select {
  width: 40%;
  min-width: 614px;
  margin-top: 24px;
}
.home-select :deep(.ant-select-selection-item) {
  text-align: center;
}
.home-links {
  margin-top: 16px;
}
.home-link {
  font-size: 16px;
}
.home-spacer {
  height: 48px;
}
.home-desc p {
  padding-bottom: 12px;
}
@media screen and (max-width: 768px) {
  .home-select {
    width: 80%;
    min-width: 0;
  }
}
/* Layout */
.container {
  display: grid;
  grid-template-columns: 350px 1fr;
  grid-template-rows: 64px 1fr;
  grid-template-areas: 'header header' 'aside main';
}
@media screen and (max-width: 768px) {
  .container {
    grid-template-rows: 64px auto 1fr;
    grid-template-columns: 1fr;
    grid-template-areas: 'header' 'aside' 'main';
  }
}
@media print {
  .container {
    grid-template-columns: 100%;
    grid-template-rows: auto auto;
    grid-template-areas: 'aside' 'main';
  }
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
/* Aside */
.layout-aside {
  grid-area: aside;
}
.aside-title {
  margin-left: 24px;
  font-size: 2em;
}
@media print {
  .layout-aside {
    margin-top: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid #999;
  }
}
/* Main */
.layout-main {
  grid-area: main;
}
.main-title {
  margin-bottom: 24px;
  font-size: 2em;
}
/* School list */
.school-list-item {
  padding-left: 0;
  padding-right: 0;
}
.school-list-item:nth-child(2n + 1) :deep(.school-list-card) {
  background: #f5f5f5;
}
.more-schools {
  font-style: italic;
  text-align: center;
}
</style>
