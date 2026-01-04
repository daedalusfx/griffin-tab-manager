import { useConveyor } from '@/app/hooks/use-conveyor';
import React, { useEffect, useRef } from 'react';
import useResizeObserver from 'use-resize-observer';

interface MosaicSlotProps {
  chartId: string;
  url: string;
  title: string;
}

export const MosaicSlot = ({ chartId, url, title }: MosaicSlotProps) => {
  const { viewCreate, viewSetBounds, viewHide } = useConveyor('window');
  const slotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. ساخت ویو (اگر وجود ندارد)
    viewCreate(chartId, url);

    // 2. مخفی کردن ویو هنگام Unmount (مثلاً وقتی کاربر این کاشی را می‌بندد یا تب را عوض می‌کند)
    return () => {
      viewHide(chartId);
    };
  }, [chartId, url, viewCreate, viewHide]);

  // 3. رصد تغییر سایز و ارسال مختصات به الکترون
  useResizeObserver({
    ref: slotRef,
    onResize: () => {
      if (slotRef.current) {
        const rect = slotRef.current.getBoundingClientRect();
        
        // ارسال مختصات دقیق به الکترون
        viewSetBounds(chartId, {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
        });
      }
    },
  });

  return (
    <div 
      ref={slotRef} 
      className="w-full h-full bg-background flex items-center justify-center relative overflow-hidden"
    >
        {/* این متن فقط وقتی دیده می‌شود که ویو هنوز لود نشده باشد */}
        <div className="text-muted-foreground opacity-20 select-none flex flex-col items-center gap-2">
            <span className="text-sm font-medium">{title}</span>
            <span className="text-xs">Loading View...</span>
        </div>
    </div>
  );
};