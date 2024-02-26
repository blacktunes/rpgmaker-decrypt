<template>
  <div class="preview">
    <img
      v-if="item.type === 'image'"
      :src="item.path"
    />
    <audio
      v-else-if="item.type === 'audio'"
      :src="item.path"
      autoplay
      loop
      controls
      controlslist="nodownload nofullscreen noplaybackrate"
    ></audio>
    <video
      v-else-if="item.type === 'video'"
      :src="item.path"
      autoplay
      loop
      controls
      controlslist="nodownload nofullscreen noplaybackrate"
      disablePictureInPicture
    ></video>
    <div
      v-else-if="item.type === 'text'"
      class="text"
    >
      <NCode
        :code="item.text"
        language="json"
        :hljs="hljs"
        show-line-numbers
      />
    </div>
    <div
      v-else
      class="unknow"
    >
      <NIcon size="30">
        <FileUnknownOutlined />
      </NIcon>
      暂不支持的文件格式
    </div>
  </div>
</template>

<script lang="ts" setup>
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import { FileUnknownOutlined } from '../Common/Icon'

hljs.registerLanguage('json', json)

defineProps<{
  item: PreviewItem
}>()
</script>

<style lang="stylus" scoped>
.preview
  flex 1
  display flex
  justify-content center
  align-items center
  overflow auto

  .text
    box-sizing border-box
    padding 15px
    width 100%
    height 100%

  img, video
    display block
    max-width 100%
    max-height 100%
    object-fit scale-down
    box-shadow 2px 2px #eee
    background-image conic-gradient(#eee 0 25%, transparent 0 50%, #eee 0 75%, transparent 0)
    background-size 24px 24px

  .unknow
    display flex
    flex-direction column
    justify-content center
    align-items center
    gap 10px
    user-select none
</style>
