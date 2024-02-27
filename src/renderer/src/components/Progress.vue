<template>
  <Transition name="popup-fade">
    <div
      v-if="state.save.show"
      class="saving"
    >
      <NProgress
        type="multiple-circle"
        :status="state.save.error ? 'error' : isSuccess ? 'success' : 'info'"
        :circle-gap="3"
        :percentage="percentage"
        processing
      >
        <NIcon
          v-if="state.save.error"
          size="60"
          :color="themeVars.errorColor"
        >
          <ErrorCircleRound />
        </NIcon>
        <NIcon
          v-else-if="isSuccess"
          size="60"
          :color="themeVars.successColor"
        >
          <CheckCircleRound />
        </NIcon>
        <div
          v-else
          style="font-size: 30px"
          :style="{ color: themeVars.infoColor }"
        >
          {{ percentageText }}
        </div>
      </NProgress>
      <div class="description">
        <Tag
          v-show="state.save.image.total"
          icon="image"
          :type="
            state.save.error
              ? 'error'
              : state.save.image.currnet >= state.save.image.total
                ? 'success'
                : 'info'
          "
        >
          {{ state.save.image.currnet }}/{{ state.save.image.total }}
        </Tag>
        <Tag
          v-show="state.save.audio.total"
          icon="audio"
          :type="
            state.save.error
              ? 'error'
              : state.save.audio.currnet >= state.save.audio.total
                ? 'success'
                : 'info'
          "
        >
          {{ state.save.audio.currnet }}/{{ state.save.audio.total }}
        </Tag>
        <Tag
          v-show="state.save.encryption.total"
          :type="
            state.save.error
              ? 'error'
              : state.save.encryption.currnet >= state.save.encryption.total
                ? 'success'
                : 'info'
          "
        >
          {{ state.save.encryption.currnet }}/{{ state.save.encryption.total }}
        </Tag>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { state } from '@/store'
import { CheckCircleRound, ErrorCircleRound } from './Common/Icon'
import Tag from './Common/Tag.vue'
import { useThemeVars } from 'naive-ui'

const themeVars = useThemeVars()

const percentageText = computed(
  () => `${(percentage.value.reduce((a, b) => a + b, 0) / percentage.value.length) | 0}%`
)

const percentage = computed(() => {
  const list: number[] = []
  if (state.save.image.total) {
    list.push(((state.save.image.currnet / state.save.image.total) * 100) | 0)
  }
  if (state.save.audio.total) {
    list.push(((state.save.audio.currnet / state.save.audio.total) * 100) | 0)
  }
  if (state.save.encryption.total) {
    list.push(((state.save.encryption.currnet / state.save.encryption.total) * 100) | 0)
  }
  return list
})
const isSuccess = computed(() => percentage.value.every((item) => item >= 100))
</script>

<style lang="stylus" scoped>
:deep(.n-progress .n-progress-graph .n-progress-graph-circle .n-progress-graph-circle-fill)
  transition opacity 0.3s var(--n-bezier), stroke 0.3s var(--n-bezier)

.saving
  z-index 998
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
    margin-top 10px
</style>
