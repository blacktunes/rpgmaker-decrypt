import LoadFile from '@/webworker/LoadFile?worker'
import SaveFile from '@/webworker/SaveFile?worker'
import { createDiscreteApi } from 'naive-ui'
import { preview, setting, sidebar, state } from '@/store'
import { decryptBuffer, encryptionBuffer } from './encryption'

const loadFileWorker = new LoadFile()
const saveFileWorker = new SaveFile()

export const symbol = {
  image: Symbol('img'),
  audio: Symbol('audio')
}

export const { message, dialog, notification } = createDiscreteApi(
  ['message', 'dialog', 'notification'],
  {
    notificationProviderProps: {
      keepAliveOnHover: true
    }
  }
)

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
        loadDir(filePath)
      },
      onAfterLeave: () => {
        state.busy = false
      }
    })
    return
  }
  loadDir(filePath)
}

const loadDir = (url: string) => {
  document.title = 'RPGMakerMV/MZ资源浏览器'

  state.count.image = 0
  state.count.audio = 0
  state.loading = true

  console.log(url)

  loadFileWorker.onmessage = (e) => {
    const event: LoadFileWorkerEvent = e.data

    switch (event.type) {
      case 'no-system':
        notification.error({
          title: 'System.json不存在',
          content: '加密文件将无法读取',
          duration: 3000
        })
        break
      case 'system':
        setting.encryptionKey = event.content.key || ''
        ipcRenderer.send('set-encryption', !!setting.encryptionKey)
        setting.gameTitle = event.content.title
        if (event.content.title) {
          document.title = event.content.title
        }
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
        setting.baseUrl = url
        state.ready = true
        state.loading = false
        break
      case 'error':
        state.loading = false
        notification.error({
          title: '加载失败',
          content: event.content.message,
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

  loadFileWorker.postMessage(url)
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

export const saveFile = (
  dir: string,
  type: 'image' | 'audio' | 'all' = 'all',
  decrypt?: boolean,
  backup?: boolean
) => {
  state.save.image.currnet = 0
  state.save.image.total = 0
  state.save.audio.currnet = 0
  state.save.audio.total = 0
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

  saveFileWorker.onmessage = (e) => {
    const event: SaveFileWorkerEvent = e.data

    switch (event.type) {
      case 'progress':
        state.save[event.content].currnet += 1
        break
      case 'done':
        state.save.show = false
        break
      case 'error':
        state.save.show = false
        notification.error({
          title: '保存失败',
          content: event.content.message,
          duration: 3000
        })
    }
  }

  const props: SaveFileWorkerProps = {
    filesList,
    dir,
    baseUrl: setting.baseUrl,
    encryptionKey: setting.encryptionKey,
    gameTitle: setting.gameTitle,
    decrypt,
    backup
  }
  saveFileWorker.postMessage(props)
}

export const encryption = async (urls: string[]) => {
  state.writing.percentage = 0
  state.writing.total = urls.length
  state.writing.show = true
  for (const url of urls) {
    const res = new Uint8Array(
      encryptionBuffer((await fs.readFile(url)).buffer, setting.encryptionKey)
    )
    await fs.outputFile(path.join(url, '..', `${path.basename(url, path.extname(url))}._`), res)
    state.writing.percentage += 1
  }
  setTimeout(() => {
    state.writing.show = false
  }, 500)
}

export const decryptGame = () => {
  dialog.info({
    title: '解密游戏',
    content: '是否保存图片和音频原文件',
    positiveText: '保留',
    negativeText: '删除',
    maskClosable: true,
    onPositiveClick: () => {
      _decryptGame(true)
    },
    onNegativeClick: () => {
      _decryptGame(false)
    }
  })
}

export const _decryptGame = (backups: boolean) => {
  state.writing.percentage = 0
  state.writing.show = true

  setTimeout(async () => {
    try {
      const systemPath = path.join(setting.baseUrl, 'data/System.json')
      await fs.copyFile(
        path.join(setting.baseUrl, 'data/System.json'),
        path.join(setting.baseUrl, 'data/System.json.bak')
      )
      const systemData = await fs.readJSON(systemPath)

      if (systemData.hasEncryptedImages) {
        state.writing.total += setting.imageFileList.length

        for (const { name, path: filePath } of setting.imageFileList) {
          const outPath = filePath
            .replace(`${path.sep}img${path.sep}`, `${path.sep}_img_${path.sep}`)
            .replace(`${path.sep}audio${path.sep}`, `${path.sep}_audio_${path.sep}`)
            .replace(/\.(rpgmvp|png_)$/i, '.png')
            .replace(/\.(rpgmvo|ogg_)$/i, '.ogg')
            .replace(/\.(rpgmvm|m4a_)$/i, '.m4a')
          if (/\.(rpgmvo|ogg_|rpgmvm|m4a_|png_|rpgmvp)$/i.test(name)) {
            const res = new Uint8Array(
              decryptBuffer((await fs.readFile(filePath)).buffer, setting.encryptionKey)
            )
            await fs.outputFile(outPath, res)
          } else {
            await fs.ensureDir(path.join(outPath, '..'))
            await fs.copyFile(filePath, outPath)
          }
          state.writing.percentage += 1
        }

        if (backups) {
          await fs.rename(path.join(setting.baseUrl, 'img'), path.join(setting.baseUrl, 'img.bak'))
        } else {
          await fs.remove(path.join(setting.baseUrl, 'img'))
        }
        await fs.rename(path.join(setting.baseUrl, '_img_'), path.join(setting.baseUrl, 'img'))

        systemData.hasEncryptedImages = false
      }

      if (systemData.hasEncryptedAudio) {
        state.writing.total += setting.audioFileList.length

        for (const { name, path: filePath } of setting.audioFileList) {
          const outPath = filePath
            .replace(`${path.sep}img${path.sep}`, `${path.sep}_img_${path.sep}`)
            .replace(`${path.sep}audio${path.sep}`, `${path.sep}_audio_${path.sep}`)
            .replace(/\.(rpgmvp|png_)$/i, '.png')
            .replace(/\.(rpgmvo|ogg_)$/i, '.ogg')
            .replace(/\.(rpgmvm|m4a_)$/i, '.m4a')
          if (/\.(rpgmvo|ogg_|rpgmvm|m4a_|png_|rpgmvp)$/i.test(name)) {
            const res = new Uint8Array(
              decryptBuffer((await fs.readFile(filePath)).buffer, setting.encryptionKey)
            )
            await fs.outputFile(outPath, res)
          } else {
            await fs.ensureDir(path.join(outPath, '..'))
            await fs.copyFile(filePath, outPath)
          }
          state.writing.percentage += 1
        }

        if (backups) {
          await fs.rename(
            path.join(setting.baseUrl, 'audio'),
            path.join(setting.baseUrl, 'audio.bak')
          )
        } else {
          await fs.remove(path.join(setting.baseUrl, 'audio'))
        }
        await fs.rename(path.join(setting.baseUrl, '_audio_'), path.join(setting.baseUrl, 'audio'))

        systemData.hasEncryptedAudio = false
      }

      await fs.writeJSON(systemPath, systemData)

      if (await fs.exists(path.join(setting.baseUrl, 'nw.dll'))) {
        await fs.writeFile(path.join(setting.baseUrl, 'Game.rmmzproject'), 'RPGMZ 1.4.3')
      } else {
        await fs.writeFile(path.join(setting.baseUrl, 'Game.rpgproject'), 'RPGMV 1.6.1')
      }
    } catch (err) {
      state.writing.show = false
      alert(err)
    }
    setTimeout(() => {
      state.writing.show = false
      checkDir(setting.baseUrl)
    }, 500)
  }, 50)
}
