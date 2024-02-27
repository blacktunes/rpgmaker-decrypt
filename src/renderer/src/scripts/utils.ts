import { createDiscreteApi } from 'naive-ui'
import { preview, setting, sidebar, state } from '@/store'
import { emitter } from './mitt'

export const isVideo = (name: string) => /\.(webm|mp4|avi)$/i.test(name)
export const isUnencryptedImage = (name: string) => /\.(png|jpg|jpeg|webp|gif)$/i.test(name)
export const isEncryptedImage = (name: string) => /\.(rpgmvp|png_)$/i.test(name)
export const isImage = (name: string) => isEncryptedImage(name) || isUnencryptedImage(name)
export const isUnencryptedAudio = (name: string) => /\.(ogg|mp3|m4a)$/i.test(name)
export const isEncryptedAudio = (name: string) => /\.(rpgmvo|ogg_|rpgmvm|m4a_)$/i.test(name)
export const isAudio = (name: string) => isEncryptedAudio(name) || isUnencryptedAudio(name)
export const isText = (name: string) => /\.(txt|json|js)$/i.test(name)

export const symbol = {
  image: Symbol('img'),
  audio: Symbol('audio')
}

export const { dialog, notification } = createDiscreteApi(['dialog', 'notification'], {
  notificationProviderProps: {
    keepAliveOnHover: true
  }
})

const reset = () => {
  preview.name = ''
  preview.path = ''

  sidebar.search = ''
  sidebar.select = undefined
}

export const getFilterList = (obj?: DirectoryTree, pattern: string = '') => {
  if (!obj) return []
  const { children, name, path } = obj
  let list: {
    name: string
    path: string
  }[] = []
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      list = [...list, ...getFilterList(child, pattern)]
    }
  } else {
    if (
      (!pattern.length || name.toLowerCase().includes(pattern.toLowerCase())) &&
      children === undefined
    ) {
      list.push({
        name,
        path
      })
    }
  }
  return list
}

export const checkDir = async (url: string) => {
  if (!(await fs.exists(url))) {
    notification.error({
      title: '加载失败',
      content: '文件不存在',
      duration: 3000
    })
    return
  }

  let _url: string = '/'
  if (await fs.exists(path.join(url, 'www'))) {
    _url = 'www/'
  }
  const filePath = path.join(url, _url)
  if (filePath === setting.baseUrl) {
    state.busy = true
    dialog.info({
      title: '重新加载',
      content: '是否重新加载该目录',
      positiveText: '是',
      negativeText: '否',
      maskClosable: true,
      onPositiveClick: () => {
        loadFile(filePath)
      },
      onAfterLeave: () => {
        state.busy = false
      }
    })
    return
  }
  loadFile(filePath)
}

const loadFile = (url: string) => {
  document.title = 'RPGMakerMV/MZ资源浏览器'

  state.count.image = 0
  state.count.audio = 0
  state.loading = true

  console.log('load:', url)

  ipcRenderer.send('load-file', url)
}

export const handleLoadFile = (event: LoadFileWorkerEvent) => {
  switch (event.type) {
    case 'no-system':
      notification.error({
        title: 'System.json不存在',
        content: '加密文件将无法读取',
        duration: 3000
      })
      break
    case 'count':
      if (event.content === 'image') {
        state.count.image += 1
      }
      if (event.content === 'audio') {
        state.count.audio += 1
      }
      break
    case 'image':
      setting.imageFileTree = event.content
      setting.imageFileTree.root = symbol.image
      break
    case 'audio':
      setting.audioFileTree = event.content
      setting.audioFileTree.root = symbol.audio
      break
    case 'done':
      reset()
      console.log('baseUrl:', event.content.baseUrl)
      console.log('encryptionKey:', event.content.key)
      setting.baseUrl = event.content.baseUrl
      setting.encryptionKey = event.content.key || ''
      setting.gameTitle = event.content.title
      if (event.content.title) {
        document.title = event.content.title
      }
      state.ready = true
      state.loading = false
      emitter.emit('reload')
      break
    case 'error':
      state.loading = false
      notification.error({
        title: '加载失败',
        content: event.content,
        duration: 3000
      })
      break
    case 'message-error':
      notification.error({
        title: event.content.title,
        content: event.content.message,
        duration: 3000
      })
      break
  }
}

export const saveCurrentFile = () => {
  if (!preview.path) return

  const link = document.createElement('a')
  link.href = preview.path
  link.download = preview.name
    .replace(/\.(rpgmvp|png_)$/i, '.png')
    .replace(/\.(rpgmvo|ogg_)$/i, '.ogg')
    .replace(/\.(rpgmvm|m4a_)$/i, '.m4a')
  link.click()
  link.remove()
}

const resetProgressState = () => {
  state.save.error = false
  state.save.image.currnet = 0
  state.save.image.total = 0
  state.save.audio.currnet = 0
  state.save.audio.total = 0
  state.save.encryption.currnet = 0
  state.save.encryption.total = 0
}

export const saveFile = (
  dir?: string,
  type: 'image' | 'audio' | 'all' = 'all',
  backup?: boolean
) => {
  resetProgressState()

  const filesList: {
    image: BaseItem[]
    audio: BaseItem[]
  } = {
    image: [],
    audio: []
  }
  if (type === 'image') {
    filesList.image = getFilterList(setting.imageFileTree)
    state.save.image.total = filesList.image.length
  } else if (type === 'audio') {
    filesList.audio = getFilterList(setting.audioFileTree)
    state.save.audio.total = filesList.audio.length
  } else {
    filesList.image = getFilterList(setting.imageFileTree)
    state.save.image.total = filesList.image.length
    filesList.audio = getFilterList(setting.audioFileTree)
    state.save.audio.total = filesList.audio.length
  }
  state.save.show = true

  const props: SaveFileWorkerProps = {
    filesList,
    dir,
    baseUrl: setting.baseUrl,
    encryptionKey: setting.encryptionKey,
    gameTitle: setting.gameTitle,
    backup
  }
  ipcRenderer.send('save-file', props)
}

export const handleSaveFile = async (event: SaveFileWorkerEvent) => {
  switch (event.type) {
    case 'progress':
      state.save[event.content].currnet += 1
      break
    case 'done':
      state.save.show = false
      if (event.reload) {
        setTimeout(() => {
          loadFile(setting.baseUrl)
        }, 500)
      }
      break
    case 'error':
      state.save.error = true
      await nextTick()
      state.save.show = false
      notification.error({
        title: '保存失败',
        content: event.content,
        duration: 3000
      })
  }
}

export const encryption = async (urls: string[]) => {
  resetProgressState()

  state.save.show = true
  state.save.encryption.total = urls.length

  try {
    for (const url of urls) {
      const res = new Uint8Array(
        encryptionBuffer((await fs.readFile(url)).buffer, setting.encryptionKey)
      )
      await fs.outputFile(path.join(url, '..', `${path.basename(url)}_`), res)
      state.save.encryption.currnet += 1
      await nextTick()
    }
  } catch (err) {
    state.save.error = true
    await nextTick()
    notification.error({
      content: (err as Error).message,
      duration: 3000
    })
  } finally {
    state.save.show = false
  }
}

export const decryptGame = () => {
  state.busy = true
  dialog.info({
    title: '解密游戏',
    content: '是否保存图片和音频原文件',
    positiveText: '保留',
    negativeText: '删除',
    maskClosable: true,
    onPositiveClick: () => {
      saveFile(undefined, 'all', true)
    },
    onNegativeClick: () => {
      saveFile(undefined, 'all', false)
    },
    onAfterLeave: () => {
      state.busy = false
    }
  })
}
