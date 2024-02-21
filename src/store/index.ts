import { getFilterList } from '@/assets/scripts/utils'
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
  imageFileTree: undefined,
  imageFileList: [],
  audioFileTree: undefined,
  audioFileList: [],
  filesList: []
})

watch(
  () => setting.encryptionKey,
  () => {
    ipcRenderer.send('set-encryption', !!setting.encryptionKey)
  }
)

export const preview = reactive<PreviewItem>({
  type: 'image',
  name: '',
  path: '',
  text: ''
})

export const sidebar: {
  search: string
  select?: {
    name: string
    path: string
  }
  currentList: {
    name: string
    path: string
  }[]
} = reactive({
  search: '',
  select: {
    name: '',
    path: ''
  },
  currentList: computed(() => [
    ...getFilterList(setting.imageFileTree, sidebar.search),
    ...getFilterList(setting.audioFileTree, sidebar.search)
  ])
})
