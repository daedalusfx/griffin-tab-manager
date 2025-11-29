import { handle } from '@/lib/main/shared';
import { electronAPI } from '@electron-toolkit/preload';
import type { BrowserWindow } from 'electron';
import { BrowserView, shell, WebContentsView } from 'electron';
import { join } from 'path';
// User Agent موزیلا


// --- (کدهای مدیریت viewMap و ...) ---
const viewMap = new Map<string, BrowserView>()
let activeViewId: string | null = null
let currentBounds: Electron.Rectangle = { x: 0, y: 0, width: 0, height: 0 }
// ---

export const registerWindowHandlers = (window: BrowserWindow) => {
  // Window operations
  handle('window-init', () => {
    const { width, height } = window.getBounds()
    const minimizable = window.isMinimizable()
    const maximizable = window.isMaximizable()
    const platform = electronAPI.process.platform

    return { width, height, minimizable, maximizable, platform }
  })

  handle('window-is-minimizable', () => window.isMinimizable())
  handle('window-is-maximizable', () => window.isMaximizable())
  handle('window-minimize', () => window.minimize())
  handle('window-maximize', () => window.maximize())
  handle('window-close', () => window.close())
  handle('window-maximize-toggle', () => (window.isMaximized() ? window.unmaximize() : window.maximize()))

  handle('view-create', (tabId: string, url: string) => {
    if (viewMap.has(tabId)) return;

    const view:any = new WebContentsView({
      webPreferences: {
        partition: 'persist:tab-session',
        preload: join(__dirname, '../preload/preload.js'),
        contextIsolation: false,
        sandbox: false,
      },
    })

    view.setBackgroundColor('#00000000');
    view.webContents.loadURL(url)
    
    viewMap.set(tabId, view)
  })

  handle('view-set-active', (tabId: string | null) => {
    if (activeViewId && viewMap.has(activeViewId)) {
      const oldView : any = viewMap.get(activeViewId)!
      window.contentView.removeChildView(oldView)
      oldView.webContents.setBackgroundThrottling(true)
    }

    if (tabId && viewMap.has(tabId)) {
      const newView:any = viewMap.get(tabId)!
      window.contentView.addChildView(newView)
      newView.setBounds(currentBounds)
      newView.webContents.setBackgroundThrottling(false)
      newView.webContents.focus()
      activeViewId = tabId
    } else {
      activeViewId = null
    }
  })



  handle('view-destroy', (tabId: string) => {
    if (viewMap.has(tabId)) {
      const view:any = viewMap.get(tabId)!
      
      if (activeViewId === tabId) {
        activeViewId = null
      }
      
      try {
         window.contentView.removeChildView(view)
      } catch (e) { /* ignore */ }

      // --- اصلاح شده: استفاده از close() به جای destroy() ---
      try {
        if (!view.webContents.isDestroyed()) {
          view.webContents.stop()
          // destroy() وجود ندارد، close() کار مشابه را انجام می‌دهد
          view.webContents.close() 
        }
      } catch (error) {
        console.error(`[Main] Error closing webContents for ${tabId}:`, error)
      }

      viewMap.delete(tabId)
      console.log(`[Main] 🗑️ Successfully destroyed WebContentsView: ${tabId}`)
    }
  })

  handle('view-set-bounds', (bounds) => {
    currentBounds = bounds
    if (activeViewId && viewMap.has(activeViewId)) {
      const view = viewMap.get(activeViewId)!;
      view.setBounds(bounds)
    }
  })
  // Web content operations
  const webContents = window.webContents
  handle('web-undo', () => webContents.undo())
  handle('web-redo', () => webContents.redo())
  handle('web-cut', () => webContents.cut())
  handle('web-copy', () => webContents.copy())
  handle('web-paste', () => webContents.paste())
  handle('web-delete', () => webContents.delete())
  handle('web-select-all', () => webContents.selectAll())
  handle('web-reload', () => webContents.reload())
  handle('web-force-reload', () => webContents.reloadIgnoringCache())
  handle('web-toggle-devtools', () => webContents.toggleDevTools())
  handle('web-actual-size', () => webContents.setZoomLevel(0))
  handle('web-zoom-in', () => webContents.setZoomLevel(webContents.zoomLevel + 0.5))
  handle('web-zoom-out', () => webContents.setZoomLevel(webContents.zoomLevel - 0.5))
  handle('web-toggle-fullscreen', () => window.setFullScreen(!window.fullScreen))
  handle('web-open-url', (url: string) => shell.openExternal(url))

  window.on('closed', () => {
    console.log('[Main] Window closed, cleaning up all views...')
    viewMap.forEach((view) => {
      try {
        if (!view.webContents.isDestroyed()) {
          view.webContents.close() // اینجا هم close
        }
      } catch (e) {}
    })
    viewMap.clear()
    activeViewId = null
  })
}