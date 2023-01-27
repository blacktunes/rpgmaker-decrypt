import { setting } from '../../store'
import { checkDir } from './utils'

ipcRenderer.on('open-dir', () => {
  if (setting.baseUrl) {
    shell.openPath(setting.baseUrl)
  }
})

ipcRenderer.on('select-new-dir', (_e, res) => {
  checkDir(res.filePaths[0])
})