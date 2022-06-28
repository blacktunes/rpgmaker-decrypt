var electron = require('electron')
var fs = require('fs-extra')
var path = require('path')

var app = new Vue({
  el: "#app",
  data: () => ({
    gameTitle: '',
    encryptionKey: '',
    headerlength: 16,
    progress: 0,
    imgList: [],
    audioList: [],
    basePath: '',
    outPath: '',
    autoOutDir: false,
    path: null,
    imgPreview: false,
    img: '',
    index: -1
  }),
  methods: {
    reset() {
      this.progress = 0
      this.encryptionKey = ''
      this.imgList = []
      this.basePath = ''
      this.path = null
      this.imgPreview = false
      this.img = ''
      this.index = -1
    },
    selectDir() {
      electron.ipcRenderer.invoke('select-dir')
        .then(res => {
          if (!res.canceled) {
            this.reset()
            this.basePath = res.filePaths[0]
            this.setOutDir()
            this.path = this.checkDir()

            if (!this.path) return

            if (this.readSystem()) {
              this.readImg()
              // this.readAudio()
            }
          }
        })
    },
    checkDir() {
      if (fs.existsSync(path.join(this.basePath, 'www/data/System.json'))) {
        return 'www/'
      }
      if (fs.existsSync(path.join(this.basePath, 'data/System.json'))) {
        return '/'
      }
      return null
    },
    selectOutDir() {
      electron.ipcRenderer.invoke('select-out-dir')
        .then(res => {
          if (!res.canceled) {
            this.outPath = res.filePaths[0]
            localStorage.setItem('out', this.outPath)
          }
        })
    },
    changeCheck() {
      this.autoOutDir = !this.autoOutDir
      this.setOutDir()
    },
    readSystem() {
      const systemPath = path.join(this.basePath, this.path, 'data/System.json')
      let flag = false
      if (fs.existsSync(systemPath)) {
        const system = require(systemPath)
        if (system.gameTitle) {
          this.gameTitle = system.gameTitle
        }
        if (system.encryptionKey) {
          this.encryptionKey = system.encryptionKey
          flag = true
        }
      }
      return flag
    },
    readImg() {
      this.imgList = this.readDir(path.join(this.basePath, this.path, 'img')).filter(item => {
        return (item.endsWith('.rpgmvp') || item.endsWith('.png_'))
      })
    },
    readAudio() {
      this.audioList = this.readDir(path.join(this.basePath, this.path, 'audio')).filter(item => {
        return (item.endsWith('.rpgmvo') || item.endsWith('.rpgmvm'))
      })
    },
    async writeImg() {
      const s = Date.now()
      let _e = s
      for (const imgPath of this.imgList) {
        const res = this.decryptArrayBuffer(fs.readFileSync(imgPath).buffer)
        const outPath = imgPath.replace(path.join(this.basePath, 'www'), this.outPath).replace('rpgmvp', 'png')
        const n = Date.now()
        console.log(`[${(n - _e) / 1000}s] `, outPath)
        _e = n
        ++this.progress
        await fs.outputFile(outPath, res)
      }
      console.log(`[${(Date.now() - s) / 1000}s] `, 'img done!')
    },
    async writeAudio() {
      const s = Date.now()
      let _e = s
      for (const audioPath of this.audioList) {
        const res = this.decryptArrayBuffer(fs.readFileSync(audioPath).buffer)
        const outPath = audioPath.replace(path.join(this.basePath, 'www'), this.outPath).replace('rpgmvo', 'ogg').replace('rpgmvm', 'm4a')
        const n = Date.now()
        console.log(`[${(n - _e) / 1000}s] `, outPath)
        _e = n
        ++this.progress
        await fs.outputFile(outPath, res)
      }
      console.log(`[${(Date.now() - s) / 1000}s] `, 'audio done!')
    },
    startDecrypt() {
      fs.ensureDirSync(this.outPath)
      this.writeImg()
      this.writeAudio()
    },
    decryptArrayBuffer(arrayBuffer) {
      if (!arrayBuffer) return null;

      arrayBuffer = arrayBuffer.slice(this.headerlength)
      const encryptionKey = this.encryptionKey.split(/(.{2})/).filter(Boolean)
      const view = new DataView(arrayBuffer)
      if (arrayBuffer) {
        const byteArray = new Uint8Array(arrayBuffer)
        for (i = 0; i < this.headerlength; i++) {
          byteArray[i] = byteArray[i] ^ parseInt(encryptionKey[i], 16)
          view.setUint8(i, byteArray[i])
        }
      }
      return view
    },
    decryptArrayBufferMz(source) {
      const header = new Uint8Array(source, 0, 16)
      const headerHex = Array.from(header, x => x.toString(16)).join(",")
      if (headerHex !== "52,50,47,4d,56,0,0,0,0,3,1,0,0,0,0,0") {
        throw new Error("Decryption error")
      }
      const body = source.slice(16)
      const view = new DataView(body)
      const key = this.encryptionKey.match(/.{2}/g)
      for (let i = 0; i < 16; i++) {
        view.setUint8(i, view.getUint8(i) ^ parseInt(key[i], 16))
      }
      return body
    },
    toBase64(buffer) {
      return new Promise(resolve => {
        const file = new FileReader()
        file.onload = (e) => {
          resolve(e.target.result)
        }
        file.readAsDataURL(new Blob([buffer]))
      })
    },
    readDir(entry) {
      let list = []
      const dirInfo = fs.readdirSync(entry);
      dirInfo.forEach(item => {
        const location = path.join(entry, item);
        const info = fs.statSync(location);
        if (info.isDirectory()) {
          list = [...list, ...this.readDir(location)]
        } else {
          list.push(location)
        }
      })
      return list
    },
    async previweImg(index) {
      this.img = ''
      this.index = -1
      const img = fs.readFileSync(this.imgList[index]).buffer
      let temp
      if (this.imgList[index].endsWith('_')) {
        temp = this.decryptArrayBufferMz(img)
      } else {
        temp = this.decryptArrayBuffer(img)
      }
      this.img = await this.toBase64(temp)
      this.index = index
    },
    preIndex() {
      const temp = this.index - 1
      if (temp >= 0) {
        this.previweImg(temp)
        window.location.hash = temp
      }
    },
    nextIndex() {
      const temp = this.index + 1
      if (temp <= this.imgList.length - 1) {
        this.previweImg(temp)
        window.location.hash = temp
      }
    },
    setOutDir() {
      if (this.autoOutDir) {
        if (this.basePath) {
          this.outPath = path.join(this.basePath, 'out')
        }
      } else {
        const out = localStorage.getItem('out')
        this.outPath = out || path.join(__dirname, 'out')
      }
    }
  },
  created() {
    this.setOutDir()
    document.addEventListener('keydown', e => {
      if (!this.imgPreview) return
      if (e.keyCode === 37) {
        this.preIndex()
      }
      if (e.keyCode === 39) {
        this.nextIndex()
      }
    })
  },
  mounted() {
    setTimeout(() => {
      electron.ipcRenderer.send('ready')
    }, 50)
  }
})