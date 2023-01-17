import { reactive } from 'vue'

export const state = reactive({
  ready: false,
  loading: false
})

export const setting = reactive({
  baseUrl: '',
  outUrl: '',
  filePath: '',
  encryptionKey: '',
  imageFileTree: {},
  audioFileTree: {},
  version: 'MV'
})

export const previweItem = reactive({
  type: 'img',
  name: '',
  path: ''
})
