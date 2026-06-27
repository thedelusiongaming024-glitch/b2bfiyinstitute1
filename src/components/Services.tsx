import React from 'react';
import { motion } from 'motion/react';
import { 
  Laptop, 
  Video, 
  Palette, 
  Megaphone, 
  Facebook, 
  PenTool, 
  Layers 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Services() {
  const { t } = useLanguage();

  const serviceList = [
    {
      titleKey: 'service.web.title',
      descKey: 'service.web.desc',
      icon: Laptop,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30',
    },
    {
      titleKey: 'service.video.title',
      descKey: 'service.video.desc',
      icon: Video,
      color: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30',
    },
    {
      titleKey: 'service.graphics.title',
      descKey: 'service.graphics.desc',
      icon: Palette,
      color: 'bg-pink-50 text-pink-600 border-pink-100 dark:bg-pink-950/20 dark:text-pink-400 dark:border-pink-900/30',
    },
    {
      titleKey: 'service.marketing.title',
      descKey: 'service.marketing.desc',
      icon: Megaphone,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
    },
    {
      titleKey: 'service.facebook.title',
      descKey: 'service.facebook.desc',
      icon: Facebook,
      color: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30',
    },
    {
      titleKey: 'service.post.title',
      descKey: 'service.post.desc',
      icon: PenTool,
      color: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
    },
    {
      titleKey: 'service.manage.title',
      descKey: 'service.manage.desc',
      icon: Layers,
      color: 'bg-teal-50 text-teal-600 border-teal-100 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/30',
    },
  ];

  return (
    <section id="services-section" className="py-20 bg-white dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-semibold text-emerald-600 uppercase tracking-widest animate-pulse">
            {t('services.badge')}
          </h2>
          <h3 className="font-sans font-bold text-3xl sm:text-4xl text-slate-950 dark:text-white tracking-tight">
            {t('services.title')}
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {t('services.subtitle')}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {serviceList.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative p-8 bg-slate-50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 rounded-3xl border border-transparent dark:border-slate-800/25 hover:border-slate-100 dark:hover:border-slate-800 hover:shadow-xl dark:hover:shadow-none hover:shadow-slate-100/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Icon Frame */}
                  <div className={`inline-flex p-4 rounded-2xl border ${service.color} mb-6 transition-transform group-hover:scale-110 duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  {/* Title */}
                  <h4 className="font-sans font-bold text-lg text-slate-900 dark:text-white mb-3 animate-none">
                    {t(service.titleKey)}
                  </h4>
                  
                  {/* Description */}
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                    {t(service.descKey)}
                  </p>
                </div>

                {/* Bottom line border effect */}
                <div className="h-1.5 w-12 bg-emerald-500 rounded-full group-hover:w-full transition-all duration-300" />
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
