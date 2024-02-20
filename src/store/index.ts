import { reactive } from 'vue'

export const state = reactive({
  ready: false,
  loading: false,
  writing: {
    show: false,
    percentage: 0,
    total: 0
  },
  count: {
    image: 0,
    audio: 0
  }
})

watch([() => state.ready, () => state.loading, () => state.writing.show], () => {
  ipcRenderer.send('set-state', [state.ready, state.loading, state.writing.show])
})

export const setting = reactive<{
  baseUrl: string
  encryptionKey: string
  previewIndex: number
  imageFileTree?: DirectoryTree
  imageFileList: {
    name: string
    path: string
  }[]
  audioFileTree?: DirectoryTree
  audioFileList: {
    name: string
    path: string
  }[]
  filesList: {
    name: string
    path: string
  }[]
}>({
  baseUrl: '',
  encryptionKey: '',
  previewIndex: 0,
  imageFileTree: undefined,
  imageFileList: [],
  audioFileTree: undefined,
  audioFileList: [],
  filesList: []
})

watch(() => setting.encryptionKey, () => {
  ipcRenderer.send('set-encryption', !!setting.encryptionKey)
})

export const previewItem = reactive({
  type: 'img',
  name: '',
  path: '',
  text: ''
})

export const sidebar = reactive({
  search: ''
})