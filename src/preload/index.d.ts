/* eslint-disable @typescript-eslint/no-unused-vars */
import type { electronAPI } from '@electron-toolkit/preload'
import type Electron from 'electron'
import type Fs from 'fs-extra'
import type Path from 'path'
import type {
  decryptBuffer as DecryptBuffer,
  encryptionBuffer as EncryptionBuffer
} from '../utils/encryption'

declare global {
  const fs = Fs
  const path = Path
  const ipcRenderer = electronAPI.ipcRenderer
  const shell = Electron.shell
  const decryptBuffer = DecryptBuffer
  const encryptionBuffer = EncryptionBuffer
}
