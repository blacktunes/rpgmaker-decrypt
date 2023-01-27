import { state, setting, previweItem, sidebar } from '../../store'

const reset = () => {
  state.img = 0
  state.audio = 0

  setting.previweIndex = setting.imageFileList.length

  previweItem.name = ''
  previweItem.path = ''

  sidebar.search = ''
}

export const checkDir = (url: string) => {
  state.loading = true
  setTimeout(() => {
    try {
      _checkDir(url)
      state.loading = false
    } catch (err) {
      console.error(err)
      state.ready = false
      state.loading = false
      alert(err)
    }
  }, 50)
}

export const _checkDir = (url: string) => {
  console.log(url)
  if (url === setting.baseUrl) return

  if (fs.existsSync(url)) {
    setting.baseUrl = url
    let _url: string
    if (fs.existsSync(path.join(url, 'www/data/System.json'))) {
      _url = 'www/'
    } else if (fs.existsSync(path.join(url, 'data/System.json'))) {
      _url = '/'
    } else {
      alert('不是MZ/MZ目录或data/System.json不存在')
      return
    }

    const filePath = path.join(url, _url)
    setting.filePath = filePath

    const systemPath = path.join(filePath, 'data/System.json')
    const { encryptionKey, gameTitle } = fs.readJSONSync(systemPath)
    console.log(encryptionKey)
    setting.encryptionKey = encryptionKey
    document.title = gameTitle

    const imageFileTree = dirTree(path.join(filePath, 'img'), {
      extensions: /\.(png|png_|rpgmvp)$/i,
    }, () => {
      state.img += 1
    })
    setting.imageFileList = getFileList(imageFileTree)
    setting.imageFileTree = imageFileTree
    if (setting.imageFileTree.name) {
      setting.imageFileTree.name = `图片[${state.img}]`
    }

    const audioFileTree = dirTree(path.join(filePath, 'audio'), {
      extensions: /\.(ogg|ogg_|m4a|m4a_|rpgmvo|rpgmvm)$/i
    }, () => {
      state.audio += 1
    })
    getFileList(audioFileTree)
    setting.audioFileTree = audioFileTree
    if (setting.audioFileTree.name) {
      setting.audioFileTree.name = `音频[${state.audio}]`
    }

    reset()
    state.ready = true
  } else {
    alert('路径不存在')
  }
}

export const getFileList = (obj: directoryTree.DirectoryTree, parent?: directoryTree.DirectoryTree) => {
  const { children, name, path } = obj
  let list: {
    name: string
    path: string
  }[] = []
  if (children) {
    let i = children.length
    while (i--) {
      const child = children[i]
      list = [...list, ...getFileList(child, obj)]
    }

    if (parent?.children) {
      if (children.length === 0) {
        const index = parent.children.findIndex((child: any) => child.name === name)
        parent.children.splice(index, 1)
      }
    }
  } else {
    list.push({
      name,
      path
    })
  }
  return list
}
