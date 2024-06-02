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
    <p>
      If you get confused or need help at any time, you can always click on the help button in the
      top-right corner for a detailed description of how to use this website.
    </p>
    <p>So go ahead and add some parameters on the left to get started!</p>
    <p class="unimportant">
      The data on this website comes from Niche.com, which provides information on colleges and
      universities in the United States. This website is in no way affiliated with or endorsed by
      Niche.com. The rankings and data are for reference only and should not be used as the sole
      basis for making decisions.
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
.unimportant {
  color: rgba(0, 0, 0, 0.45);
  font-style: italic;
}
</style>
