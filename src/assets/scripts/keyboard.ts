import { state, setting, previweItem } from '../../store'

document.onkeydown = e => {
  if (state.ready && !state.loading && previweItem.type !== 'audio') {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      const index = setting.previweIndex - 1
      if (index >= 0) {
        setting.previweIndex = index
      }
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      const index = setting.previweIndex + 1
      if (index < setting.imageFileList.length) {
        setting.previweIndex = index
      }
    }
  }
}
