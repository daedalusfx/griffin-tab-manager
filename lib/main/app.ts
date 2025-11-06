import { registerAppHandlers } from '@/lib/conveyor/handlers/app-handler'
import { registerWindowHandlers } from '@/lib/conveyor/handlers/window-handler'
import appIcon from '@/resources/build/icon.png?asset'
import { app, BrowserWindow, session, shell } from 'electron'
import { join } from 'path'
import { registerResourcesProtocol } from './protocols'

// --- بخش هوشمندسازی پنهان‌کاری ---

// ۱. لیستی از هویت‌های واقعی و هماهنگ مرورگر
const realBrowserIdentities = [
  {
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    ch: '"Google Chrome";v="124", "Chromium";v="124", ";Not A Brand";v="99"',
  },
  {
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    ch: '"Google Chrome";v="123", "Chromium";v="123", ";Not A Brand";v="99"',
  },
  {
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ch: '"Google Chrome";v="120", "Chromium";v="120", ";Not A Brand";v="99"',
  },
]

// ۲. تابعی برای انتخاب یک هویت تصادفی
const getRandomIdentity = () => {
  const index = Math.floor(Math.random() * realBrowserIdentities.length)
  return realBrowserIdentities[index]
}

// ۳. یک هویت در هر بار اجرای برنامه انتخاب می‌شود
const selectedIdentity = getRandomIdentity()

// --- پایان بخش پنهان‌کاری ---

export function createAppWindow(): void {
  // Register custom protocol for resources
  registerResourcesProtocol()

  // Create the main window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    backgroundColor: '#1c1c1c',
    icon: appIcon,
    frame: true,
    titleBarStyle: 'default',
    title: 'Griffin Tab Manager',
    maximizable: true,
    resizable: true,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      sandbox: false,
      webviewTag: true,
      devTools: false,
      spellcheck: false,
    },
  })

  mainWindow.setMenu(null)

  // Register IPC events for the main window.
  registerWindowHandlers(mainWindow)
  registerAppHandlers(app)

  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    // ۴. هدر User-Agent هماهنگ با هویت انتخابی تنظیم می‌شود
    details.requestHeaders['User-Agent'] = selectedIdentity.ua

    // هدرهای مهمی که مرورگر واقعی می‌فرستد
    details.requestHeaders['Accept-Language'] = 'en-US,en;q=0.9,fa;q=0.8'
    
    // ۵. هدر Client-Hint (ch) هماهنگ با User-Agent تنظیم می‌شود
    details.requestHeaders['sec-ch-ua'] = selectedIdentity.ch
    details.requestHeaders['sec-ch-ua-mobile'] = '?0'
    details.requestHeaders['sec-ch-ua-platform'] = '"Windows"'

    // حذف هدرهایی که الکترون بودن ما را لو می‌دهد
    delete details.requestHeaders['X-Electron-Version']

    callback({ requestHeaders: details.requestHeaders })
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}