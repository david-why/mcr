<script setup lang="ts">
import { ref } from 'vue'
import data from '@/assets/data.json'

const open = defineModel<boolean>('open', { required: true })

const userParam = ref({
  id: 'sat-range',
  importance: 75,
  args: {
    sat: 1000
  }
})
</script>

<template>
  <AModal title="Help" class="help-modal" :width="800" v-model:open="open" @cancel="open = false">
    <p>
      This is a simple website that helps you find the best school for you based on your own
      personal preferences.
    </p>
    <p>
      You can add <b>parameters</b> that are important to you and adjust their importance and
      values. For example, this is a parameter that ranks schools based on your SAT score and the
      school's students' SAT score range:
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
      The application will calculate a score for each school based on your parameters and show you
      the best schools, according to your own ranking system.
    </p>
    <p>
      After you add your parameters, you will see a list of schools to the right. You can click on
      each school to see more details. Try clicking on the school below:
    </p>
    <SchoolCard :school="data.schools[0]" :index="0" :score="100"></SchoolCard>
    <template #footer>
      <AButton @click="open = false">Got it!</AButton>
    </template>
  </AModal>
</template>

<style scoped>
.help-modal p {
  margin-bottom: 8px;
}
</style>
