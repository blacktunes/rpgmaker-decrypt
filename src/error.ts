window.onerror = (err) => {
  ipcRenderer.send('error', err)
}
