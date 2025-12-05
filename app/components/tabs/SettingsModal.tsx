import { Button } from '@/app/components/ui/button'
import { useTabStore } from '@/app/hooks/useTabStore'
import { AnimatePresence, motion } from 'framer-motion'
import { Settings, XIcon } from 'lucide-react'
import React from 'react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } }
const modalVariants = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const inactivityTimeoutMinutes = useTabStore((state) => state.inactivityTimeoutMinutes)
  const setInactivityTimeoutMinutes = useTabStore((state) => state.setInactivityTimeoutMinutes)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="trash-modal-backdrop" // استفاده از استایل موجود
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="trash-modal-content" // استفاده از استایل موجود
            variants={modalVariants}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                تنظیمات برنامه
              </h3>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-hover">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  مدیریت هوشمند حافظه (Auto-Hibernation)
                </label>
                <p className="text-xs text-muted-foreground">
                  تب‌هایی که برای مدت مشخصی غیرفعال باشند، جهت آزادسازی رم بسته می‌شوند. با کلیک مجدد، دوباره لود خواهند شد.
                </p>
                
                <select
                  value={inactivityTimeoutMinutes}
                  onChange={(e) => setInactivityTimeoutMinutes(Number(e.target.value))}
                  className="tab-input w-full" // استفاده از کلاس موجود در tabs.css
                >
                  <option value={0}>غیرفعال (همیشه باز بمانند)</option>
                  <option value={5}>بعد از ۵ دقیقه</option>
                  <option value={15}>بعد از ۱۵ دقیقه (پیش‌فرض)</option>
                  <option value={30}>بعد از ۳۰ دقیقه</option>
                  <option value={60}>بعد از ۱ ساعت</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end p-4 border-t border-border bg-muted/20">
              <Button onClick={onClose}>بستن</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}