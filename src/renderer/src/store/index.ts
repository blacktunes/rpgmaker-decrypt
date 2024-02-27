import { getFilterList } from '@/scripts/utils'
import { reactive } from 'vue'

export const state = reactive({
  ready: false,
  loading: false,
  busy: false,
  save: {
    show: false,
    error: false,
    image: {
      currnet: 0,
      total: 0
    },
    audio: {
      currnet: 0,
      total: 0
    },
    encryption: {
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

export const isSaving = () => state.save.show

export const isBusy = () => isLoading() || isSaving() || state.busy

watch([() => state.ready, () => state.loading, () => state.save.show, () => state.busy], () => {
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
  audioFileTree?: DirectoryTree
}>({
  baseUrl: '',
  gameTitle: '',
  encryptionKey: '',
  imageFileTree: undefined,
  audioFileTree: undefined
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
