// app/components/tabs/SettingsPage.tsx

import { useTabStore } from '@/app/hooks/useTabStore'
import { MonitorIcon, MoonIcon, ShieldCheckIcon } from 'lucide-react'
import React from 'react'

export const SettingsPage = () => {
  const inactivityTimeoutMinutes = useTabStore((state) => state.inactivityTimeoutMinutes)
  const setInactivityTimeoutMinutes = useTabStore((state) => state.setInactivityTimeoutMinutes)

  return (
    <div className="w-full h-full bg-background text-foreground p-8 overflow-y-auto animate-in fade-in duration-300">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* هدر صفحه */}
        <div className="border-b border-border pb-6">
          <h1 className="text-3xl font-bold tracking-tight">تنظیمات</h1>
          <p className="text-muted-foreground mt-2">
            مدیریت عملکرد و ظاهر برنامه گریفین
          </p>
        </div>

        {/* بخش مدیریت حافظه */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-primary">
            <MonitorIcon className="w-5 h-5" />
            <h2>عملکرد و حافظه</h2>
          </div>
          
          <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium">خواب زمستانی تب‌ها (Auto-Hibernation)</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  آزادسازی رم با بستن پردازش تب‌های غیرفعال
                </p>
              </div>
              <ShieldCheckIcon className="w-8 h-8 text-muted-foreground/20" />
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm whitespace-nowrap">غیرفعال کردن تب پس از:</span>
              <select
                value={inactivityTimeoutMinutes}
                onChange={(e) => setInactivityTimeoutMinutes(Number(e.target.value))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                style={{ maxWidth: '200px' }}
              >
                <option value={0}>هرگز (غیرفعال)</option>
                <option value={5}>۵ دقیقه</option>
                <option value={15}>۱۵ دقیقه (پیش‌فرض)</option>
                <option value={30}>۳۰ دقیقه</option>
                <option value={60}>۱ ساعت</option>
              </select>
            </div>
            
            <div className="mt-4 p-3 bg-muted/50 rounded text-xs text-muted-foreground border border-border/50">
              نکته: تب‌هایی که به حالت خواب می‌روند بسته نمی‌شوند، بلکه فقط از حافظه موقت خارج می‌شوند و با کلیک مجدد شما دوباره لود خواهند شد.
            </div>
          </div>
        </section>

        {/* بخش‌های دیگر (مثلا تم) */}
        <section className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-lg font-semibold text-primary">
            <MoonIcon className="w-5 h-5" />
            <h2>ظاهر برنامه</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            تنظیمات تم و رنگ‌بندی به زودی اضافه می‌شود...
          </p>
        </section>

      </div>
    </div>
  )
}