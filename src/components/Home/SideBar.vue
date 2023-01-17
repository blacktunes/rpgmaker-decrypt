<template>
  <div class="sidebar">
    <n-input v-model:value="pattern" placeholder="搜索" />
    <n-tree
      block-line
      :pattern="pattern"
      :data="data"
      :default-expanded-keys="defaultExpanded"
      key-field="path"
      label-field="name"
      children-field="children"
      :show-irrelevant-nodes="false"
      :animated="false"
      expand-on-click
      selectable
      :nodeProps="nodeProps"
      virtual-scroll
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NInput, NTree } from 'naive-ui'
import { setting } from '../../store'
import { TreeOption } from 'naive-ui/es/tree/src/interface'

const emit = defineEmits<{
  (event: 'itemClick', item: {
    name: string
    path: string
  }): void
}>()

const defaultExpanded = ref([path.join(setting.filePath, 'img')])
const pattern = ref('')
const data = computed(() => [setting.imageFileTree, setting.audioFileTree])
watch(data, () => {
  defaultExpanded.value = [path.join(setting.filePath, 'img')]
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
