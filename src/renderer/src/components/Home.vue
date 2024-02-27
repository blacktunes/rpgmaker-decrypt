<template>
  <div class="home">
    <Sidebar
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
                v-if="preview.path && preview.type !== 'error'"
                size="25"
                color="#888"
                @click="saveCurrentFile"
              >
                <Save />
              </NIcon>
              <div
                v-else
                style="width: 25px"
              ></div>
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
import {
  notification,
  saveCurrentFile,
  isVideo,
  isText,
  isEncryptedAudio,
  isEncryptedImage,
  isUnencryptedAudio,
  isUnencryptedImage
} from '@/scripts/utils'

const sideShow = ref(true)

const itemClick = (e: { name: string; path: string }) => {
  preview.name = e.name
  preview.path = ''
  preview.text = ''
  if (isVideo(e.name)) {
    preview.type = 'video'
    setPreview(e.path)
    return
  }
  if (isUnencryptedImage(e.name)) {
    preview.type = 'image'
    setPreview(e.path)
    return
  }
  if (isEncryptedImage(e.name)) {
    preview.type = 'image'
    setPreview(e.path, true)
    return
  }
  if (isUnencryptedAudio(e.name)) {
    preview.type = 'audio'
    setPreview(e.path)
    return
  }
  if (isEncryptedAudio(e.name)) {
    preview.type = 'audio'
    setPreview(e.path, true)
    return
  }
  if (isText(e.name)) {
    preview.type = 'text'
    setPreviewText(e.path)
    return
  }
  preview.type = 'other'
  preview.path = 'other'
}

const setPreview = async (url: string, decode = false) => {
  checkFile(url, async () => {
    let buffer = (await fs.readFile(url)).buffer
    if (decode) {
      buffer = decryptBuffer(buffer, setting.encryptionKey)
    }
    URL.revokeObjectURL(preview.path)
    preview.path = URL.createObjectURL(new Blob([buffer]))
  })
}

const setPreviewText = async (url: string) => {
  checkFile(url, async () => {
    let text = await fs.readFile(url, 'utf-8')
    try {
      text = JSON.stringify(JSON.parse(text), undefined, 2)
    } catch {
      // 不是JSON
    }
    preview.text = text
    preview.path = url
  })
}

const checkFile = async (url: string, cb: () => Promise<void>) => {
  if (await fs.pathExists(url)) {
    try {
      await cb()
    } catch (err) {
      console.error(err)

      preview.path = '无法打开该文件'
      preview.type = 'error'

      notification.error({
        title: '无法打开该文件',
        content: (err as Error).message,
        duration: 3000
      })
    }
  } else {
    preview.path = '文件不存在'
    preview.type = 'error'
  }
}
</script>

<style lang="stylus" scoped>
.home
  display flex
  height 100vh
  width 100vw

  .main
    overflow hidden
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
