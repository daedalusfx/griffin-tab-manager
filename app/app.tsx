import { TabManager } from '@/app/components/tabs/TabManager'
import './styles/app.css'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react';
import React from 'react';




export default function App() {

  const { i18n } = useTranslation();

  useEffect(() => {
    const htmlDir = i18n.language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.dir = htmlDir;
    document.documentElement.lang = i18n.language;
    
    localStorage.setItem('app_language', i18n.language);
  }, [i18n.language]);

  return <TabManager />
}