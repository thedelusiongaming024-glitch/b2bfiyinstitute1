import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Send, CheckCircle, MessageSquare, PhoneCall, HelpCircle } from 'lucide-react';
import { AgencySettings } from '../types';
import { addContactSubmission } from '../data/dbSync';
import { useLanguage } from '../context/LanguageContext';
import { trackLead } from '../utils/pixel';

interface ContactProps {
  settings: AgencySettings;
}

export default function Contact({ settings }: ContactProps) {
  const { t, language } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError(language === 'en' ? 'Please provide at least your name, email, and message.' : 'অনুগ্রহ করে অন্তত আপনার নাম, ইমেল এবং বার্তা প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await addContactSubmission({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim() || 'Inquiry',
        message: message.trim()
      });

      setSuccess(true);
      trackLead('ContactForm', 'Contact Inquiry Submitted');
      // Reset Form
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(language === 'en' ? 'Could not submit. Please check your internet connection.' : 'সাবমিট করা যায়নি। আপনার ইন্টারনেট সংযোগটি পরীক্ষা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate WhatsApp Direct URL
  const cleanWhatsAppNum = settings.whatsappNumber 
    ? settings.whatsappNumber.replace(/[^0-9]/g, '') 
    : '8801700000000';
  const whatsappUrl = `https://wa.me/${cleanWhatsAppNum}?text=Hello%20PixelCraft%20Agency!%20I'm%20interested%20in%2520your%20services.`;

  return (
    <section id="contact-section" className="py-20 bg-white dark:bg-slate-950 relative transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <h2 className="text-xs font-semibold text-emerald-600 uppercase tracking-widest animate-pulse">
            {t('contact.badge')}
          </h2>
          <h3 className="font-sans font-bold text-3xl sm:text-4xl text-slate-950 dark:text-white tracking-tight">
            {t('contact.title')}
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            {t('contact.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Contact Information & WhatsApp Box */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-8 text-left"
          >
            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 p-8 rounded-3xl space-y-6">
              <h4 className="font-sans font-bold text-xl text-slate-900 dark:text-white">{language === 'en' ? 'Agency Helpdesk' : 'এজেন্সি হেল্পডেস্ক'}</h4>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {language === 'en' 
                  ? 'Whether you have an upcoming project to brief or simply want advice regarding our courses and ebooks, our team is active 24/7.' 
                  : 'আপনার কোনো প্রজেক্ট আলোচনা করার ইচ্ছা হোক বা আমাদের কোর্স ও বই সম্পর্কে পরামর্শের প্রয়োজন হোক, আমাদের টিম সবসময় প্রস্তুত।'}
              </p>

              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/80 text-slate-500">
                    <Mail className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{language === 'en' ? 'Email Inquiry' : 'ইমেইল জিজ্ঞাসা'}</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">support@{settings.agencyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/80 text-slate-500">
                    <PhoneCall className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{language === 'en' ? 'Hotline Support' : 'হটলাইন সাপোর্ট'}</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">+{settings.whatsappNumber || '8801700000000'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Box */}
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 p-8 rounded-3xl space-y-4">
              <div className="flex items-center space-x-3 text-emerald-700 dark:text-emerald-400">
                <MessageSquare className="w-6 h-6 animate-bounce" />
                <h4 className="font-sans font-bold text-lg">{language === 'en' ? 'Instant Live Consultation' : 'তাৎক্ষণিক লাইভ পরামর্শ'}</h4>
              </div>
              <p className="text-emerald-700/80 dark:text-emerald-400/80 text-xs leading-relaxed">
                {language === 'en' 
                  ? 'Connect immediately with our primary support line via WhatsApp. Click below to start chatting directly with a consultant.' 
                  : 'হোয়াটসঅ্যাপের মাধ্যমে আমাদের টিম মেম্বারদের সাথে সরাসরি কথা বলুন। এখনই লাইভ চ্যাট শুরু করতে নিচের বাটনে ক্লিক করুন।'}
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackLead('WhatsAppChat', 'Contact WhatsApp Clicked')}
                className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm px-6 py-3.5 rounded-2xl transition-all shadow-md shadow-emerald-500/20"
              >
                <span>{language === 'en' ? 'Chat via WhatsApp' : 'হোয়াটসঅ্যাপে চ্যাট করুন'}</span>
              </a>
            </div>
          </motion.div>

          {/* Contact Form Submission */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 p-8 rounded-3xl"
          >
            {success ? (
              <div className="text-center py-12 space-y-4">
                <div className="inline-flex p-4 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500 rounded-full">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h4 className="font-sans font-bold text-xl text-slate-900 dark:text-white">
                  {language === 'en' ? 'Message Sent Successfully!' : 'বার্তাটি সফলভাবে পাঠানো হয়েছে!'}
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                  {language === 'en'
                    ? 'Thank you! Your message was saved. We have routed your submission to the agency dashboard.'
                    : 'ধন্যবাদ! আপনার বার্তাটি সংরক্ষণ করা হয়েছে। আমরা এজেন্সির মূল ড্যাশবোর্ডে এটি পাঠিয়ে দিয়েছি।'}
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-200 font-semibold text-xs px-6 py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                >
                  {language === 'en' ? 'Send another message' : 'আরেকটি বার্তা পাঠান'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 text-left">
                <h4 className="font-sans font-bold text-xl text-slate-900 dark:text-white mb-2">
                  {language === 'en' ? 'Send us a Message' : 'আমাদের বার্তা পাঠান'}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('contact.name')}</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Rahat Islam"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('contact.email')}</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rahat@gmail.com"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{language === 'en' ? 'Subject' : 'বিষয়'}</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={language === 'en' ? 'Web design project details' : 'ওয়েব ডিজাইন প্রজেক্টের বিবরণ'}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{language === 'en' ? 'Brief Message' : 'সংক্ষিপ্ত বার্তা'}</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={language === 'en' ? 'Explain your project needs or course query here...' : 'আপনার প্রজেক্টের তথ্য বা কোর্সের জিজ্ঞাসা এখানে বিস্তারিত লিখুন...'}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-xs font-medium">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#043324] hover:bg-[#064e37] text-white font-bold text-sm py-4 rounded-2xl transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSubmitting 
                      ? (language === 'en' ? 'Sending Message...' : 'বার্তা পাঠানো হচ্ছে...') 
                      : (language === 'en' ? 'Submit Message' : 'বার্তা সাবমিট করুন')
                    }
                  </span>
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      {/* --- FLOATING WHATSAPP BUBBLE --- */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-6 right-6 z-50 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center cursor-pointer border border-emerald-400 group"
        title="Chat on WhatsApp"
      >
        {/* Ping pulse effect */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping -z-10" />
        
        {/* WhatsApp Icon from lucide-react */}
        <MessageSquare className="w-7 h-7" />
        
        {/* Floating text badge on hover */}
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 text-xs font-bold uppercase transition-all duration-300 select-none whitespace-nowrap">
          {language === 'en' ? 'Chat With Us' : 'যোগাযোগ করুন'}
        </span>
      </motion.a>

    </section>
  );
}
