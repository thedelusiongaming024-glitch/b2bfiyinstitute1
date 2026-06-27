import React from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { DEFAULT_REVIEWS } from '../data/defaultData';

export default function Reviews() {
  return (
    <section className="py-20 bg-white dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <h2 className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">
            Success Stories
          </h2>
          <h3 className="font-sans font-bold text-3xl sm:text-4xl text-slate-950 dark:text-white tracking-tight">
            Client & Student Feedback
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            Hear from our global business partners and students who completed professional certifications.
          </p>
        </motion.div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {DEFAULT_REVIEWS.map((review, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="p-8 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 rounded-3xl space-y-6 flex flex-col justify-between hover:shadow-lg dark:hover:shadow-none hover:bg-white dark:hover:bg-slate-900 transition-all duration-300"
            >
              <div className="space-y-4">
                {/* Stars */}
                <div className="flex space-x-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                
                {/* Message */}
                <p className="text-slate-600 dark:text-slate-300 text-sm italic leading-relaxed">
                  "{review.text}"
                </p>
              </div>

              {/* Reviewer Meta */}
              <div className="flex items-center space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <div className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm">
                  {review.name[0]}
                </div>
                <div>
                  <h5 className="font-sans font-bold text-slate-800 dark:text-white text-xs">{review.name}</h5>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">{review.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
