<script setup lang="ts">
import data from '@/assets/data.json'
import params, { dumpHash, loadHash, type UserParameter } from '@/params'
import { isPrinting, isSelecting, isTouring, userParams } from '@/store'
import {
  ArrowUpOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
  QuestionCircleOutlined,
  ShareAltOutlined
} from '@ant-design/icons-vue'
import { notification } from 'ant-design-vue'
import { computed, h, onMounted, onUnmounted, ref, watch } from 'vue'

const DEFAULT_IMPORTANCE = 50
const hasBackend = !!import.meta.env.VITE_SHARE_BACKEND

const tour = ref<{ startTour: () => Promise<void> }>({} as any)

const currentHash = ref('')
const fullPath = computed(() => {
  currentHash.value
  return location.href
})

const secondCounter = ref(0)
const secondTimer = ref(0)

function onHashChange() {
  console.log('hashchange', location.hash, currentHash.value)
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
  },
  { deep: true }
)

function goHome() {
  if (isTouring.value) {
    notification.warn({ message: 'Please finish the tour first!', placement: 'topLeft' })
    return
  }
  userParams.value = []
}

function openHelpModal() {
  if (isTouring.value) {
    notification.warn({ message: 'Please finish the tour first!', placement: 'topLeft' })
    return
  }
  // helpModalOpen.value = true
  isTouring.value = true
}

function openSelectModal() {
  if (isTouring.value) {
    notification.warn({ message: 'Please finish the tour first!', placement: 'topLeft' })
    return
  }
  isSelecting.value = true
}

function resetRanking() {
  if (isTouring.value) {
    notification.warn({ message: 'Please finish the tour first!', placement: 'topLeft' })
    return
  }
  userParams.value = []
}

function shareRanking() {
  shareDrawerOpen.value = true
}

function goToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const allOptions = computed(() => {
  const groups: string[] = []
  for (const param of params) {
    if (param.group && !groups.includes(param.group)) {
      groups.push(param.group)
    }
  }
  return [{ label: 'Select a parameter to add...', value: '' } as any].concat(
    groups.map((group) => ({
      label: group,
      options: params
        .filter((param) => param.group === group)
        .map((param) => ({
          value: param.id,
          label: param.name
        }))
    }))
  )
})
const paramOptions = computed(() => {
  return allOptions.value.map((group) => {
    if (group.options) {
      return {
        label: group.label,
        options: group.options.filter(
          (option: { id: string }) => !userParams.value.find((p) => p.id === option.id)
        )
      }
    }
    return group
  })
})
const checkOptions = computed(() => {
  return paramOptions.value.filter((group) => group.options && group.options.length > 0)
})

const addParamValue = ref('')

watch(addParamValue, (value) => {
  if (value) {
    const args: Record<string, number> = {}
    for (const arg of params.find((param) => param.id === value)!.arguments) {
      args[arg.id] = arg.default === undefined ? arg.min : arg.default
    }
    userParams.value.push({ id: value, importance: DEFAULT_IMPORTANCE, args })
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

const helpModalOpen = ref(false)
const shareDrawerOpen = ref(false)

const chosenOptions = ref<string[]>([])
watch(
  () => [...userParams.value],
  (value, oldValue) => {
    if (JSON.stringify(value) === JSON.stringify(oldValue)) {
      return
    }
    chosenOptions.value = value.map((p) => p.id)
  },
  { deep: true }
)
watch(
  chosenOptions,
  (value) => {
    userParams.value = userParams.value.filter((p) => value.includes(p.id))
    for (const param of value) {
      if (userParams.value.find((p) => p.id === param)) {
        continue
      }
      const args: Record<string, number> = {}
      for (const arg of params.find((p) => p.id === param)!.arguments) {
        args[arg.id] = arg.default === undefined ? arg.min : arg.default
      }
      userParams.value.push({ id: param, importance: DEFAULT_IMPORTANCE, args })
    }
  },
  { deep: true }
)
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
        <h1 style="padding-left: 24px" class="hide-print">Parameters</h1>
        <!-- class used in tour -->
        <AList
          :data-source="userParams"
          :locale="{
            emptyText: h(
              'div',
              { style: { color: 'rgba(0, 0, 0, 0.75)' } },
              'No parameters selected. Click on the &quot;Add parameters&quot; button below to add some!'
            )
          }"
          size="large"
          class="param-list"
          :class="{ 'hide-print': userParams.length === 0 }"
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
        <ASpace class="hide-print" style="width: 100%; padding: 0 12px" direction="vertical">
          <!-- class used in tour -->
          <AButton class="add-params-button" @click="openSelectModal" style="width: 100%">
            <PlusCircleOutlined></PlusCircleOutlined> Add parameters
          </AButton>
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
          For more colleges on this ranking, please visit: {{ fullPath }}
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
  <SelectModal
    v-model:open="isSelecting"
    :options="checkOptions"
    v-model:checked="chosenOptions"
  ></SelectModal>
  <WebsiteTour v-model:open="isTouring" ref="tour"></WebsiteTour>
  <AButton
    shape="circle"
    size="large"
    style="position: fixed; bottom: 36px; right: 36px; background-color: #fffe"
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
  scroll-margin-bottom: calc(100vh - 200px);
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
</style>
