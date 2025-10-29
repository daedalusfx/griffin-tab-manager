import { z } from 'zod'


const boundsSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
})

export const windowIpcSchema = {
  'window-init': {
    args: z.tuple([]),
    return: z.object({
      width: z.number(),
      height: z.number(),
      minimizable: z.boolean(),
      maximizable: z.boolean(),
      platform: z.string(),
    }),
  },
  'window-is-minimizable': {
    args: z.tuple([]),
    return: z.boolean(),
  },
  'window-is-maximizable': {
    args: z.tuple([]),
    return: z.boolean(),
  },
  'window-minimize': {
    args: z.tuple([]),
    return: z.void(),
  },
  'window-maximize': {
    args: z.tuple([]),
    return: z.void(),
  },
  'window-close': {
    args: z.tuple([]),
    return: z.void(),
  },
  'window-maximize-toggle': {
    args: z.tuple([]),
    return: z.void(),
  },

  // Web content operations
  'web-undo': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-redo': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-cut': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-copy': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-paste': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-delete': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-select-all': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-reload': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-force-reload': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-toggle-devtools': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-actual-size': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-zoom-in': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-zoom-out': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-toggle-fullscreen': {
    args: z.tuple([]),
    return: z.void(),
  },
  'web-open-url': {
    args: z.tuple([z.string()]),
    return: z.void(),
  },
  // === کانال‌های جدید BrowserView ===
  'view-create': {
    args: z.tuple([z.string(), z.string()]), // (tabId, url)
    return: z.void(),
  },
  'view-set-active': {
    args: z.tuple([z.string().nullable()]), // (tabId | null)
    return: z.void(),
  },
  'view-destroy': {
    args: z.tuple([z.string()]), // (tabId)
    return: z.void(),
  },
  'view-set-bounds': {
    args: z.tuple([boundsSchema]), // (bounds)
    return: z.void(),
  },
}
