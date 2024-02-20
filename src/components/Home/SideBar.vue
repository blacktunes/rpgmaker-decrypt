<template>
  <div class="sidebar">
    <n-input
      class="search"
      v-model:value="sidebar.search"
      placeholder="搜索"
      clearable
      @keydown.esc="sidebar.search = ''"
    />
    <n-tree
      class="tree"
      block-line
      :pattern="sidebar.search"
      :data="data"
      key-field="path"
      label-field="name"
      expand-on-click
      :show-irrelevant-nodes="false"
      :cancelable="false"
      :keyboard="false"
      selectable
      show-line
      :nodeProps="nodeProps"
      virtual-scroll
      :render-prefix="renderPrefix"
      :selected-keys="selectedKeys"
      @update:selected-keys="updateSelectedKeys"
      :expanded-keys="expandedKeys"
      @update:expanded-keys="updateExpandedKeys"
      ref="treeRef"
    >
      <template #empty>
        <div class="empty">
          <NIcon
            size="50"
            depth="5"
          >
            <svg
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M26 7.5C26 11.0899 23.0899 14 19.5 14C15.9101 14 13 11.0899 13 7.5C13 3.91015 15.9101 1 19.5 1C23.0899 1 26 3.91015 26 7.5ZM16.8536 4.14645C16.6583 3.95118 16.3417 3.95118 16.1464 4.14645C15.9512 4.34171 15.9512 4.65829 16.1464 4.85355L18.7929 7.5L16.1464 10.1464C15.9512 10.3417 15.9512 10.6583 16.1464 10.8536C16.3417 11.0488 16.6583 11.0488 16.8536 10.8536L19.5 8.20711L22.1464 10.8536C22.3417 11.0488 22.6583 11.0488 22.8536 10.8536C23.0488 10.6583 23.0488 10.3417 22.8536 10.1464L20.2071 7.5L22.8536 4.85355C23.0488 4.65829 23.0488 4.34171 22.8536 4.14645C22.6583 3.95118 22.3417 3.95118 22.1464 4.14645L19.5 6.79289L16.8536 4.14645Z"
                fill="currentColor"
              ></path>
              <path
                d="M25 22.75V12.5991C24.5572 13.0765 24.053 13.4961 23.5 13.8454V16H17.5L17.3982 16.0068C17.0322 16.0565 16.75 16.3703 16.75 16.75C16.75 18.2688 15.5188 19.5 14 19.5C12.4812 19.5 11.25 18.2688 11.25 16.75L11.2432 16.6482C11.1935 16.2822 10.8797 16 10.5 16H4.5V7.25C4.5 6.2835 5.2835 5.5 6.25 5.5H12.2696C12.4146 4.97463 12.6153 4.47237 12.865 4H6.25C4.45507 4 3 5.45507 3 7.25V22.75C3 24.5449 4.45507 26 6.25 26H21.75C23.5449 26 25 24.5449 25 22.75ZM4.5 22.75V17.5H9.81597L9.85751 17.7041C10.2905 19.5919 11.9808 21 14 21L14.215 20.9947C16.2095 20.8953 17.842 19.4209 18.184 17.5H23.5V22.75C23.5 23.7165 22.7165 24.5 21.75 24.5H6.25C5.2835 24.5 4.5 23.7165 4.5 22.75Z"
                fill="currentColor"
              ></path>
            </svg>
          </NIcon>
        </div>
      </template>
    </n-tree>
  </div>
</template>

<script setup lang="tsx">
import { setting, sidebar } from '../../store'
import { TreeOption } from 'naive-ui/es/tree/src/interface'
import { emitter } from '../../assets/scripts/mitt'
import { NIcon } from 'naive-ui'
import {
  FolderOpenOutline,
  Folder,
  ImageOutline,
  VideocamOutline,
  SoundOutlined,
  DocumentTextOutline,
  File
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

const treeRef = ref()

const selectedKeys = computed(() => [setting.filesList[setting.previewIndex]?.path || ''])

const setExpanded = (url: string) => {
  if (path.relative(url, setting.baseUrl) === '') return
  const temp = path.join(url, '..')
  if (!expandedKeys.value.includes(temp)) {
    expandedKeys.value.push(temp)
  }
  setExpanded(temp)
}

const setHighlight = () => {
  setExpanded(setting.filesList[setting.previewIndex].path)
  treeRef.value.scrollTo({
    key: setting.filesList[setting.previewIndex].path
  })
}

watch(selectedKeys, () => {
  if (setting.filesList[setting.previewIndex]?.path) {
    setHighlight()
    emit('itemClick', {
      name: setting.filesList[setting.previewIndex].name,
      path: setting.filesList[setting.previewIndex].path
    })
  }
})

emitter.on('scrollToItem', setHighlight)

const updateSelectedKeys = (keys: string[]) => {
  const index = setting.filesList.findIndex((item) => item.path === keys[0])
  if (index !== -1) {
    setting.previewIndex = index
  }
}

const expandedKeys = ref<string[]>([
  path.join(setting.baseUrl, 'img'),
  path.join(setting.baseUrl, 'audio')
])

const updateExpandedKeys = (keys: string[]) => {
  expandedKeys.value = keys
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
      <File />
    </NIcon>
  )
}

const data = computed(() => [setting.imageFileTree || {}, setting.audioFileTree || {}])
watch(data, () => {
  expandedKeys.value = [path.join(setting.baseUrl, 'img')]
})

const nodeProps = ({ option }: { option: TreeOption }) => {
  return {
    onClick() {
      if (option.children) return
      emit('itemClick', {
        name: option.name as string,
        path: option.path as string
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.sidebar
  box-sizing border-box
  display flex
  flex-direction column
  width 350px
  height 100%
  border-right 2px solid rgba(200, 200, 200, 0.4)

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
