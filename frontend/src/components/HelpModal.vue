<script setup lang="ts">
import data from '@/assets/data.json'
import { notification } from 'ant-design-vue'
import { ref } from 'vue'

import { isTouring } from '@/store'
import { DeleteOutlined, PlusCircleOutlined, ShareAltOutlined } from '@ant-design/icons-vue'

const hasBackend = !!import.meta.env.VITE_SHARE_BACKEND

const open = defineModel<boolean>('open', { required: true })

const userParam = ref({
  id: 'sat-range',
  importance: 75,
  args: {
    sat: 1000
  }
})

function resetIntro() {
  localStorage.setItem('seenHelp', 'false')
  notification.success({ message: 'You will see the welcome dialog when you refresh!' })
}

function doStartTour() {
  open.value = false
  isTouring.value = true
  // startTour.value()
}
</script>

<template>
  <AModal title="Help" class="help-modal" :width="800" v-model:open="open" @cancel="open = false">
    <p>
      Welcome to <WebsiteTitle></WebsiteTitle>! This is a simple website that helps you find your
      best colleges and universities based on your own personal preferences.
    </p>
    <p>
      A <b>parameter</b> is an aspect of a school that you care about. You can add parameters that
      are important to you by clicking on the
      <AButton><PlusCircleOutlined></PlusCircleOutlined> Add parameters</AButton> button. Then, you
      can adjust their importance. For example, this is a parameter:
    </p>
    <AList :data-source="[0]" style="max-width: 350px">
      <template #renderItem>
        <UserParamItem
          v-model="userParam"
          :deletable="false"
          style="padding: 8px 0"
        ></UserParamItem>
      </template>
    </AList>
    <p>This parameter will rank schools based on your SAT score and each school's SAT range.</p>
    <p>
      You can adjust the <b>importance</b> of each parameter to determine how much this parameter is
      considered among the others. You can delete a parameter by clicking on the trash icon, or
      click on the <AButton danger><DeleteOutlined></DeleteOutlined> Reset</AButton> button to
      delete all your parameters.
    </p>
    <p>
      After you add your parameters, you will see a list of schools to the right, ordered with your
      own ranking. You can click on each school to see more details. Try clicking on the school
      below:
    </p>
    <SchoolCard :school="data.schools[0]" :index="0" :score="100"></SchoolCard>
    <p v-if="hasBackend">
      To share your rankings, you can click on the
      <AButton><ShareAltOutlined></ShareAltOutlined> Share rankings!</AButton> button to print your
      ranking or export it to a PDF file, copy a link to your ranking, share your rankings publicly,
      or view rankings that other people have shared.
    </p>
    <template #footer>
      <AButton @click="resetIntro">Reset welcome dialog</AButton>
      <AButton @click="doStartTour">Start tour</AButton>
      <AButton type="primary" @click="open = false">Got it!</AButton>
    </template>
  </AModal>
</template>

<style>
.help-modal .ant-modal-body > * {
  margin-bottom: 12px;
}
</style>
