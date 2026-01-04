import { Tab } from '@/app/hooks/useTabStore';
import React, { useMemo, useState } from 'react';
import { Mosaic, MosaicNode, MosaicWindow } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import { ChartSelector } from './ChartSelector';
import { MosaicSlot } from './MosaicSlot';

interface MultiViewGridProps {
  currentTab: Tab
  allTabs: Tab[]
}

export type MosaicKey = string;

export const MultiViewGrid = ({ currentTab, allTabs }: MultiViewGridProps) => {
  const availableCharts = useMemo(() => 
    allTabs.filter(t => t.type !== 'multiview' && t.type !== 'settings'),
  [allTabs]);

  const [layout, setLayout] = useState<MosaicNode<MosaicKey> | null>(() => {
      if (availableCharts.length === 0) return null;
      if (availableCharts.length === 1) return availableCharts[0].id;
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
              هیچ چارت بازی وجود ندارد.
          </div>
      ) : (
          <Mosaic<MosaicKey>
            renderTile={(id, path) => {
                const chart = availableCharts.find(c => c.id === id);
                
                // اگر چارت بسته شده بود
                if (!chart) return (
                    <MosaicWindow<MosaicKey> path={path} title="حذف شده">
                         <div className="flex items-center justify-center h-full text-destructive">
                             چارت بسته شده
                         </div>
                    </MosaicWindow>
                );

                return (
                    <MosaicWindow<MosaicKey>
                        path={path}
                        // اینجا به جای تایتل متنی، سلکتور را می‌گذاریم
                        title={ 
                            <ChartSelector 
                                currentChartId={id} 
                                path={path} 
                                allTabs={allTabs} 
                            /> as any
                        }
                        // کنترل‌های تولبار (مثل دکمه بستن و اسپلیت)
                        toolbarControls={[
                             // اگر بخواهید دکمه‌های پیش‌فرض را نگه دارید یا کاستوم کنید
                             // به صورت پیش‌فرض دکمه اسپلیت و بستن وجود دارد
                        ]}
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
            className="mosaic-blueprint-theme"
            zeroStateView={
                <div className="flex items-center justify-center h-full text-muted-foreground select-none">
                    همه پنجره‌ها بسته شدند. از دکمه‌های بالا برای افزودن مجدد استفاده کنید.
                </div>
            }
          />
      )}
    </div>
  );
};