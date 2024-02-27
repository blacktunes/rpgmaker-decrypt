import { sidebar, state } from '../store'
import { saveCurrentFile } from './utils'

document.onkeydown = (e) => {
  if (state.ready && !state.loading && !state.busy && !state.save.show) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      if (!sidebar.currentList.length) return
      const index = sidebar.currentList.findIndex((item) => item.path === sidebar.select?.path)
      if (index === -1 || index + 1 === sidebar.currentList.length) {
        sidebar.select = {
          name: sidebar.currentList[0].name,
          path: sidebar.currentList[0].path
        }
      } else {
        const _index = index + 1
        sidebar.select = {
          name: sidebar.currentList[_index].name,
          path: sidebar.currentList[_index].path
        }
      }
      return
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      if (!sidebar.currentList.length) return
      const index = sidebar.currentList.findIndex((item) => item.path === sidebar.select?.path)
      if (index === -1 || index === 0) {
        const _index = sidebar.currentList.length - 1
        sidebar.select = {
          name: sidebar.currentList[_index].name,
          path: sidebar.currentList[_index].path
        }
      } else {
        const _index = index - 1
        sidebar.select = {
          name: sidebar.currentList[_index].name,
          path: sidebar.currentList[_index].path
        }
      }
      return
    }

    if (e.key === 's' && e.ctrlKey) {
      saveCurrentFile()
      return
    }
  }
}
