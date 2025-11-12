import { Button } from '@/app/components/ui/button'
import { parseUrlsToCharts } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { XIcon } from 'lucide-react'
import React, { FormEvent, useState } from 'react'

interface BulkChartModalProps {
  isOpen: boolean
  onClose: () => void
  // تابع onSubmit حالا یک آرایه می‌گیرد
  onSubmit: (charts: Array<{ title: string; url: string }>) => void
}

const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } }
const modalVariants = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }

export const BulkChartModal = ({
  isOpen,
  onClose,
  onSubmit,
}: BulkChartModalProps) => {
  const [urlList, setUrlList] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!urlList) return
    
    // از تابع ریجکس که ساختیم استفاده می‌کنیم
    const charts = parseUrlsToCharts(urlList)
    
    if (charts.length > 0) {
      onSubmit(charts)
    }
    
    setUrlList('') // فیلد را خالی کن
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="trash-modal-backdrop" //
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="trash-modal-content" //
            variants={modalVariants}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit}>
              <div className="flex justify-between items-center p-4 border-b border-border">
                <h3 className="text-lg font-semibold">
                  افزودن گروهی چارت‌ها
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-hover"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label htmlFor="tab-urls" className="tab-label"> {/* */}
                    لیست آدرس‌ها (URL)
                  </label>
                  <textarea
                    id="tab-urls"
                    value={urlList}
                    onChange={(e) => setUrlList(e.target.value)}
                    className="tab-input min-h-[150px] resize-y" //
                    placeholder="لیست لینک‌ها را اینجا جایگذاری کنید، هر لینک در یک خط..."
                    required
                    autoFocus
                    dir="ltr"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    برنامه به صورت هوشمند نمادهای TradingView را به عنوان عنوان استخراج می‌کند.
                  </p>
                </div>
              </div>

              <div className="flex justify-end p-4 border-t border-border">
                <Button type="submit">
                  افزودن {parseUrlsToCharts(urlList).length || ''} چارت
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}