<template>
  <NTag
    round
    :bordered="false"
    :type="type"
  >
    <template
      v-if="icon"
      #icon
    >
      <NIcon>
        <FileImageRegular v-if="icon === 'image'" />
        <FileAudioRegular v-else-if="icon === 'audio'" />
      </NIcon>
    </template>
    <slot></slot>
  </NTag>
</template>

<script lang="ts" setup>
import { FileImageRegular, FileAudioRegular } from './Icon'

defineProps<{
  type?: 'default' | 'info' | 'error' | 'primary' | 'success' | 'warning'
  icon?: 'image' | 'audio'
}>()
</script>
