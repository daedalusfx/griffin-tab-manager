import { SavedChart } from '@/app/hooks/useChartStore';
import {
  CopyPlusIcon,
  Edit2Icon,
  PlayCircleIcon,
  PlusIcon,
  Trash2Icon,
  XIcon
} from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';

interface ChartListSidebarProps {
  isOpen: boolean
  onToggle: () => void
  charts: SavedChart[]
  onOpenChart: (title: string, url: string) => void
  onEditChart: (chart: SavedChart) => void
  onDeleteChart: (id: string) => void
  onAddNew: () => void
  onAddNewBulk: () => void 
}


export const ChartListSidebar = ({
  isOpen,
  onToggle,
  charts,
  onOpenChart,
  onEditChart,
  onDeleteChart,
  onAddNew,
  onAddNewBulk
}: ChartListSidebarProps) => {
 const {t} = useTranslation()
  return (
    <>
      <aside
        className="chart-list-sidebar"
        style={{ display: isOpen ? 'flex' : 'none' }}
      >
        {/* هدر سایدبار */}
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h3 className="text-lg font-semibold">
            {t('sidebar.chart_list')}
            </h3>
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
             {t('sidebar.empty_list')}
            </p>
          ) : (
            <ul className="space-y-2">
              {charts.map((chart) => (
                <li
                  key={chart.id}
                  className="flex justify-between items-center p-3 bg-muted/50 rounded-md"
                >
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
                      title={t('sidebar.delete_from_list')}
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => onEditChart(chart)}
                      title={t('sidebar.edit')}
                    >
                      <Edit2Icon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-green-500"
                      onClick={() => onOpenChart(chart.title, chart.url)}
                      title={t('sidebar.open_in_new_tab')}
                    >
                      <PlayCircleIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* فوتر سایدبار */}
        <div className="flex items-center justify-start gap-2 p-4 border-t border-border"> 
          <Button
            type="button"
            variant="outline"
            onClick={onAddNew}
            className="gap-1 flex-1"
          >
            <PlusIcon className="w-4 h-4" />
            {t('sidebar.add_single')}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onAddNewBulk}
            className="gap-1 flex-1"
            title={t('sidebar.add_bulk')}
          >
            <CopyPlusIcon className="w-4 h-4" />
{t('modals.bulk_add.url_list')}
          </Button>
        </div>
      </aside>
    </>
  )
}