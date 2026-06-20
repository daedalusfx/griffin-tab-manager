import { useTabStore, Tab } from '@/app/hooks/useTabStore';
import React, { useMemo } from 'react';
import { Mosaic, MosaicNode, MosaicWindow } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import { ChartSelector } from './ChartSelector';
import { MosaicSlot } from './MosaicSlot';
import { t } from 'i18next';

interface MultiViewGridProps {
  currentTab: Tab
  allTabs: Tab[]
}

export type MosaicKey = string;

export const MultiViewGrid = ({ currentTab, allTabs }: MultiViewGridProps) => {
  const updateTabLayout = useTabStore((state) => state.updateTabLayout);

  const availableCharts = useMemo(() => 
    allTabs.filter(t => t.type !== 'multiview' && t.type !== 'settings'),
  [allTabs]);

  // محاسبه لی‌اوت اولیه یا خواندن از استور
  const layoutValue = useMemo(() => {
    // 1. اگر قبلاً لی‌اوت ذخیره شده، همان را برگردان
    if (currentTab.layout) {
      return currentTab.layout;
    }

    // 2. اگر ذخیره نشده، یک لی‌اوت پیش‌فرض بساز
    if (availableCharts.length === 0) return null;
    if (availableCharts.length === 1) return availableCharts[0].id;
    
    // پیش‌فرض: دو تا چارت اول کنار هم
    return {
        direction: 'row',
        first: availableCharts[0].id,
        second: availableCharts[1].id,
    };
  }, [currentTab.layout, availableCharts]);


  // هندل کردن تغییرات (دراگ دراپ یا تغییر سایز یا تغییر چارت)
  const handleChange = (newLayout: MosaicNode<MosaicKey> | null) => {
    // بلافاصله در استور ذخیره می‌کنیم
    updateTabLayout(currentTab.id, newLayout);
  };

  return (
    <div className="w-full h-full bg-background mosaic-theme-dark" dir="ltr">
      {availableCharts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
      {t('tabs.no_open_charts')}
          </div>
      ) : (
          <Mosaic<MosaicKey>
            renderTile={(id, path) => {
                const chart = availableCharts.find(c => c.id === id);
                
                // اگر چارت بسته شده بود
                if (!chart) return (
                    <MosaicWindow<MosaicKey> path={path} title="حذف شده">
                         <div className="flex items-center justify-center h-full text-destructive">
                       {t('tabs.chart_closed')}
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
                    >
                        <MosaicSlot 
                            chartId={chart.id} 
                            url={chart.url} 
                            title={chart.title}
                        />
                    </MosaicWindow>
                );
            }}
            // مقدار را مستقیماً از محاسبات بالا می‌گیریم
            value={layoutValue}
            onChange={handleChange}
            className="mosaic-blueprint-theme"
            zeroStateView={
                <div className="flex items-center justify-center h-full text-muted-foreground select-none">
             {t('tabs.all_windows_closed')}
                </div>
            }
          />
      )}
    </div>
  );
};