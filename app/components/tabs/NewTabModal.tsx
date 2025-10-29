import { Button } from '@/app/components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import { FormEvent, useEffect, useState } from 'react'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CloseIcon,
  PlusCircleIcon,
} from './icons'

// تعریف نوع داده برای هر فیلد در مودال
interface FieldState {
  id: string
  title: string
  url: string
  isCollapsed: boolean
}

interface NewTabModalProps {
  isOpen: boolean
  onClose: () => void
  // تابع onSubmit حالا یک آرایه دریافت می‌کند
  onSubmit: (tabs: Array<{ title: string; url: string }>) => void
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
}

export const NewTabModal = ({ isOpen, onClose, onSubmit }: NewTabModalProps) => {
  // استیت داخلی برای مدیریت لیست فیلدها
  const [fields, setFields] = useState<FieldState[]>([])

  // افکت: وقتی مودال باز می‌شود، یک فیلد خالی اضافه کن
  useEffect(() => {
    if (isOpen) {
      // اگر لیستی وجود نداشت، با یک فیلد شروع کن
      if (fields.length === 0) {
        setFields([
          {
            id: crypto.randomUUID(),
            title: '',
            url: 'https://',
            isCollapsed: false,
          },
        ])
      }
    } else {
      // وقتی مودال بسته شد، فیلدها را ریست کن
      setFields([])
    }
  }, [isOpen]) // eslint-disable-line

  // افزودن یک ردیف فیلد جدید
  const handleAddField = () => {
    // ردیف قبلی را ببند (برای تمیزی UI)
    const collapsedFields = fields.map((f) => ({ ...f, isCollapsed: true }))
    setFields([
      ...collapsedFields,
      {
        id: crypto.randomUUID(),
        title: '',
        url: 'https://',
        isCollapsed: false,
      },
    ])
  }

  // مدیریت تغییرات در اینپوت‌ها
  const handleFieldChange = (
    id: string,
    key: 'title' | 'url',
    value: string,
  ) => {
    setFields(
      fields.map((f) => (f.id === id ? { ...f, [key]: value } : f)),
    )
  }

  // باز/بسته کردن یک ردیف
  const handleToggleCollapse = (id: string) => {
    setFields(
      fields.map((f) =>
        f.id === id ? { ...f, isCollapsed: !f.isCollapsed } : f,
      ),
    )
  }

  // حذف یک ردیف
  const handleRemoveField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id))
  }

  // ثبت نهایی فرم
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // فقط فیلدهایی که پر شده‌اند را ارسال کن
    const validTabs = fields
      .filter((f) => f.title && f.url && f.url !== 'https://')
      .map(({ title, url }) => ({ title, url })) // فقط داده‌های لازم

    if (validTabs.length > 0) {
      onSubmit(validTabs)
    }
    onClose() // مودال در هر صورت بسته می‌شود
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
            className="trash-modal-content" // از استایل قبلی استفاده می‌کنیم
            variants={modalVariants}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit}>
              {/* هدر مودال */}
              <div className="flex justify-between items-center p-4 border-b border-border">
                <h3 className="text-lg font-semibold">افزودن لیست تب‌ها</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-hover"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              {/* لیست داینامیک فیلدها */}
              <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {fields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="modal-list-item"
                    >
                      {/* هدر ردیف (برای باز/بسته کردن) */}
                      <div
                        className="modal-list-header"
                        onClick={() => handleToggleCollapse(field.id)}
                      >
                        <span>
                          {field.isCollapsed
                            ? field.title || `تب ${index + 1}`
                            : `تب ${index + 1}`}
                        </span>
                        <div className="flex items-center gap-2">
                          {fields.length > 1 && (
                            <button
                              type="button"
                              className="modal-icon-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveField(field.id)
                              }}
                            >
                              <CloseIcon className="w-4 h-4 text-destructive/70" />
                            </button>
                          )}
                          {field.isCollapsed ? (
                            <ChevronDownIcon className="w-4 h-4" />
                          ) : (
                            <ChevronUpIcon className="w-4 h-4" />
                          )}
                        </div>
                      </div>

                      {/* بدنه ردیف (فیلدهای ورودی) */}
                      <AnimatePresence>
                        {!field.isCollapsed && (
                          <motion.div
                            layout
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="modal-list-body"
                          >
                            <div>
                              <label htmlFor={`title-${field.id}`} className="tab-label">
                                عنوان
                              </label>
                              <input
                                id={`title-${field.id}`}
                                type="text"
                                value={field.title}
                                onChange={(e) =>
                                  handleFieldChange(
                                    field.id,
                                    'title',
                                    e.target.value,
                                  )
                                }
                                className="tab-input"
                                placeholder="مثلا: گوگل"
                                required
                              />
                            </div>
                            <div>
                              <label htmlFor={`url-${field.id}`} className="tab-label">
                                آدرس (URL)
                              </label>
                              <input
                                id={`url-${field.id}`}
                                type="url"
                                value={field.url}
                                onChange={(e) =>
                                  handleFieldChange(
                                    field.id,
                                    'url',
                                    e.target.value,
                                  )
                                }
                                className="tab-input"
                                placeholder="https://google.com"
                                required
                                dir="ltr"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* فوتر مودال */}
              <div className="flex justify-between items-center p-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddField}
                  className="gap-1"
                >
                  <PlusCircleIcon className="w-5 h-5" />
                  افزودن ردیف
                </Button>
                <Button type="submit">ذخیره همه تب‌ها</Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}