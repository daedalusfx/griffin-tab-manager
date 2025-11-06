import { motion } from 'framer-motion'
import { XIcon } from 'lucide-react'; // یا از icons.tsx
import { useEffect, useRef } from 'react'

const COLORS = ['#EF4444', '#22C55E', '#3B82F6', '#EAB308', '#A855F7']

interface ColorPickerMenuProps {
  position: { x: number; y: number }
  onClose: () => void
  onSelectColor: (color: string | null) => void
}

export const ColorPickerMenu = ({
  position,
  onClose,
  onSelectColor,
}: ColorPickerMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null)

  // کلیک در خارج از منو، آن را می‌بندد
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  return (
    <motion.div
      ref={menuRef}
      className="color-picker-menu"
      style={{
        top: position.y,
        left: position.x,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.1 }}
    >
      {/* دایره‌های رنگی */}
      <div className="color-picker-grid">
        {COLORS.map((color) => (
          <button
            key={color}
            className="color-picker-swatch"
            style={{ backgroundColor: color }}
            onClick={() => onSelectColor(color)}
          />
        ))}
      </div>
      {/* دکمه پاک کردن */}
      <button
        className="color-picker-clear"
        onClick={() => onSelectColor(null)}
      >
        <XIcon className="w-4 h-4" />
        پاک کردن رنگ
      </button>
    </motion.div>
  )
}