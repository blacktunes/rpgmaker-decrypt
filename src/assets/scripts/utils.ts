import { state, setting } from '../../store'

export const checkDir = (url: string) => {
  state.loading = true
  setTimeout(() => {
    _checkDir(url)
    state.loading = false
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
    const { encryptionKey, gameTitle } = JSON.parse(fs.readFileSync(systemPath, 'utf8')) || {}
    console.log(encryptionKey)
    setting.encryptionKey = encryptionKey
    document.title = gameTitle

    const imageFileTree = dirTree(path.join(filePath, 'img'), {
      extensions: /\.(png|png_|rpgmvp)$/i
    })
    removeEmptyFolder(imageFileTree)
    setting.imageFileTree = imageFileTree

    const audioFileTree = dirTree(path.join(filePath, 'audio'), {
      extensions: /\.(ogg|ogg_|m4a|m4a_|rpgmvo|rpgmvm)$/i
    })
    removeEmptyFolder(audioFileTree)
    setting.audioFileTree = audioFileTree

    // if (fs.existsSync(path.join(filePath, 'js/rpg_core.js'))) {
    //   setting.version = 'MV'
    // } else if (fs.existsSync(path.join(filePath, 'js/rmmz_core.js'))) {
    //   setting.version = 'MZ'
    // } else {
    //   alert('无法确认版本，默认为MV')
    // }

    state.ready = true
  } else {
    alert('路径不存在')
  }
}

export const removeEmptyFolder = (obj: any, parent?: any) => {
  const { children, name } = obj
  if (children) {
    let i = children.length
    while (i--) {
      const child = children[i]
      removeEmptyFolder(child, obj)
    }

    if (children.length === 0) {
      const index = parent.children.findIndex((child: any) => child.name === name)
      parent.children.splice(index, 1)
    }
  }
}
