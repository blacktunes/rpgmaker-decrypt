/// <reference types="vite/client" />

import Fs from "fs"
import Path from "path"
import Electron from "electron"
import DirTree from "directory-tree"

declare global {
  const fs = Fs
  const path = Path
  const ipcRenderer = Electron.ipcRenderer
  const dirTree = DirTree
}
