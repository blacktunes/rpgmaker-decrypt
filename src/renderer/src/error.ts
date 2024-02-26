window.onerror = (err: unknown) => {
  ipcRenderer.send('error', err)
}
