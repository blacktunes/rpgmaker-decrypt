<template>
  <div class="home">
    <SideBar
      class="sidebar"
      @itemClick="itemClick"
    />
    <div class="main">
      <div class="topbar">
        <div
          class="text"
          @click.stop="emitter.emit('scrollToItem')"
        >
          {{ previewItem.name }}
        </div>
        <n-button
          style="margin-right: 10px"
          @click="save"
          v-show="previewItem.path"
          circle
        >
          <template #icon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 32 32"
            >
              <path
                d="M27.71 9.29l-5-5A1 1 0 0 0 22 4H6a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V10a1 1 0 0 0-.29-.71zM12 6h8v4h-8zm8 20h-8v-8h8zm2 0v-8a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8H6V6h4v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6.41l4 4V26z"
                fill="currentColor"
              ></path>
            </svg>
          </template>
        </n-button>
      </div>
      <div
        class="preview"
        v-show="previewItem.path"
      >
        <img
          v-if="previewItem.type === 'image'"
          :src="previewItem.path"
          draggable="false"
        />
        <audio
          v-else-if="previewItem.type === 'audio'"
          :src="previewItem.path"
          autoplay
          loop
          controls
          controlslist="nodownload nofullscreen noplaybackrate"
        ></audio>
        <video
          v-else-if="previewItem.type === 'video'"
          :src="previewItem.path"
          autoplay
          loop
          controls
          controlslist="nodownload nofullscreen noplaybackrate"
          disablePictureInPicture
        ></video>
        <div
          v-else-if="previewItem.type === 'text'"
          class="text"
        >
          <n-code
            :code="previewItem.text"
            language="json"
            :hljs="hljs"
            show-line-numbers
          />
        </div>
        <div
          v-else
          style="user-select: none"
        >
          暂不支持的文件格式
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SideBar from './Home/SideBar.vue'
import { NButton, NCode } from 'naive-ui'
import { previewItem } from '../store'
import { emitter } from '../assets/scripts/mitt'
import { decryptBuffer } from '../assets/scripts/utils'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'

hljs.registerLanguage('json', json)

const itemClick = (e: { name: string; path: string }) => {
  previewItem.name = e.name
  if (/\.(webm|mp4|avi)$/i.test(e.name)) {
    previewItem.type = 'video'
    preview(e.path)
    return
  }
  if (/\.(png|jpg|jpeg|webp|gif)$/i.test(e.name)) {
    previewItem.type = 'image'
    preview(e.path)
    return
  }
  if (/\.(rpgmvp|png_)$/i.test(e.name)) {
    previewItem.type = 'image'
    preview(e.path, true)
    return
  }
  if (/\.(ogg|mp3)$/i.test(e.name)) {
    previewItem.type = 'audio'
    preview(e.path)
    return
  }
  if (/\.(m4a)$/i.test(e.name)) {
    previewItem.type = 'audio'
    preview(e.path)
    return
  }
  if (/\.(rpgmvo|ogg_)$/i.test(e.name)) {
    previewItem.type = 'audio'
    preview(e.path, true)
    return
  }
  if (/\.(rpgmvm|m4a_)$/i.test(e.name)) {
    previewItem.type = 'audio'
    preview(e.path, true)
    return
  }
  if (/\.(txt|json)$/i.test(e.name)) {
    previewItem.type = 'text'
    previewText(e.path)
    return
  }
  previewItem.type = 'other'
}

const save = () => {
  const link = document.createElement('a')
  link.href = previewItem.path
  link.download = previewItem.name
    .replace(/\.(rpgmvp|png_)$/i, '.png')
    .replace(/\.(rpgmvo|ogg_)$/i, '.ogg')
    .replace(/\.(rpgmvm|m4a_)$/i, '.m4a')
  link.click()
}

const previewText = async (url: string) => {
  const text = await fs.readFile(url, 'utf-8')
  previewItem.text = text
}

const preview = (url: string, decode = false) => {
  let buffer = fs.readFileSync(url).buffer
  if (decode) {
    buffer = decryptBuffer(buffer)
  }
  URL.revokeObjectURL(previewItem.path)
  previewItem.path = URL.createObjectURL(new Blob([buffer]))
}
</script>

<style lang="scss" scoped>
.home {
  height: 100vh;
  width: 100vw;
  display: flex;

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;

    .topbar {
      display: flex;
      align-items: center;
      height: 34px;

      .switch {
        margin-right: 10px;
        width: 60px;
      }

      .text {
        flex: 1;
        line-height: 34px;
        text-align: center;
        margin-left: 44px;
        user-select: none;
        cursor: pointer;
      }
    }

    .preview {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: auto;

      .text {
        box-sizing: border-box;
        padding: 15px;
        width: 100%;
        height: 100%;
      }

      img,
      video {
        display: block;
        max-width: 100%;
        max-height: 100%;
        object-fit: scale-down;
        box-shadow: 2px 2px #eee;
        background-image: conic-gradient(#eee 0 25%, transparent 0 50%, #eee 0 75%, transparent 0);
        background-size: 24px 24px;
      }
    }
  }
}
</style>
