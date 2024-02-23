<template>
  <Loading />
  <Transition name="blur-fade">
    <div
      class="writing"
      v-show="state.writing.show"
    >
      <NProgress
        type="circle"
        :percentage="percentage"
        processing
        color="#d03050"
      />
      <span style="text-align: center; color: #222">
        {{ state.writing.percentage }}/{{ state.writing.total }}
      </span>
    </div>
  </Transition>
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 24 24"
          >
            <g
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M19 11V9a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path>
              <path d="M13 13l9 3l-4 2l-2 4l-3-9"></path>
              <path d="M3 3v.01"></path>
              <path d="M7 3v.01"></path>
              <path d="M11 3v.01"></path>
              <path d="M15 3v.01"></path>
              <path d="M3 7v.01"></path>
              <path d="M3 11v.01"></path>
              <path d="M3 15v.01"></path>
            </g>
          </svg>
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
import Home from './components/Home.vue'
import { state } from './store'
import { checkDir } from './assets/scripts/utils'

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

const percentage = computed(() => ((state.writing.percentage / state.writing.total) * 100) | 0)

onMounted(() => {
  window.onerror = null
  ipcRenderer.send('ready')
})
</script>

<style lang="stylus" scoped>
.loading, .writing
  z-index 999
  position fixed
  inset 0
  display flex
  flex-direction column
  justify-content center
  align-items center
  backdrop-filter blur(3px)

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
