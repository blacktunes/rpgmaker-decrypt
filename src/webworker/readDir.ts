/// <reference lib="WebWorker" />

const fs_worker = require('fs-extra') as typeof import('fs-extra')
const path_worker = require('path') as typeof import('path')

const createMessage = (data: DirWorkerEvent): DirWorkerEvent => data

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
  const filePath = event.data

  const systemPath = path_worker.join(filePath, 'data/System.json')
  if (await fs_worker.exists(systemPath)) {
    const { encryptionKey, gameTitle } = await fs_worker.readJSON(systemPath)
    console.log(encryptionKey)
    self.postMessage(
      createMessage({
        type: 'system',
        key: encryptionKey,
        title: gameTitle
      })
    )
  } else {
    self.postMessage(
      createMessage({
        type: 'no-system',
        title: 'System.json不存在',
        content: '加密文件将无法读取'
      })
    )
  }
  if (await fs_worker.exists(path_worker.join(filePath, 'img'))) {
    const imageFileTree = await getFileTree(path_worker.join(filePath, 'img'), () => {
      self.postMessage(
        createMessage({
          type: 'count',
          count: 'image'
        })
      )
    })
    self.postMessage(
      createMessage({
        type: 'image',
        data: sort(imageFileTree)
      })
    )
  }

  if (await fs_worker.exists(path_worker.join(filePath, 'img'))) {
    const audioFileTree = await getFileTree(path_worker.join(filePath, 'audio'), () => {
      self.postMessage(
        createMessage({
          type: 'count',
          count: 'audio'
        })
      )
    })
    self.postMessage(
      createMessage({
        type: 'audio',
        data: sort(audioFileTree)
      })
    )
  }

  self.postMessage(
    createMessage({
      type: 'done'
    })
  )
}

const getFileTree = async (url: string, fn?: Function): Promise<DirectoryTree> => {
  if (fs_worker.statSync(url).isDirectory()) {
    const list = await fs_worker.readdir(url)
    const dirTree: DirectoryTree = {
      name: path_worker.basename(url),
      path: url,
      children: []
    }
    if (list.length > 0) {
      for (const subUrl of list) {
        const subItem = await getFileTree(path_worker.join(url, subUrl), fn)
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
      name: path_worker.basename(url),
      path: url
    }
  }
}
