/// <reference types="../../renderer/types" />

import { parentPort } from 'worker_threads'

import { pathExists, readJSON, stat, readdir } from 'fs-extra'
import { join, basename } from 'path'

const createMessage = (data: LoadFileWorkerEvent): LoadFileWorkerEvent => data

if (parentPort) {
  const parent = parentPort

  parentPort.on('message', async (filePath: string) => {
    let key: string | undefined
    let title: string | undefined
    const systemPath = join(filePath, 'data/System.json')
    if (await pathExists(systemPath)) {
      try {
        const { encryptionKey, gameTitle } = await readJSON(systemPath)
        key = encryptionKey
        title = gameTitle
      } catch (err) {
        parent.postMessage(
          createMessage({
            type: 'message-error',
            content: {
              title: '无法加载System.json',
              message: '文件可能被加密\n加密文件将无法读取'
            }
          })
        )
      }
    } else {
      parent.postMessage(
        createMessage({
          type: 'no-system'
        })
      )
    }
    if (await pathExists(join(filePath, 'img'))) {
      const imageFileTree = await getFileTree(join(filePath, 'img'), () => {
        parent.postMessage(
          createMessage({
            type: 'count',
            content: 'image'
          })
        )
      })
      parent.postMessage(
        createMessage({
          type: 'image',
          content: sort(imageFileTree)
        })
      )
    }

    if (await pathExists(join(filePath, 'img'))) {
      const audioFileTree = await getFileTree(join(filePath, 'audio'), () => {
        parent.postMessage(
          createMessage({
            type: 'count',
            content: 'audio'
          })
        )
      })
      parent.postMessage(
        createMessage({
          type: 'audio',
          content: sort(audioFileTree)
        })
      )
    }

    parent.postMessage(
      createMessage({
        type: 'done',
        content: {
          baseUrl: filePath,
          key,
          title
        }
      })
    )
  })
}

const sort = (obj: DirectoryTree) => {
  if (obj.children) {
    obj.children.sort((a, b) => {
      if (a.children !== undefined && b.children === undefined) {
        return -1
      }
      if (a.children === undefined && b.children !== undefined) {
        return 1
      }
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    })
    for (const i in obj.children) {
      if (obj.children[i].children) {
        sort(obj.children[i])
      }
    }
  }
  return obj
}

const getFileTree = async (url: string, fn?: () => void): Promise<DirectoryTree> => {
  if ((await stat(url)).isDirectory()) {
    const list = await readdir(url)
    const dirTree: DirectoryTree = {
      name: basename(url),
      path: url,
      children: []
    }
    if (list.length > 0) {
      for (const subUrl of list) {
        const subItem = await getFileTree(join(url, subUrl), fn)
        if (subItem) {
          dirTree.children?.push(subItem)
        }
      }
    } else {
      dirTree.disabled = true
      dirTree.children = null
    }
    return dirTree
  } else {
    if (fn) {
      fn()
    }
    return {
      name: basename(url),
      path: url
    }
  }
}
