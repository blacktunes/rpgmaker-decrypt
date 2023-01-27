<template>
  <div class="home">
    <SideBar class="sidebar" @itemClick="itemClick" />
    <div class="main">
      <div class="topbar">
        <div class="text">
          {{ previweItem.name }}
        </div>
        <n-button style="margin-right: 10px" @click="save" :disabled="!previweItem.path" circle>
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32">
              <path
                d="M27.71 9.29l-5-5A1 1 0 0 0 22 4H6a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V10a1 1 0 0 0-.29-.71zM12 6h8v4h-8zm8 20h-8v-8h8zm2 0v-8a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8H6V6h4v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6.41l4 4V26z"
                fill="currentColor"></path>
            </svg>
          </template>
        </n-button>
      </div>
      <div class="previwe">
        <img v-show="previweItem.path && previweItem.type === 'img'" :src="previweItem.path" draggable="false" />
        <audio v-show="previweItem.path && previweItem.type === 'audio'" :src="previweItem.path" controls autoplay
          contextmenu="['download']"></audio>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SideBar from './Home/SideBar.vue'
import { NButton } from 'naive-ui'
import { setting, previweItem } from '../store'

const itemClick = (e: {
  name: string;
  path: string;
}) => {
  previweItem.name = e.name
  if (/\.(png)$/i.test(e.name)) {
    previweItem.type = 'img'
    previwe(e.path)
    return
  }
  if (/\.(rpgmvp|png_)$/i.test(e.name)) {
    previweItem.type = 'img'
    previwe(e.path, undefined, true)
    return
  }
  if (/\.(ogg)$/i.test(e.name)) {
    previweItem.type = 'audio'
    previwe(e.path, 'ogg')
    return
  }
  if (/\.(m4a)$/i.test(e.name)) {
    previweItem.type = 'audio'
    previwe(e.path, 'm4a')
    return
  }
  if (/\.(rpgmvo|ogg_)$/i.test(e.name)) {
    previweItem.type = 'audio'
    previwe(e.path, 'ogg', true)
    return
  }
  if (/\.(rpgmvm|m4a_)$/i.test(e.name)) {
    previweItem.type = 'audio'
    previwe(e.path, 'm4a', true)
    return
  }
}

const save = () => {
  const link = document.createElement('a')
  link.href = previweItem.path
  link.download = previweItem.name
    .replace(/\.(rpgmvp|png_)$/i, '.png')
    .replace(/\.(rpgmvo|ogg_)$/i, '.ogg')
    .replace(/\.(rpgmvm|m4a_)$/i, '.m4a')
  link.click()
}

let timer: NodeJS.Timeout | null = null

const previwe = async (url: string, type?: 'ogg' | 'm4a', decode = false) => {
  if (timer) {
    clearTimeout(timer)
  }
  timer = setTimeout(async () => {
    let buffer = fs.readFileSync(url).buffer
    if (decode) {
      buffer = decryptBuffer(buffer)
    }
    previweItem.path = await toBase64(buffer, type)
  }, 0)
}

const decryptBuffer = (arrayBuffer: ArrayBufferLike) => {
  const body = arrayBuffer.slice(16)
  const view = new DataView(body)
  const key = setting.encryptionKey.match(/.{2}/g)!

  for (let i = 0; i < 16; i++) {
    view.setUint8(i, view.getUint8(i) ^ parseInt(key[i], 16))
  }
  return body
}

const toBase64 = (buffer: ArrayBufferLike, type?: 'ogg' | 'm4a') => {
  return new Promise<string>(resolve => {
    const file = new FileReader()
    file.onload = (e) => {
      let base64: string = e.target?.result as string
      if (type === 'ogg') {
        base64 = base64.replace('data:application/octet-stream', 'data:audio/ogg')
      } else if (type === 'm4a') {
        base64 = base64.replace('data:application/octet-stream', 'data:audio/x-m4a')
      }
      resolve(base64)
    }
    file.readAsDataURL(new Blob([buffer]))
  })
}
</script>

<style lang="scss" scoped>
.home {
  height: 100vh;
  width: 100vw;
  display: flex;

  .sidebar {
    flex: 0 0 300px;
    overflow-x: hidden;
    overflow-y: auto;
  }

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
      }
    }

    .previwe {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;

      img {
        display: block;
        max-width: 100%;
        max-height: 100%;
        object-fit: scale-down;
        box-shadow: 2px 2px #eee;
        background-image: conic-gradient(#eee 0 25%,
            transparent 0 50%,
            #eee 0 75%,
            transparent 0);
        background-size: 24px 24px;
      }
    }
  }
}
</style>
