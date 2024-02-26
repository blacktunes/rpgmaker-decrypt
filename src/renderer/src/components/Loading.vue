<template>
  <Transition name="popup-fade">
    <div
      v-show="state.loading"
      class="loading"
    >
      <NSpin
        :size="200"
        :stroke="themeVars.infoColor"
      >
        <template #description>
          <div class="description">
            <Tag
              icon="image"
              type="info"
            >
              {{ state.count.image }}
            </Tag>
            <Tag
              icon="audio"
              type="info"
            >
              {{ state.count.audio }}
            </Tag>
          </div>
        </template>
      </NSpin>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { state } from '@/store'
import Tag from './Common/Tag.vue'
import { useThemeVars } from 'naive-ui'

const themeVars = useThemeVars()
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
  background rgba(0, 0, 0, 0.1)

.description
  display flex
  flex-direction column
  gap 5px
  margin-top 5px
</style>
