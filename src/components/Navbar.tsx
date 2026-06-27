import React, { useState } from 'react';
import { Menu, X, BookOpen, User, ShieldCheck, Briefcase, Info, Mail, PhoneCall, Globe, Sun, Moon } from 'lucide-react';
import { AgencySettings } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  settings: AgencySettings;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ settings, activeTab, setActiveTab }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t, translateObject } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'home', labelKey: 'nav.home', icon: Info },
    { id: 'portfolio', labelKey: 'nav.portfolio', icon: Briefcase },
    { id: 'courses', labelKey: 'nav.courses', icon: BookOpen },
    { id: 'ebooks', labelKey: 'nav.ebooks', icon: BookOpen },
    { id: 'dashboard', labelKey: 'nav.dashboard', icon: User },
    { id: 'admin', labelKey: 'nav.admin', icon: ShieldCheck },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo / Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick('home')}>
            <img 
              src={settings.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=80&q=80'} 
              alt="Logo" 
              className="h-11 w-11 rounded-xl object-cover shadow-sm border border-slate-100 dark:border-slate-800"
            />
            <span className="font-sans font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              {translateObject(settings, 'agencyName')}
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="flex items-center space-x-1 mr-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t(item.labelKey)}</span>
                  </button>
                );
              })}
            </div>

            {/* Language Switcher Pill (Matching Reference) */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#043324] hover:bg-[#064e37] border border-emerald-900 text-white transition-all duration-200 shadow-sm ml-2 cursor-pointer"
              title={language === 'en' ? 'Switch to Bangla' : 'Switch to English'}
            >
              <Globe className="w-4 h-4 text-amber-400 fill-amber-400/10" />
              <span className="font-sans font-extrabold text-xs tracking-wider uppercase">
                {language === 'en' ? 'EN' : 'BN'}
              </span>
            </button>

            {/* Theme Toggle Switcher */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 transition-all duration-200 shadow-sm border border-slate-200/50 dark:border-slate-700/80 ml-2 cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 fill-amber-400/20" />
              ) : (
                <Moon className="w-4 h-4 fill-slate-700/10" />
              )}
            </button>
          </div>

          {/* Mobile elements */}
          <div className="flex items-center md:hidden space-x-3">
            {/* Theme Toggle Mobile */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-400 transition-all duration-150 border border-slate-200/50 dark:border-slate-700/80 cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 fill-amber-400/20" />
              ) : (
                <Moon className="w-4 h-4 fill-slate-700/10" />
              )}
            </button>

            {/* Mobile Language Switcher Pill (Matching Reference) */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#043324] hover:bg-[#064e37] border border-emerald-900 text-white transition-all duration-150 shadow-sm cursor-pointer"
              title={language === 'en' ? 'Switch to Bangla' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5 text-amber-400 fill-amber-400/10" />
              <span className="font-sans font-extrabold text-[10px] tracking-wider uppercase">
                {language === 'en' ? 'EN' : 'BN'}
              </span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 focus:outline-none cursor-pointer"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 px-2 pt-2 pb-4 space-y-1 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-base font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{t(item.labelKey)}</span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
