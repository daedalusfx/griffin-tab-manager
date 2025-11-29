import { Tab, useTabStore } from '@/app/hooks/useTabStore'
import { ActivityIcon, PlusIcon } from 'lucide-react'
import React, { useCallback, useMemo } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'; // ایمپورت صحیح

// --- تنظیمات ثابت ---
const REAL_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

interface MultiViewGridProps {
  currentTab: Tab
  allTabs: Tab[]
}

// --- کامپوننت داخلی هر اسلات ---
interface SlotProps {
  index: number
  currentChartId: string | null
  availableCharts: Tab[]
  onSelect: (index: number, chartId: string | null) => void
}

const Slot = React.memo(({ index, currentChartId, availableCharts, onSelect }: SlotProps) => {
  const selectedChart = useMemo(
    () => availableCharts.find((t) => t.id === currentChartId),
    [availableCharts, currentChartId]
  )

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSelect(index, e.target.value || null)
  }

  return (
    <div className="w-full h-full relative bg-background border border-border overflow-hidden flex flex-col group">
      {/* هدر اسلات */}
      <div className="h-9 bg-muted/40 border-b border-border flex items-center px-2 gap-2 flex-shrink-0 transition-colors group-hover:bg-muted/80">
        <span className="flex items-center justify-center w-5 h-5 rounded bg-primary/10 text-primary text-[10px] font-bold">
          {index + 1}
        </span>
        
        <div className="flex-1 relative">
          <select
            className="w-full bg-transparent text-xs font-medium outline-none cursor-pointer appearance-none py-1 pr-4"
            value={currentChartId || ''}
            onChange={handleChange}
            dir="rtl"
          >
            <option value="">-- انتخاب چارت --</option>
            {availableCharts.map((chart) => (
              <option key={chart.id} value={chart.id}>
                {chart.title}
              </option>
            ))}
          </select>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
             <ActivityIcon className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* بدنه اسلات (WebView) */}
      <div className="flex-1 relative w-full h-full bg-card/20">
        {selectedChart ? (
          <webview
            src={selectedChart.url}
            className="w-full h-full"
            partition="persist:main"
            useragent={REAL_USER_AGENT}
            webpreferences="contextIsolation=no, sandbox=no, nodeIntegration=no, nativeWindowOpen=yes"
            allowpopups={true}
            style={{ width: '100%', height: '100%', display: 'flex' }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 select-none">
            <div className="p-4 rounded-full bg-muted/30 mb-3">
               <PlusIcon className="w-8 h-8 opacity-50" />
            </div>
            <span className="text-xs font-medium">چارتی انتخاب نشده</span>
          </div>
        )}
      </div>
    </div>
  )
})

Slot.displayName = 'Slot'

// --- کامپوننت اصلی ---
export const MultiViewGrid = ({ currentTab, allTabs }: MultiViewGridProps) => {
  const updateTabGridSlots = useTabStore((state) => state.updateTabGridSlots)

  const chartOptions = useMemo(() => {
    return allTabs.filter((t) => t.type !== 'multiview')
  }, [allTabs])

  const slots = useMemo(() => {
    return currentTab.gridSlots || [null, null, null]
  }, [currentTab.gridSlots])

  const handleSlotChange = useCallback(
    (index: number, newChartId: string | null) => {
      const newSlots = [...slots]
      newSlots[index] = newChartId
      updateTabGridSlots(currentTab.id, newSlots)
    },
    [slots, currentTab.id, updateTabGridSlots]
  )

  return (
    <div className="w-full h-full p-1 bg-background select-none" dir="ltr">
      {/* نکته: id پنل‌ها برای ذخیره شدن صحیح موقعیت (autoSaveId) ضروری هستند.
      */}
      <PanelGroup direction="horizontal" autoSaveId={`grid-h-${currentTab.id}`}>
        
        {/* پنل چپ */}
        <Panel id="left-main" defaultSize={60} minSize={20}>
          <Slot
            index={0}
            currentChartId={slots[0]}
            availableCharts={chartOptions}
            onSelect={handleSlotChange}
          />
        </Panel>

        <PanelResizeHandle className="w-1.5 bg-border/40 hover:bg-primary transition-colors flex items-center justify-center group focus:outline-none cursor-col-resize">
            <div className="w-0.5 h-8 bg-muted-foreground/20 group-hover:bg-primary-foreground/50 rounded-full" />
        </PanelResizeHandle>

        {/* پنل راست (دو تکه) */}
        <Panel id="right-main" defaultSize={40} minSize={20}>
          <PanelGroup direction="vertical" autoSaveId={`grid-v-${currentTab.id}`}>
            
            <Panel id="right-top" defaultSize={50} minSize={20}>
              <Slot
                index={1}
                currentChartId={slots[1]}
                availableCharts={chartOptions}
                onSelect={handleSlotChange}
              />
            </Panel>

            <PanelResizeHandle className="h-1.5 bg-border/40 hover:bg-primary transition-colors flex items-center justify-center group focus:outline-none cursor-row-resize">
                 <div className="h-0.5 w-8 bg-muted-foreground/20 group-hover:bg-primary-foreground/50 rounded-full" />
            </PanelResizeHandle>

            <Panel id="right-bottom" defaultSize={50} minSize={20}>
              <Slot
                index={2}
                currentChartId={slots[2]}
                availableCharts={chartOptions}
                onSelect={handleSlotChange}
              />
            </Panel>

          </PanelGroup>
        </Panel>

      </PanelGroup>
    </div>
  )
}