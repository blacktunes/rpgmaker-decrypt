import type { electronAPI } from '@electron-toolkit/preload'
import type Electron from 'electron'
import type Fs from 'fs-extra'
import type Path from 'path'

declare global {
  const fs = Fs
  const path = Path
  const ipcRenderer = electronAPI.ipcRenderer
  const shell = Electron.shell
}
