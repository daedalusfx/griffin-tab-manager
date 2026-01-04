import { Tab } from '@/app/hooks/useTabStore';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, SearchIcon, XIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
interface ChartPickModalProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: Tab[];
  onSelect: (tabId: string) => void;
  currentTabId: string;
}

const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const modalVariants = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } };

export const ChartPickModal = ({
  isOpen,
  onClose,
  tabs,
  onSelect,
  currentTabId,
}: ChartPickModalProps) => {
  const [search, setSearch] = useState('');

  // فیلتر کردن تب‌ها (حذف موارد سیستمی + اعمال جستجو)
  const filteredTabs = tabs.filter((t) => {
    const isValidType = t.type !== 'multiview' && t.type !== 'settings';
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return isValidType && matchesSearch;
  });

  // پاک کردن جستجو هنگام باز شدن مجدد
  useEffect(() => {
    if (isOpen) setSearch('');
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="bg-popover border border-border rounded-lg shadow-xl w-full max-w-sm flex flex-col max-h-[80vh] overflow-hidden"
            variants={modalVariants}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-border">
              <span className="font-semibold text-sm">انتخاب نمودار</span>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="p-2 border-b border-border">
              <div className="relative">
                <SearchIcon className="absolute right-2 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="جستجوی نماد..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-muted/50 text-sm rounded-md py-2 pr-8 pl-3 focus:outline-none focus:ring-1 focus:ring-ring"
                  autoFocus
                />
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto p-1 flex-1">
              {filteredTabs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  موردی یافت نشد.
                </div>
              ) : (
                <ul className="space-y-1">
                  {filteredTabs.map((tab) => (
                    <li key={tab.id}>
                      <button
                        onClick={() => onSelect(tab.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                          tab.id === currentTabId
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'hover:bg-accent text-foreground'
                        }`}
                      >
                        <span className="truncate">{tab.title}</span>
                        {tab.id === currentTabId && <CheckIcon className="w-3 h-3" />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};