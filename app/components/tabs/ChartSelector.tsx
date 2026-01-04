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
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  padding: 0 4px;

  /* وقتی موس روی کامپوننت می‌آید */
  &:hover {
    background-color: var(--window-c-hover, rgba(255, 255, 255, 0.1));
    
    /* تغییر رنگ متن‌ها در حالت هاور */
    .selector-title {
      color: var(--foreground);
    }
    .selector-icon {
      color: var(--foreground);
      transform: translateY(2px); /* انیمیشن کوچک حرکت */
    }
  }
`;

const NativeSelect = styled.select`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0; /* کاملا نامرئی */
  cursor: pointer;
  
  /* نکته مهم برای دارک مود شدن منوی بازشونده */
  color-scheme: dark; 

  /* استایل آپشن‌ها برای اطمینان بیشتر */
  & option, & optgroup {
    background-color: #282828;
    color: var(--foreground);
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
    <Wrapper title="برای تغییر چارت کلیک کنید">
      {/* لایه نمایشی (آیکون و متن) */}
      <div className="flex items-center gap-1.5 w-full pointer-events-none z-10">
        <span className="selector-title truncate text-xs font-medium text-foreground/90 transition-colors max-w-[140px]">
          {currentTab?.title || 'انتخاب چارت...'}
        </span>

        <ChevronDownIcon 
            className="selector-icon w-3 h-3 text-muted-foreground/50 transition-all ml-auto" 
        />
      </div>

      {/* سلکتور اصلی */}
      <NativeSelect
        value={currentChartId}
        onChange={handleChange}
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