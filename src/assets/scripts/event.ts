import { setting } from '@/store'
import {
  checkDir,
  decryptGame,
  encryption,
  saveFile
} from './utils'

ipcRenderer.on('select-new-dir', (_e, result: Electron.OpenDialogReturnValue) => {
  checkDir(result.filePaths[0])
})

ipcRenderer.on('open-dir', () => {
  shell.openPath(setting.baseUrl)
})

ipcRenderer.on('export-img', (_e, result: Electron.OpenDialogReturnValue) => {
  saveFile(result.filePaths[0], 'image')
})

ipcRenderer.on('export-audio', (_e, result: Electron.OpenDialogReturnValue) => {
  saveFile(result.filePaths[0], 'audio')
})

ipcRenderer.on('export-all', (_e, result: Electron.OpenDialogReturnValue) => {
  saveFile(result.filePaths[0], 'all')
})

ipcRenderer.on('encryption', (_e, result: Electron.OpenDialogReturnValue) => {
  encryption(result.filePaths)
})

ipcRenderer.on('decrypt-game', (_e) => {
  decryptGame()
})
