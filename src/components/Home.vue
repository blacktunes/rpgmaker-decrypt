<template>
  <div class="home">
    <Sidebar
      class="sidebar"
      :class="{ 'sidebar-hide': !sideShow }"
      @itemClick="itemClick"
    />
    <div class="main">
      <div class="topbar">
        <div class="switch">
          <NIcon
            size="25"
            @click="sideShow = !sideShow"
          >
            <Menu />
          </NIcon>
        </div>
        <div class="text">
          <NTag
            v-show="preview.name"
            size="large"
            round
            style="cursor: pointer"
            @click.stop="emitter.emit('scrollToItem')"
          >
            {{ preview.name }}
          </NTag>
        </div>
        <NButton
          @click="save"
          v-show="preview.path"
          circle
        >
          <template #icon>
            <Save />
          </template>
        </NButton>
      </div>
      <Preview
        v-show="preview.path"
        :item="preview"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './Home/Sidebar.vue'
import Preview from './Home/Preview.vue'
import { Menu, Save } from '@/components/Common/Icon'
import { preview } from '@/store'
import { emitter } from '@/assets/scripts/mitt'
import { decryptBuffer } from '@/assets/scripts/utils'

const sideShow = ref(true)

const itemClick = (e: { name: string; path: string }) => {
  preview.name = e.name
  if (/\.(webm|mp4|avi)$/i.test(e.name)) {
    preview.type = 'video'
    setPreview(e.path)
    return
  }
  if (/\.(png|jpg|jpeg|webp|gif)$/i.test(e.name)) {
    preview.type = 'image'
    setPreview(e.path)
    return
  }
  if (/\.(rpgmvp|png_)$/i.test(e.name)) {
    preview.type = 'image'
    setPreview(e.path, true)
    return
  }
  if (/\.(ogg|mp3)$/i.test(e.name)) {
    preview.type = 'audio'
    setPreview(e.path)
    return
  }
  if (/\.(m4a)$/i.test(e.name)) {
    preview.type = 'audio'
    setPreview(e.path)
    return
  }
  if (/\.(rpgmvo|ogg_)$/i.test(e.name)) {
    preview.type = 'audio'
    setPreview(e.path, true)
    return
  }
  if (/\.(rpgmvm|m4a_)$/i.test(e.name)) {
    preview.type = 'audio'
    setPreview(e.path, true)
    return
  }
  if (/\.(txt|json)$/i.test(e.name)) {
    preview.type = 'text'
    setPreviewText(e.path)
    return
  }
  preview.type = 'other'
}

const save = () => {
  const link = document.createElement('a')
  link.href = preview.path
  link.download = preview.name
    .replace(/\.(rpgmvp|png_)$/i, '.png')
    .replace(/\.(rpgmvo|ogg_)$/i, '.ogg')
    .replace(/\.(rpgmvm|m4a_)$/i, '.m4a')
  link.click()
}

const setPreview = (url: string, decode = false) => {
  let buffer = fs.readFileSync(url).buffer
  if (decode) {
    buffer = decryptBuffer(buffer)
  }
  URL.revokeObjectURL(preview.path)
  preview.path = URL.createObjectURL(new Blob([buffer]))
}

const setPreviewText = async (url: string) => {
  const text = await fs.readFile(url, 'utf-8')
  preview.text = text
}
</script>

<style lang="stylus" scoped>
.home
  display flex
  height 100vh
  width 100vw

  .main
    flex 1
    height 100%
    display flex
    flex-direction column

    .topbar
      box-sizing border-box
      display flex
      align-items center
      height 34px
      margin 5px

      &:hover
        .switch
          opacity 1

      .switch
        box-sizing border-box
        display flex
        align-items center
        opacity 0.1
        transition 0.2s
        cursor pointer

      .text
        flex 1
        text-align center
        user-select none

.sidebar-hide
  width 0
</style>
