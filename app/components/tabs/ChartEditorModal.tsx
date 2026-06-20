import { Button } from '@/app/components/ui/button'
import { SavedChart } from '@/app/hooks/useChartStore'
import { AnimatePresence, motion } from 'framer-motion'
import { t } from 'i18next';
import { XIcon } from 'lucide-react'; 
import React from 'react';
import { FormEvent, useEffect, useState } from 'react'

interface ChartEditorModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (title: string, url: string) => void
  chartToEdit?: SavedChart | null
}

const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } }
const modalVariants = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }

export const ChartEditorModal = ({
  isOpen,
  onClose,
  onSubmit,
  chartToEdit,
}: ChartEditorModalProps) => {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('https://')

  const isEditMode = !!chartToEdit

  // اگر در حالت ویرایش بودیم، فیلدها را پر کن
  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setTitle(chartToEdit.title)
        setUrl(chartToEdit.url)
      } else {
        setTitle('')
        setUrl('https://')
      }
    }
  }, [isOpen, isEditMode, chartToEdit])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!title || !url) return
    onSubmit(title, url)
    onClose()
  }

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
            <form onSubmit={handleSubmit}>
              <div className="flex justify-between items-center p-4 border-b border-border">
                <h3 className="text-lg font-semibold">
                  {isEditMode ? t('modals.chart_editor.edit_title') : t('modals.chart_editor.add_title')}
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
                  <label htmlFor="tab-title" className="tab-label">{t('common.title')}</label>
                  <input
                    id="tab-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="tab-input"
                    placeholder={t('modals.chart_editor.placeholder_title')}
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label htmlFor="tab-url" className="tab-label">(URL)</label>
                  <input
                    id="tab-url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="tab-input"
                    placeholder="https://tradingview.com/..."
                    required
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="flex justify-end p-4 border-t border-border">
                <Button type="submit">
                  {isEditMode ? t('common.save_changes') : t('common.add_to_list')}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}