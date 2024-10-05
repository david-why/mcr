<script setup lang="ts">
import params, { loadHash } from '@/params'
import { createShare, deleteShare, listShares } from '@/share'
import { isPrinting, userParams } from '@/store'
import { notification } from 'ant-design-vue'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import { DeleteOutlined, EyeOutlined, PrinterOutlined } from '@ant-design/icons-vue'

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

const deletingModalOpen = ref(false)
const deletingItem = ref({ name: '', id: '' })
const deleteLoading = ref(false)

const createDisabled = computed(() => userParams.value.length === 0)

const linkCounter = ref(0)
const link = computed(() => {
  linkCounter.value
  return location.href
})

async function printPage() {
  isPrinting.value = true
  await nextTick()
  window.print()
  isPrinting.value = false
}

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

function showDeleteModal(item: any) {
  deletingModalOpen.value = true
  deletingItem.value = item
}

async function deleteItem() {
  deleteLoading.value = true
  try {
    const result = await deleteShare(deletingItem.value.id)
    if (!result.success) throw new Error('Failed to delete share')
    notification.success({ message: 'Share deleted!' })
    loadShared()
  } catch (e) {
    console.error(e)
    notification.error({ message: 'Failed to delete share' })
  } finally {
    deletingModalOpen.value = false
    deleteLoading.value = false
  }
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
    <p>
      You can
      <AButton @click="printPage"><PrinterOutlined></PrinterOutlined> Print</AButton>
      your ranking, or copy the link below to share your ranking with others:
    </p>
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
            <ATooltip title="View share">
              <a href="javascript:void(0)" @click="visit(item)"><EyeOutlined></EyeOutlined></a>
            </ATooltip>
            <ATooltip title="Delete share">
              <a href="javascript:void(0)" @click="showDeleteModal(item)">
                <DeleteOutlined style="color: red"></DeleteOutlined>
              </a>
            </ATooltip>
          </template>
        </AListItem>
      </template>
    </AList>
  </ADrawer>
  <AModal
    v-model:open="deletingModalOpen"
    ok-text="Yes"
    :title="`Are you sure you want to delete the share &quot;${deletingItem.name}&quot;?`"
    :confirm-loading="deleteLoading"
    @ok="deleteItem"
    @cancel="deletingModalOpen = false"
  >
    Please delete only your shares or shares that are inappropriate. Deleting someone else's share
    for no reason is not nice.
  </AModal>
</template>

<style scoped>
.share-drawer p {
  margin: 8px 0;
}
:deep(.ant-list-item-action) a {
  font-size: 20px !important;
}
</style>
