import { Tab } from '@/app/hooks/useTabStore';
import { ChevronDownIcon } from 'lucide-react';
import React, { useContext } from 'react';
import { MosaicBranch, MosaicContext, MosaicPath } from 'react-mosaic-component';
import styled from 'styled-components';

interface ChartSelectorProps {
  currentChartId: string;
  path: MosaicPath;
  allTabs: Tab[];
}

// --- Styled Components ---

const Wrapper = styled.div`
  position: relative;
  height: 24px; /* ارتفاع ثابت و کوچک مثل دکمه */
  display: inline-flex; /* فقط به اندازه محتوا فضا می‌گیرد */
  align-items: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  padding: 0 8px;
  cursor: pointer;
  max-width: 160px;
  

  color: var(--muted-foreground); 
  
  &:hover {
    background-color: var(--accent);
     /* رنگ پس‌زمینه در هاور */
    color: var(--foreground);
  }
`;

const NativeSelect = styled.select`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0; /* کاملا نامرئی */
  cursor: pointer;
  appearance: none;
   /* حذف استایل پیش‌فرض مرورگر */
  
  color-scheme: dark; 

  & option, & optgroup {
    background-color: var(--popover);
    color: var(--popover-foreground);
  }
`;

// --- Component ---

export const ChartSelector = ({ currentChartId, path, allTabs }: ChartSelectorProps) => {
  const { mosaicActions } = useContext(MosaicContext);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newChartId = e.target.value;
    if (newChartId && newChartId !== currentChartId) {
      mosaicActions.replaceWith(path, newChartId as MosaicBranch);
    }
  };

  const currentTab = allTabs.find(t => t.id === currentChartId);

  return (
    <Wrapper title="تغییر چارت">
      {/* لایه نمایشی (متن و آیکون) */}
      <div className="flex items-center gap-2 pointer-events-none z-10 w-full">
        <span className="truncate text-xs font-medium">
          {currentTab?.title || 'انتخاب...'}
        </span>
        <ChevronDownIcon className="w-3 h-3 opacity-70 shrink-0" />
      </div>

      {/* سلکتور مخفی روی دکمه */}
      <NativeSelect
        value={currentChartId}
        onChange={handleChange}
        onClick={(e) => e.stopPropagation()} // جلوگیری از تداخل با درگ پنجره
      >
        <optgroup label="چارت‌های موجود">
          {allTabs
            .filter((t) => t.type !== 'multiview' && t.type !== 'settings')
            .map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.title}
              </option>
            ))}
        </optgroup>
      </NativeSelect>
    </Wrapper>
  );
};