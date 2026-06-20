// app/components/tabs/SettingsPage.tsx

import { useTabStore } from '@/app/hooks/useTabStore'
import { MonitorIcon, MoonIcon, ShieldCheckIcon , GlobeIcon} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import React from 'react'

export const SettingsPage = () => {
  const inactivityTimeoutMinutes = useTabStore((state) => state.inactivityTimeoutMinutes)
  const setInactivityTimeoutMinutes = useTabStore((state) => state.setInactivityTimeoutMinutes)
  const { t, i18n } = useTranslation();


  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };


  return (
    <div className="w-full h-full bg-background text-foreground p-8 overflow-y-auto animate-in fade-in duration-300">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <div className="border-b border-border pb-6">
          <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('settings.desc')}
          </p>
        </div>

 
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-primary">
            <GlobeIcon className="w-5 h-5" />
            <h2>{t('common.language')}</h2>
          </div>
          
          <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
            <div className="flex items-center gap-4">
              <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ maxWidth: '200px' }}
              >
                <option value="fa">{t('common.persian')}</option>
                <option value="en">{t('common.english')}</option>
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-primary">
            <MonitorIcon className="w-5 h-5" />
            <h2>

            {t('settings.memory.title')}

            </h2>
          </div>
          
          <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium">
 {t('settings.memory.auto_hibernate')}
                  </h3>
                <p className="text-sm text-muted-foreground mt-1">
               {t('settings.memory.hibernate_desc')}
                </p>
              </div>
              <ShieldCheckIcon className="w-8 h-8 text-muted-foreground/20" />
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm whitespace-nowrap">{t('settings.memory.disable_after')} :</span>
              <select
                value={inactivityTimeoutMinutes}
                onChange={(e) => setInactivityTimeoutMinutes(Number(e.target.value))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                style={{ maxWidth: '200px' }}
              >
                <option value={0}>
                  {t('settings.memory.never')}
                   </option>
                <option value={5}>
{t('settings.memory.min_5')}
                  </option>
                <option value={15}>
{t('settings.memory.min_15')}
                   </option>
                <option value={30}>
{t('settings.memory.min_30')}
                  </option>
                <option value={60}>
{t('settings.memory.hour_1')}
                  </option>
              </select>
            </div>
            
            <div className="mt-4 p-3 bg-muted/50 rounded text-xs text-muted-foreground border border-border/50">
          {t('settings.memory.hint')}
            </div>
          </div>
        </section>

        {/* بخش‌های دیگر (مثلا تم) */}
        <section className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-lg font-semibold text-primary">
            <MoonIcon className="w-5 h-5" />
            <h2>
              
     {t('settings.appearance.title')}         
</h2>              
          </div>
          <p className="text-sm text-muted-foreground">
       {t('settings.appearance.coming_soon')}
          </p>
        </section>

      </div>
    </div>
  )
}