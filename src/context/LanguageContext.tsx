import React, { createContext, useContext, useState, useEffect } from 'react';
import { AgencySettings } from '../types';

export type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateObject: <T extends Record<string, any>>(obj: T, fieldName: keyof T) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations: Record<string, Record<Language, string>> = {
  // Navigation
  'nav.home': { en: 'Home', bn: 'হোম' },
  'nav.portfolio': { en: 'Portfolio', bn: 'পোর্টফোলিও' },
  'nav.courses': { en: 'Courses', bn: 'কোর্সসমূহ' },
  'nav.ebooks': { en: 'E-Books', bn: 'ই-বুক' },
  'nav.dashboard': { en: 'Student Portal', bn: 'স্টুডেন্ট পোর্টাল' },
  'nav.admin': { en: 'Admin', bn: 'এডমিন' },

  // Hero
  'hero.tagline': { en: 'Innovate. Design. Scale.', bn: 'উদ্ভাবন। ডিজাইন। প্রসার।' },
  'hero.btnServices': { en: 'Our Services', bn: 'আমাদের সার্ভিসসমূহ' },
  'hero.btnPortfolio': { en: 'View Portfolio', bn: 'পোর্টফোলিও দেখুন' },
  'hero.custSat': { en: 'Customer Sat', bn: 'গ্রাহক সন্তুষ্টি' },
  'hero.verified': { en: '100% Verified', bn: '১০০% ভেরিফাইড' },
  'hero.cat.web': { en: 'Web Dev', bn: 'ওয়েব ডেভেলপমেন্ট' },
  'hero.cat.video': { en: 'Video Editing', bn: 'ভিডিও এডিটিং' },
  'hero.cat.graphics': { en: 'Graphics', bn: 'গ্রাফিক্স ডিজাইন' },
  'hero.cat.marketing': { en: 'Digital Marketing', bn: 'ডিজিটাল মার্কেটিং' },

  // Services
  'services.badge': { en: 'Expertise & Capabilities', bn: 'অভিজ্ঞতা এবং দক্ষতা' },
  'services.title': { en: 'High-Performance Digital Services', bn: 'হাই-পারফরম্যান্স ডিজিটাল সার্ভিসসমূহ' },
  'services.subtitle': { en: 'We provide result-oriented digital solutions tailored to accelerate your commercial growth and solidify your digital footprint.', bn: 'আমরা আপনার ব্যবসায়িক প্রবৃদ্ধি ত্বরান্বিত করতে এবং আপনার ডিজিটাল উপস্থিতি সুদৃঢ় করতে বিশেষ ডিজিটাল সমাধান প্রদান করি।' },
  
  'service.web.title': { en: 'Web Development', bn: 'ওয়েব ডেভেলপমেন্ট' },
  'service.web.desc': { en: 'Bespoke corporate platforms, modern e-commerce stores, responsive landing pages, and interactive dashboards using React, Vite, and Cloud systems.', bn: 'অত্যাধুনিক কর্পোরেট ওয়েবসাইট, আধুনিক ই-কমার্স স্টোর, রেসপনসিভ ল্যান্ডিং পেজ এবং ইন্টারেক্টিভ ড্যাশবোর্ড যা রিয়্যাক্ট এবং ক্লাউড সিস্টেমে তৈরি।' },
  
  'service.video.title': { en: 'Video Editing', bn: 'ভিডিও এডিটিং' },
  'service.video.desc': { en: 'Cinematic storytelling, corporate promos, high-retention travel vlogs, sound design, and custom graphic transitions customized for YouTube & socials.', bn: 'সিনেমেটিক স্টোরিটেলিং, কর্পোরেট প্রোমো, ইউটিউব এবং সোশ্যাল মিডিয়ার জন্য হাই-রিটেনশন ট্রাভেল ভ্লগ এবং সাউন্ড ডিজাইন।' },
  
  'service.graphics.title': { en: 'Graphics Design', bn: 'গ্রাফিক্স ডিজাইন' },
  'service.graphics.desc': { en: 'Premium branding identities, vector logos, custom vector illustrations, marketing banners, and physical product mockups and packaging design.', bn: 'প্রিমিয়াম ব্র্যান্ডিং আইডেন্টিটি, ভেক্টর লোগো, কাস্টম ইলাস্ট্রেশন, আকর্ষণীয় মার্কেটিং ব্যানার এবং প্যাকেজিং ডিজাইন।' },
  
  'service.marketing.title': { en: 'Digital Marketing', bn: 'ডিজিটাল মার্কেটিং' },
  'service.marketing.desc': { en: 'Data-driven brand strategies, comprehensive SEO, target keyword campaigns, and direct customer acquisition plans built for exponential growth.', bn: 'ডেটা-চালিত ব্র্যান্ড স্ট্র্যাটেজি, সার্চ ইঞ্জিন অপ্টিমাইজেশন (SEO), কি-ওয়ার্ড ক্যাম্পেইন এবং কাস্টমার একুইজিশন প্ল্যান।' },
  
  'service.facebook.title': { en: 'Facebook Ads Run', bn: 'ফেসবুক অ্যাড রান' },
  'service.facebook.desc': { en: 'Highly optimized ad campaigns, custom lookalike audience targeting, pixel tracking setup, detailed ROI analysis, and budget distribution planning.', bn: 'অপ্টিমাইজড বিজ্ঞাপন ক্যাম্পেইন, কাস্টম অডিয়েন্স টার্গেটিং, পিক্সেল ট্র্যাকিং সেটআপ এবং রিটার্ন অন ইনভেস্টমেন্ট (ROI) বিশ্লেষণ।' },
  
  'service.post.title': { en: 'Social Media Post Design', bn: 'সোশ্যাল মিডিয়া পোস্ট ডিজাইন' },
  'service.post.desc': { en: 'Scroll-stopping creative social banners, carousel design packs, stories, and Pinterest graphics aligned precisely with your brand guidelines.', bn: 'সামাজিক যোগাযোগ মাধ্যমের জন্য আকর্ষণীয় ক্রিয়েটিভ ব্যানার, ক্যারোসেল ডিজাইন প্যাক, স্টোরি এবং পিন্টারেস্ট গ্রাফিক্স।' },
  
  'service.manage.title': { en: 'Social Media Management', bn: 'সোশ্যাল মিডিয়া ম্যানেজমেন্ট' },
  'service.manage.desc': { en: 'Complete page administration, content scheduling, audience interaction, analytics, and creative community-building across key social networks.', bn: 'সম্পূর্ণ পেজ অ্যাডমিনিস্ট্রেশন, কন্টেন্ট শিডিউলিং, কাস্টমার ইন্টারঅ্যাকশন, অ্যানালিটিক্স এবং ক্রিয়েটিভ কমিউনিটি বিল্ডিং।' },

  // Portfolio
  'portfolio.badge': { en: 'Our Masterpieces', bn: 'আমাদের সেরা কাজসমূহ' },
  'portfolio.title': { en: 'Creative Work & Showcase', bn: 'ক্রিয়েটিভ কাজ এবং শোকেস' },
  'portfolio.subtitle': { en: 'Browse our recent projects delivered across diverse web technologies, video editing pipelines, and graphics design guidelines.', bn: 'বিভিন্ন ওয়েব প্রযুক্তি, ভিডিও এডিটিং পাইপলাইন এবং গ্রাফিক্স ডিজাইন নির্দেশিকা জুড়ে আমাদের সাম্প্রতিক সম্পন্ন প্রকল্পগুলি ব্রাউজ করুন।' },
  'portfolio.cat.all': { en: 'All Work', bn: 'সব কাজ' },
  'portfolio.cat.graphics': { en: 'Graphics Design', bn: 'গ্রাফিক্স ডিজাইন' },
  'portfolio.cat.video': { en: 'Video Editing', bn: 'ভিডিও এডিটিং' },
  'portfolio.cat.web': { en: 'Web Development', bn: 'ওয়েব ডেভেলপমেন্ট' },
  'portfolio.behance': { en: 'See all on Behance', bn: 'বিহ্যান্স-এ সব দেখুন' },
  'portfolio.youtube': { en: 'See all on YouTube', bn: 'ইউটিউব-এ সব দেখুন' },
  'portfolio.github': { en: 'See all on GitHub', bn: 'গিটহাব-এ সব দেখুন' },
  'portfolio.live': { en: 'Live Demo', bn: 'লাইভ ডেমো' },

  // Reviews
  'reviews.badge': { en: 'Success Stories', bn: 'সাফল্যের গল্প' },
  'reviews.title': { en: 'Client & Student Feedback', bn: 'ক্লায়েন্ট এবং শিক্ষার্থীদের প্রতিক্রিয়া' },
  'reviews.subtitle': { en: 'Hear from our global business partners and students who completed professional certifications.', bn: 'আমাদের বৈশ্বিক ব্যবসায়িক অংশীদার এবং পেশাদার সার্টিফিকেশন সম্পন্ন করা শিক্ষার্থীদের কাছ থেকে শুনুন।' },

  // Contact
  'contact.badge': { en: 'Get In Touch', bn: 'যোগাযোগ করুন' },
  'contact.title': { en: 'Start Your Project or Course Today', bn: 'আজই আপনার প্রজেক্ট বা কোর্স শুরু করুন' },
  'contact.subtitle': { en: 'Send us a message or reach us directly via WhatsApp. Our team usually responds within a few hours.', bn: 'আমাদের একটি বার্তা পাঠান অথবা সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করুন। আমাদের টিম সাধারণত কয়েক ঘণ্টার মধ্যে সাড়া দেয়।' },
  'contact.name': { en: 'Full Name', bn: 'পুরো নাম' },
  'contact.email': { en: 'Email Address', bn: 'ইমেইল অ্যাড্রেস' },
  'contact.phone': { en: 'WhatsApp / Phone Number', bn: 'হোয়াটসঅ্যাপ / ফোন নম্বর' },
  'contact.message': { en: 'Project or Learning Inquiry Details', bn: 'প্রজেক্ট বা কোর্স অনুসন্ধানের বিবরণ' },
  'contact.send': { en: 'Send Message', bn: 'বার্তা পাঠান' },
  'contact.sending': { en: 'Sending Message...', bn: 'বার্তা পাঠানো হচ্ছে...' },
  'contact.success': { en: 'Message sent successfully! We will contact you shortly.', bn: 'বার্তাটি সফলভাবে পাঠানো হয়েছে! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।' },
  'contact.direct': { en: 'Or Contact Directly', bn: 'অথবা সরাসরি যোগাযোগ করুন' },

  // Courses
  'courses.badge': { en: 'Upskill & Transform', bn: 'দক্ষতা বৃদ্ধি করুন' },
  'courses.title': { en: 'Professional Certification Courses', bn: 'পেশাদার সার্টিফিকেশন কোর্সসমূহ' },
  'courses.subtitle': { en: 'Gain highly sought-after industry skills with our step-by-step masterclasses. Hand-holding support, practical projects, and lifetime resources included.', bn: 'আমাদের ধাপে ধাপে মাস্টারক্লাসের মাধ্যমে বর্তমানের সবচেয়ে চাহিদাসম্পন্ন দক্ষতা অর্জন করুন। এতে রয়েছে সরাসরি মেন্টরশিপ সাপোর্ট, বাস্তবমুখী প্রজেক্ট এবং আজীবন রিসোর্স অ্যাক্সেস।' },
  'courses.syllabus': { en: 'Syllabus & Modules', bn: 'সিলেবাস এবং মডিউলসমূহ' },
  'courses.enroll': { en: 'Enroll Now', bn: 'এখনই এনরোল করুন' },
  'courses.enrolled': { en: 'Enrolled (Access Active)', bn: 'এনরোল করা আছে (অ্যাক্সেস সক্রিয়)' },
  'courses.pending': { en: 'Enrolled (Pending Approval)', bn: 'এনরোলড (অনুমোদনের অপেক্ষায়)' },
  'courses.bdt': { en: 'BDT', bn: 'টাকা' },
  'courses.moduleCount': { en: 'Modules', bn: 'মডিউল' },

  // Enroll Modal
  'enroll.title': { en: 'Course Enrollment', bn: 'কোর্সে এনরোলমেন্ট' },
  'enroll.subtitle': { en: 'Complete your manual mobile payment to get instant Google Drive lifetime access.', bn: 'আপনার গুগল ড্রাইভ লাইফটাইম অ্যাক্সেস পেতে ম্যানুয়াল মোবাইল পেমেন্ট সম্পন্ন করুন।' },
  'enroll.instr': { en: 'Payment Instructions', bn: 'পেমেন্ট নির্দেশাবলী' },
  'enroll.step1': { en: '1. Send the item price of {price} BDT via Cash Out / Send Money to any of the numbers below:', bn: '১. ক্যাশ আউট / সেন্ড মানি করে পণ্যের মূল্য {price} টাকা নিচের যেকোনো নম্বরে পাঠান:' },
  'enroll.step2': { en: '2. Fill out the enrollment form below with your transaction details:', bn: '২. আপনার লেনদেনের বিবরণ দিয়ে নিচের এনরোলমেন্ট ফর্মটি পূরণ করুন:' },
  'enroll.trxid': { en: 'Transaction ID (TrxID)', bn: 'ট্রানজেকশন আইডি (TrxID)' },
  'enroll.submit': { en: 'Complete Enrollment', bn: 'এনরোলমেন্ট সম্পন্ন করুন' },
  'enroll.close': { en: 'Close', bn: 'বন্ধ করুন' },

  // E-Books
  'ebooks.badge': { en: 'Knowledge Guides', bn: 'জ্ঞানভাণ্ডার গাইড' },
  'ebooks.title': { en: 'Premium Practical Guidebooks', bn: 'প্রিমিয়াম প্র্যাক্টিক্যাল গাইডবইসমূহ' },
  'ebooks.subtitle': { en: 'Instant PDF downloads with step-by-step master formulas and actionable tips to boost your skills and client acquisitions.', bn: 'আপনার দক্ষতা এবং ক্লায়েন্ট পাওয়ার কৌশল বৃদ্ধি করতে তাৎক্ষণিক পিডিএফ ডাউনলোড এবং চমৎকার মাস্টার ফর্মুলা।' },
  'ebooks.buy': { en: 'Buy Now & Download', bn: 'এখনই কিনুন এবং ডাউনলোড করুন' },
  'ebooks.download': { en: 'Download eBook', bn: 'ই-বুক ডাউনলোড করুন' },

  // Student Dashboard
  'dashboard.title': { en: 'Welcome to your Student Portal', bn: 'আপনার স্টুডেন্ট পোর্টালে স্বাগতম' },
  'dashboard.subtitle': { en: 'Access your courses, download ebooks, and track your enrollment status.', bn: 'আপনার কোর্সগুলো অ্যাক্সেস করুন, ই-বুক ডাউনলোড করুন এবং আপনার এনরোলমেন্টের স্ট্যাটাস ট্র্যাক করুন।' },
  'dashboard.loginTitle': { en: 'Student Portal Access', bn: 'স্টুডেন্ট পোর্টাল অ্যাক্সেস' },
  'dashboard.loginSub': { en: 'Enter your registered email and phone number to access your enrolled courses and purchased ebooks.', bn: 'আপনার এনরোল করা কোর্স এবং কেনা ই-বুক অ্যাক্সেস করতে আপনার নিবন্ধিত ইমেইল এবং ফোন নম্বর লিখুন।' },
  'dashboard.phone': { en: 'Registered Phone Number', bn: 'নিবন্ধিত ফোন নম্বর' },
  'dashboard.email': { en: 'Registered Email Address', bn: 'নিবন্ধিত ইমেইল এড্রেস' },
  'dashboard.btnAccess': { en: 'Access Portal', bn: 'পোর্টালে প্রবেশ করুন' },
  'dashboard.yourCourses': { en: 'Your Enrolled Courses', bn: 'আপনার এনরোল করা কোর্সসমূহ' },
  'dashboard.yourEbooks': { en: 'Your Purchased Ebooks', bn: 'আপনার কেনা ই-বুকসমূহ' },
  'dashboard.empty': { en: 'You are not enrolled in any courses or ebooks yet.', bn: 'আপনি এখনও কোনো কোর্স বা ই-বুকে এনরোল করেননি।' },
  'dashboard.pending': { en: 'Pending (Verifying Payment)', bn: 'পেন্ডিং (পেমেন্ট যাচাই করা হচ্ছে)' },
  'dashboard.approved': { en: 'Approved (Access Active)', bn: 'অনুমোদিত (অ্যাক্সেস সক্রিয়)' },
  'dashboard.rejected': { en: 'Rejected (Invalid Payment)', bn: 'প্রত্যাখ্যাত (অকার্যকর পেমেন্ট)' },
  'dashboard.accessMaterials': { en: 'Access Materials', bn: 'লার্নিং ম্যাটেরিয়ালস' },
  'dashboard.pendingNote': { en: 'Our admins are verifying your mobile transaction. Usually takes 15-30 minutes.', bn: 'আমাদের এডমিনরা আপনার মোবাইল লেনদেন যাচাই করছেন। সাধারণত ১৫-৩০ মিনিট সময় লাগে।' },
  'dashboard.logout': { en: 'Logout', bn: 'লগআউট' },

  // Admin Panel
  'admin.title': { en: 'Admin Management Panel', bn: 'এডমিন ম্যানেজমেন্ট প্যানেল' },
  'admin.stats': { en: 'Analytics Overview', bn: 'অ্যানালিটিক্স ওভারভিউ' },
  'admin.totalEnrollments': { en: 'Total Enrollments', bn: 'মোট এনরোলমেন্ট' },
  'admin.pendingVerif': { en: 'Pending Verification', bn: 'যাচাইয়ের অপেক্ষায়' },
  'admin.inquiries': { en: 'Inquiries', bn: 'জিজ্ঞাসাবাদ/বার্তা' },
  'admin.tabRequests': { en: 'Enrollment Requests', bn: 'এনরোলমেন্টের অনুরোধ' },
  'admin.tabSettings': { en: 'Agency Settings', bn: 'এজেন্সি সেটিংস' },
  'admin.tabPortfolio': { en: 'Portfolio Items', bn: 'পোর্টফোলিও আইটেম' },
  'admin.tabCourses': { en: 'Courses & Ebooks', bn: 'কোর্স এবং ই-বুক' },
  'admin.tabSubmissions': { en: 'Contact Forms', bn: 'যোগাযোগ বার্তা' },

  // Default Settings translations (Fallback if dynamic values are the defaults)
  'settings.agencyName': { en: 'PixelCraft Agency', bn: 'পিক্সেলক্রাফট এজেন্সি' },
  'settings.heroTitle': { en: 'Crafting Next-Gen Digital Experiences', bn: 'পরবর্তী প্রজন্মের ডিজিটাল অভিজ্ঞতা সৃষ্টি' },
  'settings.heroSubtitle': { en: 'Transforming ideas into high-converting websites, visual designs, and marketing campaigns with industry-leading experts.', bn: 'শিল্প-নেতৃস্থানীয় বিশেষজ্ঞদের সাহায্যে ধারণাকে উচ্চ-রূপান্তরকারী ওয়েবসাইট, ভিজ্যুয়াল ডিজাইন এবং বিপণন প্রচারাভিযানে রূপান্তর করা।' },
  'settings.aboutText': { en: 'We are a premier digital agency specializing in high-impact creative services. From full-stack web platforms and bespoke branding to high-energy social media ads and cinematic video production, our mission is to elevate your digital presence.', bn: 'আমরা একটি প্রিমিয়ার ডিজিটাল এজেন্সি যা উচ্চ-প্রভাবশালী ক্রিয়েটিভ পরিষেবাগুলিতে বিশেষজ্ঞ। ফুল-স্ট্যাক ওয়েব প্ল্যাটফর্ম এবং কাস্টম ব্র্যান্ডিং থেকে শুরু করে উচ্চ-ক্ষমতাসম্পন্ন সোশ্যাল মিডিয়া বিজ্ঞাপন এবং সিনেমাটিক ভিডিও প্রোডাকশন পর্যন্ত, আমাদের লক্ষ্য আপনার ডিজিটাল উপস্থিতি উন্নত করা।' },
  'settings.footerText': { en: '© 2026 PixelCraft Agency. All rights reserved. Empowering your brand with custom digital solutions.', bn: '© ২০২৬ পিক্সেলক্রাফট এজেন্সি। সর্বস্বত্ব সংরক্ষিত। কাস্টম ডিজিটাল সমাধান দিয়ে আপনার ব্র্যান্ডকে শক্তিশালী করা হচ্ছে।' }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('pixelcraft_lang') as Language;
    if (savedLang === 'en' || savedLang === 'bn') {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('pixelcraft_lang', lang);
  };

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language] || translations[key]['en'];
    }
    return key;
  };

  // Helper to translate default values if they are active
  const translateObject = <T extends Record<string, any>>(obj: T, fieldName: keyof T): string => {
    const originalValue = String(obj[fieldName] || '');
    if (language === 'bn') {
      // Find matches in default translations
      for (const [key, value] of Object.entries(translations)) {
        if (key.startsWith('settings.') && value.en.trim().toLowerCase() === originalValue.trim().toLowerCase()) {
          return value.bn;
        }
      }
    }
    return originalValue;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateObject }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
