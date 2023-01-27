import { reactive } from 'vue'

export const state = reactive({
  ready: false,
  loading: false,
  img: 0,
  audio: 0
})

export const setting = reactive<{
  baseUrl: string
  outUrl: string
  filePath: string
  encryptionKey: string
  previweIndex: number
  imageFileTree?: directoryTree.DirectoryTree
  imageFileList: {
    name: string
    path: string
  }[]
  audioFileTree?: directoryTree.DirectoryTree
}>({
  baseUrl: '',
  outUrl: '',
  filePath: '',
  encryptionKey: '',
  previweIndex: 0,
  imageFileTree: undefined,
  imageFileList: [],
  audioFileTree: undefined,
})

export const previweItem = reactive({
  type: 'img',
  name: '',
  path: ''
})

export const sidebar = reactive({
  search: ''
})