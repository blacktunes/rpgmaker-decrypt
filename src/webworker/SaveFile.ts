/// <reference lib="WebWorker" />
// @ts-ignore
const fs = undefined
// @ts-ignore
const path = undefined
// @ts-ignore
const ipcRenderer = undefined
// @ts-ignore
const shell = undefined
// 防止误用Electron注入的全局变量

import { decryptBuffer } from '@/assets/scripts/encryption'

const {
  copyFile,
  readJSON,
  writeJSON,
  exists,
  writeFile,
  readFile,
  outputFile,
  ensureDir,
  rename,
  remove
} = require('fs-extra') as typeof import('fs-extra')
const { join, sep } = require('path') as typeof import('path')

const createMessage = (data: SaveFileWorkerEvent): SaveFileWorkerEvent => data

self.onmessage = async (event: MessageEvent) => {
  try {
    const { filesList, baseUrl, dir, gameTitle, encryptionKey, backup }: SaveFileWorkerProps =
      event.data

    // 如果dir不存在则为解密游戏
    if (!dir) {
      await copyFile(join(baseUrl, 'data/System.json'), join(baseUrl, 'data/System.json.bak'))

      const systemPath = join(baseUrl, 'data/System.json')
      const systemData = await readJSON(systemPath)
      delete systemData.hasEncryptedImages
      delete systemData.hasEncryptedAudio
      delete systemData.encryptionKey
      await writeJSON(systemPath, systemData)

      if (await exists(join(baseUrl, 'nw.dll'))) {
        await writeFile(join(baseUrl, 'Game.rmmzproject'), 'RPGMZ 1.4.3')
      } else {
        await writeFile(join(baseUrl, 'Game.rpgproject'), 'RPGMV 1.6.1')
      }
    }

    let type: 'image' | 'audio'
    for (type in filesList) {
      const list = filesList[type]
      if (list.length > 0) {
        for (const { name, path: filePath } of list) {
          let outPath = filePath
            .replace(/\.(rpgmvp|png_)$/i, '.png')
            .replace(/\.(rpgmvo|ogg_)$/i, '.ogg')
            .replace(/\.(rpgmvm|m4a_)$/i, '.m4a')
          if (dir) {
            outPath = outPath.replace(baseUrl, join(dir, `${gameTitle || 'Game'}[decrypt]${sep}`))
          } else {
            outPath = outPath
              .replace(`${sep}img${sep}`, `${sep}_img_${sep}`)
              .replace(`${sep}audio${sep}`, `${sep}_audio_${sep}`)
          }
          if (/\.(rpgmvo|ogg_|rpgmvm|m4a_|png_|rpgmvp)$/i.test(name)) {
            const res = new Uint8Array(
              decryptBuffer((await readFile(filePath)).buffer, encryptionKey)
            )
            await outputFile(outPath, res)
          } else {
            await ensureDir(join(outPath, '..'))
            await copyFile(filePath, outPath)
          }
          self.postMessage(
            createMessage({
              type: 'progress',
              content: type
            })
          )
        }
      }
    }

    if (!dir) {
      if (await exists(join(baseUrl, 'img'))) {
        if (backup) {
          await rename(join(baseUrl, 'img'), join(baseUrl, 'img[backup]'))
        } else {
          await remove(join(baseUrl, 'img'))
        }
        await rename(join(baseUrl, '_img_'), join(baseUrl, 'img'))
      }
      if (await exists(join(baseUrl, 'audio'))) {
        if (backup) {
          await rename(join(baseUrl, 'audio'), join(baseUrl, 'audio[backup]'))
        } else {
          await remove(join(baseUrl, 'audio'))
        }
        await rename(join(baseUrl, '_audio_'), join(baseUrl, 'audio'))
      }
    }

    self.postMessage(
      createMessage({
        type: 'done'
      })
    )
  } catch (err) {
    console.error(err)
    self.postMessage(
      createMessage({
        type: 'error',
        content: err as Error
      })
    )
  }
}

export {}
