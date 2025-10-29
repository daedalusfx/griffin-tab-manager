import { SavedChart } from '@/app/hooks/useChartStore';
// import { AnimatePresence, motion, Variants } from 'framer-motion'; // <-- حذف شد
import {
  Edit2Icon,
  // PanelLeftCloseIcon, // <-- حذف شد
  // PanelLeftOpenIcon, // <-- حذف شد
  PlayCircleIcon,
  PlusIcon,
  Trash2Icon,
  XIcon
} from 'lucide-react';
import { Button } from '../ui/button';

interface ChartListSidebarProps {
  isOpen: boolean
  onToggle: () => void
  charts: SavedChart[]
  onOpenChart: (title: string, url: string) => void
  onEditChart: (chart: SavedChart) => void
  onDeleteChart: (id: string) => void
  onAddNew: () => void
}

// const sidebarVariants: Variants = { ... } // <-- حذف شد

export const ChartListSidebar = ({
  isOpen,
  onToggle,
  charts,
  onOpenChart,
  onEditChart,
  onDeleteChart,
  onAddNew,
}: ChartListSidebarProps) => {
  return (
    <>
      {/* دکمه Toggle شناور حذف شد */}
      
      {/* از display: flex استفاده می‌کنیم چون خود کامپوننت 
        flex-direction: column دارد 
      */}
      <aside
        className="chart-list-sidebar"
        style={{ display: isOpen ? 'flex' : 'none' }}
      >
        {/* هدر سایدبار */}
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h3 className="text-lg font-semibold">لیست چارت‌ها</h3>
          <button
            type="button"
            onClick={onToggle}
            className="p-1 rounded-full hover:bg-hover"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* محتوای لیست */}
        <div className="p-4 flex-1 overflow-y-auto">
          {charts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              لیست چارت‌ها خالی است.
            </p>
          ) : (
            <ul className="space-y-2">
              {/* AnimatePresence حذف شد */}
              {charts.map((chart) => (
                <li // <-- motion.li به li تغییر کرد
                  key={chart.id}
                  // props انیمیشن حذف شدند
                  className="flex justify-between items-center p-3 bg-muted/50 rounded-md"
                >
                  {/* اطلاعات چارت */}
                  <div className="truncate flex-1 mr-2">
                    <span className="font-medium text-sm">{chart.title}</span>
                    <p className="text-xs text-muted-foreground truncate" dir="ltr">
                      {chart.url}
                    </p>
                  </div>
                  {/* دکمه‌ها */}
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-destructive/80 hover:text-destructive"
                      onClick={() => onDeleteChart(chart.id)}
                      title="حذف از لیست"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => onEditChart(chart)}
                      title="ویرایش"
                    >
                      <Edit2Icon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-green-500"
                      onClick={() => onOpenChart(chart.title, chart.url)}
                      title="باز کردن در تب جدید"
                    >
                      <PlayCircleIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </li>
              ))}
              {/* AnimatePresence حذف شد */}
            </ul>
          )}
        </div>

        {/* فوتر سایدبار */}
        <div className="flex justify-start p-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onAddNew}
            className="gap-1 w-full"
          >
            <PlusIcon className="w-4 h-4" />
            افزودن چارت جدید
          </Button>
        </div>
      </aside>
    </>
  )
}