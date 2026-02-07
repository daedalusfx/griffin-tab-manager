import { motion } from 'framer-motion'
import { 
  XIcon, 
  RefreshCwIcon, 
  MoonIcon 
} from 'lucide-react'
import React, { useEffect, useRef } from 'react'

const COLORS = ['#EF4444', '#22C55E', '#3B82F6', '#EAB308', '#A855F7']

interface TabContextMenuProps {
  position: { x: number; y: number }
  onClose: () => void
  onSelectColor: (color: string | null) => void
  onAction: (action: 'reload' | 'hibernate') => void
  currentTabId: string
}

export const TabContextMenu = ({
  position,
  onClose,
  onSelectColor,
  onAction,
}: TabContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <motion.div
      ref={menuRef}
      className="fixed z-50 bg-card border border-border rounded-lg shadow-xl flex flex-col w-48 overflow-hidden"
      style={{ top: position.y, left: position.x }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      {/* بخش رنگ‌ها */}
      <div className="p-3 border-b border-border/50 bg-muted/30">
        <span className="text-[10px] text-muted-foreground mb-2 block font-medium">برچسب رنگی</span>
        <div className="flex justify-between items-center gap-1">
          {COLORS.map((color) => (
            <button
              key={color}
              className="w-5 h-5 rounded-full hover:scale-110 transition-transform border border-background shadow-sm ring-1 ring-transparent hover:ring-ring"
              style={{ backgroundColor: color }}
              onClick={() => onSelectColor(color)}
              title="تغییر رنگ"
            />
          ))}
          <button
            className="w-5 h-5 rounded-full border border-dashed border-muted-foreground/70 flex items-center justify-center hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-colors"
            onClick={() => onSelectColor(null)}
            title="حذف رنگ"
          >
            <XIcon className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* بخش دکمه‌ها */}
      <div className="p-1 space-y-0.5">
        <button
          onClick={() => onAction('reload')}
          className="flex items-center gap-2 w-full px-2 py-2 text-sm text-foreground rounded hover:bg-accent hover:text-accent-foreground transition-colors text-right"
        >
          <RefreshCwIcon className="w-4 h-4 text-muted-foreground" />
          <span>بارگذاری مجدد</span>
        </button>

        <button
          onClick={() => onAction('hibernate')}
          className="flex items-center gap-2 w-full px-2 py-2 text-sm text-foreground rounded hover:bg-accent hover:text-accent-foreground transition-colors text-right group"
        >
          <MoonIcon className="w-4 h-4 text-muted-foreground group-hover:text-indigo-400 transition-colors" />
          <span>به خواب رفتن (Hibernate)</span>
        </button>
      </div>
    </motion.div>
  )
}