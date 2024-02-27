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
        :key="item.path"
        :code="item.text"
        :hljs="hljs"
        :language="extname"
        show-line-numbers
      />
    </div>
    <div
      v-else-if="item.type === 'error'"
      class="other"
    >
      <NIcon
        size="42"
        color="#888"
      >
        <DocumentError24Regular />
      </NIcon>
      {{ item.path }}
    </div>
    <div
      v-else
      class="other"
    >
      <NIcon
        size="40"
        color="#888"
      >
        <FileUnknownOutlined />
      </NIcon>
      暂不支持的文件格式
    </div>
  </div>
</template>

<script lang="ts" setup>
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import js from 'highlight.js/lib/languages/javascript'
import { DocumentError24Regular, FileUnknownOutlined } from '../Common/Icon'

hljs.registerLanguage('json', json)
hljs.registerLanguage('js', js)

const props = defineProps<{
  item: PreviewItem
  error?: string
}>()

const extname = computed(() => {
  const ext = path.extname(props.item.name).slice(1)
  if (hljs.getLanguage(ext)) {
    return ext
  }
  return 'json'
})
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

  .other
    display flex
    flex-direction column
    justify-content center
    align-items center
    margin-bottom 50px
    gap 10px
    color #888
    font-weight bold
    user-select none
</style>
