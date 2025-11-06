import { Tab } from '@/app/hooks/useTabStore'
import { Reorder, useMotionValue } from 'framer-motion'
import { XIcon } from 'lucide-react'
import styled, { css } from 'styled-components'

// --- تعریف Props ---
interface TabItemProps {
  tab: Tab
  isActive: boolean
  onSelect: (id: string) => void
  onClose: (id: string) => void
  onUpdateColor: (id: string, color: string | null) => void 
  onOpenColorMenu: (props: { tabId: string; position: { x: number; y: number } }) => void 
}

// --- کامپوننت‌های استایل‌دار ---

const TabTitle = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.875rem; /* 14px */
  line-height: 1.25rem;
  
`

const CloseButton = styled.button`
  opacity: 0.7; 
  border-radius: 6px;
  flex-shrink: 0;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 0; 

  & > svg {
    width: 1rem; /* 16px */
    height: 1rem; /* 16px */
    stroke: currentColor;
  }

  &:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.1); 
  }
`

const StyledTabItem = styled(Reorder.Item)<{ $isActive: boolean ,$color?: string | any}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem; 
  cursor: pointer;
  max-width: 16rem;
  flex-shrink: 0;
  transition: all 0.2s ease;

  /* استایل تخت و مستطیلی شبیه به عکس
    بردرها و مارجین‌های قبلی حذف شدند 
  */
  border: none;
  border-radius: 0;
  margin: 0;
  
  /* یک جداکننده ظریف بین تب‌ها */
  border-right: 1px solid rgba(255, 255, 255, 0.05);
   /* یا border-left برای RTL */
  
  border-left: 4px solid transparent;
  ${(props) =>
    props.$color &&
    css`
      border-left-color: ${props.$color};
      /* پدینگ داخلی رو تنظیم می‌کنیم تا متن از نوار رنگی فاصله بگیره */
      padding-left: calc(1rem - 4px); 
    `}
  /* --- استایل بر اساس Prop --- */

  /* ۱. استایل تب غیرفعال */
  ${(props) =>
    !props.$isActive &&
    css`
      /* رنگ متن روشن‌تر (شبیه عکس) */
      color: var(--muted-foreground); 
      /* پس‌زمینه تیره (همرنگ نوار تب) */
      background-color: transparent; 

      &:hover {
        /* در هاور کمی روشن‌تر می‌شود */
        background-color: var(--window-c-hover, var(--accent));
        color: var(--foreground);
      }
    `}

  /* ۲. استایل تب فعال (شبیه عکس) */
  ${(props) =>
    props.$isActive &&
    css`
      background-color: #f59e0b;
      color: #1e293b; /* Tailwind Slate 800 */
      font-weight: 500;

      ${CloseButton} {
        opacity: 0.8;
      }
      ${CloseButton}:hover {
        opacity: 1;
        background-color: rgba(0, 0, 0, 0.15);
      }
    `}
`

// --- کامپوننت اصلی ---

export const TabItem = ({ tab, isActive, onSelect, onClose,onUpdateColor,onOpenColorMenu }: TabItemProps) => {
  const y = useMotionValue(0)


  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // --- به جای استیت محلی، تابع والد رو صدا بزن ---
    onOpenColorMenu({ tabId: tab.id, position: { x: e.clientX, y: e.clientY } })
  }

  return (
    <>
    <StyledTabItem
      $isActive={isActive}
      value={tab}
      $color={tab.color} 
      id={tab.id}
      style={{ y }}
      onClick={() => onSelect(tab.id)}
      onContextMenu={handleContextMenu} 
      
      layout
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
    >
     <div style={{display:'flex',width:'100%',flexDirection:'row',
      justifyContent:'space-between',gap:'20px',alignItems:'center'}}>
     <TabTitle title={tab.title}>
        {tab.title}
      </TabTitle>
      <CloseButton
        onClick={(e) => {
          e.stopPropagation() // جلوگیری از فعال شدن تب هنگام بستن
          onClose(tab.id)
        }}
      >
        <XIcon />
      </CloseButton>

     </div>
    </StyledTabItem>
    </>
  )
}