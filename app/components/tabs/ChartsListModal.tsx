import { Button } from '@/app/components/ui/button'
import { SavedChart } from '@/app/hooks/useChartStore'
import { AnimatePresence, motion } from 'framer-motion'
import { Edit2Icon, PlayCircleIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react'

interface ChartsListModalProps {
  isOpen: boolean
  onClose: () => void
  charts: SavedChart[]
  onOpenChart: (title: string, url: string) => void
  onEditChart: (chart: SavedChart) => void
  onDeleteChart: (id: string) => void
  onAddNew: () => void
}

const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } }
const modalVariants = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }

export const ChartsListModal = ({
  isOpen,
  onClose,
  charts,
  onOpenChart,
  onEditChart,
  onDeleteChart,
  onAddNew,
}: ChartsListModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="trash-modal-backdrop"
          variants={backdropVariants}
          initial="hidden" // <-- کاما از اینجا حذف شد
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
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="text-lg font-semibold">لیست چارت‌های ذخیره شده</h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full hover:bg-hover"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              {charts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  لیست چارت‌های شما خالی است.
                </p>
              ) : (
                <ul className="space-y-2">
                  <AnimatePresence>
                    {charts.map((chart) => (
                      <motion.li
                        key={chart.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex justify-between items-center p-3 bg-muted/50 rounded-md"
                      >
                        <div className="truncate">
                          <span className="font-medium text-sm">{chart.title}</span>
                          <p className="text-xs text-muted-foreground truncate" dir="ltr">
                            {chart.url}
                          </p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-destructive/80 hover:text-destructive"
                            onClick={() => onDeleteChart(chart.id)}
                            title="حذف از لیست"
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => onEditChart(chart)}
                            title="ویرایش"
                          >
                            <Edit2Icon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-green-500"
                            onClick={() => onOpenChart(chart.title, chart.url)}
                            title="باز کردن در تب جدید"
                          >
                            <PlayCircleIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            <div className="flex justify-start p-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onAddNew}
                className="gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                افزودن چارت جدید به لیست
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}