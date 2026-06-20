import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export enum AppLanguage {
  EN = 'en',
  FA = 'fa',
}

// ۱. تعریف متون فارسی (منبع اصلی)
const faTranslation = {
  // --- عمومی (Common) ---
  common: {
    language: 'زبان',
    persian: 'فارسی',
    english: 'انگلیسی (English)',
    save_changes: 'ذخیره تغییرات',
    add_to_list: 'افزودن به لیست',
    cancel: 'لغو',
    title: 'عنوان',
    url: 'آدرس (URL)',
    loading: 'در حال بارگذاری...',
    deleted: 'حذف شده',
    restore: 'بازیابی',
  },

  // --- سایدبار و نوار تب‌ها (Sidebar & TabBar) ---
  sidebar: {
    chart_list: 'لیست چارت‌ها',
    empty_list: 'لیست چارت‌ها خالی است.',
    delete_from_list: 'حذف از لیست',
    edit: 'ویرایش',
    open_in_new_tab: 'باز کردن در تب جدید',
    add_single: 'افزودن تکی',
    add_bulk: 'افزودن گروهی',
  },
  tab_bar: {
    sort_by_color: 'مرتب‌سازی بر اساس رنگ',
    open_multiview: 'باز کردن داشبورد چندتایی',
    deleted_tabs: 'تب‌های حذف شده',
    settings: 'تنظیمات',
  },

  // --- محتوای تب و داشبورد (TabContent & MultiView) ---
  tabs: {
    welcome: 'خوش آمدید!',
    welcome_desc: 'از سایدبار کناری یک چارت را باز کنید یا چارت جدیدی اضافه کنید.',
    new_tab: 'تب جدید',
    dashboard: 'داشبورد',
    multiview_dashboard: 'داشبورد چندگانه',
    no_open_charts: 'هیچ چارت بازی وجود ندارد.',
    chart_closed: 'چارت بسته شده',
    all_windows_closed: 'همه پنجره‌ها بسته شدند. از دکمه‌های بالا برای افزودن مجدد استفاده کنید.',
    select_chart: 'انتخاب...',
    change_chart: 'تغییر چارت',
    available_charts: 'چارت‌های موجود',
  },

  // --- مودال‌ها (Modals) ---
  modals: {
    chart_editor: {
      edit_title: 'ویرایش چارت',
      add_title: 'افزودن چارت به لیست',
      placeholder_title: 'مثلا: چارت EUR/JPY',
    },
    bulk_add: {
      title: 'افزودن گروهی',
      auto_generate: 'تولید خودکار',
      manual_url: 'دستی (URL)',
      url_list: 'لیست آدرس‌ها (URL)',
      url_hint: 'هر لینک در یک خط.',
      data_source: 'منبع داده (Broker/Source)',
      majors: 'جفت ارزهای ماژور (Majors)',
      minors: 'جفت ارزهای مینور (Minors)',
      select_all: 'انتخاب همه',
      preview: 'پیش‌نمایش لینک:',
      add_charts: 'افزودن {{count}} چارت', // {{count}} مقدار داینامیک می‌گیرد
      build_and_add: 'ساخت و افزودن {{count}} چارت',
    },
    trash: {
      title: 'تب‌های حذف شده',
      empty: 'سطل زباله خالی است.',
    },
    chart_picker: {
      title: 'انتخاب نمودار',
      search: 'جستجوی نماد...',
      not_found: 'موردی یافت نشد.',
    }
  },

  // --- منوی راست کلیک (Context Menu) ---
  context_menu: {
    color_label: 'برچسب رنگی',
    change_color: 'تغییر رنگ',
    remove_color: 'حذف رنگ',
    reload: 'بارگذاری مجدد',
    hibernate: 'به خواب رفتن (Hibernate)',
  },

  // --- تنظیمات (Settings) ---
  settings: {
    title: 'تنظیمات',
    desc: 'مدیریت عملکرد و ظاهر برنامه گریفین',
    memory: {
      title: 'عملکرد و حافظه',
      auto_hibernate: 'خواب زمستانی تب‌ها (Auto-Hibernation)',
      hibernate_desc: 'آزادسازی رم با بستن پردازش تب‌های غیرفعال',
      disable_after: 'غیرفعال کردن تب پس از:',
      never: 'هرگز (غیرفعال)',
      min_5: '۵ دقیقه',
      min_15: '۱۵ دقیقه (پیش‌فرض)',
      min_30: '۳۰ دقیقه',
      hour_1: '۱ ساعت',
      hint: 'نکته: تب‌هایی که به حالت خواب می‌روند بسته نمی‌شوند، بلکه فقط از حافظه موقت خارج می‌شوند و با کلیک مجدد شما دوباره لود خواهند شد.',
    },
    appearance: {
      title: 'ظاهر برنامه',
      coming_soon: 'تنظیمات تم و رنگ‌بندی به زودی اضافه می‌شود...',
    }
  }
};

