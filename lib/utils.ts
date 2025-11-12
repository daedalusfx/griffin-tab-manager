import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



// یک تابع کمکی برای استخراج عنوان از URL
function extractTitleFromUrl(url: string): string {
  try {
    // 1. ریجکس مخصوص TradingView
    const tradingViewMatch = url.match(/symbol=([\w%:]+)/);
    if (tradingViewMatch && tradingViewMatch[1]) {
      // کد نماد مثل 'FX%3AEURNZD' را به 'FX:EURNZD' تبدیل می‌کند
      return decodeURIComponent(tradingViewMatch[1]);
    }

    // 2. ریجکس برای استخراج دامنه (برای لینک‌های عمومی مثل ForexFactory)
    const urlObj = new URL(url);
    let domain = urlObj.hostname.replace(/^www\./, ''); // 'forexfactory.com'
    // .com, .net و ... را حذف می‌کند
    domain = domain.split('.')[0]; // 'forexfactory'
    // حرف اول را بزرگ می‌کند
    return domain.charAt(0).toUpperCase() + domain.slice(1); // 'Forexfactory'
    
  } catch (error) {
    // 3. فال‌بک: اگر هیچکدام نشد، خود URL را برمی‌گرداند
    console.error("Could not parse title from URL:", url, error);
    return url;
  }
}

/**
 * تابع اصلی پردازش متن:
 * متن خام را می‌گیرد و آرایه‌ای از چارت‌های معتبر برمی‌گرداند
 */
export const parseUrlsToCharts = (text: string): Array<{ title: string; url: string }> => {
  // ریجکس برای پیدا کردن تمام URL های http یا https
  const urlRegex = /https?:\/\/[^\s\n\r]+/g;
  const matches = text.match(urlRegex);

  if (!matches) {
    return []; // هیچ URL معتبری پیدا نشد
  }

  // حذف URL های تکراری و تبدیل به فرمت چارت
  const uniqueUrls = [...new Set(matches)];
  
  return uniqueUrls.map(url => ({
    url: url,
    title: extractTitleFromUrl(url), // استخراج هوشمند عنوان
  }));
};