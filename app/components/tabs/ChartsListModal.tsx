import { Button } from '@/app/components/ui/button'
import { SavedChart } from '@/app/hooks/useChartStore'
import { AnimatePresence, motion } from 'framer-motion'
import { Edit2Icon, PlayCircleIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'

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
      const { t, i18n } = useTranslation();
  
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
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="text-lg font-semibold">
                
                {t('sidebar.chart_list')}
                
                </h3>
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
                  {t('sidebar.empty_list')}
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
                            title={t('sidebar.delete_from_list')}
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => onEditChart(chart)}
                            title={t('sidebar.edit')}
                          >
                            <Edit2Icon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-green-500"
                            onClick={() => onOpenChart(chart.title, chart.url)}
                            title={t('sidebar.open_in_new_tab')}
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
      {t('modals.chart_editor.add_title')}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}