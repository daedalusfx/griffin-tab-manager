import { Tab } from '@/app/hooks/useTabStore';
import React, { useMemo, useState } from 'react';
import { Mosaic, MosaicNode, MosaicWindow } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css'; // استایل‌های موزاییک
import { MosaicSlot } from './MosaicSlot';

interface MultiViewGridProps {
  currentTab: Tab
  allTabs: Tab[]
}

export type MosaicKey = string; // ID چارت‌ها

export const MultiViewGrid = ({ currentTab, allTabs }: MultiViewGridProps) => {
  // فیلتر کردن چارت‌های واقعی (غیر از مولتی ویو و ستینگ)
  const availableCharts = useMemo(() => 
    allTabs.filter(t => t.type !== 'multiview' && t.type !== 'settings'),
  [allTabs]);

  // ساختن لی‌اوت اولیه: اگر چارت داریم، اولی را نشان بده
  // (برای نسخه پیشرفته‌تر، این state می‌تواند در useTabStore ذخیره شود)
  const [layout, setLayout] = useState<MosaicNode<MosaicKey> | null>(() => {
      if (availableCharts.length === 0) return null;
      if (availableCharts.length === 1) return availableCharts[0].id;
      // مثال: دو چارت اول کنار هم
      return {
          direction: 'row',
          first: availableCharts[0].id,
          second: availableCharts[1].id,
      };
  });

  return (
    <div className="w-full h-full bg-background mosaic-theme-dark" dir="ltr">
      {availableCharts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
              هیچ چارت بازی وجود ندارد. ابتدا چند چارت اضافه کنید.
          </div>
      ) : (
          <Mosaic<MosaicKey>
            renderTile={(id, path) => {
                const chart = availableCharts.find(c => c.id === id);
                
                // هندل کردن حالتی که چارت حذف شده باشد
                if (!chart) return (
                    <MosaicWindow<MosaicKey> path={path} title="چارت حذف شده">
                         <div className="p-4 text-destructive">این چارت دیگر وجود ندارد.</div>
                    </MosaicWindow>
                );

                return (
                    <MosaicWindow<MosaicKey>
                        path={path}
                        title={chart.title}
                        // حذف دکمه‌های اضافی تولبار اگر نیاز بود
                        // toolbarControls={...} 
                    >
                        <MosaicSlot 
                            chartId={chart.id} 
                            url={chart.url} 
                            title={chart.title}
                        />
                    </MosaicWindow>
                );
            }}
            value={layout}
            onChange={setLayout}
            className="mosaic-blueprint-theme" // استفاده از تم تیره پیش‌فرض
            zeroStateView={
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    همه پنجره‌ها بسته شدند.
                </div>
            }
          />
      )}
    </div>
  );
};