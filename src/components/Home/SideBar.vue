<template>
  <div class="sidebar">
    <NInput
      class="search"
      v-model:value="sidebar.search"
      placeholder="搜索"
      clearable
      @keydown.esc="sidebar.search = ''"
    />
    <NTree
      class="tree"
      :animated="false"
      block-line
      block-node
      :cancelable="false"
      :data="data"
      expand-on-click
      :expanded-keys="expandedKeys"
      :keyboard="false"
      key-field="path"
      label-field="name"
      :node-props="nodeProps"
      :pattern="sidebar.search"
      :render-prefix="renderPrefix"
      :selected-keys="selectedKeys"
      :show-irrelevant-nodes="false"
      show-line
      virtual-scroll
      @update:expanded-keys="updateExpandedKeys"
      ref="treeRef"
    >
      <template #empty>
        <div class="empty">
          <NIcon
            size="50"
            depth="5"
          >
            <Empty />
          </NIcon>
        </div>
      </template>
    </NTree>
  </div>
</template>

<script setup lang="tsx">
import { NTree, NIcon } from 'naive-ui'
import { Empty } from '@/components/Common/Icon'
import { TreeOption } from 'naive-ui/es/tree/src/interface'
import { setting, sidebar } from '@/store'
import { emitter } from '@/assets/scripts/mitt'
import {
  FolderOpenOutline,
  Folder,
  ImageOutline,
  VideocamOutline,
  SoundOutlined,
  DocumentTextOutline,
  FileUnknownOutlined
} from '@/components/Common/Icon'

const emit = defineEmits<{
  (
    event: 'itemClick',
    item: {
      name: string
      path: string
    }
  ): void
}>()

const treeRef = ref<InstanceType<typeof NTree> | null>(null)

const data = computed(() => [setting.imageFileTree || {}, setting.audioFileTree || {}])
watch(data, () => {
  expandedKeys.value = [path.join(setting.baseUrl, 'img')]
})

const expandedKeys = ref<string[]>([
  path.join(setting.baseUrl, 'img'),
  path.join(setting.baseUrl, 'audio')
])

const nodeProps = ({ option }: { option: TreeOption }) => {
  return {
    onClick() {
      if (option.children !== undefined) return
      sidebar.select = {
        name: option.name as string,
        path: option.path as string
      }
      emit('itemClick', {
        name: option.name as string,
        path: option.path as string
      })
    }
  }
}

const renderPrefix = ({ option }: { option: TreeOption }) => {
  if (option.children !== undefined) {
    if (expandedKeys.value.includes(option.path as string)) {
      return (
        <NIcon>
          <FolderOpenOutline />
        </NIcon>
      )
    } else {
      return (
        <NIcon>
          <Folder />
        </NIcon>
      )
    }
  } else {
    if (/\.(png|jpg|jpeg|webp|gif|rpgmvp|png_)$/i.test(option.path as string)) {
      return (
        <NIcon>
          <ImageOutline />
        </NIcon>
      )
    }
    if (/\.(webm|mp4|avi)$/i.test(option.path as string)) {
      return (
        <NIcon>
          <VideocamOutline />
        </NIcon>
      )
    }
    if (/\.(ogg|mp3|m4a|rpgmvo|ogg_|rpgmvm|m4a_)$/i.test(option.path as string)) {
      return (
        <NIcon>
          <SoundOutlined />
        </NIcon>
      )
    }
    if (/\.(txt|json)$/i.test(option.path as string)) {
      return (
        <NIcon>
          <DocumentTextOutline />
        </NIcon>
      )
    }
  }
  return (
    <NIcon>
      <FileUnknownOutlined />
    </NIcon>
  )
}

const selectedKeys = computed(() => (sidebar.select ? [sidebar.select.path] : []))

const updateExpandedKeys = (keys: string[]) => {
  expandedKeys.value = keys
}

const setExpanded = (url: string) => {
  if (path.relative(url, setting.baseUrl) === '') return
  const temp = path.join(url, '..')
  if (!expandedKeys.value.includes(temp)) {
    expandedKeys.value.push(temp)
  }
  setExpanded(temp)
}

const setHighlight = async () => {
  if (sidebar.select?.path) {
    setExpanded(sidebar.select.path)
    await nextTick()
    treeRef.value?.scrollTo({
      key: sidebar.select.path
    })
  }
}

watch(selectedKeys, () => {
  if (sidebar.select?.path) {
    setHighlight()
    emit('itemClick', {
      name: sidebar.select.name,
      path: sidebar.select.path
    })
  }
})

emitter.on('scrollToItem', setHighlight)
</script>

<style lang="stylus" scoped>
.sidebar
  overflow hidden
  box-sizing border-box
  display flex
  flex-direction column
  width 350px
  height 100%
  border-right 2px solid rgba(200, 200, 200, 0.4)
  transition width 0.2s

  .search
    width calc(100% - 10px)
    margin 5px

  .tree
    flex 1
    width 100%

.empty
  display flex
  flex-direction column
  justify-content center
  align-items center
  height 100%
</style>
