/// <reference lib="WebWorker" />

import { decryptBuffer } from '@/assets/scripts/encryption'

const fs_worker = require('fs-extra') as typeof import('fs-extra')
const path_worker = require('path') as typeof import('path')

const createMessage = (data: SaveFileWorkerEvent): SaveFileWorkerEvent => data

self.onmessage = async (event: MessageEvent) => {
  try {
    const { filesList, baseUrl, dir, gameTitle, encryptionKey }: SaveFileWorkerProps = event.data

    let type: 'image' | 'audio'
    for (type in filesList) {
      const list = filesList[type]
      if (list.length > 0) {
        for (const { name, path: filePath } of list) {
          const outPath = filePath
            .replace(
              baseUrl,
              path_worker.join(dir, `${gameTitle || 'Game'}[decrypt]${path_worker.sep}`)
            )
            .replace(/\.(rpgmvp|png_)$/i, '.png')
            .replace(/\.(rpgmvo|ogg_)$/i, '.ogg')
            .replace(/\.(rpgmvm|m4a_)$/i, '.m4a')
          if (/\.(rpgmvo|ogg_|rpgmvm|m4a_|png_|rpgmvp)$/i.test(name)) {
            const res = new Uint8Array(
              decryptBuffer((await fs_worker.readFile(filePath)).buffer, encryptionKey)
            )
            await fs_worker.outputFile(outPath, res)
          } else {
            await fs_worker.ensureDir(path_worker.join(outPath, '..'))
            await fs_worker.copyFile(filePath, outPath)
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
