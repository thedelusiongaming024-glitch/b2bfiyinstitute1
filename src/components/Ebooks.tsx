import React, { useState } from 'react';
import { BookOpen, DollarSign, Key, ShieldCheck, CreditCard, Copy, Check } from 'lucide-react';
import { Ebook, AgencySettings } from '../types';
import { createStudentEnrollment } from '../data/dbSync';
import { useLanguage } from '../context/LanguageContext';
import { trackViewContent, trackInitiateCheckout, trackPurchase } from '../utils/pixel';
import Checkout from './Checkout';

interface EbooksProps {
  ebooks: Ebook[];
  settings: AgencySettings;
  onEnrollSuccess: (studentName: string, studentEmail: string, studentPhone: string) => void;
}

export default function Ebooks({ ebooks, settings, onEnrollSuccess }: EbooksProps) {
  const { t, language } = useLanguage();
  const [selectedBook, setSelectedBook] = useState<Ebook | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Form Fields
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSelectBook = (book: Ebook) => {
    setSelectedBook(book);
    trackViewContent('ebook', book.id, book.title, book.price);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleOpenCheckout = () => {
    setIsCheckoutOpen(true);
    setSubmitError('');
    setSubmitSuccess(false);
    if (selectedBook) {
      trackInitiateCheckout('ebook', selectedBook.id, selectedBook.title, selectedBook.price);
    }
  };

  const handleCloseAll = () => {
    setSelectedBook(null);
    setIsCheckoutOpen(false);
    setSubmitSuccess(false);
    // Reset form fields
    setStudentName('');
    setStudentEmail('');
    setStudentPhone('');
    setPaymentPhone('');
    setTransactionId('');
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;
    if (!studentName.trim() || !studentEmail.trim() || !studentPhone.trim() || !paymentPhone.trim() || !transactionId.trim()) {
      setSubmitError(language === 'en' ? 'Please fill out all fields completely.' : 'দয়া করে সব ফিল্ড সম্পূর্ণ পূরণ করুন।');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Create Manual Ebook Enrollment request in Firestore
      await createStudentEnrollment({
        studentId: 'student_' + Math.random().toString(36).substr(2, 9),
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim().toLowerCase(),
        studentPhone: studentPhone.trim(),
        itemType: 'ebook',
        itemId: selectedBook.id,
        itemTitle: selectedBook.title,
        paymentMethod,
        paymentPhone: paymentPhone.trim(),
        transactionId: transactionId.trim()
      });

      setSubmitSuccess(true);
      if (selectedBook) {
        trackPurchase('ebook', selectedBook.id, selectedBook.title, selectedBook.price, transactionId.trim());
      }
      // Automatically log the student in on their system
      onEnrollSuccess(studentName.trim(), studentEmail.trim(), studentPhone.trim());
    } catch (error: any) {
      setSubmitError(language === 'en' ? 'Failed to submit ebook order. Please try again.' : 'ই-বুক ক্রয়ের অনুরোধ সাবমিট করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNumberForMethod = () => {
    switch (paymentMethod) {
      case 'bKash':
        return settings.bkashNumber || '01700-000000 (Personal)';
      case 'Nagad':
        return settings.nagadNumber || '01800-000000 (Personal)';
      case 'Rocket':
        return settings.rocketNumber || '01900-000000-0 (Personal)';
    }
  };

  return (
    <section id="ebooks-section" className="py-20 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-semibold text-emerald-600 uppercase tracking-widest animate-pulse">
            {t('ebooks.badge')}
          </h2>
          <h3 className="font-sans font-bold text-3xl sm:text-4xl text-slate-950 dark:text-white tracking-tight">
            {t('ebooks.title')}
          </h3>
          <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed">
            {t('ebooks.subtitle')}
          </p>
        </div>

        {/* Ebooks Shelf Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {ebooks.map((book) => (
            <div
              key={book.id}
              onClick={() => handleSelectBook(book)}
              className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-xl dark:hover:shadow-none hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              {/* Ebook Cover Visual */}
              <div className="relative aspect-[3/4] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Visual Cover Frame Overlay */}
                <div className="absolute inset-y-0 left-0 w-2.5 bg-slate-900/10 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.15)]" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10 opacity-60" />
              </div>

              {/* Title & Info */}
              <div className="p-5 space-y-3 flex-grow flex flex-col justify-between">
                <h4 className="font-sans font-extrabold text-slate-900 dark:text-white text-sm leading-snug line-clamp-2">
                  {book.title}
                </h4>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800">
                  <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                    {language === 'en' ? '৳' : ''}{book.price.toLocaleString('en-BD')} {language === 'en' ? 'BDT' : 'টাকা'}
                  </span>
                  
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 transition-colors">
                    {language === 'en' ? 'Buy eBook ➔' : 'কিনুন ➔'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {ebooks.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-400 dark:text-slate-500 font-medium">
              {language === 'en' ? 'No eBooks uploaded yet.' : 'কোনো ই-বুক এখনও আপলোড করা হয়নি।'}
            </p>
          </div>
        )}

        {/* --- DETAILS MODAL --- */}
        {selectedBook && !isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Header */}
                <div className="flex justify-between items-start">
                  <h3 className="font-sans font-extrabold text-lg text-slate-900 dark:text-white leading-tight">
                    {selectedBook.title}
                  </h3>
                  <button
                    onClick={() => setSelectedBook(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Cover and details */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                  <div className="sm:col-span-5 relative aspect-[3/4] rounded-xl overflow-hidden shadow-md border border-slate-100 dark:border-slate-800 max-w-[160px] mx-auto sm:mx-0">
                    <img
                      src={selectedBook.coverImage}
                      alt={selectedBook.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-y-0 left-0 w-2 bg-slate-900/10" />
                  </div>

                  <div className="sm:col-span-7 space-y-4 text-left">
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{language === 'en' ? 'Description' : 'বিবরণ'}</span>
                      </h4>
                      <p className="text-slate-600 dark:text-slate-350 text-xs sm:text-sm leading-relaxed">
                        {selectedBook.description}
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{language === 'en' ? 'Deliverables' : 'যা যা পাবেন'}</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold flex items-center space-x-2">
                        <span className="text-emerald-500">✓</span>
                        <span>{language === 'en' ? 'High-Quality PDF & Epub formats' : 'হাই-কোয়ালিটি পিডিএফ এবং ই-পাব ফরম্যাট'}</span>
                      </p>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold flex items-center space-x-2">
                        <span className="text-emerald-500">✓</span>
                        <span>{language === 'en' ? 'Permanent lifetime cloud access' : 'লাইফটাইম ক্লাউড স্টোরেজ অ্যাক্সেস'}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">{language === 'en' ? 'Price' : 'মূল্য'}</span>
                    <span className="font-mono font-extrabold text-xl text-slate-900 dark:text-white">
                      {language === 'en' ? '৳' : ''}{selectedBook.price.toLocaleString('en-BD')} {language === 'en' ? 'BDT' : 'টাকা'}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleOpenCheckout}
                    className="bg-emerald-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    {t('ebooks.download')}
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* --- PREMIUM MULTI-STEP CHECKOUT COMPONENT --- */}
        {selectedBook && isCheckoutOpen && (
          <Checkout 
            isOpen={isCheckoutOpen}
            onClose={handleCloseAll}
            item={selectedBook}
            itemType="ebook"
            settings={settings}
            onEnrollSuccess={onEnrollSuccess}
          />
        )}

      </div>
    </section>
  );
}
