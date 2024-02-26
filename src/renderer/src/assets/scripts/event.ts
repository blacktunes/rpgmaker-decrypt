import { setting } from '@/store'
import { checkDir, decryptGame, encryption, saveFile } from './utils'

ipcRenderer.on('select-new-dir', (_e, result: string) => {
  checkDir(result)
})

ipcRenderer.on('open-dir', () => {
  shell.openPath(setting.baseUrl)
})

ipcRenderer.on('export-img', (_e, result: string) => {
  saveFile(result, 'image')
})

ipcRenderer.on('export-audio', (_e, result: string) => {
  saveFile(result, 'audio')
})

ipcRenderer.on('export-all', (_e, result: string) => {
  saveFile(result, 'all')
})

ipcRenderer.on('encryption', (_e, result: string[]) => {
  encryption(result)
})

ipcRenderer.on('decrypt-game', () => {
  decryptGame()
})
