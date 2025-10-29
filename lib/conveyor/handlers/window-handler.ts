import type { BrowserWindow } from 'electron';
// --- این خط اصلاح شد ---
import { handle } from '@/lib/main/shared';
import { electronAPI } from '@electron-toolkit/preload';
import { BrowserView, shell } from 'electron';
import { join } from 'path'; // <-- این را اضافه کنید
// User Agent موزیلا

const CHROME_USER_AGENT =
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

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

  // --- هندلرهای جدید BrowserView ---

  handle('view-create', (tabId: string, url: string) => {
    const view = new BrowserView({
      webPreferences: {
        partition: 'persist:tab-session',

        // --- این بخش حیاتی اضافه شد (راه‌حل ۱) ---
        preload: join(__dirname, '../preload/preload.js'),
        contextIsolation: false, // <-- برای پنهان‌کاری لازم است
        sandbox: false,          // <-- برای پنهان‌کاری لازم است
      },
    })
    
    // User Agent را تنظیم می‌کنیم
    // view.webContents.setUserAgent(CHROME_USER_AGENT) // <-- استفاده از متغیر
    
    window.addBrowserView(view)
    view.setBounds(currentBounds)
    view.webContents.loadURL(url)

    // view.webContents.openDevTools({ mode: 'detach' })

    viewMap.set(tabId, view)
  })

  handle('view-set-active', (tabId: string | null) => {
    if (activeViewId && viewMap.has(activeViewId)) {
      // مخفی کردن ویوی فعال قبلی (اگر وجود داشت)
      const oldView = viewMap.get(activeViewId)
      window.removeBrowserView(oldView!) // <-- مخفی کردن واقعی
      oldView!.webContents.setBackgroundThrottling(true); 
    }

    if (tabId && viewMap.has(tabId)) {
      // نمایش ویوی جدید
      const newView = viewMap.get(tabId)
      window.addBrowserView(newView!) // <-- نمایش دادن
      newView!.setBounds(currentBounds) // اطمینان از درست بودن ابعاد
      newView!.webContents.setBackgroundThrottling(false);
      activeViewId = tabId
    } else {
      activeViewId = null
    }
  })

  handle('view-destroy', (tabId: string) => {
    if (viewMap.has(tabId)) {
      const view = viewMap.get(tabId)
      window.removeBrowserView(view!)
      // @ts-ignore (destroy is not in d.ts but exists)
      view!.webContents.destroy() // آزاد کردن کامل منابع
      viewMap.delete(tabId)
    }
  })

  handle('view-set-bounds', (bounds) => {
    currentBounds = bounds
    // ابعاد ویوی فعال فعلی را آپدیت کن
    if (activeViewId && viewMap.has(activeViewId)) {
      viewMap.get(activeViewId)!.setBounds(bounds)
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
}