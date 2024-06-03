<script setup lang="ts">
import data from '@/assets/data.json'
import { notification } from 'ant-design-vue'
import { ref } from 'vue'

import { ShareAltOutlined } from '@ant-design/icons-vue'

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
</script>

<template>
  <AModal title="Help" class="help-modal" :width="800" v-model:open="open" @cancel="open = false">
    <p>
      This is a simple website that helps you find the best school for you based on your own
      personal preferences.
    </p>
    <p>
      You can add <b>parameters</b> that are important to you and adjust their importance and
      values. Each parameter is responsible for ranking schools in one aspect. For example, this is
      a parameter that ranks schools based on your SAT score and the school's students' SAT score
      range:
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
    <p>
      You can adjust the <b>importance</b> of each parameter to determine how much this parameter is
      considered among the others.
    </p>
    <p>
      The website will calculate a score for each school based on your parameters and show you the
      best schools, according to your own ranking system.
    </p>
    <p>
      After you add your parameters, you will see a list of schools to the right. You can click on
      each school to see more details. Try clicking on the school below:
    </p>
    <SchoolCard :school="data.schools[0]" :index="0" :score="100"></SchoolCard>
    <template #footer>
      <AButton @click="resetIntro">Reset welcome dialog</AButton>
      <AButton type="primary" @click="open = false">Got it!</AButton>
    </template>
    <p v-if="hasBackend">
      You can click on the
      <AButton><ShareAltOutlined></ShareAltOutlined> Share rankings!</AButton> button to share a
      link of your rankings with others, share your rankings with everyone, or view rankings other
      people have shared.
    </p>
  </AModal>
</template>

<style scoped>
.help-modal p {
  margin-bottom: 8px;
}
</style>
