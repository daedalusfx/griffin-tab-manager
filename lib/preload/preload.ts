import { conveyor } from '@/lib/conveyor/api';
import { contextBridge } from 'electron';

// Use `contextBridge` APIs to expose APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
// ما در حال دستکاری محیط JS هستیم تا شبیه مرورگر واقعی شویم

// ۱. حذف نشانه‌ی وب‌درایور (مهم‌ترین نشانه اتوماسیون)
if (navigator.webdriver) {
  Object.defineProperty(navigator, 'webdriver', {
    get: () => false,
  });
  // console.log('Stealth: navigator.webdriver patched.');
}


try {
  // --- راه‌حل اصلاح شده ---
  // ما به delete برمی‌گردیم. 
  // (as any) فقط برای ساکت کردن خطای کامپایلر TypeScript است.
  if (process && process.versions && (process.versions as any).electron) {
    delete (process.versions as any).electron;
  }

  // رفع خطای 'undefined' is not assignable to type 'Process' (ts(2322))
  if ((window as any).process) {
    (window as any).process = undefined;
  }

  // console.log('Stealth: Electron process versions patched.');
} catch (e) {
  // console.error('Stealth patch error (process):', e);
}

try {
  const plausiblePlugins = [
    { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
    { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '' },
    { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' },
  ];

  // متد item و namedItem را برای شباهت بیشتر جعل می‌کنیم
  const pluginsArray = {
    ...plausiblePlugins,
    item: (index) => plausiblePlugins[index],
    namedItem: (name) => plausiblePlugins.find(p => p.name === name) || null,
    length: plausiblePlugins.length
  };

  Object.defineProperty(navigator, 'plugins', {
    get: () => pluginsArray,
  });
  // console.log('Stealth: navigator.plugins patched.');
} catch (e) {
  // console.error('Stealth patch error (plugins):', e);
}


// ۳. هماهنگ‌سازی زبان‌ها (باید با هدر Accept-Language در app.ts یکی باشد)
try {
  Object.defineProperty(navigator, 'languages', {
    get: () => ['en-US', 'en', 'fa'],
  });
  // console.log('Stealth: navigator.languages patched.');
} catch (e) {
  // console.error('Stealth patch error (languages):', e);
}


// ۴. جعل مجوز نوتیفیکیشن (ربات‌ها معمولا 'denied' هستند)
try {
  // این کد را در یک try/catch می‌گذاریم چون ممکن است قبلاً تعریف شده باشد
  const originalNotification = Notification;
  const newNotification = function(title, options) {
    return new originalNotification(title, options);
  };
  newNotification.permission = 'default'; // به جای 'denied' یا 'granted'
  
  Object.defineProperty(window, 'Notification', {
    value: newNotification,
    writable: false,
    configurable: false,
  });
  // console.log('Stealth: Notification.permission patched.');
} catch(e) {
  // console.error('Stealth patch error (Notification):', e);
}


if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('conveyor', conveyor)
  } catch (error) {
    // console.error(error)
  }
} else {
  // @ts-ignore
  window.conveyor = conveyor
}