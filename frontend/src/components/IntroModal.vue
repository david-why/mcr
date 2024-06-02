<script setup lang="ts">
import { seenHelp } from '@/store'
import { computed } from 'vue'

const open = computed(() => {
  return !seenHelp.value
})
</script>

<template>
  <AModal
    title="Welcome to My College Ranking!"
    class="intro-modal"
    :width="600"
    :open="open"
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
    <p style="font-style: italic">
      If you get confused, you can always click on the help button in the top-right corner for a
      detailed description of how to use this website.
    </p>
    <template #footer>
      <AButton type="primary" @click="seenHelp = true">Let's go!</AButton>
    </template>
  </AModal>
</template>

<style scoped>
.intro-modal p {
  margin-bottom: 8px;
}
</style>
