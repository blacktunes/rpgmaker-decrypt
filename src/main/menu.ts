import { type BrowserWindow, Menu, dialog, shell } from 'electron'

export const createMenu = (win: BrowserWindow) => {
  return Menu.buildFromTemplate([
    {
      label: '加载',
      submenu: [
        {
          id: 'load',
          label: '选择目录',
          enabled: true,
          click: async () => {
            win.focus()
            const result = await dialog.showOpenDialog(win, { properties: ['openDirectory'] })
            if (!result.canceled) {
              win.webContents.send('select-new-dir', result.filePaths[0])
            }
          }
        },
        {
          id: 'open-dir',
          label: '打开游戏目录',
          enabled: false,
          click: () => {
            win.webContents.send('open-dir')
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
            win.focus()
            const result = await dialog.showOpenDialog(win, { properties: ['openDirectory'] })
            if (!result.canceled) {
              win.webContents.send('export-img', result.filePaths[0])
            }
          }
        },
        {
          id: 'export-audio',
          label: '导出音频',
          enabled: false,
          click: async () => {
            win.focus()
            const result = await dialog.showOpenDialog(win, { properties: ['openDirectory'] })
            if (!result.canceled) {
              win.webContents.send('export-audio', result.filePaths[0])
            }
          }
        },
        {
          id: 'export-all',
          label: '导出全部',
          enabled: false,
          click: async () => {
            win.focus()
            const result = await dialog.showOpenDialog(win, { properties: ['openDirectory'] })
            if (!result.canceled) {
              win.webContents.send('export-all', result.filePaths[0])
            }
          }
        }
      ]
    },
    {
      label: '解密',
      submenu: [
        {
          id: 'encryption',
          label: '加密文件',
          enabled: false,
          click: async () => {
            win.focus()
            const result = await dialog.showOpenDialog(win, {
              properties: ['openFile', 'multiSelections']
            })
            if (!result.canceled) {
              win.webContents.send('encryption', result.filePaths)
            }
          }
        },
        {
          id: 'decrypt-game',
          label: '解密游戏',
          enabled: false,
          click: async () => {
            win.focus()
            win.webContents.send('decrypt-game')
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
            if (win.isMaximized()) {
              win.unmaximize()
            } else {
              win.maximize()
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
    },
    {
      label: '关于',
      submenu: [
        {
          label: '赞助',
          click: () => {
            shell.openExternal('https://afdian.net/a/blacktune')
          }
        },
        {
          label: 'Github',
          click: () => {
            shell.openExternal('https://github.com/blacktunes/rpgmaker-decrypt')
          }
        }
      ]
    }
  ])
}
