process.env.DIST = join(__dirname, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST, '../public')

import { join } from 'path'
import { app, BrowserWindow, dialog, ipcMain } from 'electron'

let win: BrowserWindow | null
// Here, you can also use other preload
const preload = join(__dirname, './preload.js')
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const url = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    show: true,
    minWidth: 800,
    minHeight: 600,
    icon: join(process.env.PUBLIC, 'icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload
    }
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (url) {
    win.loadURL(url)
  } else {
    win.loadFile(join(process.env.DIST, 'index.html'))
  }

  win.on('closed', () => {
    app.quit()
    process.exit()
  })
}

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('select-dir', async () => {
  if (win) {
    win.focus()
    const result = await dialog.showOpenDialog(win, { properties: ['openDirectory'] })
    return result
  } else {
    return {
      canceled: true
    }
  }
})

app.whenReady().then(createWindow)
