import { useConveyor } from '@/app/hooks/use-conveyor';
import { SavedChart, useChartStore } from '@/app/hooks/useChartStore';
import { useTabStore } from '@/app/hooks/useTabStore';
import { debounce } from 'lodash-es';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import useResizeObserver from 'use-resize-observer';
import { ChartEditorModal } from './ChartEditorModal';
import { ChartListSidebar } from './ChartListSidebar';
import { TabBar } from './TabBar';
import { TabContent } from './TabContent';
import { TrashModal } from './TrashModal';

// --- ثابت‌ها ---
const BOUNDS_DEBOUNCE_MS = 350;

export const TabManager = () => {
  // --- استیت‌ها ---
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
  const [isChartEditorModalOpen, setIsChartEditorModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingChart, setEditingChart] = useState<SavedChart | null>(null);

  // --- هوک‌ها ---
  const { viewSetActive, viewSetBounds, viewCreate, viewDestroy } = useConveyor('window'); // (توابع قبلی را هم اضافه کردم)
  const {
    activeTabs, setActiveTabs, deletedTabs, activeTabId, setActiveTabId,
    createTab, deleteTab, restoreTab,
  } = useTabStore();
  const { savedCharts, addChart, updateChart, deleteChart } = useChartStore();

  // --- رفرنس ---
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const didInitViewsRef = useRef<boolean>(false); 





  useEffect(() => {
    // این افکت فقط یک بار اجرا می‌شود
    if (activeTabs.length > 0 && !didInitViewsRef.current) {
      didInitViewsRef.current = true; // پرچم را تنظیم کن که دوباره اجرا نشود
      
      console.log('--- Initializing BrowserViews on App Start ---');
      
      const initViews = async () => {
        // ۱. برای تمام تب‌های موجود، ویو بساز
        const createPromises = activeTabs.map(tab => {
          console.log(`Creating view for: ${tab.title} (ID: ${tab.id})`);
          // تابع viewCreate از قبل در کامپوننت موجود است
          return viewCreate(tab.id, tab.url); 
        });
        
        // منتظر بمان تا همه ساخته شوند
        await Promise.all(createPromises);
        
        // ۲. ویوی فعال را تنظیم کن
        // افکت بعدی (مدیریت نمایش BrowserView) این کار را به طور خودکار انجام می‌دهد
        // چون activeTabId از قبل در استور موجود است.
        console.log(`Setting active view to: ${activeTabId}`);
        viewSetActive(activeTabId);
      };

      initViews();
    }
  }, [activeTabs, activeTabId, viewCreate, viewSetActive]); // <-- وابستگی‌ها



  // --- مدیریت نمایش BrowserView بر اساس مودال‌های تمام‌صفحه ---
  useEffect(() => {
    const isBlockingModalOpen = isTrashModalOpen || isChartEditorModalOpen;
    viewSetActive(isBlockingModalOpen ? null : activeTabId);
  }, [activeTabId, isTrashModalOpen, isChartEditorModalOpen, viewSetActive]);

  // --- مدیریت ابعاد BrowserView (اصلاح شده) ---

  // تابع اصلی ارسال ابعاد
  const sendBounds = useCallback(() => {
    if (contentWrapperRef.current) {
      const rect = contentWrapperRef.current.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 10) return;

      // const sidebarOffset = isSidebarOpen ? SIDEBAR_WIDTH : 0; // <-- این خط حذف شد

      const bounds = {
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        width: Math.round(rect.width), // <-- آفست از اینجا حذف شد
        height: Math.round(rect.height),
      };

      viewSetBounds(bounds);
    }
  }, [viewSetBounds]); // <-- isSidebarOpen از وابستگی‌ها حذف شد

  // تابع debounce شده برای ارسال ابعاد
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSendBounds = useCallback(debounce(sendBounds, BOUNDS_DEBOUNCE_MS), [sendBounds]);

  // ارسال ابعاد اولیه و هنگام تغییر تب فعال (بدون debounce)
  useLayoutEffect(() => {
    sendBounds();
  }, [activeTabId, sendBounds]);

  // نظارت بر تغییر اندازه پنجره (با debounce)
  useResizeObserver({
    ref: contentWrapperRef,
    onResize: debouncedSendBounds,
  });

  // ارسال ابعاد هنگام باز/بسته شدن سایدبار (با debounce)
  // این افکت مهم است چون flexbox اندازه را تغییر می‌دهد
  useEffect(() => {
    debouncedSendBounds();
    return () => {
      debouncedSendBounds.cancel();
    };
  }, [isSidebarOpen, debouncedSendBounds]);

  // --- توابع هندلر (اصلاح شده) ---
  const handleOpenChart = (title: string, url: string) => {
    const newTab = createTab(title, url, true);
    if (newTab) {
      viewCreate(newTab.id, newTab.url);
    }
    setIsSidebarOpen(false);
  };

  const handleDeleteTab = (tabId: string) => {
    deleteTab(tabId);
    viewDestroy(tabId);
  };

  const handleAddNewChart = () => {
    setEditingChart(null);
    setIsChartEditorModalOpen(true);
  };

  const handleEditChart = (chart: SavedChart) => {
    setEditingChart(chart);
    setIsChartEditorModalOpen(true);
  };

  const handleEditorSubmit = (title: string, url: string) => {
    if (editingChart) {
      updateChart(editingChart.id, title, url);
    } else {
      addChart(title, url);
    }
    setIsChartEditorModalOpen(false);
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  }

  return (
    // <div className={cn('tab-manager-container-wrapper', isSidebarOpen && 'sidebar-open')}> // <-- cn حذف شد
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
          onDeleteTab={handleDeleteTab} // <-- استفاده از هندلر جدید
          onOpenTrash={() => setIsTrashModalOpen(true)}
          onOpenChartList={handleToggleSidebar} // <-- دکمه نوار تب حالا سایدبار را کنترل می‌کند
          trashCount={deletedTabs.length}
        />

        <div className="tab-content-wrapper" ref={contentWrapperRef}>
          <TabContent activeTabs={activeTabs} activeTabId={activeTabId} />
        </div>
      </div>

      {/* مودال‌ها */}
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
    </div>
  );
};