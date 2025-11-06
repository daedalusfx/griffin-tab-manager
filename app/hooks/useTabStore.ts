import { useEffect, useState } from 'react'

export interface Tab {
  id: string
  title: string
  url: string 
  color?: string | null 
}

const TABS_KEY = 'desktopTabs_activeTabs'
const TRASH_KEY = 'desktopTabs_deletedTabs'
const ACTIVE_TAB_KEY = 'desktopTabs_activeTabId'

export const useTabStore = () => {
  const [activeTabs, setActiveTabs] = useState<Tab[]>(() => {
    return JSON.parse(localStorage.getItem(TABS_KEY) || '[]')
  })

  const [deletedTabs, setDeletedTabs] = useState<Tab[]>(() => {
    return JSON.parse(localStorage.getItem(TRASH_KEY) || '[]')
  })

  const [activeTabId, setActiveTabId] = useState<string | null>(() => {
    return localStorage.getItem(ACTIVE_TAB_KEY) || null
  })

  // افکت برای ذخیره تب‌های فعال
  useEffect(() => {
    localStorage.setItem(TABS_KEY, JSON.stringify(activeTabs))
    // اگر تب فعال حذف شد، اولین تب را فعال کن
    if (activeTabs.length > 0 && !activeTabs.find((t) => t.id === activeTabId)) {
      setActiveTabId(activeTabs[0].id)
    } else if (activeTabs.length === 0) {
      setActiveTabId(null)
    }
  }, [activeTabs, activeTabId])

  // افکت برای ذخیره تب‌های حذف‌شده
  useEffect(() => {
    localStorage.setItem(TRASH_KEY, JSON.stringify(deletedTabs))
  }, [deletedTabs])

  // افکت برای ذخیره تب فعال
  useEffect(() => {
    if (activeTabId) {
      localStorage.setItem(ACTIVE_TAB_KEY, activeTabId)
    } else {
      localStorage.removeItem(ACTIVE_TAB_KEY)
    }
  }, [activeTabId])

  const createTab = (
    title: string,
    url: string,
    activate: boolean = false,
  ): Tab => { // ۱. نوع بازگشتی را به Tab تغییر دهید
    const newTab: Tab = {
      id: window.crypto.randomUUID(),
      title: title || `تب ${activeTabs.length + 1}`,
      url: url,
    }
    setActiveTabs((prevTabs) => [...prevTabs, newTab])
    if (activate) {
      setActiveTabId(newTab.id)
    }
    return newTab // ۲. تب جدید را برگردانید
  }

  const deleteTab = (tabId: string) => {
    const tabToDelete = activeTabs.find((t) => t.id === tabId)
    if (!tabToDelete) return

    setActiveTabs(activeTabs.filter((t) => t.id !== tabId))
    setDeletedTabs([...deletedTabs, tabToDelete])
  }

  const restoreTab = (tabId: string) => {
    const tabToRestore = deletedTabs.find((t) => t.id === tabId)
    if (!tabToRestore) return

    setDeletedTabs(deletedTabs.filter((t) => t.id !== tabId))
    setActiveTabs([...activeTabs, tabToRestore])
    setActiveTabId(tabToRestore.id)
  }
  const updateTabColor = (tabId: string, color: string | null) => {
    setActiveTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === tabId ? { ...tab, color: color } : tab,
      ),
    )
  }

  const activeTab = activeTabs.find((t) => t.id === activeTabId) || null

  return {
    activeTabs,
    setActiveTabs,
    deletedTabs,
    activeTabId,
    setActiveTabId,
    createTab,
    deleteTab,
    restoreTab,
    updateTabColor,
    activeTab,
  }
}