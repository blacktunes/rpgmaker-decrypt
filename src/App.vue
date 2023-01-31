<template>
  <Transition name="fade">
    <div class="loading" v-show="state.loading">
      <n-spin size="large" stroke="#222">
        <template #description>
          <span style="user-select: none;color: #222;">
            {{ state.filesNum }}
          </span>
        </template>
      </n-spin>
    </div>
  </Transition>
  <Transition name="fade">
    <div class="writing" v-show="state.writing.show">
      <n-progress type="circle" :percentage="percentage" processing color="#d03050" />
      <span style="text-align: center;color: #222;">
        {{ state.writing.percentage }}/{{ state.writing.total }}
      </span>
    </div>
  </Transition>
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
  if (e.dataTransfer?.files?.[0]?.path) {
    checkDir(e.dataTransfer.files[0].path)
    previweItem.name = ''
    previweItem.path = ''
  }
}

const percentage = computed(() => (state.writing.percentage / state.writing.total * 100) | 0)
</script>

<style lang="scss">
.loading,
.writing {
  z-index: 999;
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
}

.first-enter-to,
.first-leave-from {
  filter: blur(0)
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1
}
</style>
