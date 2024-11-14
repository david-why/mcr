<script setup lang="ts">
import { expandedParamGroups, userParams } from '@/store'
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import { Button as AButton, notification } from 'ant-design-vue'
import { h, ref, watch } from 'vue'

const open = defineModel<boolean>('open', { required: true })
watch(open, (value, oldValue) => {
  if (value && !oldValue) {
    startTour()
  }
})

const counter = ref(0)

const steps: any[] = [
  {
    title: 'Welcome!',
    description: h('div', [
      h(
        'p',
        'Welcome to My College Ranking! You can create your very own college ranking by choosing from a variety of factors and customizing their importance, such as location, size, cost, and more.'
      )
    ])
  },
  {
    title: 'Choose factors',
    description:
      'Here, you can select the factors that matter to you. Click the categories to open or close them, and check the boxes next to the factors you want to include in your ranking. You can adjust the importance of each factor to determine how much it is considered among the others.',
    target: () => document.querySelector('.param-list')!,
    placement: 'right'
  },
  {
    title: 'College list',
    description:
      'This is the list of colleges, sorted based on the scores calculated from your ranking factors. You can click on a college to view more details.',
    target: () => document.querySelector('.school-list')!,
    placement: 'top'
  },
  {
    title: 'Share your ranking',
    description:
      'You can share your ranking with others by clicking on the "Share rankings" button, where you can print your ranking, copy a link to it, or share it publicly. You can reset your ranking by clicking on the "Reset" button.',
    target: () => document.querySelector('.buttons-row-2')!
  },
  {
    title: "That's it!",
    description: h('div', [
      'Hope you enjoy this website! If you need help, you can always click on the "',
      h(QuestionCircleOutlined),
      '" button to view this demo again.'
    ]),
    target: () => document.querySelector('.anticon-question-circle')!,
    placement: 'bottomRight'
  }
]

const current = ref(0)

async function startTour(step = 0) {
  userParams.value = [
    {
      id: 'best-colleges',
      importance: 75,
      args: {}
    },
    {
      id: 'student-faculty-ratio',
      importance: 50,
      args: {}
    }
  ]
  expandedParamGroups.value = ['General']
  counter.value++
  current.value = step
  open.value = true
}

function resetIntro() {
  localStorage.setItem('mcr::seenHelp', 'false')
  notification.success({
    message: 'Welcome dialog reset',
    description:
      'The welcome dialog has been reset. You will see it again next time you visit the website.'
  })
}

defineExpose({
  startTour
})
</script>

<template>
  <ATour
    v-model:current="current"
    :open="open"
    :steps="steps"
    @close="open = false"
    :key="counter"
    :arrow="false"
  >
    <template #indicatorsRender="{ current, total }">
      <span v-if="current + 1 < total.value">{{ current + 1 }} / {{ total }}</span>
      <span v-else style="padding-left: 8px"
        ><AButton size="small" @click="resetIntro">Reset welcome dialog</AButton></span
      >
    </template>
  </ATour>
</template>
