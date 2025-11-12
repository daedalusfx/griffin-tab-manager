import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * اینترفیس چارت ذخیره شده
 */
export interface SavedChart {
  id: string
  title: string
  url: string
}

/**
 * اینترفیس کامل استور چارت‌ها
 * شامل هم داده‌ها (state) و هم اکشن‌ها (actions)
 */
interface ChartStoreState {
  savedCharts: SavedChart[]
  addChart: (title: string, url: string) => void
  updateChart: (id: string, title: string, url: string) => void
  deleteChart: (id: string) => void
}

// کلید برای ذخیره‌سازی در localStorage
const CHARTS_KEY = 'griffin_savedCharts' //

/**
 * هوک Zustand برای مدیریت چارت‌ها
 * از `persist` middleware برای ذخیره خودکار در localStorage استفاده شده
 */
export const useChartStore = create<ChartStoreState>()(
  persist(
    (set) => ({
      // --- حالت اولیه (State) ---
      savedCharts: [],

      // --- اکشن‌ها (Actions) ---
      addChart: (title, url) => {
        const newChart: SavedChart = {
          id: window.crypto.randomUUID(), //
          title,
          url,
        }
        set((state) => ({
          savedCharts: [...state.savedCharts, newChart],
        }))
      },

      updateChart: (id, title, url) => {
        set((state) => ({
          savedCharts: state.savedCharts.map((chart) =>
            chart.id === id ? { ...chart, title, url } : chart, //
          ),
        }))
      },

      deleteChart: (id) => {
        set((state) => ({
          savedCharts: state.savedCharts.filter((chart) => chart.id !== id), //
        }))
      },
    }),
    {
      name: CHARTS_KEY, // نام کلید در localStorage
      // فقط این بخش از استیت در localStorage ذخیره شود
      partialize: (state) => ({ savedCharts: state.savedCharts }),
    },
  ),
)