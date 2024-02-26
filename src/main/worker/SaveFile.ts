import { parentPort } from 'worker_threads'
import { decryptBuffer } from '../../utils/encryption'

import {
  copyFile,
  readJSON,
  writeJSON,
  pathExists,
  writeFile,
  readFile,
  outputFile,
  ensureDir,
  rename,
  remove
} from 'fs-extra'
import { join, sep } from 'path'

const createMessage = (data: SaveFileWorkerEvent): SaveFileWorkerEvent => data

if (parentPort) {
  const parent = parentPort

  parentPort.on(
    'message',
    async ({ filesList, baseUrl, dir, gameTitle, encryptionKey, backup }: SaveFileWorkerProps) => {
      // 如果dir不存在则为解密游戏
      if (!dir) {
        await copyFile(join(baseUrl, 'data/System.json'), join(baseUrl, 'data/System.json.bak'))

        const systemPath = join(baseUrl, 'data/System.json')
        const systemData = await readJSON(systemPath)
        delete systemData.hasEncryptedImages
        delete systemData.hasEncryptedAudio
        delete systemData.encryptionKey
        await writeJSON(systemPath, systemData)

        if (await pathExists(join(baseUrl, 'nw.dll'))) {
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
            parent.postMessage(
              createMessage({
                type: 'progress',
                content: type
              })
            )
          }
        }
      }

      if (!dir) {
        if (await pathExists(join(baseUrl, 'img'))) {
          if (backup) {
            await rename(join(baseUrl, 'img'), join(baseUrl, 'img[backup]'))
          } else {
            await remove(join(baseUrl, 'img'))
          }
          await rename(join(baseUrl, '_img_'), join(baseUrl, 'img'))
        }
        if (await pathExists(join(baseUrl, 'audio'))) {
          if (backup) {
            await rename(join(baseUrl, 'audio'), join(baseUrl, 'audio[backup]'))
          } else {
            await remove(join(baseUrl, 'audio'))
          }
          await rename(join(baseUrl, '_audio_'), join(baseUrl, 'audio'))
        }
      }

      parent.postMessage(
        createMessage({
          type: 'done',
          reload: !dir
        })
      )
    }
  )
}
