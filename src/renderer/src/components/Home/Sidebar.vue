<template>
  <div class="sidebar">
    <NInput
      v-model:value="sidebar.search"
      class="search"
      placeholder="搜索"
      clearable
      @keydown.stop="resetSearch"
    />
    <NTree
      ref="treeRef"
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
      :render-label="renderLabel"
      :selected-keys="selectedKeys"
      :show-irrelevant-nodes="false"
      show-line
      virtual-scroll
      @update:expanded-keys="updateExpandedKeys"
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
    <div class="button-list">
      <NTooltip
        trigger="hover"
        class="tip"
      >
        <template #trigger>
          <NIcon
            depth="3"
            class="btn"
            @click="scrollTo('top')"
          >
            <VerticalAlignTopOutlined />
          </NIcon>
        </template>
        <span>滚动到顶部</span>
      </NTooltip>
      <NTooltip trigger="hover">
        <template #trigger>
          <NIcon
            depth="3"
            class="btn"
            @click="scrollTo('bottom')"
          >
            <VerticalAlignBottomOutlined />
          </NIcon>
        </template>
        <span>滚动到底部</span>
      </NTooltip>
      <NTooltip trigger="hover">
        <template #trigger>
          <NIcon
            depth="3"
            class="btn"
            @click="updateExpandedKeys([])"
          >
            <CollapseAll />
          </NIcon>
        </template>
        <span>折叠文件夹</span>
      </NTooltip>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { NTree, NIcon, NTag } from 'naive-ui'
import { Empty } from '@/components/Common/Icon'
import { TreeOption } from 'naive-ui/es/tree/src/interface'
import { setting, sidebar } from '@/store'
import { symbol } from '@/scripts/utils'
import { emitter } from '@/scripts/mitt'
import {
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined,
  CollapseAll,
  FolderOutline,
  FolderOpen,
  ImageOutline,
  Image,
  VideocamOutline,
  Videocam,
  SoundOutlined,
  SoundFilled,
  DocumentTextOutline,
  DocumentText,
  FileUnknownOutlined,
  FileUnknownFilled
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

const resetSearch = (e: KeyboardEvent) => {
  if (e.code === 'Escape') {
    sidebar.search = ''
    ;(e.target as HTMLInputElement).blur()
  }
}

const treeRef = ref<InstanceType<typeof NTree> | null>(null)

const data = computed(() => [setting.imageFileTree || {}, setting.audioFileTree || {}])
watch(data, () => {
  expandedKeys.value = [path.join(setting.baseUrl, 'img')]
})

const expandedKeys = ref<string[]>([
  path.join(setting.baseUrl, 'img'),
  path.join(setting.baseUrl, 'audio')
])
emitter.on('reload', () => {
  expandedKeys.value = [path.join(setting.baseUrl, 'img'), path.join(setting.baseUrl, 'audio')]
})

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
  const key = option.path as string

  if (option.children !== undefined) {
    if (expandedKeys.value.includes(key)) {
      return (
        <NIcon>
          <FolderOpen />
        </NIcon>
      )
    } else {
      return (
        <NIcon>
          <FolderOutline />
        </NIcon>
      )
    }
  } else {
    if (/\.(png|jpg|jpeg|webp|gif|rpgmvp|png_)$/i.test(key)) {
      if (sidebar.select?.path === key) {
        return (
          <NIcon>
            <Image />
          </NIcon>
        )
      } else {
        return (
          <NIcon>
            <ImageOutline />
          </NIcon>
        )
      }
    }
    if (/\.(webm|mp4|avi)$/i.test(key)) {
      if (sidebar.select?.path === key) {
        return (
          <NIcon>
            <Videocam />
          </NIcon>
        )
      } else {
        return (
          <NIcon>
            <VideocamOutline />
          </NIcon>
        )
      }
    }
    if (/\.(ogg|mp3|m4a|rpgmvo|ogg_|rpgmvm|m4a_)$/i.test(key)) {
      if (sidebar.select?.path === key) {
        return (
          <NIcon>
            <SoundFilled />
          </NIcon>
        )
      } else {
        return (
          <NIcon>
            <SoundOutlined />
          </NIcon>
        )
      }
    }
    if (/\.(txt|json)$/i.test(key)) {
      if (sidebar.select?.path === key) {
        return (
          <NIcon>
            <DocumentText />
          </NIcon>
        )
      } else {
        return (
          <NIcon>
            <DocumentTextOutline />
          </NIcon>
        )
      }
    }
  }
  if (sidebar.select?.path === key) {
    return (
      <NIcon>
        <FileUnknownFilled />
      </NIcon>
    )
  } else {
    return (
      <NIcon>
        <FileUnknownOutlined />
      </NIcon>
    )
  }
}

const renderLabel = ({ option }: { option: TreeOption }) => {
  const name = option.name as string
  if (option.root) {
    if (option.root === symbol.image) {
      return (
        <>
          图片
          <NTag
            size="small"
            style="margin-left: 5px;pointer-events: none;"
          >
            {sidebar.currentImageList.length}
          </NTag>
        </>
      )
    }
    if (option.root === symbol.audio) {
      return (
        <>
          音频
          <NTag
            size="small"
            style="margin-left: 5px;pointer-events: none;"
          >
            {sidebar.currentAudioList.length}
          </NTag>
        </>
      )
    }
  }
  return name
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

const scrollTo = (type: 'top' | 'bottom') => {
  if (treeRef.value) {
    treeRef.value.scrollTo({ position: type })
  }
}

emitter.on('scrollToItem', setHighlight)
</script>

<style lang="stylus" scoped>
.tip, .btn, span
  user-select none
  -webkit-user-drag none

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

  .button-list
    display flex
    justify-content flex-end
    align-items center
    gap 2px
    height 25px
    padding 0 5px
    background #eee

    .btn
      padding 2px
      border-radius 2px
      cursor pointer
      background transparent

      &:hover
        background rgba(200, 200, 200, 0.5)

.empty
  display flex
  flex-direction column
  justify-content center
  align-items center
  height 100%
</style>
