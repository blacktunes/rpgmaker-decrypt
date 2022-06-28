const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron')
const path = require('path')

Menu.setApplicationMenu(Menu.buildFromTemplate([
  {
    label: 'Dev',
    accelerator: 'F12',
    click: () => {
      if (mainWindow) {
        mainWindow.webContents.openDevTools()
      }
    }
  },
  {
    label: 'Reload',
    accelerator: 'F5',
    click: () => {
      mainWindow.webContents.reload()
    }
  }
]))
// Menu.setApplicationMenu(null)

let mainWindow
function createWindow() {


  mainWindow = new BrowserWindow({
    show: false,
    width: 500,
    height: 420,
    // resizable: false,
    // frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  mainWindow.loadFile(path.join(__dirname, 'index.html'))

  // mainWindow.maximize()
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('ready', () => {
  mainWindow.show()
})

ipcMain.handle('select-dir', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  return result
})

ipcMain.handle('select-out-dir', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  return result
})
