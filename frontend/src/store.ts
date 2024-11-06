import type { UserParameter } from '@/params'
import { computed, ref } from 'vue'

export const userParams = ref<UserParameter[]>([])

export const expandedParamGroups = ref<string[]>([])

const seenHelpCounter = ref(0)

export const seenHelp = computed({
  get: () => {
    seenHelpCounter.value
    return localStorage.getItem('mcr::seenHelp') === 'true'
  },
  set: (value: boolean) => {
    localStorage.setItem('mcr::seenHelp', value ? 'true' : 'false')
    seenHelpCounter.value++
  }
})

export const isPrinting = ref(false)

export const isTouring = ref(false)
