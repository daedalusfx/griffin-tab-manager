import { Button } from '@/app/components/ui/button'
import { Tab } from '@/app/hooks/useTabStore'
import { AnimatePresence, motion } from 'framer-motion'
import { CloseIcon } from './icons'

interface TrashModalProps {
  isOpen: boolean
  onClose: () => void
  deletedTabs: Tab[]
  onRestoreTab: (id: string) => void
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
}

export const TrashModal = ({
  isOpen,
  onClose,
  deletedTabs,
  onRestoreTab,
}: TrashModalProps) => {
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
          >
            {/* هدر مودال */}
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="text-lg font-semibold">تب‌های حذف شده</h3>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-hover">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* محتوای مودال */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {deletedTabs.length === 0 ? (
                <p className="text-muted-foreground text-center">
                  سطل زباله خالی است.
                </p>
              ) : (
                <ul className="space-y-2">
                  <AnimatePresence>
                    {deletedTabs.map((tab) => (
                      <motion.li
                        key={tab.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="flex justify-between items-center p-3 bg-muted/50 rounded-md"
                      >
                        <span className="text-sm truncate" title={tab.title}>
                          {tab.title}
                        </span>
                        <Button
                          variant="link"
                          className="text-sm p-0 h-auto"
                          onClick={() => onRestoreTab(tab.id)}
                        >
                          بازیابی
                        </Button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}