import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Video, Laptop, Palette, Megaphone } from 'lucide-react';
import { AgencySettings } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface HeroProps {
  settings: AgencySettings;
  onExploreServices: () => void;
  onExplorePortfolio: () => void;
}

export default function Hero({ settings, onExploreServices, onExplorePortfolio }: HeroProps) {
  const { t, translateObject } = useLanguage();

  const categories = [
    { nameKey: 'hero.cat.web', icon: Laptop, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900/30' },
    { nameKey: 'hero.cat.video', icon: Video, color: 'text-red-500 bg-red-50 dark:bg-red-950/20 dark:border-red-900/30' },
    { nameKey: 'hero.cat.graphics', icon: Palette, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/20 dark:border-pink-900/30' },
    { nameKey: 'hero.cat.marketing', icon: Megaphone, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900/30' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-16 pb-20 lg:pt-24 lg:pb-28 transition-colors duration-200">
      {/* Decorative background shapes */}
      <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 [mask-image:radial-gradient(100%_100%_at_top,white,transparent)]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 text-left space-y-8">
            {/* Tagline */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 px-4 py-1.5 rounded-full text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-semibold shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>{t('hero.tagline')}</span>
            </motion.div>

            {/* Main Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-sans font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white tracking-tight leading-tight"
            >
              {translateObject(settings, 'heroTitle')}
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed font-light"
            >
              {translateObject(settings, 'heroSubtitle')}
            </motion.p>

            {/* Category Quick Tags */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              {categories.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <div 
                    key={idx} 
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-sm ${cat.color} font-medium text-xs sm:text-sm`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t(cat.nameKey)}</span>
                  </div>
                );
              })}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <button
                onClick={onExploreServices}
                className="flex items-center justify-center space-x-2 bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold px-8 py-4 rounded-2xl hover:bg-slate-800 dark:hover:bg-emerald-400 transition-all duration-200 shadow-lg hover:shadow-slate-900/15 cursor-pointer group"
              >
                <span>{t('hero.btnServices')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={onExplorePortfolio}
                className="flex items-center justify-center space-x-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-semibold px-8 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-200 cursor-pointer"
              >
                <span>{t('hero.btnPortfolio')}</span>
              </button>
            </motion.div>
          </div>

          {/* Hero Right Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-[450px] lg:max-w-none">
              {/* Background gradient blur */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-400 to-indigo-400 rounded-3xl opacity-20 blur-2xl" />
              
              {/* Main Image */}
              <img 
                src={settings.heroImage || 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80'} 
                alt="Creative Agency Workspace" 
                className="relative rounded-3xl object-cover shadow-2xl border border-slate-100 dark:border-slate-800/80 aspect-[4/3] w-full"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
              
              {/* Floating Widget: Trust Stat */}
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl border border-slate-50 dark:border-slate-800/50 hidden sm:flex items-center space-x-3">
                <div className="bg-emerald-500 text-white p-2.5 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('hero.custSat')}</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">{t('hero.verified')}</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
