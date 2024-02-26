/// <reference types="vite/client" />

import type Fs from 'fs-extra'
import type Path from 'path'
import type Electron from 'electron'

declare global {
  const fs = Fs
  const path = Path
  const ipcRenderer = Electron.ipcRenderer
  const shell = Electron.shell
}
