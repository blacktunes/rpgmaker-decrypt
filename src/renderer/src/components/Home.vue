<template>
  <div class="home">
    <Sidebar
      class="sidebar"
      :class="{ 'sidebar-hide': !sideShow }"
      @item-click="itemClick"
    />
    <div class="main">
      <div class="topbar">
        <div class="btn switch">
          <NIcon
            size="25"
            color="#888"
            @click="sideShow = !sideShow"
          >
            <Menu />
          </NIcon>
        </div>
        <div class="text">
          <span
            v-show="preview.name"
            @click.stop="emitter.emit('scrollToItem')"
          >
            {{ preview.name }}
          </span>
        </div>
        <div class="btn save">
          <NTooltip trigger="hover">
            <template #trigger>
              <NIcon
                v-show="preview.path"
                size="25"
                color="#888"
                @click="saveCurrentFile"
              >
                <Save />
              </NIcon>
            </template>
            <span>保存当前预览</span>
          </NTooltip>
        </div>
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
import { preview, setting } from '@/store'
import { emitter } from '@/scripts/mitt'
import { saveCurrentFile } from '@/scripts/utils'

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
  if (/\.(mp3|ogg|m4a)$/i.test(e.name)) {
    preview.type = 'audio'
    setPreview(e.path)
    return
  }
  if (/\.(rpgmvo|ogg_|rpgmvm|m4a_)$/i.test(e.name)) {
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

const setPreview = (url: string, decode = false) => {
  let buffer = fs.readFileSync(url).buffer
  if (decode) {
    buffer = decryptBuffer(buffer, setting.encryptionKey)
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

      .btn
        box-sizing border-box
        display flex
        align-items center
        cursor pointer

      .switch
        opacity 0.1
        transition 0.2s

      .save
        padding 2px
        border-radius 5px

        &:hover
          background rgba(200, 200, 200, 0.3)

      .text
        flex 1
        text-align center
        user-select none

        span
          color #888
          font-weight bold
          cursor pointer

.sidebar-hide
  width 0
</style>
