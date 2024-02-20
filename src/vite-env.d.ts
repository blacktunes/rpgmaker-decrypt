/// <reference types="vite/client" />

import Fs from "fs-extra"
import Path from "path"
import Electron from "electron"

declare global {
  const fs = Fs
  const path = Path
  const ipcRenderer = Electron.ipcRenderer
  const shell = Electron.shell
}
