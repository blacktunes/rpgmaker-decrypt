/// <reference lib="WebWorker" />

const { pathExists, readJSON, stat, readdir } = require('fs-extra') as typeof import('fs-extra')
const { join, basename } = require('path') as typeof import('path')

const createMessage = (data: LoadFileWorkerEvent): LoadFileWorkerEvent => data

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

self.onmessage = async (event: MessageEvent) => {
  try {
    const filePath: string = event.data

    const systemPath = join(filePath, 'data/System.json')
    if (await pathExists(systemPath)) {
      try {
        const { encryptionKey, gameTitle } = await readJSON(systemPath)
        console.log(encryptionKey)
        self.postMessage(
          createMessage({
            type: 'system',
            content: {
              key: encryptionKey,
              title: gameTitle
            }
          })
        )
      } catch (err) {
        console.error(err)
        self.postMessage(
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
      self.postMessage(
        createMessage({
          type: 'no-system'
        })
      )
    }
    if (await pathExists(join(filePath, 'img'))) {
      const imageFileTree = await getFileTree(join(filePath, 'img'), () => {
        self.postMessage(
          createMessage({
            type: 'count',
            content: 'image'
          })
        )
      })
      self.postMessage(
        createMessage({
          type: 'image',
          content: sort(imageFileTree)
        })
      )
    }

    if (await pathExists(join(filePath, 'img'))) {
      const audioFileTree = await getFileTree(join(filePath, 'audio'), () => {
        self.postMessage(
          createMessage({
            type: 'count',
            content: 'audio'
          })
        )
      })
      self.postMessage(
        createMessage({
          type: 'audio',
          content: sort(audioFileTree)
        })
      )
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

export {}
