import { state, setting, sidebar } from '../../store'

document.onkeydown = e => {
  if (state.ready && !state.loading && sidebar.search.length === 0) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      const index = setting.previewIndex - 1
      if (index >= 0) {
        setting.previewIndex = index
      } else {
        setting.previewIndex = setting.filesList.length - 1
      }
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      const index = setting.previewIndex + 1
      if (index < setting.filesList.length) {
        setting.previewIndex = index
      } else {
        setting.previewIndex = 0
      }
    }
  }
}
