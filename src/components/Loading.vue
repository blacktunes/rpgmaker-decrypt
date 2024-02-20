<template>
  <Transition name="blur-fade">
    <div
      class="loading"
      v-show="state.loading"
    >
      <NSpin
        :size="80"
        stroke="#222"
      >
        <template #description>
          <div class="description">
            <NTag round>
              <template #icon>
                <NIcon>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 1024 1024"
                  >
                    <path
                      d="M553.1 509.1l-77.8 99.2l-41.1-52.4a8 8 0 0 0-12.6 0l-99.8 127.2a7.98 7.98 0 0 0 6.3 12.9H696c6.7 0 10.4-7.7 6.3-12.9l-136.5-174a8.1 8.1 0 0 0-12.7 0zM360 442a40 40 0 1 0 80 0a40 40 0 1 0-80 0zm494.6-153.4L639.4 73.4c-6-6-14.1-9.4-22.6-9.4H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V311.3c0-8.5-3.4-16.7-9.4-22.7zM790.2 326H602V137.8L790.2 326zm1.8 562H232V136h302v216a42 42 0 0 0 42 42h216v494z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </NIcon>
              </template>
              {{ state.count.image }}
            </NTag>
            <NTag round>
              <template #icon>
                <NIcon
                  ><svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm10-9h-4v3.88a2.247 2.247 0 0 0-3.5 1.87c0 1.24 1.01 2.25 2.25 2.25S13 17.99 13 16.75V13h3v-2z"
                      fill="currentColor"
                    ></path></svg
                ></NIcon>
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
</style>
