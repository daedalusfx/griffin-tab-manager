import { useConveyor } from '@/app/hooks/use-conveyor';
import { debounce } from 'lodash-es';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import useResizeObserver from 'use-resize-observer';

interface MosaicSlotProps {
  chartId: string;
  url: string;
  title: string;
}

export const MosaicSlot = ({ chartId, url, title }: MosaicSlotProps) => {
  const { viewCreate, viewSetBounds, viewHide } = useConveyor('window');
  const slotRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  

  // ایجاد ویو فقط یک بار
  useEffect(() => {
    let mounted = true;
    
    const initView = async () => {
      // ایجاد ویو
      await viewCreate(chartId, url);
      if (mounted) setIsLoaded(true);
    };

    initView();

    return () => {
      mounted = false;
      // مخفی کردن به جای نابود کردن کامل (برای سرعت بیشتر در سوئیچ)
      viewHide(chartId);
    };
  }, [chartId, url]); // وابستگی‌ها را دقیق کن

  // جلوگیری از ارسال رگباری مختصات با Debounce
  const handleResize = useMemo(
    () =>
      debounce((width: number, height: number, x: number, y: number) => {
        if (width > 0 && height > 0) {
          viewSetBounds(chartId, {
            x: Math.round(x),
            y: Math.round(y),
            width: Math.round(width),
            height: Math.round(height),
          });
        }
      }, 300), // 16ms = ~60fps
    [chartId, viewSetBounds]
  );

  useResizeObserver({
    ref: slotRef,
    onResize: ({ width, height }) => {
      if (slotRef.current && width && height) {
        const rect = slotRef.current.getBoundingClientRect();
        handleResize(width, height, rect.x, rect.y);
      }
    },
  });

  return (
    <div 
      ref={slotRef} 
      className="w-full h-full bg-background relative overflow-hidden"
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-card/50 z-10">
          <span className="loading-spinner mb-2" /> {/* می‌توانید یک اسپینر اضافه کنید */}
          <span className="text-xs">در حال بارگذاری...</span>
        </div>
      )}
    </div>
  );
};