import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * اینترفیس تب
 */
export interface Tab {
  id: string
  title: string
  url: string
  color?: string | null

  type?: 'normal' | 'multiview'
  gridSlots?: (string | null)[]

  lastAccessed?: number
}

/**
 * اینترفیس کامل استور تب‌ها
 * شامل داده‌ها و اکشن‌ها
 */
interface TabStoreState {
  activeTabs: Tab[]
  deletedTabs: Tab[]
  activeTabId: string | null
  isMultiViewOpen: boolean
  multiViewSlots: (string | null)[] 
  // اکشن‌ها
  setActiveTabs: (tabs: Tab[]) => void
  setActiveTabId: (id: string | null) => void
  createTab: (title: string, url: string, activate?: boolean , type?: 'normal' | 'multiview') => Tab | undefined
  deleteTab: (tabId: string) => void
  restoreTab: (tabId: string) => void
  updateTabColor: (tabId: string, color: string | null) => void
  sortTabsByColor: () => void 
  toggleMultiView: () => void
  setMultiViewSlot: (index: number, tabId: string | null) => void
  updateTabGridSlots: (tabId: string, slots: (string | null)[]) => void
}

// یک نام واحد برای ذخیره‌سازی کل استور تب‌ها در localStorage
const TABS_KEY = 'desktopTabs_store'

/**
 * هوک Zustand برای مدیریت تب‌ها
 */
export const useTabStore = create<TabStoreState>()(
  persist(
    (set) => ({
      // --- حالت اولیه (State) ---
      activeTabs: [],
      deletedTabs: [],
      activeTabId: null,

      isMultiViewOpen: false,
      multiViewSlots: [null, null, null], 

      toggleMultiView: () => set((state) => ({ isMultiViewOpen: !state.isMultiViewOpen })),
      
      setMultiViewSlot: (index, tabId) => set((state) => {
        const newSlots = [...state.multiViewSlots]
        newSlots[index] = tabId
        return { multiViewSlots: newSlots }
      }),

      setActiveTabs: (tabs) => {
        set((state) => {
          const currentActiveId = state.activeTabId
          let newActiveId = currentActiveId

          // منطق حیاتی که قبلاً در useEffect بود:
          if (tabs.length > 0 && !tabs.find((t) => t.id === currentActiveId)) {
            newActiveId = tabs[0].id //
          } else if (tabs.length === 0) {
            newActiveId = null //
          }

          return { activeTabs: tabs, activeTabId: newActiveId }
        })
      },

      setActiveTabId: (id) => set((state) => ({
        activeTabId: id,
        // وقتی تب فعال می‌شود، زمان بازدیدش را آپدیت کن
        activeTabs: state.activeTabs.map((tab) => 
          tab.id === id ? { ...tab, lastAccessed: Date.now() } : tab
        )
      })),

      /**
       * یک تب جدید ایجاد می‌کند
       */
      createTab: (title, url, activate = false, type = 'normal') => {
        const newTab: Tab = {
          id: window.crypto.randomUUID(),
          title: title || (type === 'multiview' ? 'داشبورد' : 'تب جدید'),
          url: url,
          type: type,
          // اگر مولتی ویو بود، ۳ اسلات خالی براش بساز
          gridSlots: type === 'multiview' ? [null, null, null] : undefined ,
          lastAccessed: Date.now()
        }

        set((state) => ({
          activeTabs: [...state.activeTabs, newTab],
        }))

       if (activate) {
          // اگر تب جدید فعال شد، setActiveTabId خودش زمان را آپدیت می‌کند، 
          // اما اینجا دستی هم ست می‌کنیم که محکم کاری شود
          set((state) => ({ 
             activeTabId: newTab.id,
             activeTabs: state.activeTabs.map(t => t.id === newTab.id ? {...t, lastAccessed: Date.now()} : t)
          }))
        }

        return newTab
      },

      updateTabGridSlots: (tabId, slots) => {
        set((state) => ({
          activeTabs: state.activeTabs.map((tab) =>
            tab.id === tabId ? { ...tab, gridSlots: slots } : tab
          ),
        }))
      },
      /**
       * یک تب را حذف و به سطل زباله منتقل می‌کند
       * همچنین منطق انتخاب تب فعال جدید را مدیریت می‌کند
       */
      deleteTab: (tabId) => {
        set((state) => {
          const tabToDelete = state.activeTabs.find((t) => t.id === tabId)
          if (!tabToDelete) return state // اگر تب وجود نداشت، کاری نکن

          const newActiveTabs = state.activeTabs.filter((t) => t.id !== tabId)
          let newActiveId = state.activeTabId

          // منطق حیاتی که قبلاً در useEffect بود:
          // اگر تبی که حذف شد، تب فعال بود، یک تب جدید را فعال کن
          if (state.activeTabId === tabId) {
            newActiveId = newActiveTabs.length > 0 ? newActiveTabs[0].id : null //
          }

          return {
            activeTabs: newActiveTabs,
            deletedTabs: [...state.deletedTabs, tabToDelete], //
            activeTabId: newActiveId,
          }
        })
      },

      /**
       * یک تب را از سطل زباله بازیابی می‌کند
       */
      restoreTab: (tabId) => {
        set((state) => {
          const tabToRestore = state.deletedTabs.find((t) => t.id === tabId)
          if (!tabToRestore) return state //

          return {
            deletedTabs: state.deletedTabs.filter((t) => t.id !== tabId), //
            activeTabs: [...state.activeTabs, tabToRestore], //
            activeTabId: tabToRestore.id, // تب بازیابی شده، فعال می‌شود
          }
        })
      },

      /**
       * رنگ یک تب را آپدیت می‌کند
       */
      updateTabColor: (tabId, color) => {
        set((state) => ({
          activeTabs: state.activeTabs.map((tab) =>
            tab.id === tabId ? { ...tab, color: color } : tab, //
          ),
        }))
      },

      sortTabsByColor: () => {
        set((state) => {
          const sortedTabs = [...state.activeTabs].sort((a, b) => {
            // اگر رنگ نداشت، بفرستش ته لیست (با یه استرینگ بزرگ مثل zzz)
            const colorA = a.color || 'zzzzzz'
            const colorB = b.color || 'zzzzzz'
            
            // مقایسه الفبایی رنگ‌ها (Hex Code)
            // این باعث میشه رنگ‌های یکسان کنار هم بیفتن
            return colorA.localeCompare(colorB)
          })

          return { activeTabs: sortedTabs }
        })
      },
    }),
    {
      name: TABS_KEY,
      // فقط این سه متغیر در localStorage ذخیره شوند
      partialize: (state) => ({
        activeTabs: state.activeTabs,
        deletedTabs: state.deletedTabs,
        activeTabId: state.activeTabId,
        multiViewSlots: state.multiViewSlots
      }),
    },
  ),
)