import { getFilterList } from '@/scripts/utils'
import { reactive } from 'vue'

export const state = reactive({
  ready: false,
  loading: false,
  busy: false,
  writing: {
    show: false,
    percentage: 0,
    total: 0
  },
  save: {
    show: false,
    image: {
      currnet: 0,
      total: 0
    },
    audio: {
      currnet: 0,
      total: 0
    }
  },
  count: {
    image: 0,
    audio: 0
  }
})

export const isReady = () => !!setting.baseUrl && state.ready

export const isLoading = () => state.loading

export const isWriting = () => state.writing.show

export const isBusy = () => isLoading() || isWriting() || state.busy

watch([() => state.ready, () => state.loading, () => state.writing.show, () => state.busy], () => {
  const event: StateEvent = {
    ready: isReady(),
    busy: isBusy()
  }
  ipcRenderer.send('set-state', event)
})

export const setting = reactive<{
  baseUrl: string
  gameTitle?: string
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
  gameTitle: '',
  encryptionKey: '',
  imageFileTree: undefined,
  imageFileList: [],
  audioFileTree: undefined,
  audioFileList: [],
  filesList: []
})

export const preview = reactive<PreviewItem>({
  type: 'image',
  name: '',
  path: '',
  text: ''
})

export const sidebar: {
  search: string
  select?: BaseItem
  readonly currentImageList: BaseItem[]
  readonly currentAudioList: BaseItem[]
  readonly currentList: BaseItem[]
} = reactive({
  search: '',
  select: {
    name: '',
    path: ''
  },
  currentImageList: computed(() => getFilterList(setting.imageFileTree, sidebar.search)),
  currentAudioList: computed(() => getFilterList(setting.audioFileTree, sidebar.search)),
  currentList: computed(() => {
    const list: BaseItem[] = []
    if (sidebar.currentImageList.length > 0) {
      list.push(...sidebar.currentImageList)
    }
    if (sidebar.currentAudioList.length > 0) {
      list.push(...sidebar.currentAudioList)
    }
    return list
  })
})