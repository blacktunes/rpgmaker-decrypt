<template>
  <div
    class="drop-view"
    @drop="onDrop"
    @dragover.prevent
    @dragenter="hover = true"
  >
    <Transition name="blur-fade">
      <div
        v-if="hover"
        class="drop-tip"
        @dragleave="hover = false"
      >
        <NIcon
          size="100"
          :color="themeVars.infoColor"
        >
          <DownloadingRound />
        </NIcon>
      </div>
    </Transition>
    <slot v-if="state.ready"></slot>
    <div
      v-else
      class="select"
      @click="onClick"
    >
      <NText>点击或者拖动文件夹到该区域来加载游戏资源</NText>
      <NP depth="3"> 该工具可以查看RPGMakerMV/MZ常规加密的图片和音频 </NP>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { state } from '@/store'
import { checkDir } from '@/assets/scripts/utils'
import { DownloadingRound } from '@/components/Common/Icon'
import { useThemeVars } from 'naive-ui'

const themeVars = useThemeVars()

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
</script>

<style lang="stylus" scoped>
.drop-view
  position relative

  .drop-tip
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
      border 2px dashed v-bind('themeVars.infoColor')
      border-radius 10px

  .select
    position relative
    display flex
    flex-direction column
    justify-content center
    align-items center
    width 100vw
    height 100vh
    cursor pointer
    user-select none
    font-size 16px

    span
      font-weight bold

    p
      margin-top 5px

    &:hover
      &:before
        border-color v-bind('themeVars.infoColor')

    &:before
      content ''
      position absolute
      inset 10px
      border 2px dashed #666
      border-radius 10px
      transition border-color 0.3s
      pointer-events none

.blur-fade-enter-active, .blur-fade-leave-active
  transition 0.1s

.blur-fade-enter-from, .blur-fade-leave-to
  opacity 0
  backdrop-filter blur(0)

.blur-fade-enter-to, .blur-fade-leave-from
  opacity 1
  backdrop-filter blur(3px)
</style>
