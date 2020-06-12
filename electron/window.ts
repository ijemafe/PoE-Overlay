import { Rectangle } from 'electron'
import { addon, windowManager } from 'node-window-manager'
import activeWin from 'active-win'

export interface Window {
  processId: number
  path: string
  title: () => string
  bounds: () => Rectangle
  bringToTop: () => void
}

// macos only - probably not needed for now
windowManager.requestAccessibility()

export async function getActiveWindow(): Promise<Window> {
  try {
    let active: any
    const isLinux = process.platform !== ('win32' || 'darwin')

    if (isLinux) {
      active = await activeWin()
    } else {
      active = windowManager.getActiveWindow()
    }

    if (!active) {
      return undefined
    }

    return {
      processId: active.processId || active.owner.processId,
      path: active.path || active.owner.path,
      bounds: () => active.bounds || (() => addon.getWindowBounds(active.id)),
      title: () => active.title || (() => active.getTitle()),
      bringToTop: () => active.bringToTop() || (() => {}),
    }
  } catch (error) {
    console.warn('Could not get active window.', error)
    return undefined
  }
}
