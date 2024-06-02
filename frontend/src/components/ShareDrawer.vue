<script setup lang="ts">
import params, { loadHash } from '@/params'
import { createShare, listShares } from '@/share'
import { userParams } from '@/store'
import { notification } from 'ant-design-vue'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const open = defineModel<boolean>('open', { required: true })

watch(open, (value) => {
  if (value) {
    loadShared()
  }
})

const title = ref('')

const createLoading = ref(false)
const getLoading = ref(true)
const shared = ref([])

const createDisabled = computed(() => userParams.value.length === 0)

const linkCounter = ref(0)
const link = computed(() => {
  linkCounter.value
  return location.href
})

function copyLink() {
  if (!navigator || !navigator.clipboard) {
    notification.error({ message: 'Copying to clipboard is not supported in your browser' })
    return
  }
  navigator.clipboard.writeText(link.value)
  notification.success({ message: 'Link copied!' })
}

async function shareRanking() {
  if (!title.value) {
    notification.error({ message: 'Please enter a title!' })
    return
  }
  createLoading.value = true
  await createShare({ name: title.value, params: location.hash.slice(1) })
  notification.success({ message: 'Ranking shared!' })
  createLoading.value = false
  title.value = ''
  loadShared()
}

async function loadShared() {
  getLoading.value = true
  const shares = await listShares()
  if (!shares.success) {
    notification.error({ message: 'Failed to load shared rankings' })
    return
  }
  shared.value = shares.data.map((share: any) => ({
    ...share,
    params: loadHash(share.params).map((param) => ({
      ...param,
      param: params.find((p) => p.id === param.id)
    }))
  }))
  getLoading.value = false
}

function visit(item: any) {
  userParams.value = item.params.map((param: any) => ({
    id: param.id,
    importance: param.importance,
    args: param.args
  }))
  open.value = false
}

function renderParam(param: any) {
  let text = `${param.param.name}: ${param.importance}%`
  if (Object.keys(param.args).length > 0) {
    text += ' ('
    text += Object.values(param.args).join(', ')
    text += ')'
  }
  return text
}

function onHashChange() {
  linkCounter.value++
}

onMounted(() => {
  loadShared()
  window.addEventListener('hashchange', onHashChange)
})

onUnmounted(() => {
  window.removeEventListener('hashchange', onHashChange)
})
</script>

<template>
  <ADrawer v-model:open="open" class="share-drawer">
    <h2>Share rankings</h2>
    <p>You can copy the link below to share your current ranking with others:</p>
    <AInputGroup compact style="display: flex">
      <AInput :value="link" readonly></AInput>
      <AButton @click="copyLink">Copy</AButton>
    </AInputGroup>
    <p>Or you can share your ranking with everyone:</p>
    <AInputGroup compact style="display: flex">
      <AInput placeholder="Enter a title..." v-model:value="title" style="flex: 1 0 0"></AInput>
      <AButton
        type="primary"
        @click="shareRanking"
        :loading="createLoading"
        :disabled="createDisabled"
        >Share!</AButton
      >
    </AInputGroup>
    <p>Rankings that other people shared:</p>
    <AList
      :data-source="shared"
      :loading="getLoading"
      :locale="{ emptyText: 'No shared rankings yet' }"
    >
      <template #renderItem="{ item }">
        <AListItem>
          <AListItemMeta :title="item.name">
            <template #description>
              <div v-for="param in item.params" :key="param.id">
                {{ renderParam(param) }}
              </div>
            </template>
          </AListItemMeta>
          <template #actions>
            <AButton type="link" @click="visit(item)">View</AButton>
          </template>
        </AListItem>
      </template>
    </AList>
  </ADrawer>
</template>

<style scoped>
.share-drawer p {
  margin: 8px 0;
}
</style>
