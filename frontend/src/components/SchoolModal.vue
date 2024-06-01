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

const nicheGrade = computed(() => {
  if (props.school.niche_grade === 4.33) return 'A+'
  if (props.school.niche_grade === 4) return 'A'
  if (props.school.niche_grade === 3.66) return 'A-'
  if (props.school.niche_grade === 3.33) return 'B+'
  if (props.school.niche_grade === 3) return 'B'
  if (props.school.niche_grade === 2.66) return 'B-'
  if (props.school.niche_grade === 2.33) return 'C+'
  if (props.school.niche_grade === 2) return 'C'
  if (props.school.niche_grade === 1.66) return 'C-'
  return '-'
})

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

const graduationRate = computed(() => {
  if (!props.school.graduation_rate) return '-'
  const rounded = Math.round(props.school.graduation_rate * 1000) / 10
  return `${rounded}%`
})
</script>

<template>
  <AModal v-model:open="isOpen" class="school-modal" :footer="false" style="width: 100vw">
    <h1>{{ school.name }}</h1>
    <p>
      {{ school.character }} | Niche Grade {{ nicheGrade }} | {{ school.location }} |
      <a :href="school.website" target="_blank">Official website</a> |
      <a :href="`https://www.niche.com/colleges/${school.slug}/`" target="_blank">Niche.com page</a>
    </p>
    <ARow>
      <DetailCol name="Acceptance Rate" :value="acceptanceRate"></DetailCol>
      <DetailCol
        name="Net Price"
        :value="netPrice"
        tooltip="Average cost after financial aids and scholarships"
      ></DetailCol>
      <DetailCol name="Undergrads" :value="undergrads"></DetailCol>
      <DetailCol
        name="Earnings after College"
        :value="earningsAfterCollege"
        tooltip="Median earnings 6 years after graduation"
      ></DetailCol>
      <DetailCol name="Niche Overall Rank" :value="overallRank"></DetailCol>
      <DetailCol name="Graduation Rate" :value="graduationRate"></DetailCol>
    </ARow>
    <ARow>
      <ACol :span="24" style="height: 500px; max-height: 50vh">
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