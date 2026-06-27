import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, BookOpen, Clock, CheckCircle, ExternalLink, LogOut, ArrowRight, BookMarked } from 'lucide-react';
import { Enrollment } from '../types';
import { getStudentEnrollments } from '../data/dbSync';
import { useLanguage } from '../context/LanguageContext';

interface StudentDashboardProps {
  studentSession: { name: string; email: string; phone: string } | null;
  onLogin: (name: string, email: string, phone: string) => void;
  onLogout: () => void;
}

export default function StudentDashboard({ studentSession, onLogin, onLogout }: StudentDashboardProps) {
  const { t, language } = useLanguage();
  // Login Form States
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch enrollments when session is active
  useEffect(() => {
    if (studentSession) {
      fetchEnrollments();
    }
  }, [studentSession]);

  const fetchEnrollments = async () => {
    if (!studentSession) return;
    setIsLoading(true);
    try {
      const data = await getStudentEnrollments(studentSession.phone, studentSession.email);
      setEnrollments(data);
    } catch (err) {
      console.error('Error fetching enrollments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginName.trim() || !loginEmail.trim() || !loginPhone.trim()) {
      setError(language === 'en' ? 'Please fill in all your registered details.' : 'অনুগ্রহ করে আপনার রেজিস্ট্রিকৃত সব তথ্য পূরণ করুন।');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      // Fetch enrollments using these credentials to verify if they have any record
      const data = await getStudentEnrollments(loginPhone.trim(), loginEmail.trim().toLowerCase());
      
      // Save session
      onLogin(loginName.trim(), loginEmail.trim().toLowerCase(), loginPhone.trim());
      setEnrollments(data);
    } catch (err) {
      setError(language === 'en' ? 'Connection failed. Please check your network and retry.' : 'সংযোগ ব্যর্থ হয়েছে। অনুগ্রহ করে ইন্টারনেট কানেকশন চেক করে আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {!studentSession ? (
        /* --- LOGGED OUT / LOGIN FORM --- */
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl rounded-3xl overflow-hidden transition-colors">
          <div className="p-8 space-y-6 text-center">
            <div className="inline-flex p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400 rounded-2xl shadow-sm mx-auto">
              <User className="w-10 h-10" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="font-sans font-bold text-2xl text-slate-900 dark:text-white">{language === 'en' ? 'Student Portal' : 'স্টুডেন্ট পোর্টাল'}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                {language === 'en'
                  ? 'Enter your payment-registered details to instantly access your courses and ebooks.'
                  : 'আপনার কোর্স বা ই-বুক ক্রয়ের সময় ব্যবহৃত তথ্যগুলো দিয়ে ড্যাশবোর্ডে প্রবেশ করুন।'}
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{language === 'en' ? 'Your Registered Name' : 'আপনার নিবন্ধিত নাম'}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    placeholder={language === 'en' ? 'Enter full name' : 'সম্পূর্ণ নাম লিখুন'}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{language === 'en' ? 'Registered Email' : 'নিবন্ধিত ইমেইল ঠিকানা'}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="rahat@gmail.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{language === 'en' ? 'Registered Phone Number' : 'নিবন্ধিত ফোন নম্বর'}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    required
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-xs font-medium text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#043324] hover:bg-[#064e37] dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 text-white font-bold text-sm py-4 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>{isLoading ? (language === 'en' ? 'Verifying Student...' : 'ভেরিফাই করা হচ্ছে...') : (language === 'en' ? 'Access Dashboard' : 'ড্যাশবোর্ডে প্রবেশ করুন')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* --- LOGGED IN STUDENT DASHBOARD --- */
        <div className="space-y-8 text-left">
          
          {/* Dashboard Header Banner */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
            <div className="space-y-2">
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                {language === 'en' ? 'Student Account Active' : 'স্টুডেন্ট অ্যাকাউন্ট সক্রিয়'}
              </span>
              <h2 className="font-sans font-bold text-2xl sm:text-3xl tracking-tight">
                {language === 'en' ? `Welcome back, ${studentSession.name}!` : `স্বাগতম, ${studentSession.name}!`}
              </h2>
              <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                <span className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{studentSession.email}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{studentSession.phone}</span>
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center space-x-2 bg-slate-800 text-slate-200 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-700/50 hover:bg-red-500 hover:border-red-500 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{language === 'en' ? 'Logout' : 'লগআউট'}</span>
            </button>
          </div>

          {/* Enrolled Materials Sections */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 className="font-sans font-bold text-xl text-slate-900 dark:text-white flex items-center space-x-2">
                <BookMarked className="w-5 h-5 text-emerald-500" />
                <span>{language === 'en' ? 'My Enrolled Learning Assets' : 'আমার এনরোলকৃত কোর্স ও ই-বুকসমূহ'}</span>
              </h3>
              <button
                onClick={fetchEnrollments}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white underline font-medium cursor-pointer"
              >
                {language === 'en' ? 'Refresh Status' : 'স্ট্যাটাস রিফ্রেশ করুন'}
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                <p className="text-slate-400 font-medium">
                  {language === 'en' ? 'Synchronizing resources...' : 'রিসোর্স সিঙ্ক করা হচ্ছে...'}
                </p>
              </div>
            ) : enrollments.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-inner space-y-3 transition-colors">
                <p className="text-slate-400 dark:text-slate-500 font-medium">
                  {language === 'en' ? "You haven't requested any enrollments yet." : 'আপনার এখনও কোনো এনরোলমেন্ট নেই।'}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                  {language === 'en'
                    ? 'Go to our **Courses** or **Ebooks** section, choose your favorites, and complete manual payments to get started!'
                    : 'আমাদের **কোর্স** অথবা **ই-বুক** সেকশনে গিয়ে পছন্দের আইটেমটি বেছে নিন এবং ম্যানুয়াল পেমেন্ট সম্পন্ন করে যুক্ত হোন!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrollments.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md dark:hover:shadow-none transition-all flex flex-col justify-between space-y-6"
                  >
                    <div className="space-y-4">
                      {/* Badge / Type */}
                      <div className="flex justify-between items-start">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.itemType === 'course' 
                            ? 'bg-blue-50 dark:bg-blue-950/45 text-blue-700 dark:text-blue-400 border border-blue-100/10' 
                            : 'bg-pink-50 dark:bg-pink-950/45 text-pink-700 dark:text-pink-400 border border-pink-100/10'
                        }`}>
                          {item.itemType === 'course' ? (language === 'en' ? 'course' : 'কোর্স') : (language === 'en' ? 'ebook' : 'ই-বুক')}
                        </span>

                        {/* Status tag */}
                        {item.status === 'approved' ? (
                          <span className="flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{language === 'en' ? 'Approved' : 'অনুমোদিত'}</span>
                          </span>
                        ) : item.status === 'rejected' ? (
                          <span className="flex items-center space-x-1.5 text-xs text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/30 px-2.5 py-1 rounded-full">
                            ✕ {language === 'en' ? 'Rejected' : 'বাতিলকৃত'}
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full">
                            <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                            <span>{language === 'en' ? 'Pending Verification' : 'যাচাই করা হচ্ছে'}</span>
                          </span>
                        )}
                      </div>

                      {/* Content Info */}
                      <div className="space-y-1.5 text-left">
                        <h4 className="font-sans font-bold text-slate-850 dark:text-white text-base leading-snug">
                          {item.itemTitle}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                          <span>{language === 'en' ? 'Paid via' : 'পেমেন্ট মাধ্যম'}: **{item.paymentMethod}**</span>
                          <span>•</span>
                          <span>TxID: <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold uppercase">{item.transactionId}</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Drive links and buttons */}
                    <div className="pt-4 border-t border-slate-50 dark:border-slate-800 text-left">
                      {item.status === 'approved' ? (
                        <div className="space-y-3">
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {language === 'en' 
                              ? 'Your payment is verified! Click below to access your files on Google Drive:' 
                              : 'আপনার পেমেন্ট ভেরিফাই করা হয়েছে! গুগল ড্রাইভে ফোল্ডার বা ফাইলগুলো ডাউনলোড করতে নিচে ক্লিক করুন:'}
                          </p>
                          <a
                            href={item.driveLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm w-full py-3 rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>{language === 'en' ? 'Access Google Drive Folder' : 'গুগল ড্রাইভ ফোল্ডারে প্রবেশ করুন'}</span>
                          </a>
                        </div>
                      ) : item.status === 'rejected' ? (
                        <p className="text-xs text-red-500 dark:text-red-450 bg-red-50/50 dark:bg-red-950/10 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                          {language === 'en'
                            ? 'Your transaction ID could not be verified by the admin. Please contact us via WhatsApp immediately to rectify the issue.'
                            : 'আপনার ট্রানজেকশন আইডিটি অ্যাডমিন দ্বারা যাচাই করা সম্ভব হয়নি। সমস্যাটি দ্রুত সমাধান করতে দয়া করে আমাদের হোয়াটসঅ্যাপ হটলাইনে যোগাযোগ করুন।'}
                        </p>
                      ) : (
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 flex items-start space-x-2.5">
                          <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                            {language === 'en'
                              ? `Our admin is currently verifying your payment of BDT from your phone ${item.paymentPhone}. Your Drive download button will unlock here automatically as soon as it is approved.`
                              : `আমাদের অ্যাডমিন টিম আপনার প্রেরিত পেমেন্টটি (${item.paymentPhone} নম্বর থেকে) যাচাই করছে। ভেরিফিকেশন সফল হলেই স্বয়ংক্রিয়ভাবে ড্রাইভে ডাউনলোডের বাটানটি আনলক হবে।`
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
