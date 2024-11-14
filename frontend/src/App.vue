<script setup lang="ts">
import data from '@/assets/data.json'
import params, { dumpHash, loadHash, type Parameter, type UserParameter } from '@/params'
import { expandedParamGroups, isTouring, userParams } from '@/store'
import {
  ArrowUpOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  ShareAltOutlined
} from '@ant-design/icons-vue'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const DEFAULT_IMPORTANCE = 50
const hasBackend = !!import.meta.env.VITE_SHARE_BACKEND

// sync hash with userParams
const currentHash = ref('')
const fullUrl = computed(() => {
  currentHash.value
  return location.href
})

function onHashChange() {
  if (location.hash === currentHash.value) return
  currentHash.value = location.hash
  userParams.value = loadHash(decodeURIComponent(location.hash.slice(1)))
}

watch(
  userParams,
  (value) => {
    location.hash = '#' + dumpHash(value)
  },
  { deep: true }
)

onMounted(() => {
  if (location.hash.length > 1) {
    currentHash.value = location.hash
    userParams.value = loadHash(decodeURIComponent(location.hash.slice(1)))
  }
  window.addEventListener('hashchange', onHashChange, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('hashchange', onHashChange)
})

// help modal

const helpModalOpen = ref(false)

function openHelpModal() {
  if (isTouring.value) {
    return
  }
  isTouring.value = true
}

// share drawer

const shareDrawerOpen = ref(false)

function shareRanking() {
  shareDrawerOpen.value = true
}

// utils

function goHome() {
  if (isTouring.value) {
    return
  }
  userParams.value = []
}

function resetRanking() {
  if (isTouring.value) {
    return
  }
  userParams.value = []
}

function goToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// param list

const paramGroups = computed(() => {
  const groups: string[] = []
  for (const param of params) {
    if (param.group && !groups.includes(param.group)) {
      groups.push(param.group)
    }
  }
  return groups.map((group) => ({
    label: group,
    options: params.filter((param) => param.group === group)
  }))
})

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

const schoolDisplayCount = ref(30)
watch(
  userParams,
  () => {
    schoolDisplayCount.value = 30
  },
  { deep: true }
)

const totalSchools = computed(() => scoredSchools.value.length)
const displaySchools = computed(() => {
  return [...scoredSchools.value]
    .sort((a, b) => b.score - a.score)
    .slice(0, schoolDisplayCount.value)
})

// param stuff
// const chosenParamIds = computed(() => {
//   // { [id: string]: number } // index into userParams
//   const ids: Record<string, number> = {}
//   for (let i = 0; i < userParams.value.length; i++) {
//     ids[userParams.value[i].id] = i
//   }
//   return ids
// })
const chosenUserParams = computed({
  get: () => {
    const pms: Record<string, UserParameter | null> = {}
    for (const param of params) {
      const userParam = userParams.value.find((p) => p.id === param.id)
      pms[param.id] = userParam || null
    }
    return pms
  },
  set: (value) => {
    for (const param of params) {
      if (value[param.id]) {
        if (!userParams.value.find((p) => p.id === param.id)) {
          userParams.value.push(value[param.id]!)
        } else {
          const index = userParams.value.findIndex((p) => p.id === param.id)
          userParams.value[index] = value[param.id]!
        }
      } else {
        userParams.value = userParams.value.filter((p) => p.id !== param.id)
      }
    }
  }
})

const computedActiveGroups = computed({
  get: () => {
    return paramGroups.value.map(({ label }) =>
      expandedParamGroups.value.includes(label) ? label : '!' + label
    )
  },
  set: (value) => {
    expandedParamGroups.value = value.filter((v) => !v.startsWith('!'))
  }
})

function modifyParam(param: Parameter, checked: boolean) {
  if (checked && !userParams.value.find((p) => p.id === param.id)) {
    const args: Record<string, number> = {}
    for (const arg of param.arguments) {
      args[arg.id] = arg.default === undefined ? arg.min : arg.default
    }
    userParams.value.push({ id: param.id, importance: DEFAULT_IMPORTANCE, args })
  } else if (!checked) {
    const index = userParams.value.findIndex((p) => p.id === param.id)
    if (index !== -1) {
      userParams.value.splice(index, 1)
    }
  }
}

watch(userParams, (v) => console.log(v), { deep: true })
</script>

<template>
  <div class="container">
    <header class="layout-header">
      <span style="display: flex; align-items: center; cursor: pointer" @click="goHome">
        <WebsiteTitle class="header-title"></WebsiteTitle>
      </span>
      <span style="flex: 1 0 0"></span>
      <!-- class used in tour -->
      <span class="help-button" style="cursor: pointer" @click="openHelpModal">
        <QuestionCircleOutlined></QuestionCircleOutlined>
      </span>
    </header>
    <aside class="layout-aside">
      <div>
        <h1 class="aside-title print-only">My College Ranking</h1>
        <div style="margin-top: 36px" class="hide-print"></div>
        <h1 style="padding-inline: 24px" class="hide-print">Ranking factors</h1>
        <!-- class used in tour -->
        <template v-if="!userParams.length">
          <div
            class="hide-print"
            style="
              margin: 8px 16px 0 16px;
              padding: 8px;
              border-radius: 16px;
              background: #f5f5f5;
              color: rgba(0, 0, 0, 0.65);
            "
          >
            No ranking factors selected. You can add some factors from the categories below to
            create your own college ranking!
          </div>
          <div class="print-only" style="padding: 8px 24px">
            No ranking factors selected. You can add some factors from the categories below to
            create your own college ranking!
          </div>
        </template>
        <div class="user-params print-only" v-else style="margin-left: 24px">
          <div v-for="param in userParams" :key="param.id">
            <h2 style="margin-block: 8px">{{ params.find((p) => p.id === param.id)!.name }}</h2>
            <UserParam :model-value="param"></UserParam>
          </div>
        </div>
        <!-- class used in tour -->
        <div style="padding-left: 8px" class="param-list hide-print">
          <ACollapse v-model:active-key="computedActiveGroups" ghost>
            <template v-for="group in paramGroups" :key="group.label">
              <ACollapsePanel v-if="true" :key="group.label">
                <template #header>
                  <span>{{ group.label }}</span>
                </template>
                <div v-for="param in group.options" :key="param.id">
                  <ACheckbox
                    :checked="!!chosenUserParams[param.id]"
                    @change="(event) => modifyParam(param, event.target.checked)"
                    class="param-checkbox"
                  >
                    <strong>{{ param.name }}</strong>
                  </ACheckbox>
                  <UserParam
                    v-if="chosenUserParams[param.id]"
                    v-model="chosenUserParams[param.id]!"
                    style="margin-left: 24px"
                  ></UserParam>
                </div>
              </ACollapsePanel>
              <ACollapsePanel v-if="true" :show-arrow="false" :key="'!' + group.label">
                <div
                  v-for="param in group.options.filter((p) => chosenUserParams[p.id])"
                  :key="param.id"
                >
                  <h4>{{ param.name }}</h4>
                  <UserParam v-model="chosenUserParams[param.id]!"></UserParam>
                </div>
              </ACollapsePanel>
            </template>
          </ACollapse>
        </div>
        <ASpace class="hide-print" style="width: 100%; padding: 12px 12px 0" direction="vertical">
          <!-- class used in tour -->
          <AFlex class="buttons-row-2" :gap="8">
            <AButton danger @click="resetRanking"><DeleteOutlined></DeleteOutlined> Reset</AButton>
            <AButton v-if="hasBackend" @click="shareRanking" style="flex: 1 0 auto">
              <ShareAltOutlined></ShareAltOutlined> Share rankings!
            </AButton>
          </AFlex>
        </ASpace>
      </div>
    </aside>
    <main class="layout-main">
      <div style="padding: 24px; background: #fff">
        <h1 class="main-title print-only">Schools</h1>
        <AList class="school-list" :data-source="displaySchools" :split="false">
          <template #renderItem="{ item, index }">
            <AListItem class="school-list-item" :class="{ 'hide-print': index > 29 }">
              <SchoolCard :school="item" :index="index" :score="item.score"></SchoolCard>
            </AListItem>
          </template>
          <template #footer>
            <AButton
              v-if="totalSchools > schoolDisplayCount"
              @click="schoolDisplayCount += 30"
              style="width: 100%"
              class="hide-print"
              >Show more</AButton
            >
          </template>
        </AList>
        <p class="more-schools print-only">
          For more colleges on this ranking, please visit: {{ fullUrl }}
        </p>
      </div>
    </main>
    <footer class="layout-footer">
      <div>
        Website created by David Wang | Source code available on
        <ASpace>
          <a href="https://github.com/david-why/mcr" target="_blank">GitHub</a>
        </ASpace>
      </div>
      <div>
        This website is not affiliated with Niche.com or any other organization, and is for
        educational purposes only. All data is from Niche.com.
      </div>
    </footer>
  </div>
  <IntroModal></IntroModal>
  <HelpModal v-model:open="helpModalOpen"></HelpModal>
  <ShareDrawer v-if="hasBackend" v-model:open="shareDrawerOpen"></ShareDrawer>
  <WebsiteTour v-model:open="isTouring" ref="tour"></WebsiteTour>
  <AButton
    shape="circle"
    size="large"
    style="position: fixed; bottom: 36px; right: 36px; background-color: #fffe"
    class="hide-print"
    @click="goToTop"
  >
    <ArrowUpOutlined></ArrowUpOutlined>
  </AButton>
</template>

<style scoped>
/* Layout */
.container {
  display: grid;
  grid-template-columns: 350px 1fr;
  grid-template-rows: 64px 1fr auto;
  grid-template-areas: 'header header' 'aside main' 'footer footer';
}
@media screen and (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
    grid-template-rows: 64px auto 1fr auto;
    grid-template-areas: 'header' 'aside' 'main' 'footer';
  }
}
@media print {
  .container {
    grid-template-columns: 100%;
    grid-template-rows: auto auto;
    grid-template-areas: 'aside' 'main' 'footer';
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
@media print {
  .layout-header {
    display: none;
  }
}
/* Aside */
.layout-aside {
  grid-area: aside;
  scroll-margin-bottom: calc(100vh - 200px);
}
.aside-title {
  margin-left: 24px;
  font-size: 2em;
}
.param-list :deep(.ant-collapse-content-box) {
  padding-block: 0 !important;
}
.param-checkbox {
  width: 100%;
}
.param-checkbox > :deep(span:nth-child(2)) {
  flex: 1 0 auto;
}
.param-list :deep(.ant-collapse-no-arrow) .ant-collapse-header {
  display: none !important;
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
.school-list {
  scroll-margin-top: 200px;
}
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
/* Footer */
.layout-footer {
  grid-area: footer;
  background: #001529;
  color: #fffc;
  text-align: center;
  line-height: 24px;
  padding: 8px 20px;
}
.layout-footer > div {
  margin: 8px 0;
}
@media print {
  .layout-footer {
    background: #fff;
    color: #000;
  }
}
</style>
