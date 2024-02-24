<template>
  <Loading />
  <Progress />
  <div
    class="window"
    @drop="onDrop"
    @dragover.prevent
    @dragenter="hover = true"
  >
    <Transition name="blur-fade">
      <div
        class="drop-wrapper"
        v-if="hover"
        @dragleave="hover = false"
      >
        <NIcon
          size="100"
          color="#666"
        >
          <DownloadingRound />
        </NIcon>
      </div>
    </Transition>
    <Home v-if="state.ready" />
    <div
      class="select-wrapper"
      @click="onClick"
      v-else
    >
      <div class="select">
        <NText style="font-size: 16px">点击或者拖动文件夹到该区域来加载游戏资源</NText>
        <NP
          depth="3"
          style="margin: 5px 0 0 0"
        >
          该工具可以查看RPGMakerMV/MZ加密的图片和音频
        </NP>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { state } from './store'
import { checkDir } from './assets/scripts/utils'
import { DownloadingRound } from './components/Common/Icon'

const hover = ref(false)

const onDrop = (e: DragEvent) => {
  hover.value = false
  if (e.dataTransfer?.files?.[0]?.path) {
    checkDir(e.dataTransfer.files[0].path)
  }
}

const onClick = () => {
  ipcRenderer.invoke('select-dir').then((res) => {
    if (res.canceled) return
    checkDir(res.filePaths[0])
  })
}

onMounted(() => {
  window.onerror = null
  ipcRenderer.send('ready')
})
</script>

<style lang="stylus" scoped>
.window
  position relative

  .drop-wrapper
    z-index 9
    position absolute
    inset 0
    display flex
    justify-content center
    align-items center

    &:before
      content ''
      position absolute
      inset 0
      backdrop-filter blur(3px)

    &:after
      content ''
      position absolute
      inset 10px
      border 2px dashed #666
      border-radius 10px

.select-wrapper
  position relative
  width 100vw
  height 100vh

.select
  display flex
  flex-direction column
  justify-content center
  align-items center
  width 100%
  height 100%
  cursor pointer
  user-select none

  &:hover
    &:before
      border-color #18a058

  &:before
    content ''
    position absolute
    inset 10px
    border 2px dashed #666
    border-radius 10px
    transition border-color 0.3s
    pointer-events none
</style>
