<template>
  <div class="home">
    <div v-show="!state.loading" class="select-btn" @click="selectDir">
      点击选择或拖入游戏目录
    </div>
  </div>
</template>

<script setup lang="ts">
import { state } from '../store'
import { checkDir } from '../assets/scripts/utils'

const selectDir = () => {
  ipcRenderer.invoke('select-dir')
    .then(res => {
      if (res.canceled) return
      checkDir(res.filePaths[0])
    })
}

</script>

<style lang="scss" scoped>
.home {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  .select-btn {
    border-radius: 5px;
    padding: 10px;
    border: 1px solid #eee;
    user-select: none;
    cursor: pointer;
  }
}
</style>
