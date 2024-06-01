<script setup lang="ts">
import data from '@/assets/data.json'
import params from '@/params'
import { seenHelp, userParams } from '@/store'
import { computed, onMounted, ref, watch } from 'vue'
import type { School } from '@/types';

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

const helpModalOpen = computed(() => {
  return !seenHelp.value
})

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

const paramListData = computed(() => {
  return userParams.value.map((param) => {
    const paramData = params.find((p) => p.id === param.id)
    return {
      ...param,
      name: paramData?.name,
      param: paramData
    }
  })
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

function deleteParam(id: string) {
  const index = userParams.value.findIndex((param) => param.id === id)
  userParams.value.splice(index, 1)
}

function changeImportance(id: string, value: number | [number, number]) {
  userParams.value.find((param) => param.id === id)!.importance = value as number
}

function changeArgument(id: string, argId: string, value: number | [number, number]) {
  userParams.value.find((param) => param.id === id)!.args[argId] = value as number
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

const sortedSchoolsData = computed(() => {
  return [...scoredSchools.value].sort((a, b) => b.score - a.score)
})

function truncate(text: string) {
  if (!text) return ''
  return text.length > 200 ? text.slice(0, 200) + '...' : text
}

const schoolModal = ref(data.schools[0])
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
          :data-source="paramListData"
          :locale="{ emptyText: 'Choose your parameters above!' }"
          size="large"
        >
          <template #renderItem="{ item }">
            <AListItem>
              <AListItemMeta>
                <template #title>
                  <div style="display: flex; width: 100%">
                    <span style="font-size: 18px">{{ item.name }}</span>
                    <span style="flex: 1 0 0"></span>
                    <span
                      style="cursor: pointer"
                      title="Delete this parameter"
                      @click="deleteParam(item.id)"
                      >&#x274C;</span
                    >
                  </div>
                </template>
                <template #description>
                  <div style="color: rgba(0, 0, 0, 0.88)">
                    <p>Importance</p>
                    <ASlider
                      :min="0"
                      :max="100"
                      :step="1"
                      :value="item.importance"
                      @change="changeImportance(item.id, $event)"
                    ></ASlider>
                    <template v-for="arg in item.param.arguments" :key="arg.id">
                      <p>{{ arg.name }}</p>
                      <ASlider
                        :min="arg.min"
                        :max="arg.max"
                        :step="arg.step || 1"
                        :value="item.args[arg.id]"
                        @change="changeArgument(item.id, arg.id, $event)"
                      ></ASlider>
                    </template>
                  </div>
                </template>
              </AListItemMeta>
            </AListItem>
          </template>
        </AList>
      </div>
    </aside>
    <main>
      <div style="padding: 24px; background: #fff">
        <AList
          class="school-list"
          :data-source="sortedSchoolsData"
          :split="false"
          :row-key="(item: School) => item.slug"
        >
          <template #renderItem="{ item, index }">
            <AListItem class="school-list-item">
              <ACard
                class="school-list-card"
                hoverable
                @click="(schoolModal = item), (schoolModalOpen = true)"
              >
                <ACardMeta>
                  <template #title><span style="font-size: 18px">{{ item.name }} // Score: {{ item.score }}</span></template>
                  <template #avatar>
                    <div
                      class="ranking-number"
                      :style="{
                        background:
                          index < 3 ? ['#ffd700', '#a0a0a0', '#b36700'][index] : '#e2e2e2',
                        color: index < 3 ? '#fff' : undefined
                      }"
                    >
                      {{ index + 1 }}
                    </div>
                  </template>
                  <template #description>
                    <div class="school-description">{{ item.description }}</div>
                    <div class="school-description-mobile">{{ truncate(item.description) }}</div>
                  </template>
                </ACardMeta>
              </ACard>
            </AListItem>
          </template>
        </AList>
      </div>
    </main>
  </div>
  <AModal
    title="Welcome to My College Ranking!"
    class="help-modal"
    style="width: 600px"
    :open="helpModalOpen"
    @cancel="seenHelp = true"
  >
    <p>
      You might have heard of college rankings like the U.S. News and World Report, which use a set
      of criteria to rank colleges. But what if you could rank colleges based on your own
      preferences?
    </p>
    <p>
      That's where My College Ranking comes in. You can choose from a variety of parameters
      (criteria), such as location, size, cost, and more. You can adjust the importance of each
      parameter and the arguments for each parameter. The colleges will be ranked based on your
      preferences.
    </p>
    <p>So go ahead and add some parameters on the left to get started!</p>
    <template #footer>
      <AButton type="primary" @click="seenHelp = true">Let's go!</AButton>
    </template>
  </AModal>
  <SchoolModal :school="schoolModal" v-model:open="schoolModalOpen"></SchoolModal>
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
.school-list-item:nth-child(2n + 1) .school-list-card {
  background: #f5f5f5;
}
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
.school-list :deep(.ant-list-item-meta) {
  align-items: stretch;
}
.school-list :deep(.ant-list-item-meta-content) {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100%;
}
/* Help modal */
.help-modal p {
  margin-bottom: 8px;
}
@media screen and (max-width: 768px) {
  .container {
    grid-template-rows: 64px auto 1fr;
    grid-template-columns: 1fr;
    grid-template-areas: 'header' 'aside' 'main';
  }
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
