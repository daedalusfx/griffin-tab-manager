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
import { BulkChartModal } from './BulkChartModal'
import { ChartEditorModal } from './ChartEditorModal'
import { ChartListSidebar } from './ChartListSidebar'
import { ColorPickerMenu } from './ColorPickerMenu'
import { MultiViewGrid } from './MultiViewGrid'
import { SettingsPage } from './SettingsPage'
import { TabBar } from './TabBar'
import { TabContent } from './TabContent'
import { TrashModal } from './TrashModal'

// --- ثابت‌ها ---
const BOUNDS_DEBOUNCE_MS = 350

type ColorMenuProps = {
  tabId: string
  position: { x: number; y: number }
}

export const TabManager = () => {
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false)
  const [isChartEditorModalOpen, setIsChartEditorModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [editingChart, setEditingChart] = useState<SavedChart | null>(null) 
  const [colorMenuProps, setColorMenuProps] = useState<ColorMenuProps | null>(null)
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false) 
  
  const sortTabsByColor = useTabStore((state) => state.sortTabsByColor)
  const inactivityTimeoutMinutes = useTabStore((state) => state.inactivityTimeoutMinutes)
  const isMultiViewOpen = useTabStore((state) => state.isMultiViewOpen)
  const toggleMultiView = useTabStore((state) => state.toggleMultiView)

  // --- هوک‌های IPC ---
  // توجه: viewSetBounds حالا دو آرگومان می‌گیرد
  const { viewSetActive, viewSetBounds, viewCreate, viewDestroy } = useConveyor('window') 

  const { activeTabs, deletedTabs, activeTabId } = useTabStore(
    useShallow((state) => ({
      activeTabs: state.activeTabs,
      deletedTabs: state.deletedTabs,
      activeTabId: state.activeTabId,
    })),
  )

  const setActiveTabs = useTabStore((state) => state.setActiveTabs)
  const setActiveTabId = useTabStore((state) => state.setActiveTabId)
  const createTab = useTabStore((state) => state.createTab)
  const deleteTab = useTabStore((state) => state.deleteTab)
  const restoreTab = useTabStore((state) => state.restoreTab)
  const updateTabColor = useTabStore((state) => state.updateTabColor)

  const savedCharts = useChartStore(useShallow((state) => state.savedCharts))
  const addChart = useChartStore((state) => state.addChart)
  const updateChart = useChartStore((state) => state.updateChart)
  const deleteChart = useChartStore((state) => state.deleteChart)

  const contentWrapperRef = useRef<HTMLDivElement>(null) 
  const didInitViewsRef = useRef<boolean>(false) 

  // --- Garbage Collector ---
  useEffect(() => {
    if (inactivityTimeoutMinutes === 0) return;

    const intervalId = setInterval(() => {
      const now = Date.now()
      const timeoutMs = inactivityTimeoutMinutes * 60 * 1000 
      
      activeTabs.forEach((tab) => {
        if (
          tab.id !== activeTabId && 
          tab.type !== 'multiview' && 
          tab.lastAccessed
        ) {
          const timeDiff = now - tab.lastAccessed
          if (timeDiff > timeoutMs) {
            viewDestroy(tab.id)
          }
        }
      })
    }, 60 * 1000) 

    return () => clearInterval(intervalId)
  }, [activeTabs, activeTabId, viewDestroy, inactivityTimeoutMinutes]) 

  useEffect(() => {
    if (!didInitViewsRef.current) {
      didInitViewsRef.current = true
    }
  }, [])
  
  // --- مدیریت Lazy Views ---
  useEffect(() => {
    const shouldHideMainView =
      isTrashModalOpen ||
      isChartEditorModalOpen ||
      !!colorMenuProps ||
      isBulkAddModalOpen ||
      isMultiViewOpen

    if (shouldHideMainView || !activeTabId) {
      viewSetActive(null)
      return
    }

    const currentTab = activeTabs.find((t) => t.id === activeTabId)

    if (
      currentTab && 
      currentTab.type !== 'multiview' && 
      currentTab.type !== 'settings' 
    ) {
      const loadView = async () => {
        await viewCreate(currentTab.id, currentTab.url)
        await viewSetActive(currentTab.id)
      }
      loadView()
    } else {
      viewSetActive(null)
    }
  }, [
    activeTabId,
    activeTabs,
    isTrashModalOpen,
    isChartEditorModalOpen,
    colorMenuProps,
    isBulkAddModalOpen,
    isMultiViewOpen,
    viewCreate,
    viewSetActive,
  ])

  // --- مدیریت ابعاد (Bounds) ---
  const sendBounds = useCallback(() => {
    if (contentWrapperRef.current && activeTabId) { // فقط اگر تب فعال داریم
      const rect = contentWrapperRef.current.getBoundingClientRect()
      if (rect.width < 10 || rect.height < 10) return
      
      const bounds = {
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      }
      
      // تغییر مهم: ارسال ID تب فعال به همراه Bounds
      viewSetBounds(activeTabId, bounds)
    }
  }, [viewSetBounds, activeTabId]) 

  const debouncedSendBounds = useCallback(
    debounce(sendBounds, BOUNDS_DEBOUNCE_MS),
    [sendBounds],
  ) 

  useLayoutEffect(() => {
    sendBounds()
  }, [activeTabId, sendBounds]) 

  useResizeObserver({
    ref: contentWrapperRef,
    onResize: debouncedSendBounds,
  }) 

  useEffect(() => {
    debouncedSendBounds()
    return () => {
      debouncedSendBounds.cancel()
    }
  }, [isSidebarOpen, debouncedSendBounds]) 

  // --- هندلرها ---
  const handleOpenMultiView = () => {
    createTab('داشبورد جدید', '', true, 'multiview')
    setIsSidebarOpen(false)
  }

  const handleOpenChart = async (title: string, url: string) => {
    const newTab = createTab(title, url, false) 
    if (newTab) {
      await viewCreate(newTab.id, newTab.url)
      setActiveTabId(newTab.id)
    }
    setIsSidebarOpen(false)
  }
  
  const handleDeleteTab = (tabId: string) => {
    deleteTab(tabId)
    viewDestroy(tabId)
  } 

  const handleAddNewChart = () => {
    setEditingChart(null)
    setIsChartEditorModalOpen(true)
  } 

  const handleEditChart = (chart: SavedChart) => {
    setEditingChart(chart)
    setIsChartEditorModalOpen(true)
  } 

  const handleEditorSubmit = (title: string, url: string) => {
    if (editingChart) {
      updateChart(editingChart.id, title, url)
    } else {
      addChart(title, url)
    }
    setIsChartEditorModalOpen(false)
  } 

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  } 

  const handleSelectColor = (color: string | null) => {
    if (colorMenuProps) {
      updateTabColor(colorMenuProps.tabId, color)
    }
    setColorMenuProps(null)
  } 

  const handleCloseColorMenu = () => {
    setColorMenuProps(null)
  } 

  const handleBulkEditorSubmit = (charts: Array<{ title: string; url: string }>) => {
    charts.forEach(chart => {
      addChart(chart.title, chart.url); 
    });
    setIsBulkAddModalOpen(false);
  };

  const handleOpenSettings = () => {
    const existingSettingsTab = activeTabs.find(t => t.type === 'settings')
    if (existingSettingsTab) {
      setActiveTabId(existingSettingsTab.id)
    } else {
      createTab('تنظیمات', '', true, 'settings')
    }
    setIsSidebarOpen(false) 
  }

  const activeTabObj = activeTabs.find(t => t.id === activeTabId)

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
        onAddNewBulk={() => setIsBulkAddModalOpen(true)}
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
          onSortTabs={sortTabsByColor}
          onToggleMultiView={toggleMultiView} 
          isMultiViewActive={isMultiViewOpen}
          onOpenMultiView={handleOpenMultiView}
          onOpenSettings={handleOpenSettings}
        />

        <div className="tab-content-wrapper" ref={contentWrapperRef}>
          {activeTabObj?.type === 'settings' ? (
            <SettingsPage />
          ) : activeTabObj?.type === 'multiview' ? (
            <MultiViewGrid 
              currentTab={activeTabObj} 
              allTabs={activeTabs} 
            />
          ) : (
            <TabContent activeTabs={activeTabs} activeTabId={activeTabId} />
          )}
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

     <BulkChartModal
        isOpen={isBulkAddModalOpen}
        onClose={() => setIsBulkAddModalOpen(false)}
        onSubmit={handleBulkEditorSubmit}
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