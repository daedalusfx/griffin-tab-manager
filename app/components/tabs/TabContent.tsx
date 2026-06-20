import { Tab } from '@/app/hooks/useTabStore'
import { AnimatePresence, motion } from 'framer-motion'
import { t } from 'i18next'
import React from 'react'
// ایمپورت‌های useRef, useEffect, useLayoutEffect, useResizeObserver, useConveyor حذف شدند

interface TabContentProps {
  activeTabs: Tab[]
  activeTabId: string | null // <-- این هنوز لازم است
}

const contentVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

export const TabContent = ({ activeTabs, activeTabId }: TabContentProps) => {
  // --- تمام منطق مربوط به Bounds و IPC حذف شد ---

  return (
    // --- ref حذف شد ---
    <main className="tab-content">
      <AnimatePresence mode="wait">
        {activeTabs.length === 0 ? (
          <motion.div /* ... پیام خوش‌آمدگویی ... */ >
            <h1 className="text-3xl font-bold">
              {t('tabs.welcome')}
              
              </h1>
            <p className="mt-4 text-muted-foreground">
        {t('tabs.welcome_desc')}
            </p>
          </motion.div>
        ) : (
          // یک div ساده برای نگه داشتن فضا (BrowserView روی آن قرار می‌گیرد)
          <div className="webview-placeholder"></div>
        )}
      </AnimatePresence>
    </main>
  )
}