import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, shell } from 'electron'
import fs from 'fs-extra'
import path from 'path'
import { decryptBuffer, encryptionBuffer } from '../utils/encryption'

Buffer.poolSize = 0

contextBridge.exposeInMainWorld('ipcRenderer', electronAPI.ipcRenderer)
contextBridge.exposeInMainWorld('shell', shell)
contextBridge.exposeInMainWorld('fs', fs)
contextBridge.exposeInMainWorld('path', path)
contextBridge.exposeInMainWorld('decryptBuffer', decryptBuffer)
contextBridge.exposeInMainWorld('encryptionBuffer', encryptionBuffer)
