import { Tab } from '@/app/hooks/useTabStore'
import { Reorder, useMotionValue } from 'framer-motion'
import { XIcon } from 'lucide-react'
import React from 'react'
import styled, { css } from 'styled-components'

// --- Props ---
interface TabItemProps {
  tab: Tab
  isActive: boolean
  onSelect: (id: string) => void
  onClose: (id: string) => void
  onUpdateColor: (id: string, color: string | null) => void 
  onOpenColorMenu: (props: { tabId: string; position: { x: number; y: number } }) => void
}

// --- Styled Components ---

// ۱. نقطه رنگی مینیاتوری به جای خط کناری
const ColorDot = styled.div<{ $color?: string, $isActive: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  /* اگر رنگی ست نشده بود، برای تب فعال رنگ اصلی و برای غیرفعال خاکستری می‌گیره */
  background-color: ${props => props.$color || (props.$isActive ? 'var(--foreground)' : 'var(--muted-foreground)')};
  transition: all 0.3s ease;
  /* افکت درخشش ملایم برای تب فعال که رنگ داره */
  box-shadow: ${props => (props.$isActive && props.$color) ? `0 0 8px ${props.$color}80` : 'none'};
`

// ۲. محتوای پنهان‌شونده (متن و دکمه بستن)
const ExpandedContent = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;
  /* حالت پیش‌فرض بسته است */
  max-width: 0;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
`

const TabTitle = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.8125rem; /* 13px - مناسب برای تب‌های فشرده */
  line-height: 1.2;
  flex: 1;
  text-align: right;
`

const CloseButton = styled.button`
  opacity: 0.6; 
  border-radius: 50%;
  flex-shrink: 0;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-inline-start: 6px;

  & > svg {
    width: 12px; 
    height: 12px; 
    stroke: currentColor;
    stroke-width: 2.5;
  }

  &:hover {
    opacity: 1;
    background-color: var(--destructive);
    color: white;
  }
`

// ۳. کانتینر اصلی تب (Pill)
const StyledTabItem = styled(Reorder.Item)<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  padding: 6px;
  border-radius: 9999px; /* شکل کپسولی کامل */
  cursor: pointer;
  flex-shrink: 0;
  background-color: transparent;
  border: 1px solid transparent;
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  margin: 0 4px;
  user-select: none;
  
  /* --- استایل تب غیرفعال --- */
  ${props => !props.$isActive && css`
    color: var(--muted-foreground);
    
    /* باز شدن کشویی موقع هاور */
    &:hover {
      background-color: var(--accent);
      padding: 6px 12px 6px 10px;
      
      ${ExpandedContent} {
        max-width: 160px; /* فضای کافی برای متن و دکمه */
        opacity: 1;
        margin-inline-start: 8px;
      }
    }
  `}

  /* --- استایل تب فعال --- */
  ${props => props.$isActive && css`
    background-color: var(--background);
    color: var(--foreground);
    border-color: var(--border);
    padding: 6px 12px 6px 10px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    font-weight: 500;
    
    /* تب فعال همیشه باز است */
    ${ExpandedContent} {
      max-width: 160px;
      opacity: 1;
      margin-inline-start: 8px;
    }
  `}
`

// --- Component ---
export const TabItem = ({ tab, isActive, onSelect, onClose, onUpdateColor, onOpenColorMenu }: TabItemProps) => {
  const y = useMotionValue(0)

  // مدیریت کلیک راست برای تغییر رنگ
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onOpenColorMenu({ tabId: tab.id, position: { x: e.clientX, y: e.clientY } })
  }

  return (
    <StyledTabItem
      $isActive={isActive}
      value={tab}
      id={tab.id}
      style={{ y }}
      onClick={() => onSelect(tab.id)}
      onContextMenu={handleContextMenu}
      layout // قابلیت فوق‌العاده Framer برای جابجایی نرم
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
    >
      <ColorDot $color={tab.color} $isActive={isActive} />
      
      <ExpandedContent>
        <TabTitle title={tab.title}>
          {tab.title}
        </TabTitle>
        <CloseButton
          onClick={(e) => {
            e.stopPropagation() // جلوگیری از سلکت شدن تب هنگام بستن
            onClose(tab.id)
          }}
          title="بستن"
        >
          <XIcon />
        </CloseButton>
      </ExpandedContent>
    </StyledTabItem>
  )
}