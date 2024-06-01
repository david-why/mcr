<script setup lang="ts">
import type { School } from '@/types'
import { computed } from 'vue'

const props = defineProps<{
  school: School
}>()

const isOpen = defineModel<boolean>('open', { required: true })

function addCommas(value: number) {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const acceptanceRate = computed(() => {
  if (!props.school.acceptance_rate) return '-'
  const rounded = Math.round(props.school.acceptance_rate * 1000) / 10
  return `${rounded}%`
})

const netPrice = computed(() => {
  if (!props.school.net_price) return '-'
  return `$${addCommas(props.school.net_price)}`
})

const undergrads = computed(() => {
  if (!props.school.full_time_undergrads) return '-'
  return addCommas(props.school.full_time_undergrads)
})

const earningsAfterCollege = computed(() => {
  if (!props.school.earnings_after_graduation) return '-'
  return `$${addCommas(props.school.earnings_after_graduation)}`
})

const overallRank = computed(() => {
  const ranking = props.school.rankings['best-colleges'].ordinal
  return `#${ranking}`
})

const testRequirement = computed(() => {
  if (props.school.test_requirement === null) return undefined
  return ['Neither required nor recommended', 'Considered but not required', 'Required'][
    props.school.test_requirement
  ]
})

const satRange = computed(() => {
  if (!props.school.sat_range) return '-'
  const [min, max] = props.school.sat_range
  return `${min}-${max}`
})
</script>

<template>
  <AModal centered v-model:open="isOpen" class="school-modal" :footer="false" style="width: 100vw">
    <h1>{{ school.name }}</h1>
    <p>
      {{ school.character }} | {{ school.location }} |
      <a :href="school.website" target="_blank">Official website</a> |
      <a :href="`https://www.niche.com/colleges/${school.slug}/`" target="_blank">Niche.com page</a>
    </p>
    <ARow>
      <DetailCol name="Niche Overall Rank" :value="overallRank"></DetailCol>
      <DetailCol
        name="Undergrads"
        :value="undergrads"
        tooltip="Number of undergrads enrolled full-time"
      ></DetailCol>
      <DetailCol name="Acceptance Rate" :value="acceptanceRate"></DetailCol>
      <DetailCol name="SAT Range" :value="satRange" :tooltip="testRequirement"></DetailCol>
      <DetailCol
        name="Net Price"
        :value="netPrice"
        tooltip="Average cost after financial aids and scholarships"
      ></DetailCol>
      <DetailCol
        name="Earnings after College"
        :value="earningsAfterCollege"
        tooltip="Median earnings 6 years after graduation"
      ></DetailCol>
    </ARow>
    <ARow>
      <ACol :span="24" style="height: 350px">
        <SchoolMap :school="school"></SchoolMap>
      </ACol>
    </ARow>
  </AModal>
</template>

<style scoped>
.school-modal p {
  margin-bottom: 8px;
}
.school-modal h2 {
  font-weight: 500;
}
</style>
