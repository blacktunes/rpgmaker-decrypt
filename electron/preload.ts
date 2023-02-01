import { contextBridge, ipcRenderer, shell } from 'electron'
import fs from 'fs-extra'
import path from 'path'

Buffer.poolSize = 0

contextBridge.exposeInMainWorld('ipcRenderer', {
  ...ipcRenderer,
  on: ipcRenderer.on.bind(ipcRenderer),
  removeListener: ipcRenderer.removeListener.bind(ipcRenderer)
})
contextBridge.exposeInMainWorld('shell', shell)
contextBridge.exposeInMainWorld('fs', fs)
contextBridge.exposeInMainWorld('isDirectory', (url: string) => {
  return fs.statSync(url).isDirectory()
})
contextBridge.exposeInMainWorld('path', path)
contextBridge.exposeInMainWorld('Buffer', {
  from: Buffer.from,
  concat: Buffer.concat
})
