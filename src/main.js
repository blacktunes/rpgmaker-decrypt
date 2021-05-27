// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')

let mainWindow
function createWindow() {
  // Menu.setApplicationMenu(null)
  // Create the browser window.
  mainWindow = new BrowserWindow({
    // show: false,
    // width: 1024,
    // frame: false,
    // height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  // mainWindow.maximize()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('app:quit', () => {
  app.exit()
})

ipcMain.on('app:dev', () => {
  if (mainWindow) {
    mainWindow.webContents.openDevTools()
  }
})

ipcMain.on('app:max', e => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow.maximize()
  }
});

ipcMain.on('app:min', () => {
  mainWindow.minimize()
})


ipcMain.on('app:reload', () => {
  mainWindow.webContents.reload()
})

ipcMain.on('vue:ready', () => {
  mainWindow.show()
})
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
