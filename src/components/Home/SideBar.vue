<template>
  <div class="sidebar">
    <n-input v-model:value="sidebar.search" placeholder="搜索" />
    <n-tree
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

const emit = defineEmits<{
  (event: 'itemClick', item: {
    name: string
    path: string
  }): void
}>()

const treeRef = ref()

const selectedKeys = computed(() => [setting.filesList[setting.previweIndex]?.path || ''])

const setExpanded = (url: string) => {
  if (path.relative(url, setting.baseUrl) === '') return
  const temp = path.join(url , '..')
  if (!expandedKeys.value.includes(temp)) {
    expandedKeys.value.push(temp)
  }
  setExpanded(temp)
}

watch(selectedKeys, () => {
  if (setting.filesList[setting.previweIndex]?.path) {
    setExpanded(setting.filesList[setting.previweIndex].path)

    treeRef.value.scrollTo({
      key: setting.filesList[setting.previweIndex].path
    })
    emit('itemClick', {
      name: setting.filesList[setting.previweIndex].name,
      path: setting.filesList[setting.previweIndex].path
    })
  }
})

const updateSelectedKeys = (keys: string[]) => {
  const index = setting.filesList.findIndex(item => item.path === keys[0])
  if (index !== -1) {
    setting.previweIndex = index
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
  display: flex;
  flex-direction: column;
}
</style>
