<template>
  <Transition name="blur-fade">
    <div
      class="loading"
      v-show="state.loading"
    >
      <NSpin
        :size="65"
        stroke="#222"
      >
        <template #description>
          <div class="description">
            <NTag round>
              <template #icon>
                <NIcon>
                  <FileImageOutlined />
                </NIcon>
              </template>
              {{ state.count.image }}
            </NTag>
            <NTag round>
              <template #icon>
                <NIcon>
                  <FileAudioRegular />
                </NIcon>
              </template>
              {{ state.count.audio }}
            </NTag>
          </div>
        </template>
      </NSpin>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { state } from '@/store'
import { FileImageOutlined, FileAudioRegular } from '@/components/Common/Icon'
</script>

<style lang="stylus" scoped>
.loading
  z-index 999
  position fixed
  inset 0
  display flex
  flex-direction column
  justify-content center
  align-items center
  backdrop-filter blur(3px)

.description
  display flex
  flex-direction column
  gap 5px
  margin-top 5px
</style>
