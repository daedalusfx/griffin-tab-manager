import { Tab } from '@/app/hooks/useTabStore';
import { AnimatePresence, motion, Reorder } from 'framer-motion';
import { ListIcon, TrashIcon } from 'lucide-react'; // <-- آیکون‌ها از Lucide
import { TabItem } from './TabItem';

interface TabBarProps {
  activeTabs: Tab[]
  setActiveTabs: (tabs: Tab[]) => void
  activeTabId: string | null
  onSetActiveId: (id: string) => void
  // onAddNewTab حذف شد
  onDeleteTab: (id: string) => void
  onOpenTrash: () => void
  onOpenChartList: () => void // <-- دکمه جدید
  trashCount: number
}

export const TabBar = ({
  activeTabs,
  setActiveTabs,
  activeTabId,
  onSetActiveId,
  onDeleteTab,
  onOpenTrash,
  onOpenChartList, // <-- جدید
  trashCount,
}: TabBarProps) => {
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
          style={{ overflowY: 'hidden' }} // جلوگیری از پرش عمودی
        >
          <AnimatePresence initial={false}>
            {activeTabs.map((tab) => (
              <TabItem
                key={tab.id}
                tab={tab}
                isActive={tab.id === activeTabId}
                onSelect={onSetActiveId}
                onClose={onDeleteTab}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>
      </nav>

      {/* دکمه‌های کنترل */}
      <div className="tab-controls">
        {/* --- این دکمه جایگزین شد --- */}
        <button
          id="chart-list-btn"
          className="tab-icon-btn"
          title="لیست چارت‌ها"
          onClick={onOpenChartList}
        >
          <ListIcon className="w-5 h-5" />
        </button>

        <button
          id="trash-btn"
          className="relative tab-icon-btn"
          title="تب‌های حذف شده"
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
  )
}