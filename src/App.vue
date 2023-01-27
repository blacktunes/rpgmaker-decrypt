<template>
  <div class="loading" v-show="state.loading">
    <n-spin size="large" stroke="#000" />
  </div>
  <div @drop="dropDir" @dragover.prevent="">
    <SelectDir v-if="!state.ready" />
    <Home v-else />
  </div>
</template>

<script setup lang="ts">
import SelectDir from './components/SelectDir.vue'
import Home from './components/Home.vue'
import { state, previweItem } from './store'
import { checkDir } from './assets/scripts/utils'
import './assets/scripts/keyboard'
import './assets/scripts/event'

const dropDir = (e: DragEvent) => {
  if (e.dataTransfer?.files[0].path) {
    checkDir(e.dataTransfer.files[0].path)
    previweItem.name = ''
    previweItem.path = ''
  }
}
</script>

<style scoped>
.loading {
  z-index: 999;
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
}
</style>
