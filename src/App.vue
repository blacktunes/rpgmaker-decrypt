<template>
  <Loading />
  <Progress />
  <DropView>
    <Home />
  </DropView>
</template>

<script setup lang="ts">
onMounted(() => {
  window.onerror = null
  ipcRenderer.send('ready')
})
</script>
