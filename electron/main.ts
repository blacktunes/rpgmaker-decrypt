/// <reference types="./electron-env" />
/// <reference types="../src/event" />

process.env.DIST = join(__dirname, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST, '../public')

import { join } from 'path'
import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron'
import { createMenu } from './menu'

const preload = join(__dirname, './preload.js')
const url = process.env['VITE_DEV_SERVER_URL']

const createWindow = () => {
  const win: BrowserWindow = new BrowserWindow({
    show: false,
    width: 900,
    height: 600,
    minWidth: 900,
    minHeight: 600,
    icon: join(process.env.PUBLIC, 'icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      nodeIntegrationInWorker: true,
      preload
    }
  })
  const menu = createMenu(win)
  Menu.setApplicationMenu(menu)

  if (url) {
    win.loadURL(url)
  } else {
    win.loadFile(join(process.env.DIST, 'index.html'))
  }

  win.on('closed', () => {
    app.quit()
    process.exit()
  })

  ipcMain.handle('select-dir', async () => {
    win.focus()
    const result = await dialog.showOpenDialog(win, { properties: ['openDirectory'] })
    return result
  })

  let encryption = false
  ipcMain.on('set-state', (_e, event: StateEvent) => {
    const { ready, busy } = event
    menu.getMenuItemById('load')!.enabled = !busy
    menu.getMenuItemById('open-dir')!.enabled = !busy
    menu.getMenuItemById('export-img')!.enabled = ready && !busy
    menu.getMenuItemById('export-audio')!.enabled = ready && !busy
    menu.getMenuItemById('export-all')!.enabled = ready && !busy
    menu.getMenuItemById('encryption')!.enabled = ready && !busy && encryption
    menu.getMenuItemById('decrypt-game')!.enabled = ready && !busy && encryption
  })

  ipcMain.on('set-encryption', (_e, flag: boolean) => {
    encryption = flag
  })

  let start = false
  ipcMain.on('ready', () => {
    win.show()
    if (process.argv[1]) {
      if (start) return
      win.webContents.send('select-new-dir', process.argv[1])
    }
    start = true
  })

  ipcMain.on('error', (_e, error) => {
    if (win.isVisible()) return
    dialog.showErrorBox('', error)
    app.exit()
    process.exit()
  })
}

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(createWindow)
