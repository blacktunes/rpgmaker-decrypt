<template>
  <div
    class="sidebar"
    :style="{ width: showSlideBar ? '300px' : '0px' }"
  >
    <n-icon
      size="30"
      class="icon"
      :style="{ left: showSlideBar ? '300px' : '0px' }"
      @click.stop="showSlideBar = !showSlideBar"
    >
      <svg
        :style="{ transform: showSlideBar ? 'rotate(0deg)' : 'rotate(180deg)' }"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 24 24"
      >
        <path
          d="M4 18h11c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zm0-5h8c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zM3 7c0 .55.45 1 1 1h11c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1zm17.3 7.88L17.42 12l2.88-2.88a.996.996 0 1 0-1.41-1.41L15.3 11.3a.996.996 0 0 0 0 1.41l3.59 3.59c.39.39 1.02.39 1.41 0c.38-.39.39-1.03 0-1.42z"
          fill="currentColor"
        ></path>
      </svg>
    </n-icon>
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
      children-field="children"
      :show-irrelevant-nodes="false"
      :animated="false"
      :cancelable="false"
      :keyboard="false"
      expand-on-click
      selectable
      :nodeProps="nodeProps"
      virtual-scroll
      :selected-keys="selectedKeys"
      @update:selected-keys="updateSelectedKeys"
      :expanded-keys="expandedKeys"
      @update:expanded-keys="updateExpandedKeys"
      ref="treeRef"
    />
  </div>
</template>

<script setup lang="ts">
import { NInput, NTree } from 'naive-ui'
import { setting, sidebar } from '../../store'
import { TreeOption } from 'naive-ui/es/tree/src/interface'
import { emitter } from '../../assets/scripts/mitt'

const showSlideBar = ref(true)

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

const expandedKeys = ref<string[]>([path.join(setting.filePath, 'img')])

const updateExpandedKeys = (keys: string[]) => {
  expandedKeys.value = keys
}

const data = computed(() => [setting.imageFileTree || {}, setting.audioFileTree || {}])
watch(data, () => {
  expandedKeys.value = [path.join(setting.filePath, 'img')]
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

<style lang="scss" scoped>
.sidebar {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  border-right: 2px solid #eee;
  transition: 0.25s;

  .icon {
    position: absolute;
    bottom: 5px;
    border: 2px solid #eee;
    border-radius: 0 5px 5px 0;
    border-left: none;
    background: #fff;
    transition: 0.25s;
    cursor: pointer;
  }

  .search {
    width: calc(300px - 10px);
    margin: 5px;
  }

  .tree {
    flex: 1;
    width: 300px;
  }
}
</style>
