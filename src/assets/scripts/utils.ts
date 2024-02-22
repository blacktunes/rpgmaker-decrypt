import ReadDir from '@/webworker/readDir?worker'
import { createDiscreteApi } from 'naive-ui'
import { preview, setting, sidebar, state } from '../../store'

const readDirWorker = new ReadDir()

export const { message, dialog, notification } = createDiscreteApi(
  ['message', 'dialog', 'notification'],
  {
    notificationProviderProps: {
      keepAliveOnHover: true
    }
  }
)

export const isReady = () => setting.baseUrl && state.ready

export const isLoading = () => state.loading

export const isWriting = () => state.writing.show

const reset = () => {
  preview.name = ''
  preview.path = ''

  sidebar.search = ''
  sidebar.select = undefined
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

  setting.baseUrl = url
  setting.encryptionKey = ''
  console.log(url)

  readDirWorker.postMessage(url)

  readDirWorker.onmessage = (e) => {
    const event: DirWorkerEvent = e.data

    switch (event.type) {
      case 'no-system':
        notification.error({
          title: event.title,
          content: event.content,
          duration: 3000
        })
        break
      case 'system':
        setting.encryptionKey = event.key || ''
        if (event.title) {
          document.title = event.title
        }
        break
      case 'count':
        if (event.count === 'image') {
          state.count.image += 1
        }
        if (event.count === 'audio') {
          state.count.audio += 1
        }
        break
      case 'image':
        setting.imageFileTree = event.data
        setting.imageFileTree.name = '图片'
        break
      case 'audio':
        setting.audioFileTree = event.data
        setting.audioFileTree.name = '音频'
        break
      case 'done':
        reset()
        state.ready = true
        state.loading = false
        break
    }
  }

  readDirWorker.onerror = (err) => {
    state.ready = false
    state.loading = false
    notification.error({
      title: '加载失败',
      content: err.message,
      duration: 3000
    })
  }
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
    if (!pattern.length || name.toLowerCase().includes(pattern.toLowerCase())) {
      list.push({
        name,
        path
      })
    }
  }
  return list
}

export const decryptBuffer = (arrayBuffer: ArrayBufferLike) => {
  const body = arrayBuffer.slice(16)
  const view = new DataView(body)
  const key = setting.encryptionKey.match(/.{2}/g)!

  for (let i = 0; i < 16; i++) {
    view.setUint8(i, view.getUint8(i) ^ parseInt(key[i], 16))
  }
  return body
}

export const encryptionBuffer = (arrayBuffer: ArrayBufferLike) => {
  const body = arrayBuffer
  const view = new DataView(body)
  const key = setting.encryptionKey.match(/.{2}/g)!

  for (let i = 0; i < 16; i++) {
    view.setUint8(i, view.getUint8(i) ^ parseInt(key[i], 16))
  }
  return Buffer.concat([Buffer.from(new ArrayBuffer(16)), Buffer.from(arrayBuffer)]).buffer
}

export const encryption = async (urls: string[]) => {
  state.writing.percentage = 0
  state.writing.total = urls.length
  state.writing.show = true
  for (const url of urls) {
    const res = new Uint8Array(encryptionBuffer((await fs.readFile(url)).buffer))
    await fs.outputFile(path.join(url, '..', `${path.basename(url, path.extname(url))}._`), res)
    state.writing.percentage += 1
  }
  setTimeout(() => {
    state.writing.show = false
  }, 500)
}

export const saveFile = (dir: string, type: 'img' | 'audio' | 'all' = 'all') => {
  state.writing.percentage = 0
  let filesList: {
    name: string
    path: string
  }[]
  if (type === 'img') {
    state.writing.total = setting.imageFileList.length
    filesList = setting.imageFileList
  } else if (type === 'audio') {
    state.writing.total = setting.audioFileList.length
    filesList = setting.audioFileList
  } else {
    state.writing.total = setting.filesList.length
    filesList = setting.filesList
  }
  state.writing.show = true

  setTimeout(async () => {
    try {
      for (const { name, path: filePath } of filesList) {
        const outPath = filePath
          .replace(setting.baseUrl, path.join(dir, `${document.title}-decrypt`))
          .replace(/\.(rpgmvp|png_)$/i, '.png')
          .replace(/\.(rpgmvo|ogg_)$/i, '.ogg')
          .replace(/\.(rpgmvm|m4a_)$/i, '.m4a')
        if (/\.(rpgmvo|ogg_|rpgmvm|m4a_|png_|rpgmvp)$/i.test(name)) {
          const res = new Uint8Array(decryptBuffer((await fs.readFile(filePath)).buffer))
          await fs.outputFile(outPath, res)
        } else {
          await fs.ensureDir(path.join(outPath, '..'))
          await fs.copyFile(filePath, outPath)
        }
        state.writing.percentage += 1
      }
    } catch (err) {
      state.writing.show = false
      alert(err)
    }
    setTimeout(() => {
      state.writing.show = false
    }, 500)
  }, 50)
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
            const res = new Uint8Array(decryptBuffer((await fs.readFile(filePath)).buffer))
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
            const res = new Uint8Array(decryptBuffer((await fs.readFile(filePath)).buffer))
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
