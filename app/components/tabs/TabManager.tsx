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
import { TabBar } from './TabBar'
import { TabContent } from './TabContent'
import { TrashModal } from './TrashModal'

// --- ثابت‌ها ---
const BOUNDS_DEBOUNCE_MS = 350

const INACTIVE_TIMEOUT_MS = 2 * 60 * 1000 
const GC_INTERVAL_MS = 60 * 1000 // چک کردن هر ۱ دقیقه


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
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false) 
  const sortTabsByColor = useTabStore((state) => state.sortTabsByColor)


  const isMultiViewOpen = useTabStore((state) => state.isMultiViewOpen)
  const toggleMultiView = useTabStore((state) => state.toggleMultiView)

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



  // --- فیچر جدید: Garbage Collector (آزادسازی رم) ---
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now()
      
      activeTabs.forEach((tab) => {
        // ۱. اگر تب، تبِ فعال فعلی نیست
        // ۲. اگر نوع تب نرمال است (مولتی‌ویو را نمی‌بندیم چون وب‌ویو است)
        // ۳. اگر زمان آخرین بازدید را دارد
        if (
          tab.id !== activeTabId && 
          tab.type !== 'multiview' && 
          tab.lastAccessed
        ) {
          // محاسبه اختلاف زمانی
          const timeDiff = now - tab.lastAccessed
          
          if (timeDiff > INACTIVE_TIMEOUT_MS) {
            console.log(`[GC] Hibernating tab due to inactivity: ${tab.title}`)
            // ویو را از Main Process حذف می‌کنیم تا رم آزاد شود
            viewDestroy(tab.id)
            
            // نکته: نیازی نیست در Zustand چیزی را تغییر دهیم یا lastAccessed را null کنیم.
            // چون وقتی کاربر دوباره روی تب کلیک کند، useEffect مربوط به Lazy Loading (پایین‌تر)
            // دوباره viewCreate را صدا می‌زند و ویو از نو ساخته می‌شود.
          }
        }
      })
    }, GC_INTERVAL_MS)

    return () => clearInterval(intervalId)
  }, [activeTabs, activeTabId, viewDestroy])




  // --- کد جدید (Lazy Loading) ---
  useEffect(() => {
    // فقط یکبار اجرا می‌شود تا فلگ initialization ست شود
    if (!didInitViewsRef.current) {
      didInitViewsRef.current = true
      console.log('--- App Started: Lazy Loading Mode Active ---')
      
      // نکته مهم: ما دیگر اینجا هیچ تبی را نمی‌سازیم (viewCreate صدا زده نمی‌شود).
      // وظیفه ساخت تب فعال به عهده useEffect بعدی است که به تغییرات activeTabId گوش می‌دهد.
    
    }
  }, [])
  // --- افکت جدید: مدیریت هوشمند و تنبل (Lazy) ویوها ---
  useEffect(() => {
    // اگر مودال‌ها باز هستند یا مولتی‌ویو فعال است، ویوی اصلی را مخفی کن
    const shouldHideMainView =
      isTrashModalOpen ||
      isChartEditorModalOpen ||
      !!colorMenuProps ||
      isBulkAddModalOpen ||
      isMultiViewOpen;

    if (shouldHideMainView || !activeTabId) {
      viewSetActive(null);
      return;
    }

    // پیدا کردن تب فعال
    const currentTab = activeTabs.find((t) => t.id === activeTabId);
    
    // اگر تب وجود دارد و از نوع normal است (یعنی BrowserView می‌خواهد)
    if (currentTab && currentTab.type !== 'multiview') {
      const loadView = async () => {
        // ۱. درخواست ساخت ویو (اگر قبلاً ساخته شده باشد، هندلر سمت Main آن را نادیده می‌گیرد)
        // این یعنی "بارگذاری در لحظه نیاز"
        await viewCreate(currentTab.id, currentTab.url);
        
        // ۲. حالا که مطمئنیم ویو وجود دارد، آن را نمایش بده
        await viewSetActive(currentTab.id);
      };
      
      loadView();
    } else {
      // اگر تب مولتی‌ویو است، نیازی به BrowserView نیست
      viewSetActive(null);
    }
  }, [
    activeTabId,           // هر وقت تب عوض شد اجرا می‌شود
    activeTabs,            // برای دسترسی به اطلاعات تب
    isTrashModalOpen,
    isChartEditorModalOpen,
    colorMenuProps,
    isBulkAddModalOpen,
    isMultiViewOpen,
    viewCreate,            // هوک‌ها
    viewSetActive
  ]);
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

  const handleOpenMultiView = () => {
    // ایجاد تب جدید با تایپ 'multiview'
    // نیازی به صدا زدن viewCreate برای این تب نیست چون از <webview> استفاده می‌کند
    createTab('داشبورد جدید', '', true, 'multiview')
    setIsSidebarOpen(false)
  }

  const handleOpenChart = async (title: string, url: string) => {
    // ۱. تب ساخته می‌شود اما فعال نمی‌شود (activate = false)
    const newTab = createTab(title, url, false) 
    
    if (newTab) {
      // ۲. منتظر می‌مانیم تا BrowserView ساخته شود
      await viewCreate(newTab.id, newTab.url)
      // ۳. حالا تب را فعال می‌کنیم
      setActiveTabId(newTab.id)
    }
    setIsSidebarOpen(false)
  }
  
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


  const handleBulkEditorSubmit = (charts: Array<{ title: string; url: string }>) => {
    charts.forEach(chart => {
      addChart(chart.title, chart.url); //
    });
    
    setIsBulkAddModalOpen(false);
  };

  // پیدا کردن آبجکت تب فعال برای رندر
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
        />

        <div className="tab-content-wrapper" ref={contentWrapperRef}>

        {activeTabObj?.type === 'multiview' ? (
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