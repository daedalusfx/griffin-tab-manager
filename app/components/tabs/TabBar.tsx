import { Tab } from '@/app/hooks/useTabStore';
import { AnimatePresence, motion, Reorder } from 'framer-motion';
import { LayoutDashboard, ListIcon, PaintBucketIcon, Settings, TrashIcon, SearchIcon } from 'lucide-react';
import React from 'react';
import { TabItem } from './TabItem';
import { useTranslation } from 'react-i18next';

interface TabBarProps {
  activeTabs: Tab[]
  isMultiViewActive: boolean
  setActiveTabs: (tabs: Tab[]) => void
  activeTabId: string | null
  onSetActiveId: (id: string) => void
  onDeleteTab: (id: string) => void
  onOpenTrash: () => void
  onOpenChartList: () => void
  trashCount: number
  onUpdateTabColor: (id: string, color: string | null) => void 
  onOpenColorMenu: (props: { tabId: string; position: { x: number; y: number } }) => void
  onSortTabs: () => void
  onToggleMultiView: () => void
  onOpenMultiView: () => void
  onOpenSettings: () => void
  onOpenSearch: () => void 
}

export const TabBar = ({
  activeTabs,
  setActiveTabs,
  activeTabId,
  onSetActiveId,
  onDeleteTab,
  onOpenTrash,
  onOpenChartList,
  trashCount,
  onUpdateTabColor,
  onOpenColorMenu,
  onSortTabs,
  onToggleMultiView,
  isMultiViewActive,
  onOpenMultiView,
  onOpenSettings,
  onOpenSearch 
}: TabBarProps) => {
  const { t, i18n } = useTranslation();

  return (
    <header className="tab-header">
      <nav className="tab-bar-nav">
        <Reorder.Group
          as="ul"
          axis="x"
          values={activeTabs}
          onReorder={setActiveTabs}
          className="flex"
          layoutScroll
          style={{ overflowY: 'hidden' }}
        >
          <AnimatePresence initial={false}>
            {activeTabs.map((tab) => (
              <TabItem
                key={tab.id}
                tab={tab}
                isActive={tab.id === activeTabId}
                onSelect={onSetActiveId}
                onUpdateColor={onUpdateTabColor} 
                onOpenColorMenu={onOpenColorMenu}
                onClose={onDeleteTab}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>
      </nav>

      <div className="tab-controls flex items-center gap-1">
        
        {/* نوار جستجوی جدید */}
        <button
          className="flex items-center gap-2 bg-input/40 hover:bg-input border border-border text-muted-foreground px-3 py-1.5 rounded-md text-xs transition-colors mx-2 ml-4 cursor-pointer"
          onClick={onOpenSearch}
          title="جستجوی چارت (Ctrl+K)"
        >
          <SearchIcon className="w-4 h-4" />
          <span className="hidden sm:inline">جستجو...</span>
          <kbd className="hidden md:inline-block font-mono bg-background/50 px-1.5 rounded border border-border/50 text-[10px] mr-2 text-muted-foreground/80" dir="ltr">
            Ctrl+K
          </kbd>
        </button>
        {/* پایان نوار جستجو */}

        <button
          id="chart-list-btn"
          className="tab-icon-btn"
          title={t('sidebar.chart_list')}
          onClick={onOpenChartList}
        >
          <ListIcon className="w-5 h-5" />
        </button>
        <button
          className="tab-icon-btn"
          title={t('tab_bar.sort_by_color')}
          onClick={onSortTabs}
        >
          <PaintBucketIcon className="w-5 h-5" />
        </button>
        <button
          className="tab-icon-btn"
          title={t('tab_bar.open_multiview')}
          onClick={onOpenMultiView}
        >
          <LayoutDashboard className="w-5 h-5" />
        </button>
        <button
          className="tab-icon-btn"
          title={t('tab_bar.settings')}
          onClick={onOpenSettings}
        >
          <Settings className="w-5 h-5" />
        </button>
        <button
          id="trash-btn"
          className="relative tab-icon-btn"
          title={t('tab_bar.deleted_tabs')}
          onClick={onOpenTrash}
        >
          <TrashIcon className="w-5 h-5" />
          <AnimatePresence>
            {trashCount > 0 && (
              <motion.span
                className="badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                {trashCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </header>
  );
};