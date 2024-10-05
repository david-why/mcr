import type { UserParameter } from '@/params'
import { computed, ref } from 'vue'

export const userParams = ref<UserParameter[]>([])

const seenHelpCounter = ref(0)

export const seenHelp = computed({
  get: () => {
    seenHelpCounter.value
    return localStorage.getItem('seenHelp') === 'true'
  },
  set: (value: boolean) => {
    localStorage.setItem('seenHelp', value ? 'true' : 'false')
    seenHelpCounter.value++
  }
})

export const isPrinting = ref(false)
