<script setup lang="ts">
import data from '@/assets/data.json'
import params from '@/params'
import { seenHelp, userParams } from '@/store'
import { computed, ref, watch } from 'vue'

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

const schoolModal = ref(data.schools[0])
const schoolModalOpen = ref(false)
</script>

<template>
  <ALayout style="min-height: 100vh">
    <ALayoutHeader style="display: flex; align-items: center">
      <IconR style="height: 32px; padding-right: 12px"></IconR>
      <h1 class="header-title" style="color: #fffc">My College Ranking</h1>
    </ALayoutHeader>
    <ALayout>
      <ALayoutSider
        class="layout-sider"
        theme="light"
        breakpoint="lg"
        collapsed-width="0"
        width="350"
      >
        <div style="padding: 0 12px">
          <h2 style="margin: 10px 0">Choose your parameters!</h2>
          <ASelect
            :options="paramOptions"
            v-model:value="addParamValue"
            style="width: 100%"
          ></ASelect>
          <AList
            :data-source="paramListData"
            :locale="{ emptyText: 'No params added' }"
            size="large"
          >
            <template #renderItem="{ item }">
              <AListItem>
                <AListItemMeta>
                  <template #title>
                    <div style="display: flex; width: 100%">
                      <span>{{ item.name }}</span>
                      <span style="flex: 1 0 0"></span>
                      <span
                        style="cursor: pointer"
                        title="Delete this parameter"
                        @click="deleteParam(item.id)"
                        >&#x274C;</span
                      >
                    </div>
                    <!-- {{ item.name }} -->
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
      </ALayoutSider>
      <ALayoutContent style="padding: 30px">
        <div style="padding: 24px; background: #fff">
          <AList
            class="school-list"
            :data-source="sortedSchoolsData"
            :split="false"
            :row-key="(item) => item.slug"
          >
            <template #renderItem="{ item, index }">
              <AListItem class="school-list-item">
                <ACard
                  class="school-list-card"
                  hoverable
                  @click="(schoolModal = item), (schoolModalOpen = true)"
                >
                  <ACardMeta
                    :title="item.name + ' | Score: ' + item.score"
                    :description="item.description"
                  >
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
                  </ACardMeta>
                </ACard>
              </AListItem>
            </template>
          </AList>
        </div>
      </ALayoutContent>
    </ALayout>
  </ALayout>
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
.ranking-number {
  font-size: 24px;
  height: 54px;
  width: 54px;
  line-height: 54px;
  border-radius: 27px;
  text-align: center;
  font-weight: bold;
}
.school-list-item:nth-child(2n + 1) .school-list-card {
  background: #f5f5f5;
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
.help-modal p {
  margin-bottom: 8px;
}
.school-modal h2 {
  font-weight: 500;
}
</style>
