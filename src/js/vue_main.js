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
    autoOutDir: false
  }),
  methods: {
    reset() {
      this.progress = 0
      this.encryptionKey = ''
      this.imgList = []
      this.basePath = ''
    },
    selectDir() {
      this.reset()

      electron.ipcRenderer.invoke('select-dir')
        .then(res => {
          if (!res.canceled) {
            this.basePath = res.filePaths[0]
            this.setOutDir()
            if (this.readSystem()) {
              this.readImg()
              this.readAudio()
            }
          }
        })
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
      const systemPath = path.join(this.basePath, 'www/data/System.json')
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
      this.imgList = this.readDir(path.join(this.basePath, 'www/img')).filter(item => {
        return item.endsWith('.rpgmvp')
      })
    },
    readAudio() {
      this.audioList = this.readDir(path.join(this.basePath, 'www/audio')).filter(item => {
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
      var view = new DataView(arrayBuffer);
      if (arrayBuffer) {
        var byteArray = new Uint8Array(arrayBuffer);
        for (i = 0; i < this.headerlength; i++) {
          byteArray[i] = byteArray[i] ^ parseInt(encryptionKey[i], 16);
          view.setUint8(i, byteArray[i]);
        }
      }
      return view;
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
  },
  mounted() {
    setTimeout(() => {
      electron.ipcRenderer.send('ready')
    }, 50)
  }
})