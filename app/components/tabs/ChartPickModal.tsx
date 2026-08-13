import { Tab } from '@/app/hooks/useTabStore';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, SearchIcon, CommandIcon, ArrowRightIcon } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface ChartPickModalProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: Tab[];
  onSelect: (tabId: string) => void;
  currentTabId: string;
}

const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const modalVariants = { hidden: { opacity: 0, scale: 0.95, y: -20 }, visible: { opacity: 1, scale: 1, y: 0 } };

export const ChartPickModal = ({
  isOpen,
  onClose,
  tabs,
  onSelect,
  currentTabId,
}: ChartPickModalProps) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const { t } = useTranslation();

  // فیلتر کردن تب‌ها (حالا تنظیمات و مولتی‌ویو رو هم شامل میشه تا دسترسی سریع‌تر باشه)
  const filteredTabs = tabs.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  // ریست کردن ایندکس وقتی سرچ تغییر میکنه یا مدال باز/بسته میشه
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // مدیریت دکمه‌های کیبورد (Arrow Up/Down و Enter)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredTabs.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredTabs.length) % filteredTabs.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredTabs.length > 0) {
          onSelect(filteredTabs[selectedIndex].id);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredTabs, selectedIndex, onSelect, onClose]);

  // اسکرول هوشمند به آیتم انتخاب شده با کیبورد
  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 z-[9999] flex items-start justify-center pt-[15vh] backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="bg-popover/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden"
            variants={modalVariants}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Area */}
            <div className="flex items-center p-4 border-b border-border/50 gap-3">
              <SearchIcon className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="جستجوی چارت یا تب (مثال: EUR/USD) ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
                autoFocus
                dir="auto"
              />
              <div className="hidden sm:flex items-center gap-1 opacity-50 shrink-0 bg-muted px-2 py-1 rounded text-xs font-mono">
                <span>ESC</span>
              </div>
            </div>

            {/* List Area */}
            <div className="max-h-[50vh] overflow-y-auto p-2" dir="ltr">
              {filteredTabs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CommandIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">{t('modals.chart_picker.not_found')}</p>
                </div>
              ) : (
                <ul className="space-y-1">
                  {filteredTabs.map((tab, index) => {
                    const isSelected = index === selectedIndex;
                    const isActiveTab = tab.id === currentTabId;

                    return (
                      <li key={tab.id}>
                        <button
                          ref={(el) => (itemRefs.current[index] = el)}
                          onClick={() => onSelect(tab.id)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-150 text-left ${
                            isSelected
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'text-foreground hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            {/* Color Dot */}
                            <div 
                              className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                              style={{ backgroundColor: tab.color || '#888' }}
                            />
                            <span className="truncate font-medium">
                              {tab.title || (tab.type === 'settings' ? 'Settings' : 'Multi-View')}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            {isActiveTab && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                Active
                              </span>
                            )}
                            {isSelected && <ArrowRightIcon className="w-4 h-4" />}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            
            {/* Footer Hint */}
            <div className="bg-muted/30 p-2 px-4 border-t border-border/50 text-[11px] text-muted-foreground flex justify-between">
              <span>تغییر چارت با <kbd className="font-mono bg-background border border-border px-1 rounded">↑</kbd> <kbd className="font-mono bg-background border border-border px-1 rounded">↓</kbd> و <kbd className="font-mono bg-background border border-border px-1 rounded">Enter</kbd></span>
              <span className="hidden sm:inline">ناوبری سریع</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};