import { setting } from '../../store'
import { message, checkDir, isReady, saveFile, isWriting, isLoading, encryption } from './utils'

ipcRenderer.on('select-new-dir', (_e, result: Electron.OpenDialogReturnValue) => {
  if (isWriting()) {
    message.warning('正在导出')
    return
  }
  if (isLoading()) {
    message.warning('正在加载')
    return
  }
  checkDir(result.filePaths[0])
})

ipcRenderer.on('open-dir', () => {
  if (isReady()) {
    shell.openPath(setting.baseUrl)
  } else {
    message.warning('未加载项目')
  }
})

ipcRenderer.on('export-img', (_e, result: Electron.OpenDialogReturnValue) => {
  if (isLoading()) {
    message.warning('正在加载')
    return
  }
  if (isWriting()) {
    message.warning('正在导出')
    return
  }
  if (isReady()) {
    saveFile(result.filePaths[0], 'img')
  } else {
    message.warning('未加载项目')
  }
})

ipcRenderer.on('export-audio', (_e, result: Electron.OpenDialogReturnValue) => {
  if (isLoading()) {
    message.warning('正在加载')
    return
  }
  if (isWriting()) {
    message.warning('正在导出')
    return
  }
  if (isReady()) {
    saveFile(result.filePaths[0], 'audio')
  } else {
    message.warning('未加载项目')
  }
})

ipcRenderer.on('export-all', (_e, result: Electron.OpenDialogReturnValue) => {
  if (isLoading()) {
    message.warning('正在加载')
    return
  }
  if (isWriting()) {
    message.warning('正在导出')
    return
  }
  if (isReady()) {
    saveFile(result.filePaths[0], 'all')
  } else {
    message.warning('未加载项目')
  }
})

ipcRenderer.on('encryption', (_e, result: Electron.OpenDialogReturnValue) => {
  if (isWriting()) {
    message.warning('正在导出')
    return
  }
  if (isLoading()) {
    message.warning('正在加载')
    return
  }
  if (isReady()) {
    encryption(result.filePaths)
  } else {
    message.warning('未加载项目')
  }
})
