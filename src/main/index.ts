import { is } from '@electron-toolkit/utils'
import { BrowserWindow, Menu, app, dialog, ipcMain } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.ico?asset'
import LoadFileWorker from './worker/LoadFile?nodeWorker'
import SaveFileWorker from './worker/SaveFile?nodeWorker'
import { createMenu } from './menu'

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    show: false,
    width: 900,
    height: 600,
    minWidth: 900,
    minHeight: 600,
    autoHideMenuBar: false,
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegrationInWorker: true
    }
  })

  // 阻止打开窗口
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))

  const menu = createMenu(mainWindow)
  Menu.setApplicationMenu(menu)

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    app.quit()
  })

  ipcMain.handle('select-dir', async () => {
    mainWindow.focus()
    const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] })
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

  let start = false
  ipcMain.on('ready', () => {
    mainWindow.show()
    if (process.argv[1]) {
      if (is.dev || start) return
      mainWindow.webContents.send('select-new-dir', process.argv[1])
    }
    start = true
  })

  ipcMain.on('error', (_e, error) => {
    if (mainWindow.isVisible()) return
    dialog.showErrorBox('', error)
    app.exit()
  })

  ipcMain.on('load-file', (_e, url: string) => {
    const worker = LoadFileWorker({})

    worker.on('message', (event: LoadFileWorkerEvent) => {
      mainWindow.webContents.send('load-file-event', event)
      switch (event.type) {
        case 'message-error':
          if (is.dev) {
            console.error(event.content)
          }
          break
        case 'done':
          encryption = !!event.content.key
          worker.terminate()
      }
    })

    worker.on('error', (err: Error) => {
      console.error(err)
      mainWindow.webContents.send('load-file-event', {
        type: 'error',
        content: err
      })
      worker.terminate()
    })

    worker.postMessage(url)
  })

  ipcMain.on('save-file', (_e, props: SaveFileWorkerProps) => {
    const worker = SaveFileWorker({})

    worker.on('message', (event: LoadFileWorkerEvent) => {
      mainWindow.webContents.send('save-file-event', event)
      if (event.type === 'done') {
        worker.terminate()
      }
    })

    worker.on('error', (err: Error) => {
      console.error(err)
      mainWindow.webContents.send('save-file-event', {
        type: 'error',
        content: err
      })
      worker.terminate()
    })

    worker.postMessage(props)
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.whenReady().then(createWindow)
