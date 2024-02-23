/// <reference types="./electron-env" />
/// <reference types="../src/event" />

process.env.DIST = join(__dirname, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST, '../public')

import { join } from 'path'
import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron'

let win: BrowserWindow | null
const preload = join(__dirname, './preload.js')
const url = process.env['VITE_DEV_SERVER_URL']

const menu = Menu.buildFromTemplate([
  {
    label: '加载',
    submenu: [
      {
        id: 'load',
        label: '选择目录',
        enabled: true,
        click: async () => {
          if (win) {
            win.focus()
            const result = await dialog.showOpenDialog(win, { properties: ['openDirectory'] })
            if (!result.canceled) {
              win.webContents.send('select-new-dir', result)
            }
          }
        }
      },
      {
        id: 'open-dir',
        label: '打开游戏目录',
        enabled: false,
        click: () => {
          if (win) {
            win.webContents.send('open-dir')
          }
        }
      }
    ]
  },
  {
    label: '导出',
    submenu: [
      {
        id: 'export-img',
        label: '导出图片',
        enabled: false,
        click: async () => {
          if (win) {
            win.focus()
            const result = await dialog.showOpenDialog(win, { properties: ['openDirectory'] })
            if (!result.canceled) {
              win.webContents.send('export-img', result)
            }
          }
        }
      },
      {
        id: 'export-audio',
        label: '导出音频',
        enabled: false,
        click: async () => {
          if (win) {
            win.focus()
            const result = await dialog.showOpenDialog(win, { properties: ['openDirectory'] })
            if (!result.canceled) {
              win.webContents.send('export-audio', result)
            }
          }
        }
      },
      {
        id: 'export-all',
        label: '导出全部',
        enabled: false,
        click: async () => {
          if (win) {
            win.focus()
            const result = await dialog.showOpenDialog(win, { properties: ['openDirectory'] })
            if (!result.canceled) {
              win.webContents.send('export-all', result)
            }
          }
        }
      }
    ]
  },
  {
    label: '其它',
    submenu: [
      {
        id: 'encryption',
        label: '加密文件',
        enabled: false,
        click: async () => {
          if (win) {
            win.focus()
            const result = await dialog.showOpenDialog(win, {
              properties: ['openFile', 'multiSelections']
            })
            if (!result.canceled) {
              win.webContents.send('encryption', result)
            }
          }
        }
      },
      {
        id: 'decrypt-game',
        label: '解密游戏',
        enabled: false,
        click: async () => {
          if (win) {
            win.focus()
            win.webContents.send('decrypt-game')
          }
        }
      }
    ]
  },
  {
    label: '调试',
    submenu: [
      {
        visible: false,
        label: '最大化',
        accelerator: 'F4',
        click: () => {
          if (win) {
            if (win.isMaximized()) {
              win.unmaximize()
            } else {
              win.maximize()
            }
          }
        }
      },
      {
        label: '刷新',
        accelerator: 'F5',
        role: 'reload'
      },
      {
        label: '控制台',
        accelerator: 'F12',
        role: 'toggleDevTools'
      }
    ]
  }
])

Menu.setApplicationMenu(menu)

function createWindow() {
  win = new BrowserWindow({
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

let encryption = false

// 改用对象
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

ipcMain.on('ready', () => {
  win?.show()
})

ipcMain.on('error', (_e, error) => {
  if (win?.isVisible()) return
  dialog.showErrorBox('', error)
  app.exit()
})

app.whenReady().then(createWindow)
