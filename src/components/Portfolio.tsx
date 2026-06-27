import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Play, Layout, Image, Video, Palette, Globe, Maximize2, X } from 'lucide-react';
import { AgencySettings, PortfolioItem, Partner } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface PortfolioProps {
  settings: AgencySettings;
  items: PortfolioItem[];
  partners: Partner[];
}

type CategoryType = 'Graphics Design' | 'Video Editing' | 'Web Development';

export default function Portfolio({ settings, items, partners }: PortfolioProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('Graphics Design');
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
  const { t, language } = useLanguage();

  const categories: { labelKey: string; value: CategoryType; icon: any }[] = [
    { labelKey: 'portfolio.cat.graphics', value: 'Graphics Design', icon: Palette },
    { labelKey: 'portfolio.cat.video', value: 'Video Editing', icon: Video },
    { labelKey: 'portfolio.cat.web', value: 'Web Development', icon: Globe },
  ];

  // Filter items based on category and limit to 4 posts as requested by user
  const filteredItems = items
    .filter((item) => item.category === selectedCategory)
    .slice(0, 4);

  // Get current redirection link based on selected category
  const getSeeAllLink = () => {
    switch (selectedCategory) {
      case 'Graphics Design':
        return settings.graphicsSeeAllLink || 'https://www.behance.net';
      case 'Video Editing':
        return settings.videoSeeAllLink || 'https://www.youtube.com';
      case 'Web Development':
        return settings.webSeeAllLink || 'https://github.com';
      default:
        return 'https://www.behance.net';
    }
  };

  const getSeeAllButtonLabel = () => {
    switch (selectedCategory) {
      case 'Graphics Design':
        return language === 'en' ? 'See All Design Portfolios' : 'ডিজাইন পোর্টফোলিও সব দেখুন';
      case 'Video Editing':
        return language === 'en' ? 'See All Video Reels' : 'ভিডিও রিল সব দেখুন';
      case 'Web Development':
        return language === 'en' ? 'See All Live Web Demos' : 'লাইভ ওয়েব ডেমো সব দেখুন';
      default:
        return language === 'en' ? 'See All Projects' : 'সব প্রজেক্ট দেখুন';
    }
  };

  return (
    <section id="portfolio-section" className="py-20 bg-slate-50 dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-800/60 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <h2 className="text-xs font-semibold text-emerald-600 uppercase tracking-widest animate-pulse">
            {t('portfolio.badge')}
          </h2>
          <h3 className="font-sans font-bold text-3xl sm:text-4xl text-slate-950 dark:text-white tracking-tight">
            {t('portfolio.title')}
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            {t('portfolio.subtitle')}
          </p>
        </div>

        {/* Partners Slideshow */}
        {partners && partners.length > 0 && (
          <div className="mb-16 border-y border-slate-200/50 dark:border-slate-800/60 py-6 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm rounded-3xl overflow-hidden shadow-sm">
            <p className="text-center text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-4">
              {language === 'en' ? 'Brands We Have Worked With' : 'যেসব কোম্পানির সাথে আমরা কাজ করেছি'}
            </p>
            <div className="relative w-full overflow-hidden py-2">
              <div className="flex animate-marquee whitespace-nowrap gap-12 w-max">
                {/* First copy */}
                <div className="flex space-x-12 shrink-0 items-center">
                  {partners.map((partner) => (
                    <a
                      key={`part1-${partner.id}`}
                      href={partner.websiteUrl || '#'}
                      target={partner.websiteUrl ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/80 p-1.5 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                        <img
                          src={partner.logoUrl}
                          alt={partner.name}
                          className="max-w-full max-h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="font-sans font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm tracking-tight group-hover:text-emerald-600 transition-colors">
                        {partner.name}
                      </span>
                    </a>
                  ))}
                </div>
                {/* Second copy for seamless looping */}
                <div className="flex space-x-12 shrink-0 items-center" aria-hidden="true">
                  {partners.map((partner) => (
                    <a
                      key={`part2-${partner.id}`}
                      href={partner.websiteUrl || '#'}
                      target={partner.websiteUrl ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/80 p-1.5 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                        <img
                          src={partner.logoUrl}
                          alt={partner.name}
                          className="max-w-full max-h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="font-sans font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm tracking-tight group-hover:text-emerald-600 transition-colors">
                        {partner.name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex justify-center space-x-2 md:space-x-4 mb-12">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex items-center space-x-2 px-4 sm:px-6 py-3 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-sm'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t(cat.labelKey)}</span>
              </button>
            );
          })}
        </div>

        {/* Portfolio Items Grid */}
        <div className="min-h-[400px]">
          <motion.div 
            layout 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => {
                if (item.category === 'Graphics Design') {
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => setLightboxImage({ url: item.imageUrl, title: item.title })}
                      className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800/40 shadow-sm hover:shadow-xl dark:hover:shadow-none transition-all duration-300 flex flex-col justify-between cursor-pointer"
                    >
                      <div className="relative overflow-hidden aspect-[4/3] bg-slate-100 dark:bg-slate-800">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Visual Overlay Tag */}
                        <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border border-slate-50 dark:border-slate-800 shadow-sm">
                          {t('portfolio.cat.graphics')}
                        </div>

                        {/* Hover Overlay with Maximize icon */}
                        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white p-3.5 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                            <Maximize2 className="w-5 h-5 text-emerald-600" />
                          </div>
                        </div>
                      </div>

                      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                        <h4 className="font-sans font-bold text-slate-800 dark:text-white text-sm line-clamp-2">
                          {item.title}
                        </h4>
                        <button className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors duration-200 cursor-pointer">
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>{language === 'en' ? 'View Full Image' : 'সম্পূর্ণ ছবি দেখুন'}</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                }

                if (item.category === 'Video Editing') {
                  const videoUrl = item.demoLink || settings.videoSeeAllLink || 'https://www.youtube.com';
                  return (
                    <motion.a
                      key={item.id}
                      href={videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800/40 shadow-sm hover:shadow-xl dark:hover:shadow-none transition-all duration-300 flex flex-col justify-between block cursor-pointer"
                    >
                      <div className="relative overflow-hidden aspect-[4/3] bg-slate-100 dark:bg-slate-800">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Visual Overlay Tag */}
                        <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border border-slate-50 dark:border-slate-800 shadow-sm">
                          {t('portfolio.cat.video')}
                        </div>

                        {/* Persistent Play Icon on top of thumbnail */}
                        <div className="absolute inset-0 bg-slate-950/20 flex items-center justify-center transition-all group-hover:bg-slate-950/30">
                          <div className="bg-red-500 text-white p-4 rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                            <Play className="w-6 h-6 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>

                      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                        <h4 className="font-sans font-bold text-slate-800 dark:text-white text-sm line-clamp-2">
                          {item.title}
                        </h4>
                        <div className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl border border-red-500/20 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 font-semibold text-xs transition-colors duration-200">
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{language === 'en' ? 'Watch Video' : 'ভিডিওটি দেখুন'}</span>
                        </div>
                      </div>
                    </motion.a>
                  );
                }

                // Default is Web Development
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800/40 shadow-sm hover:shadow-xl dark:hover:shadow-none transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="relative overflow-hidden aspect-[4/3] bg-slate-100 dark:bg-slate-800">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Visual Overlay Tag */}
                      <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border border-slate-50 dark:border-slate-800 shadow-sm">
                        {t('portfolio.cat.web')}
                      </div>
                    </div>

                    <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                      <h4 className="font-sans font-bold text-slate-800 dark:text-white text-sm line-clamp-2">
                        {item.title}
                      </h4>

                      {item.demoLink && (
                        <a
                          href={item.demoLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl border border-emerald-500/20 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 font-semibold text-xs transition-colors duration-200 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{t('portfolio.live')}</span>
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-400 dark:text-slate-500 font-medium">
                {language === 'en' ? 'No projects added yet for this category.' : 'এই ক্যাটাগরিতে এখনও কোনো প্রজেক্ট যুক্ত করা হয়নি।'}
              </p>
            </div>
          )}
        </div>

        {/* See All Button Section */}
        {filteredItems.length > 0 && (
          <div className="flex justify-center mt-12">
            <a
              href={getSeeAllLink()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold px-8 py-3.5 rounded-2xl hover:bg-slate-800 dark:hover:bg-emerald-400 transition-colors duration-200 shadow-lg shadow-slate-900/10 cursor-pointer group text-sm"
            >
              <span>{getSeeAllButtonLabel()}</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        )}

      </div>

      {/* Lightbox Modal for Graphics Design */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md cursor-pointer"
            onClick={() => setLightboxImage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-4xl w-full flex flex-col items-center bg-slate-900 rounded-3xl p-3 sm:p-4 border border-slate-800 shadow-2xl overflow-hidden cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-colors z-10 cursor-pointer"
                aria-label="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Main Image */}
              <div className="relative w-full overflow-hidden rounded-2xl bg-black flex items-center justify-center max-h-[75vh]">
                <img
                  src={lightboxImage.url}
                  alt={lightboxImage.title}
                  className="max-w-full max-h-[70vh] object-contain rounded-xl select-none"
                />
              </div>

              {/* Caption */}
              <div className="w-full text-center mt-4 px-2 pb-2">
                <h4 className="font-sans font-bold text-white text-base sm:text-lg">
                  {lightboxImage.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {language === 'en' ? 'Click anywhere outside to close' : 'বন্ধ করতে যেকোনো বাইরের অংশে ক্লিক করুন'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
