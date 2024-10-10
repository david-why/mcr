<script setup lang="ts">
import { isTouring, seenHelp } from '@/store'
import { computed } from 'vue'

const open = computed(() => {
  return !seenHelp.value
})

function closeModal() {
  seenHelp.value = true
}

function doStartTour() {
  closeModal()
  isTouring.value = true
}
</script>

<template>
  <AModal
    title="Welcome to My College Ranking!"
    class="intro-modal"
    :width="600"
    :open="open"
    @cancel="closeModal"
  >
    <p>Seems like it's your first time here! Would you like a tour of how to use the website?</p>
    <template #footer>
      <AButton @click="closeModal">No, thanks</AButton>
      <AButton type="primary" @click="doStartTour">Let's go!</AButton>
    </template>
  </AModal>
</template>

<style scoped>
.intro-modal p {
  margin-bottom: 8px;
}
.unimportant {
  color: rgba(0, 0, 0, 0.45);
  font-style: italic;
}
</style>
