import { handle } from '@/lib/main/shared';
import { electronAPI } from '@electron-toolkit/preload';
import type { BrowserWindow } from 'electron';
import { shell, WebContentsView } from 'electron';
import { join } from 'path';

const viewMap = new Map<string, WebContentsView>()
let activeViewId: string | null = null
let currentBounds: Electron.Rectangle = { x: 0, y: 0, width: 0, height: 0 }

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

  // === View Logic ===

  handle('view-create', (tabId: string, url: string) => {
    if (viewMap.has(tabId)) return;

    const view = new WebContentsView({
      webPreferences: {
        partition: 'persist:tab-session',
        preload: join(__dirname, '../preload/preload.js'),
        contextIsolation: false,
        sandbox: false,
      },
    }) as any

    view.setBackgroundColor('#00000000');
    view.webContents.loadURL(url)
    
    viewMap.set(tabId, view)
  })

  // این هندلر برای حالت "تک ویو" استفاده می‌شود
  handle('view-set-active', (tabId: string | null) => {
    // 1. پاکسازی ویوی فعال قبلی (اگر وجود داشت)
    if (activeViewId && viewMap.has(activeViewId)) {
      const oldView = viewMap.get(activeViewId)! as any
      try { window.contentView.removeChildView(oldView) } catch (e) {}
      oldView.webContents.setBackgroundThrottling(true)
    }

    // 2. تنظیم ویوی جدید
    if (tabId && viewMap.has(tabId)) {
      const newView = viewMap.get(tabId)! as any
      // ابتدا همه ویوهای مزاحم احتمالی را حذف کن (اختیاری ولی امن‌تر)
      // window.contentView.children.forEach(...) 
      
      try { window.contentView.addChildView(newView) } catch(e) {} // ممکنه قبلا اد شده باشه
      
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
      const view = viewMap.get(tabId)! as any
      
      if (activeViewId === tabId) {
        activeViewId = null
      }
      
      try { window.contentView.removeChildView(view) } catch (e) { }

      try {
        if (!view.webContents.isDestroyed()) {
          view.webContents.stop()
          view.webContents.close() 
        }
      } catch (error) {
        console.error(`[Main] Error closing webContents for ${tabId}:`, error)
      }

      viewMap.delete(tabId)
    }
  })

  // هندلر جدید برای مخفی کردن ویو (مثلاً وقتی کاشی بسته می‌شود)
  handle('view-hide', (tabId: string) => {
    if (viewMap.has(tabId)) {
      const view = viewMap.get(tabId)! as any
      try { window.contentView.removeChildView(view) } catch (e) { }
    }
  })

  // آپدیت شده: حالا ID می‌گیرد و ویو را به پنجره اضافه می‌کند (مناسب برای Mosaic)
  handle('view-set-bounds', (tabId: string, bounds: Electron.Rectangle) => {
    // ذخیره باندز کلی (برای ویوی فعال تک‌حالته)
    if (tabId === activeViewId) {
        currentBounds = bounds
    }

    if (viewMap.has(tabId)) {
      const view = viewMap.get(tabId)! as any
      
      // اطمینان از اینکه ویو به پنجره چسبیده است
      // (addChildView در الکترون‌های جدید اگر ویو قبلا اد شده باشد، کاری نمی‌کند که خوب است)
      try { window.contentView.addChildView(view) } catch (e) {}
      
      view.setBounds(bounds)
    }
  })

  // ... (Web content handlers unchanged)
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
    viewMap.forEach((view: any) => {
      try {
        if (!view.webContents.isDestroyed()) {
          view.webContents.close()
        }
      } catch (e) {}
    })
    viewMap.clear()
    activeViewId = null
  })
}