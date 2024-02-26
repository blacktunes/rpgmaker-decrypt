import { contextBridge, shell } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import fs from 'fs-extra'
import path from 'path'

Buffer.poolSize = 0

contextBridge.exposeInMainWorld('ipcRenderer', electronAPI.ipcRenderer)
contextBridge.exposeInMainWorld('shell', shell)
contextBridge.exposeInMainWorld('fs', fs)
contextBridge.exposeInMainWorld('path', path)
contextBridge.exposeInMainWorld('Buffer', {
  from: Buffer.from,
  concat: Buffer.concat
})