// ۲. اکسپورت تایپ‌ها برای پشتیبانی VS Code
export type AppResources = {
  translation: typeof faTranslation;
};

// ۳. تعریف ترجمه‌های انگلیسی
const resources = {
  [AppLanguage.EN]: {
    translation: {
      common: {
        language: 'Language',
        persian: 'Persian (فارسی)',
        english: 'English',
        save_changes: 'Save Changes',
        add_to_list: 'Add to List',
        cancel: 'Cancel',
        title: 'Title',
        url: 'URL',
        loading: 'Loading...',
        deleted: 'Deleted',
        restore: 'Restore',
      },
      sidebar: {
        chart_list: 'Chart List',
        empty_list: 'The chart list is empty.',
        delete_from_list: 'Remove from list',
        edit: 'Edit',
        open_in_new_tab: 'Open in new tab',
        add_single: 'Add Single',
        add_bulk: 'Add Bulk',
      },
      tab_bar: {
        sort_by_color: 'Sort by Color',
        open_multiview: 'Open Multi-View Dashboard',
        deleted_tabs: 'Deleted Tabs',
        settings: 'Settings',
      },
      tabs: {
        welcome: 'Welcome!',
        welcome_desc: 'Open a chart from the sidebar or add a new one.',
        new_tab: 'New Tab',
        dashboard: 'Dashboard',
        multiview_dashboard: 'Multi-View Dashboard',
        no_open_charts: 'No open charts.',
        chart_closed: 'Chart Closed',
        all_windows_closed: 'All windows are closed. Use the buttons above to add them back.',
        select_chart: 'Select...',
        change_chart: 'Change Chart',
        available_charts: 'Available Charts',
      },
      modals: {
        chart_editor: {
          edit_title: 'Edit Chart',
          add_title: 'Add Chart to List',
          placeholder_title: 'e.g. EUR/JPY Chart',
        },
        bulk_add: {
          title: 'Bulk Add',
          auto_generate: 'Auto Generate',
          manual_url: 'Manual (URL)',
          url_list: 'URL List',
          url_hint: 'One link per line.',
          data_source: 'Data Source (Broker)',
          majors: 'Major Pairs',
          minors: 'Minor Pairs',
          select_all: 'Select All',
          preview: 'Preview Link:',
          add_charts: 'Add {{count}} Charts',
          build_and_add: 'Generate & Add {{count}} Charts',
        },
        trash: {
          title: 'Deleted Tabs',
          empty: 'Trash is empty.',
        },
        chart_picker: {
          title: 'Select Chart',
          search: 'Search symbol...',
          not_found: 'No results found.',
        }
      },
      context_menu: {
        color_label: 'Color Label',
        change_color: 'Change Color',
        remove_color: 'Remove Color',
        reload: 'Reload',
        hibernate: 'Hibernate',
      },
      settings: {
        title: 'Settings',
        desc: 'Manage Griffin performance and appearance',
        memory: {
          title: 'Performance & Memory',
          auto_hibernate: 'Auto-Hibernation',
          hibernate_desc: 'Free up RAM by suspending inactive tabs',
          disable_after: 'Hibernate tab after:',
          never: 'Never (Disabled)',
          min_5: '5 minutes',
          min_15: '15 minutes (Default)',
          min_30: '30 minutes',
          hour_1: '1 hour',
          hint: 'Note: Hibernated tabs are not closed, they are just cleared from memory and will reload when you click them again.',
        },
        appearance: {
          title: 'Appearance',
          coming_soon: 'Theme and color settings coming soon...',
        }
      }
    }
  },
  [AppLanguage.FA]: {
    translation: faTranslation
  }
};

const savedLanguage = (localStorage.getItem('app_language') as AppLanguage) || AppLanguage.EN;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage, 
    fallbackLng: AppLanguage.EN,
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;


declare module 'i18next' {
  interface CustomTypeOptions {
    resources: AppResources;
  }
}