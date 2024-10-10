<script setup lang="ts">
import { isSelecting, userParams } from '@/store'
import { Button as AButton, notification } from 'ant-design-vue'
import { h, nextTick, ref, watch } from 'vue'
import { QuestionCircleOutlined } from '@ant-design/icons-vue'

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
        'Welcome to My College Ranking! You can create your very own college ranking by choosing from a variety of parameters (criteria), such as location, size, cost, and more.'
      )
    ])
  },
  {
    title: 'Add parameters',
    description: 'You can add parameters by clicking on the "Add parameters" button.',
    target: () => document.querySelector('.add-params-button')!
  },
  {
    title: 'Add parameters',
    description:
      'Here, you can select the parameters that matter to you. Check the boxes next to the parameters you want to include in your ranking. You can adjust the importance of each parameter to determine how much this parameter is considered among the others later.',
    target: () => document.querySelector('.select-modal .ant-modal-content')!,
    placement: 'bottom'
  },
  {
    title: 'Parameters',
    description:
      'We chose some sample parameters for demo purposes. The website will calculate a score for each college based on these parameters, and sort the colleges based on the scores. Here, you can adjust the importance of each parameter by dragging the blue slider.',
    target: () => document.querySelector('.param-list')!,
    placement: 'bottom'
  },
  // {
  //   title: 'Add parameters',
  //   description:
  //     'You can add parameters by clicking on the "Add parameters" button. Then, you can adjust the importance of each parameter to determine how much this parameter is considered among the others.',
  //   target: () => document.querySelector('.add-params-button')!
  // },
  {
    title: 'Share your ranking',
    description:
      'You can share your ranking with others by clicking on the "Share rankings" button, where you can print your ranking, copy a link to it, or share it publicly. You can reset your ranking by clicking on the "Reset" button.',
    target: () => document.querySelector('.buttons-row-2')!
  },
  {
    title: 'College list',
    description:
      'This is the list of colleges. The colleges are sorted based on the scores calculated from the parameters. You can click on a college to view more details.',
    target: () => document.querySelector('.school-list')!,
    placement: 'top',
    arrow: false
  },
  {
    title: "That's it!",
    description: h('div', [
      'Hope you enjoy this website! If you need help, you can always click on the "',
      h(QuestionCircleOutlined),
      '" button to view this demo again.'
    ]),
    target: () => document.querySelector('.anticon-question-circle')!,
    placement: 'bottomLeft'
  }
]

const current = ref(0)
watch(current, async (value) => {
  if (value === 2) {
    isSelecting.value = true
    setTimeout(() => {
      counter.value++
    }, 1000)
  } else {
    isSelecting.value = false
  }
})

async function startTour(step = 0) {
  userParams.value = [
    {
      id: 'best-colleges',
      importance: 50,
      args: {}
    },
    {
      id: 'sat-range',
      importance: 100,
      args: { sat: 1400 }
    }
  ]
  counter.value++
  current.value = step
  await nextTick()
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
    :arrow="false"
    :steps="steps"
    @close="open = false"
    :key="counter"
  >
    <template #indicatorsRender="{ current, total }">
      <span v-if="current + 1 < total.value">{{ current + 1 }} / {{ total }}</span>
      <span v-else style="padding-left: 8px"
        ><AButton size="small" @click="resetIntro">Reset welcome dialog</AButton></span
      >
    </template>
  </ATour>
</template>
