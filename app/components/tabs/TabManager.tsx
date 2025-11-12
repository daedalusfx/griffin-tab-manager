import { useConveyor } from '@/app/hooks/use-conveyor'
import { SavedChart, useChartStore } from '@/app/hooks/useChartStore'
import { useTabStore } from '@/app/hooks/useTabStore'
import { debounce } from 'lodash-es'
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import useResizeObserver from 'use-resize-observer'
import { useShallow } from 'zustand/react/shallow'
import { ChartEditorModal } from './ChartEditorModal'
import { ChartListSidebar } from './ChartListSidebar'
import { ColorPickerMenu } from './ColorPickerMenu'
import { TabBar } from './TabBar'
import { TabContent } from './TabContent'
import { TrashModal } from './TrashModal'

// --- ثابت‌ها ---
const BOUNDS_DEBOUNCE_MS = 350

// تعریف تایپ برای منوی انتخاب رنگ
type ColorMenuProps = {
  tabId: string
  position: { x: number; y: number }
}

export const TabManager = () => {
  // --- استیت‌های محلی برای مودال‌ها ---
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false)
  const [isChartEditorModalOpen, setIsChartEditorModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [editingChart, setEditingChart] = useState<SavedChart | null>(null) //
  const [colorMenuProps, setColorMenuProps] = useState<ColorMenuProps | null>(
    null, //
  )

  // --- هوک‌های IPC ---
  const { viewSetActive, viewSetBounds, viewCreate, viewDestroy } =
    useConveyor('window') //

  // --- انتخاب داده‌ها از استور تب (با useShallow) ---
  // از useShallow استفاده می‌کنیم تا این کامپوننت فقط زمانی رندر شود
  // که یکی از این سه متغیر واقعاً تغییر کند.
  const { activeTabs, deletedTabs, activeTabId } = useTabStore(
    useShallow((state) => ({
      activeTabs: state.activeTabs,
      deletedTabs: state.deletedTabs,
      activeTabId: state.activeTabId,
    })),
  )

  // --- انتخاب اکشن‌ها از استور تب (بدون useShallow) ---
  // اکشن‌ها توابع ثابت هستند و نیازی به useShallow ندارند.
  // انتخاب جداگانه آن‌ها بهینه‌ترین حالت است.
  const setActiveTabs = useTabStore((state) => state.setActiveTabs)
  const setActiveTabId = useTabStore((state) => state.setActiveTabId)
  const createTab = useTabStore((state) => state.createTab)
  const deleteTab = useTabStore((state) => state.deleteTab)
  const restoreTab = useTabStore((state) => state.restoreTab)
  const updateTabColor = useTabStore((state) => state.updateTabColor)

  // --- انتخاب داده‌ها از استور چارت (با useShallow) ---
  const savedCharts = useChartStore(useShallow((state) => state.savedCharts))

  // --- انتخاب اکشن‌ها از استور چارت ---
  const addChart = useChartStore((state) => state.addChart)
  const updateChart = useChartStore((state) => state.updateChart)
  const deleteChart = useChartStore((state) => state.deleteChart)

  // --- رفرنس‌ها ---
  const contentWrapperRef = useRef<HTMLDivElement>(null) //
  const didInitViewsRef = useRef<boolean>(false) //

  useEffect(() => {
    if (activeTabs.length > 0 && !didInitViewsRef.current) {
      didInitViewsRef.current = true
      console.log('--- Initializing BrowserViews on App Start ---')
      const initViews = async () => {
        const createPromises = activeTabs.map((tab) => {
          console.log(`Creating view for: ${tab.title} (ID: ${tab.id})`)
          return viewCreate(tab.id, tab.url)
        })
        await Promise.all(createPromises)
        console.log(`Setting active view to: ${activeTabId}`)
        viewSetActive(activeTabId)
      }
      initViews()
    }
  }, [activeTabs, activeTabId, viewCreate, viewSetActive]) //

  useEffect(() => {
    const isBlockingModalOpen =
      isTrashModalOpen || isChartEditorModalOpen || !!colorMenuProps
    viewSetActive(isBlockingModalOpen ? null : activeTabId)
  }, [
    activeTabId,
    isTrashModalOpen,
    isChartEditorModalOpen,
    colorMenuProps,
    viewSetActive,
  ]) //

  // --- منطق مدیریت ابعاد (Bounds) (بدون تغییر) ---
  const sendBounds = useCallback(() => {
    if (contentWrapperRef.current) {
      const rect = contentWrapperRef.current.getBoundingClientRect()
      if (rect.width < 10 || rect.height < 10) return
      const bounds = {
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      }
      viewSetBounds(bounds)
    }
  }, [viewSetBounds]) //

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSendBounds = useCallback(
    debounce(sendBounds, BOUNDS_DEBOUNCE_MS),
    [sendBounds],
  ) //

  useLayoutEffect(() => {
    sendBounds()
  }, [activeTabId, sendBounds]) //

  useResizeObserver({
    ref: contentWrapperRef,
    onResize: debouncedSendBounds,
  }) //

  useEffect(() => {
    debouncedSendBounds()
    return () => {
      debouncedSendBounds.cancel()
    }
  }, [isSidebarOpen, debouncedSendBounds]) //

  // --- توابع هندلر (بدون تغییر در منطق، فقط از اکشن‌های Zustand استفاده می‌کنند) ---
  const handleOpenChart = (title: string, url: string) => {
    const newTab = createTab(title, url, true)
    if (newTab) {
      viewCreate(newTab.id, newTab.url)
    }
    setIsSidebarOpen(false)
  } //

  const handleDeleteTab = (tabId: string) => {
    console.log(`[Renderer] 1. Deleting tab from Zustand: ${tabId}`);
    deleteTab(tabId)
    console.log(`[Renderer] 1. Deleting tab from Zustand: ${tabId}`);
    viewDestroy(tabId)
  } //

  const handleAddNewChart = () => {
    setEditingChart(null)
    setIsChartEditorModalOpen(true)
  } //

  const handleEditChart = (chart: SavedChart) => {
    setEditingChart(chart)
    setIsChartEditorModalOpen(true)
  } //

  const handleEditorSubmit = (title: string, url: string) => {
    if (editingChart) {
      updateChart(editingChart.id, title, url)
    } else {
      addChart(title, url)
    }
    setIsChartEditorModalOpen(false)
  } //

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  } //

  const handleSelectColor = (color: string | null) => {
    if (colorMenuProps) {
      updateTabColor(colorMenuProps.tabId, color)
    }
    setColorMenuProps(null)
  } //

  const handleCloseColorMenu = () => {
    setColorMenuProps(null)
  } //

  // --- JSX (بدون تغییر) ---
  return (
    <div className="tab-manager-container-wrapper">
      <ChartListSidebar
        isOpen={isSidebarOpen}
        onToggle={handleToggleSidebar}
        charts={savedCharts}
        onOpenChart={handleOpenChart}
        onEditChart={handleEditChart}
        onDeleteChart={deleteChart}
        onAddNew={handleAddNewChart}
      />

      <div className="tab-manager-main-content">
        <TabBar
          activeTabs={activeTabs}
          setActiveTabs={setActiveTabs}
          activeTabId={activeTabId}
          onSetActiveId={setActiveTabId}
          onUpdateTabColor={updateTabColor}
          onOpenColorMenu={setColorMenuProps}
          onDeleteTab={handleDeleteTab}
          onOpenTrash={() => setIsTrashModalOpen(true)}
          onOpenChartList={handleToggleSidebar}
          trashCount={deletedTabs.length}
        />

        <div className="tab-content-wrapper" ref={contentWrapperRef}>
          <TabContent activeTabs={activeTabs} activeTabId={activeTabId} />
        </div>
      </div>

      <TrashModal
        isOpen={isTrashModalOpen}
        onClose={() => setIsTrashModalOpen(false)}
        deletedTabs={deletedTabs}
        onRestoreTab={restoreTab}
      />
      <ChartEditorModal
        isOpen={isChartEditorModalOpen}
        onClose={() => setIsChartEditorModalOpen(false)}
        onSubmit={handleEditorSubmit}
        chartToEdit={editingChart}
      />

      {colorMenuProps && (
        <ColorPickerMenu
          position={colorMenuProps.position}
          onClose={handleCloseColorMenu}
          onSelectColor={handleSelectColor}
        />
      )}
    </div>
  )
}