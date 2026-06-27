import React, { useState } from 'react';
import { BookOpen, DollarSign, List, ShieldCheck, CreditCard, CheckCircle2, Copy, Check, Star, ChevronDown, ChevronUp, ThumbsUp, Users, Award, HelpCircle, CheckSquare, Smartphone, Lock, Play, X, ArrowLeft } from 'lucide-react';
import { Course, AgencySettings } from '../types';
import { createStudentEnrollment } from '../data/dbSync';
import { useLanguage } from '../context/LanguageContext';
import { trackViewContent, trackInitiateCheckout, trackPurchase } from '../utils/pixel';
import Checkout from './Checkout';

interface CoursesProps {
  courses: Course[];
  settings: AgencySettings;
  onEnrollSuccess: (studentName: string, studentEmail: string, studentPhone: string) => void;
}

export default function Courses({ courses, settings, onEnrollSuccess }: CoursesProps) {
  const { t, language } = useLanguage();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeDetailsTab, setActiveDetailsTab] = useState<'curriculum' | 'description' | 'instructor'>('curriculum');
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({ 0: true });

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

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    trackViewContent('course', course.id, course.title, course.price);
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
    if (selectedCourse) {
      trackInitiateCheckout('course', selectedCourse.id, selectedCourse.title, selectedCourse.price);
    }
  };

  const handleCloseAll = () => {
    setSelectedCourse(null);
    setIsCheckoutOpen(false);
    setSubmitSuccess(false);
    // Reset Form
    setStudentName('');
    setStudentEmail('');
    setStudentPhone('');
    setPaymentPhone('');
    setTransactionId('');
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    if (!studentName.trim() || !studentEmail.trim() || !studentPhone.trim() || !paymentPhone.trim() || !transactionId.trim()) {
      setSubmitError(language === 'en' ? 'Please fill out all fields completely.' : 'দয়া করে সব ফিল্ড সম্পূর্ণ পূরণ করুন।');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Create Student Enrollment request in Firestore
      await createStudentEnrollment({
        studentId: 'student_' + Math.random().toString(36).substr(2, 9),
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim().toLowerCase(),
        studentPhone: studentPhone.trim(),
        itemType: 'course',
        itemId: selectedCourse.id,
        itemTitle: selectedCourse.title,
        paymentMethod,
        paymentPhone: paymentPhone.trim(),
        transactionId: transactionId.trim()
      });

      setSubmitSuccess(true);
      if (selectedCourse) {
        trackPurchase('course', selectedCourse.id, selectedCourse.title, selectedCourse.price, transactionId.trim());
      }
      // Callback to automatically log the student in
      onEnrollSuccess(studentName.trim(), studentEmail.trim(), studentPhone.trim());
    } catch (error: any) {
      setSubmitError(language === 'en' ? 'Failed to submit enrollment request. Please try again.' : 'এনরোলমেন্টের অনুরোধ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
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
    <section id="courses-section" className="py-20 bg-white dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-semibold text-emerald-600 uppercase tracking-widest animate-pulse">
            {t('courses.badge')}
          </h2>
          <h3 className="font-sans font-bold text-3xl sm:text-4xl text-slate-950 dark:text-white tracking-tight">
            {t('courses.title')}
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            {t('courses.subtitle')}
          </p>
        </div>

        {/* Courses List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 rounded-3xl overflow-hidden hover:shadow-xl hover:bg-white dark:hover:bg-slate-900 transition-all duration-300 flex flex-col md:flex-row h-full"
            >
              {/* Cover Image */}
              <div className="md:w-2/5 relative h-56 md:h-auto overflow-hidden">
                <img
                  src={course.coverImage}
                  alt={course.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Course Info */}
              <div className="p-6 md:w-3/5 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <h4 className="font-sans font-extrabold text-slate-900 dark:text-white text-lg leading-snug">
                    {course.title}
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-3">
                    {course.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/60">
                  <span className="font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400">
                    {language === 'en' ? '৳' : ''}{course.price.toLocaleString('en-BD')} {language === 'en' ? 'BDT' : 'টাকা'}
                  </span>
                  
                  <button
                    onClick={() => handleSelectCourse(course)}
                    className="bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold text-xs px-5 py-3 rounded-xl hover:bg-emerald-500 dark:hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-200 cursor-pointer"
                  >
                    {language === 'en' ? 'View Details' : 'বিস্তারিত দেখুন'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {courses.length === 0 && (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800/80">
            <p className="text-slate-400 dark:text-slate-500 font-medium">
              {language === 'en' ? 'No courses available at this time.' : 'এই মুহূর্তে কোনো কোর্স পাওয়া যায়নি।'}
            </p>
          </div>
        )}

        {/* --- DETAILS DIALOG MODAL --- */}
        {selectedCourse && !isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-slate-50 dark:bg-slate-950 w-full max-w-6xl my-4 sm:my-8 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/60 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
              
              {/* Inner Top Navigation Bar / Header */}
              <div className="bg-white dark:bg-slate-900 px-4 sm:px-8 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  <button onClick={() => setSelectedCourse(null)} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                    {language === 'en' ? 'Home' : 'হোম'}
                  </button>
                  <span>&gt;</span>
                  <span className="text-slate-400 dark:text-slate-500 font-normal">
                    {language === 'en' ? 'All Courses' : 'সকল কোর্সসমূহ'}
                  </span>
                  <span>&gt;</span>
                  <span className="text-slate-800 font-semibold line-clamp-1 max-w-[200px] sm:max-w-none">
                    {selectedCourse.title}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 sm:w-5 h-5" />
                </button>
              </div>

              {/* Main Content Area */}
              <div className="p-4 sm:p-8">
                
                {/* Title */}
                <h1 className="font-sans font-extrabold text-xl sm:text-3xl text-slate-900 mb-6 tracking-tight text-left">
                  {selectedCourse.title}
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  
                  {/* Left & Center Main Content Column (Tabs & Details) */}
                  <div className="order-2 lg:order-1 lg:col-span-2 space-y-6">
                    
                    {/* Tabs Headers */}
                    <div className="bg-white p-1 rounded-2xl border border-slate-200 flex space-x-1">
                      {[
                        { id: 'curriculum', label: language === 'en' ? 'Curriculum' : 'কারিকুলাম' },
                        { id: 'description', label: language === 'en' ? 'Description' : 'কোর্স বিবরণী' },
                        { id: 'instructor', label: language === 'en' ? 'Instructor' : 'ইন্সট্রাক্টর' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveDetailsTab(tab.id as any)}
                          className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                            activeDetailsTab === tab.id
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab Contents */}
                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm text-left">
                      
                      {/* 1. Curriculum Tab */}
                      {activeDetailsTab === 'curriculum' && (
                        <div className="space-y-4">
                          {/* Curriculum Metadata Stats bar */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 text-slate-500 text-xs sm:text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <span>{selectedCourse.modules?.length || 0} {language === 'en' ? 'Sections' : 'সেকশন'}</span>
                              <span>•</span>
                              <span>{(selectedCourse.modules?.length || 1) * 2} {language === 'en' ? 'Lessons' : 'লেসন'}</span>
                              <span>•</span>
                              <span>{language === 'en' ? 'Lifetime Access' : 'লাইফটাইম অ্যাক্সেস'}</span>
                            </div>
                            <button
                              onClick={() => {
                                const allOpen = Object.keys(expandedSections).length === selectedCourse.modules.length;
                                if (allOpen) {
                                  setExpandedSections({});
                                } else {
                                  const updated: Record<number, boolean> = {};
                                  selectedCourse.modules.forEach((_, idx) => {
                                    updated[idx] = true;
                                  });
                                  setExpandedSections(updated);
                                }
                              }}
                              className="text-blue-600 hover:text-blue-700 text-xs font-bold transition-colors text-left self-start cursor-pointer"
                            >
                              {Object.keys(expandedSections).length === (selectedCourse.modules?.length || 0)
                                ? (language === 'en' ? 'Collapse All Sections' : 'সবগুলো সেকশন বন্ধ করুন')
                                : (language === 'en' ? 'Expand All Sections' : 'সবগুলো সেকশন খুলুন')}
                            </button>
                          </div>

                          {/* Accordion List */}
                          <div className="space-y-3">
                            {selectedCourse.modules?.map((moduleName, idx) => {
                              const isOpen = !!expandedSections[idx];
                              return (
                                <div key={idx} className="border border-slate-100 rounded-2xl overflow-hidden transition-all bg-white hover:border-slate-200">
                                  {/* Accordion Header */}
                                  <button
                                    onClick={() => {
                                      setExpandedSections(prev => ({
                                        ...prev,
                                        [idx]: !prev[idx]
                                      }));
                                    }}
                                    className="w-full px-5 py-4 flex items-center justify-between text-left font-semibold text-slate-800 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/60 transition-colors cursor-pointer"
                                  >
                                    <div className="flex items-center space-x-3 pr-2">
                                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
                                      <span className="leading-snug">{moduleName}</span>
                                    </div>
                                    <span className="text-xs text-slate-400 font-mono shrink-0">
                                      {idx === 0 ? '3 items' : '2 items'}
                                    </span>
                                  </button>

                                  {/* Accordion Body */}
                                  {isOpen && (
                                    <div className="p-1 sm:p-2 divide-y divide-slate-100 bg-white">
                                      {idx === 0 ? (
                                        <>
                                          <div className="px-5 py-3 flex items-center justify-between text-slate-600 text-xs sm:text-sm">
                                            <div className="flex items-center space-x-2.5">
                                              <Play className="w-3.5 h-3.5 text-slate-400" />
                                              <span>{language === 'en' ? 'Class Recording Intro' : 'কোর্স গাইডলাইন এবং ক্লাস পরিচিতি'}</span>
                                            </div>
                                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                                          </div>
                                          <div className="px-5 py-3 flex items-center justify-between text-slate-600 text-xs sm:text-sm">
                                            <div className="flex items-center space-x-2.5">
                                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                                              <span>{language === 'en' ? 'Exclusive Facebook Group Access' : 'সিক্রেট ফেসবুক গ্রুপ লিংক'}</span>
                                            </div>
                                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                                          </div>
                                          <div className="px-5 py-3 flex items-center justify-between text-slate-600 text-xs sm:text-sm">
                                            <div className="flex items-center space-x-2.5">
                                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                                              <span>{language === 'en' ? 'Helpline & Community Support Group' : 'হেল্পলাইন ও সাপোর্ট গ্রুপ লিংক'}</span>
                                            </div>
                                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <div className="px-5 py-3 flex items-center justify-between text-slate-600 text-xs sm:text-sm">
                                            <div className="flex items-center space-x-2.5">
                                              <Play className="w-3.5 h-3.5 text-slate-400" />
                                              <span>{language === 'en' ? 'Main Lesson Video Lecture' : 'মূল ক্লাস ভিডিও লেকচার'}</span>
                                            </div>
                                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                                          </div>
                                          <div className="px-5 py-3 flex items-center justify-between text-slate-600 text-xs sm:text-sm">
                                            <div className="flex items-center space-x-2.5">
                                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                                              <span>{language === 'en' ? 'Resource & Practice Files' : 'প্র্যাকটিস ও সোর্স ফাইলস'}</span>
                                            </div>
                                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 2. Description Tab */}
                      {activeDetailsTab === 'description' && (
                        <div className="space-y-4">
                          <h3 className="font-sans font-bold text-slate-800 text-base flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                            <span>{language === 'en' ? 'Course Comprehensive Overview' : 'কোর্সের বিস্তারিত বিবরণ'}</span>
                          </h3>
                          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                            {selectedCourse.description}
                          </p>
                          <div className="p-4 bg-blue-50/40 border border-blue-100/60 rounded-2xl mt-4">
                            <p className="text-xs text-blue-800 font-semibold leading-relaxed">
                              {language === 'en' 
                                ? '💡 Learn step-by-step from raw files to fully polished exports. Standard course materials, private support portal, and future module updates are included absolutely free.' 
                                : '💡 র ফাইল থেকে শুরু করে সম্পূর্ণ প্রফেশনাল এক্সপোর্ট পর্যন্ত ধাপে ধাপে শিখুন। স্ট্যান্ডার্ড কোর্স ম্যাটেরিয়াল, প্রাইভেট সাপোর্ট পোর্টাল এবং ভবিষ্যতের সকল আপডেট সম্পূর্ণ ফ্রিতে পাবেন।'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 3. Instructor Tab */}
                      {activeDetailsTab === 'instructor' && (
                        <div className="space-y-6">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl shrink-0 self-start sm:self-center">
                              SS
                            </div>
                            <div>
                              <h3 className="font-sans font-extrabold text-slate-900 text-lg">Sajid Sako</h3>
                              <p className="text-xs text-slate-500 font-medium">Lead Mentor & Professional Video Editor</p>
                              <div className="flex items-center space-x-1 mt-1">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                <span className="text-xs font-bold text-slate-700">5.0 Star Instructor Rating</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                            {language === 'en'
                              ? 'Sajid Sako is a veteran content creator and premium service designer who has worked with over 100+ national and international organizations. Specializing in high-performance video editing and motion graphics, Sako designed this curriculum to share industrial secrets that help students build profitable design agencies and freelancing careers.'
                              : 'সাজিদ সাকো একজন অভিজ্ঞ কন্টেন্ট ক্রিয়েটর এবং প্রিমিয়াম সার্ভিস ডিজাইনার যিনি ১০০টিরও বেশি জাতীয় এবং আন্তর্জাতিক সংস্থার সাথে কাজ করেছেন। হাই-পারফরম্যান্স ভিডিও এডিটিং এবং মোশন গ্রাফিক্সে পারদর্শী সাকো, শিক্ষার্থীদের একটি সফল ডিজাইন এজেন্সি এবং ফ্রিল্যান্সিং ক্যারিয়ার গড়ে তুলতে সাহায্য করার জন্য এই বিশেষ কারিকুলামটি ডিজাইন করেছেন।'}
                          </p>
                        </div>
                      )}

                    </div>

                    {/* --- Bottom Student Ratings Section --- */}
                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm text-left space-y-6">
                      <h3 className="font-sans font-extrabold text-slate-900 text-base sm:text-lg">
                        {language === 'en' ? 'Student Reviews & Ratings' : 'শিক্ষার্থীদের রিভিউ এবং রেটিংস'}
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center bg-slate-50/75 p-5 rounded-2xl border border-slate-100">
                        {/* Huge Number */}
                        <div className="text-center sm:border-r border-slate-200/60 py-2">
                          <h4 className="text-5xl font-extrabold text-slate-900">5.0</h4>
                          <div className="flex justify-center space-x-1 my-1.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                            ))}
                          </div>
                          <p className="text-xs text-slate-400 font-semibold">{language === 'en' ? '124 ratings' : '১২৪টি রেটিং'}</p>
                        </div>

                        {/* Progress Grid */}
                        <div className="sm:col-span-2 space-y-2">
                          {[
                            { stars: 5, pct: 100 },
                            { stars: 4, pct: 0 },
                            { stars: 3, pct: 0 },
                            { stars: 2, pct: 0 },
                            { stars: 1, pct: 0 }
                          ].map((row) => (
                            <div key={row.stars} className="flex items-center space-x-3 text-xs">
                              <span className="w-3 font-semibold text-slate-600 font-mono text-right">{row.stars}</span>
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                              <div className="flex-1 h-2 bg-slate-200/80 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${row.pct}%` }} />
                              </div>
                              <span className="w-8 text-slate-400 font-mono text-right">{row.pct}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actual User Testimonials list */}
                      <div className="divide-y divide-slate-100">
                        {[
                          { name: 'Sajid Hasan', date: 'September 24, 2025', text: language === 'en' ? 'Absolutely outstanding course! Topics are covered step-by-step in native language, highly recommended.' : 'কোর্সটি এক কথায় অসাধারণ! প্রতিটি বিষয় খুব সুন্দরভাবে সহজ ভাষায় বোঝানো হয়েছে। প্র্যাকটিস ফাইলগুলো অনেক কাজে লেগেছে।' },
                          { name: 'Tanvir Ahmed', date: 'October 12, 2025', text: language === 'en' ? 'The best course for getting started with real editing careers. Extremely helpful support community.' : 'প্রফেশনাল ক্যারিয়ার শুরু করার জন্য সেরা গাইডলাইন। সাপোর্ট গ্রুপটি যেকোনো বিপদে অনেক সাহায্য করে।' }
                        ].map((review, i) => (
                          <div key={i} className="py-4 first:pt-0 last:pb-0">
                            <div className="flex items-center justify-between">
                              <h5 className="font-sans font-bold text-slate-800 text-sm">{review.name}</h5>
                              <span className="text-[10px] sm:text-xs text-slate-400 font-semibold">{review.date}</span>
                            </div>
                            <div className="flex space-x-0.5 my-1">
                              {[...Array(5)].map((_, idx) => (
                                <Star key={idx} className="w-3 h-3 text-amber-500 fill-amber-500" />
                              ))}
                            </div>
                            <p className="text-slate-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
                              {review.text}
                            </p>
                          </div>
                        ))}
                      </div>

                    </div>

                  </div>

                  {/* Right Column (Course Preview Banner & High Conversion Sidebar) */}
                  <div className="order-1 lg:order-2 space-y-6">
                    
                    <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl sticky top-24">
                      {/* Course Thumbnail Image */}
                      <div className="relative aspect-video bg-slate-100 group overflow-hidden">
                        <img
                          src={selectedCourse.coverImage}
                          alt={selectedCourse.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Static Play overlay mimic */}
                        <div className="absolute inset-0 bg-slate-950/20 flex items-center justify-center">
                          <div className="bg-blue-600 text-white p-3.5 rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-200">
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>

                      {/* Pricing area */}
                      <div className="p-6 space-y-6 text-left">
                        
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {language === 'en' ? 'Course Investment Fee' : 'কোর্স ইনভেস্টমেন্ট ফি'}
                          </p>
                          <div className="flex items-baseline space-x-2.5">
                            <span className="font-mono font-extrabold text-2xl sm:text-3xl text-blue-600">
                              {language === 'en' ? '৳' : ''}{selectedCourse.price.toLocaleString('en-BD')} {language === 'en' ? 'BDT' : 'টাকা'}
                            </span>
                            <span className="font-mono text-xs sm:text-sm text-slate-400 line-through">
                              {language === 'en' ? '৳' : ''}{(selectedCourse.price + 500).toLocaleString('en-BD')} {language === 'en' ? 'BDT' : 'টাকা'}
                            </span>
                          </div>
                        </div>

                        {/* High conversion metadata checkbox list */}
                        <div className="space-y-3.5 border-t border-slate-100 pt-5">
                          {[
                            { label: language === 'en' ? '100% positive reviews' : '১০০% পজিটিভ রিভিউস', icon: ThumbsUp },
                            { label: language === 'en' ? '85 active students' : '৮৫ জন শিক্ষার্থী', icon: Users },
                            { label: language === 'en' ? `${(selectedCourse.modules?.length || 1) * 2} detailed lessons` : `${(selectedCourse.modules?.length || 1) * 2}টি লেকচার ভিডিও`, icon: Play },
                            { label: language === 'en' ? 'Language: Bangla' : 'ভাষা: বাংলা', icon: BookOpen },
                            { label: language === 'en' ? 'Assessment & Projects: Yes' : 'অ্যাসাইনমেন্ট এবং প্রজেক্ট ফাইলস', icon: CheckSquare },
                            { label: language === 'en' ? 'Available on desktop & app' : 'ডেস্কটপ এবং অ্যাপে অ্যাক্সেসযোগ্য', icon: Smartphone },
                            { label: language === 'en' ? 'Unlimited lifetime access' : 'আনলিমিটেড লাইফটাইম অ্যাক্সেস', icon: Lock },
                            { label: language === 'en' ? 'Skill level: All Levels' : 'স্কিল লেভেল: যেকোনো পর্যায়', icon: Award }
                          ].map((feat, i) => (
                            <div key={i} className="flex items-center space-x-2.5 text-slate-600 text-xs sm:text-sm font-medium">
                              <feat.icon className="w-4 h-4 text-emerald-500 shrink-0" />
                              <span>{feat.label}</span>
                            </div>
                          ))}
                        </div>

                        {/* Enroll CTA Button */}
                        <button
                          onClick={handleOpenCheckout}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-600/10 cursor-pointer text-center"
                        >
                          {language === 'en' ? 'Buy Now' : 'বাই নাও (এনরোল করুন)'}
                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>
          </div>
        )}

        {/* --- PREMIUM MULTI-STEP CHECKOUT COMPONENT --- */}
        {selectedCourse && isCheckoutOpen && (
          <Checkout 
            isOpen={isCheckoutOpen}
            onClose={handleCloseAll}
            item={selectedCourse}
            itemType="course"
            settings={settings}
            onEnrollSuccess={onEnrollSuccess}
          />
        )}

      </div>
    </section>
  );
}
