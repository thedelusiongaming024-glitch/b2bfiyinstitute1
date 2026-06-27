import React, { useState, useEffect } from 'react';
import { 
  seedDatabaseIfEmpty, 
  getAgencySettings, 
  getPortfolioItems, 
  getCourses, 
  getEbooks,
  getPartners
} from './data/dbSync';
import { DEFAULT_SETTINGS } from './data/defaultData';
import { AgencySettings, PortfolioItem, Course, Ebook, Partner } from './types';
import { initPixel, trackPageView } from './utils/pixel';

// Component imports
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import Courses from './components/Courses';
import Ebooks from './components/Ebooks';
import Reviews from './components/Reviews';
import Contact from './components/Contact';
import StudentDashboard from './components/StudentDashboard';
import AdminPanel from './components/AdminPanel';

import { Sparkles, MessageSquare, PhoneCall, Mail, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [settings, setSettings] = useState<AgencySettings | null>(() => {
    try {
      const cached = localStorage.getItem('pixelcraft_cache_settings');
      return cached ? JSON.parse(cached) : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(() => {
    try {
      const cached = localStorage.getItem('pixelcraft_cache_portfolio');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const cached = localStorage.getItem('pixelcraft_cache_courses');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [ebooks, setEbooks] = useState<Ebook[]>(() => {
    try {
      const cached = localStorage.getItem('pixelcraft_cache_ebooks');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [partners, setPartners] = useState<Partner[]>(() => {
    try {
      const cached = localStorage.getItem('pixelcraft_cache_partners');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    try {
      // If we already have cached settings, don't show the full-screen loading spinner at all!
      return !localStorage.getItem('pixelcraft_cache_settings');
    } catch (e) {
      return true;
    }
  });

  // Student Session
  const [studentSession, setStudentSession] = useState<{ name: string; email: string; phone: string } | null>(null);

  useEffect(() => {
    // Check if there is an active student session cached in localStorage
    const cachedSession = localStorage.getItem('pixelcraft_student_session');
    if (cachedSession) {
      try {
        setStudentSession(JSON.parse(cachedSession));
      } catch (err) {
        console.error('Error parsing student session:', err);
      }
    }

    // Initialize & Fetch data
    initializeAndFetch();
  }, []);

  // Facebook Pixel tracking initialization
  useEffect(() => {
    if (settings?.facebookPixelId) {
      initPixel(settings.facebookPixelId);
    }
  }, [settings]);

  // Track page view when active tab changes
  useEffect(() => {
    if (settings?.facebookPixelId) {
      trackPageView();
    }
  }, [activeTab, settings]);

  const initializeAndFetch = async () => {
    // Only show full screen loading spinner if we don't have settings loaded from cache yet
    if (!settings || settings.agencyName === 'PixelCraft Agency') {
      const cachedSettings = localStorage.getItem('pixelcraft_cache_settings');
      if (!cachedSettings) {
        setIsLoading(true);
      }
    }
    try {
      // 1. Run Seeder gracefully so any failures don't block loading
      await seedDatabaseIfEmpty().catch((err) => {
        console.error('Database seeding failed:', err);
      });
    } catch (err) {
      console.error('Seeding process error:', err);
    }

    try {
      // 2. Fetch All Data (Always execute even if seeding failed)
      await refreshGlobalData();
    } catch (err) {
      console.error('Error in initial fetch:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshGlobalData = async () => {
    try {
      const [siteSettings, portfolio, courseList, ebookList, partnerList] = await Promise.all([
        getAgencySettings().catch((err) => {
          console.error('getAgencySettings failed:', err);
          return DEFAULT_SETTINGS;
        }),
        getPortfolioItems().catch((err) => {
          console.error('getPortfolioItems failed:', err);
          return [];
        }),
        getCourses().catch((err) => {
          console.error('getCourses failed:', err);
          return [];
        }),
        getEbooks().catch((err) => {
          console.error('getEbooks failed:', err);
          return [];
        }),
        getPartners().catch((err) => {
          console.error('getPartners failed:', err);
          return [];
        })
      ]);

      setSettings(siteSettings || DEFAULT_SETTINGS);
      setPortfolioItems(portfolio && portfolio.length > 0 ? portfolio : []);
      setCourses(courseList && courseList.length > 0 ? courseList : []);
      setEbooks(ebookList && ebookList.length > 0 ? ebookList : []);
      setPartners(partnerList || []);
    } catch (error) {
      console.error('Error refreshing data:', error);
      // Absolute guaranteed safe fallback so the spinner disappears
      setSettings(DEFAULT_SETTINGS);
    }
  };

  // Student Session Management callbacks
  const handleStudentLogin = (name: string, email: string, phone: string) => {
    const session = { name, email, phone };
    setStudentSession(session);
    localStorage.setItem('pixelcraft_student_session', JSON.stringify(session));
  };

  const handleStudentLogout = () => {
    setStudentSession(null);
    localStorage.removeItem('pixelcraft_student_session');
  };

  const handleEnrollSuccess = (studentName: string, studentEmail: string, studentPhone: string) => {
    handleStudentLogin(studentName, studentEmail, studentPhone);
  };

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4 transition-colors duration-200">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
          <Sparkles className="w-5 h-5 text-emerald-500 absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="text-slate-500 font-medium text-xs uppercase tracking-wider animate-pulse">
          Crafting Digital Experience...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      
      {/* Header Navigation */}
      <Navbar 
        settings={settings} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main Container */}
      <main className="flex-grow">
        {activeTab === 'home' && (
          <div>
            <Hero 
              settings={settings} 
              onExploreServices={() => {
                const sec = document.getElementById('services-section');
                if (sec) sec.scrollIntoView({ behavior: 'smooth' });
              }}
              onExplorePortfolio={() => {
                const sec = document.getElementById('portfolio-section');
                if (sec) sec.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <Services />
            <Portfolio 
              settings={settings} 
              items={portfolioItems} 
              partners={partners}
            />
            <Reviews />
            <Contact settings={settings} />
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="py-8 bg-slate-50 dark:bg-slate-900/40">
            <Portfolio 
              settings={settings} 
              items={portfolioItems} 
              partners={partners}
            />
          </div>
        )}

        {activeTab === 'courses' && (
          <Courses 
            courses={courses} 
            settings={settings} 
            onEnrollSuccess={handleEnrollSuccess} 
          />
        )}

        {activeTab === 'ebooks' && (
          <Ebooks 
            ebooks={ebooks} 
            settings={settings} 
            onEnrollSuccess={handleEnrollSuccess} 
          />
        )}

        {activeTab === 'dashboard' && (
          <StudentDashboard 
            studentSession={studentSession}
            onLogin={handleStudentLogin}
            onLogout={handleStudentLogout}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel 
            settings={settings}
            portfolioItems={portfolioItems}
            courses={courses}
            ebooks={ebooks}
            partners={partners}
            onRefreshData={refreshGlobalData}
          />
        )}
      </main>

      {/* Global Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Column 1: Brand details */}
            <div className="md:col-span-5 space-y-4 text-left">
              <div className="flex items-center space-x-3">
                <img 
                  src={settings.logoUrl} 
                  alt="Logo" 
                  className="h-10 w-10 rounded-xl object-cover border border-slate-700 shadow-sm"
                />
                <span className="font-sans font-extrabold text-lg tracking-tight">
                  {settings.agencyName}
                </span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
                {settings.aboutText}
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="md:col-span-3 text-left space-y-3">
              <h5 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Quick Navigation</h5>
              <div className="flex flex-col space-y-2 text-xs font-semibold text-slate-300">
                <button onClick={() => setActiveTab('home')} className="hover:text-white transition-colors text-left">Home</button>
                <button onClick={() => setActiveTab('portfolio')} className="hover:text-white transition-colors text-left">Portfolio</button>
                <button onClick={() => setActiveTab('courses')} className="hover:text-white transition-colors text-left">Courses</button>
                <button onClick={() => setActiveTab('ebooks')} className="hover:text-white transition-colors text-left">eBooks</button>
              </div>
            </div>

            {/* Column 3: Contact details */}
            <div className="md:col-span-4 text-left space-y-3">
              <h5 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Inquiries & Support</h5>
              <div className="space-y-2 text-xs font-semibold text-slate-300">
                <div className="flex items-center space-x-2">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+{settings.whatsappNumber}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>support@{settings.agencyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com</span>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-mono">
            <span className="text-center sm:text-left">{settings.footerText}</span>
            <button 
              onClick={() => {
                setActiveTab('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700 whitespace-nowrap"
              title="Admin Panel Control"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-sans font-bold uppercase tracking-wider text-[10px]">Admin Area</span>
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
