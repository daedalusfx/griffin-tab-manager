import { useEffect, useState } from 'react'

export interface SavedChart {
  id: string
  title: string
  url: string
}

const CHARTS_KEY = 'griffin_savedCharts'

export const useChartStore = () => {
  const [savedCharts, setSavedCharts] = useState<SavedChart[]>(() => {
    return JSON.parse(localStorage.getItem(CHARTS_KEY) || '[]')
  })

  // افکت برای ذخیره لیست در localStorage
  useEffect(() => {
    localStorage.setItem(CHARTS_KEY, JSON.stringify(savedCharts))
  }, [savedCharts])

  const addChart = (title: string, url: string) => {
    const newChart: SavedChart = {
      id: window.crypto.randomUUID(),
      title,
      url,
    }
    setSavedCharts((prev) => [...prev, newChart])
  }

  const updateChart = (id: string, title: string, url: string) => {
    setSavedCharts((prev) =>
      prev.map((chart) =>
        chart.id === id ? { ...chart, title, url } : chart,
      ),
    )
  }

  const deleteChart = (id: string) => {
    setSavedCharts((prev) => prev.filter((chart) => chart.id !== id))
  }

  return {
    savedCharts,
    addChart,
    updateChart,
    deleteChart,
  }
}