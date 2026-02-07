import { Button } from '@/app/components/ui/button'
import { parseUrlsToCharts } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { XIcon } from 'lucide-react'
import React, { FormEvent, useState } from 'react'

interface BulkChartModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (charts: Array<{ title: string; url: string }>) => void
}

// --- داده‌های ثابت ---
const SOURCES = ['OANDA', 'FX'] as const;
const MAJOR_PAIRS = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD'];
const MINOR_PAIRS = [
  'EURGBP', 'EURJPY', 'GBPJPY', 'CADJPY', 'AUDJPY', 'EURAUD', 
  'EURCAD', 'GBPCHF', 'NZDJPY', 'AUDNZD', 'GBPAUD', 'EURCHF'
];

const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } }
const modalVariants = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }

export const BulkChartModal = ({
  isOpen,
  onClose,
  onSubmit,
}: BulkChartModalProps) => {
  // --- State ---
  const [mode, setMode] = useState<'manual' | 'auto'>('auto'); // حالت پیش‌فرض
  
  // Manual State
  const [urlList, setUrlList] = useState('');

  // Auto State
  const [selectedSource, setSelectedSource] = useState<string>('FX');
  const [selectedPairs, setSelectedPairs] = useState<string[]>([]);

  // --- Logic ---

  // انتخاب/حذف جفت ارز
  const togglePair = (pair: string) => {
    setSelectedPairs(prev => 
      prev.includes(pair) ? prev.filter(p => p !== pair) : [...prev, pair]
    );
  };

  // انتخاب همه یک گروه
  const toggleAll = (group: string[]) => {
    const allSelected = group.every(p => selectedPairs.includes(p));
    if (allSelected) {
      setSelectedPairs(prev => prev.filter(p => !group.includes(p)));
    } else {
      setSelectedPairs(prev => [...new Set([...prev, ...group])]);
    }
  };

  // ساخت URL با Regex و فرمت استاندارد
  const generateCharts = () => {
    if (mode === 'manual') {
      return parseUrlsToCharts(urlList);
    } else {
      return selectedPairs.map(pair => {
        // ساختار استاندارد تریدینگ ویو
        // مثال: FX:EURJPY -> انکد شده: FX%3AEURJPY
        const symbol = `${selectedSource}:${pair}`;
        const encodedSymbol = encodeURIComponent(symbol);
        const url = `https://www.tradingview.com/chart/?symbol=${encodedSymbol}`;
        
        return {
          title: symbol, // تایتل تمیز: FX:EURJPY
          url: url
        };
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const charts = generateCharts();
    
    if (charts.length > 0) {
      onSubmit(charts);
      // Reset logic
      setUrlList('');
      setSelectedPairs([]);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="trash-modal-backdrop"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="trash-modal-content" 
            variants={modalVariants}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '36rem' }} // کمی عریض‌تر برای لیست جفت ارزها
          >
            <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[85vh]">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-border">
                <div className="flex gap-4 items-center">
                  <h3 className="text-lg font-semibold">افزودن گروهی</h3>
                  {/* Mode Switcher Tabs */}
                  <div className="flex bg-muted rounded-md p-1">
                    <button
                      type="button"
                      onClick={() => setMode('auto')}
                      className={`px-3 py-1 text-xs rounded-sm transition-all ${mode === 'auto' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      تولید خودکار
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('manual')}
                      className={`px-3 py-1 text-xs rounded-sm transition-all ${mode === 'manual' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      دستی (URL)
                    </button>
                  </div>
                </div>
                <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-hover">
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 overflow-y-auto">
                {mode === 'manual' ? (
                  // --- MANUAL MODE ---
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="tab-urls" className="tab-label">لیست آدرس‌ها (URL)</label>
                      <textarea
                        id="tab-urls"
                        value={urlList}
                        onChange={(e) => setUrlList(e.target.value)}
                        className="tab-input min-h-[200px] resize-y"
                        placeholder="https://tradingview.com/chart/..."
                        dir="ltr"
                        autoFocus
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        هر لینک در یک خط.
                      </p>
                    </div>
                  </div>
                ) : (
                  // --- AUTO (FOREX) MODE ---
                  <div className="space-y-6">
                    
                    {/* Source Selection */}
                    <div>
                      <span className="text-sm font-medium mb-2 block">منبع داده (Broker/Source)</span>
                      <div className="flex gap-2">
                        {SOURCES.map(src => (
                          <div 
                            key={src}
                            onClick={() => setSelectedSource(src)}
                            className={`cursor-pointer px-4 py-2 rounded-md border text-sm font-medium transition-colors flex items-center gap-2 ${selectedSource === src ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'}`}
                          >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedSource === src ? 'border-primary' : 'border-muted-foreground'}`}>
                              {selectedSource === src && <div className="w-2 h-2 bg-primary rounded-full" />}
                            </div>
                            {src}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Majors Selection */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">جفت ارزهای ماژور (Majors)</span>
                        <Button type="button" variant="ghost" size="sm" className="h-6 text-xs" onClick={() => toggleAll(MAJOR_PAIRS)}>
                          انتخاب همه
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2" dir="ltr">
                        {MAJOR_PAIRS.map(pair => (
                          <button
                            key={pair}
                            type="button"
                            onClick={() => togglePair(pair)}
                            className={`text-xs p-2 rounded border transition-colors ${selectedPairs.includes(pair) ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/30 hover:bg-muted border-border'}`}
                          >
                            {pair}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Minors Selection */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">جفت ارزهای مینور (Minors)</span>
                        <Button type="button" variant="ghost" size="sm" className="h-6 text-xs" onClick={() => toggleAll(MINOR_PAIRS)}>
                          انتخاب همه
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2" dir="ltr">
                        {MINOR_PAIRS.map(pair => (
                          <button
                            key={pair}
                            type="button"
                            onClick={() => togglePair(pair)}
                            className={`text-xs p-2 rounded border transition-colors ${selectedPairs.includes(pair) ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/30 hover:bg-muted border-border'}`}
                          >
                            {pair}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                      پیش‌نمایش لینک: <span dir="ltr" className="font-mono opacity-70">tradingview.com/chart/?symbol={selectedSource}%3AEURUSD</span>
                    </div>

                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end p-4 border-t border-border bg-background">
                <Button type="submit" disabled={mode === 'auto' && selectedPairs.length === 0}>
                  {mode === 'manual' 
                    ? `افزودن ${parseUrlsToCharts(urlList).length || ''} چارت`
                    : `ساخت و افزودن ${selectedPairs.length} چارت`
                  }
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}