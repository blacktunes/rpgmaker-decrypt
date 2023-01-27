process.env.DIST = join(__dirname, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST, '../public')

import { join } from 'path'
import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron'

let win: BrowserWindow | null
const preload = join(__dirname, './preload.js')
const url = process.env['VITE_DEV_SERVER_URL']

Menu.setApplicationMenu(Menu.buildFromTemplate([
  {
    label: '文件',
    submenu: [
      {
        label: '选择目录',
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
        label: '打开目录',
        click: () => {
          if (win) {
            win.webContents.send('open-dir')
          }
        }
      }
    ]
  },
  {
    label: '调试',
    submenu: [
      {
        label: '刷新',
        accelerator: 'F5',
        click: () => {
          if (win) {
            win.webContents.reload()
          }
        }
      },
      {
        label: '控制台',
        accelerator: 'F12',
        click: () => {
          if (win) {
            win.webContents.openDevTools()
          }
        }
      }
    ]
  }
]))

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
