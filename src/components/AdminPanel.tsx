import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Settings, 
  Briefcase, 
  BookOpen, 
  Users, 
  MessageSquare, 
  Lock, 
  Trash2, 
  Plus, 
  Edit, 
  Check, 
  X, 
  FileText,
  DollarSign,
  UserCheck,
  AlertCircle,
  Search,
  Image as ImageIcon,
  Mail,
  MapPin,
  Globe,
  Calendar,
  Upload,
  Eye,
  EyeOff,
  Handshake,
  ExternalLink
} from 'lucide-react';
import { 
  AgencySettings, 
  PortfolioItem, 
  Course, 
  Ebook, 
  Enrollment, 
  ContactSubmission,
  Partner
} from '../types';
import { 
  getAdminCredentials, 
  updateAdminCredentials, 
  updateAgencySettings,
  addPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  saveCourse,
  deleteCourse,
  saveEbook,
  deleteEbook,
  getEnrollments,
  updateEnrollmentStatus,
  getContactSubmissions,
  savePartner,
  deletePartner
} from '../data/dbSync';
import { verifyPassword } from '../utils/crypto';

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, value, onChange, placeholder = 'https://example.com/image.jpg' }) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file!');
      return;
    }
    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Optimally resize to maximum 800px width or height to stay very light
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
          onChange(compressedBase64);
        } else {
          onChange(event.target?.result as string);
        }
        setIsCompressing(false);
      };
      img.onerror = () => {
        onChange(event.target?.result as string);
        setIsCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</label>
      
      {/* Visual Sandbox/Box */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-4 transition-all flex flex-col items-center justify-center text-center bg-slate-50 min-h-[140px] ${
          dragActive ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        {isCompressing ? (
          <div className="space-y-2 py-4">
            <div className="w-8 h-8 border-4 border-slate-300 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-500">Processing and optimizing image...</p>
          </div>
        ) : value ? (
          <div className="w-full flex flex-col sm:flex-row items-center gap-4 py-2">
            <div className="relative group w-24 h-24 rounded-xl overflow-hidden border border-slate-200 bg-white flex-shrink-0 flex items-center justify-center">
              <img src={value} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs"
              >
                Remove
              </button>
            </div>
            <div className="flex-grow text-left space-y-1 w-full">
              <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Image loaded successfully!</span>
              </p>
              <p className="text-[10px] text-slate-400 font-medium line-clamp-1 break-all">
                {value.startsWith('data:') ? 'Base64 Local Image (Compressed & Optimized)' : value}
              </p>
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-[10px] text-red-500 hover:text-red-700 font-bold hover:underline"
              >
                Clear Image
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 py-2 cursor-pointer relative w-full">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="mx-auto w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Drag & drop image here, or <span className="text-emerald-600 hover:underline">browse files</span></p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Supports PNG, JPG, GIF, WebP (auto-optimized)</p>
            </div>
          </div>
        )}
      </div>

      {/* Manual URL entry input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Direct URL</span>
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-20 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 focus:outline-none focus:bg-white focus:border-slate-300 transition-colors"
        />
      </div>
    </div>
  );
};

interface AdminPanelProps {
  settings: AgencySettings;
  portfolioItems: PortfolioItem[];
  courses: Course[];
  ebooks: Ebook[];
  partners: Partner[];
  onRefreshData: () => void;
}

export default function AdminPanel({ 
  settings, 
  portfolioItems, 
  courses, 
  ebooks,
  partners,
  onRefreshData 
}: AdminPanelProps) {
  
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Active Admin View Tab
  const [activeTab, setActiveTab] = useState<'settings' | 'portfolio' | 'courses' | 'ebooks' | 'enrollments' | 'contacts' | 'password' | 'partners'>('enrollments');

  // Firestore Sync variables
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [isLoadingDynamicData, setIsLoadingDynamicData] = useState(false);

  // Search & Filter state for Student Orders
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | 'bKash' | 'Nagad' | 'Rocket' | 'Upay'>('all');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Success message toaster
  const [toastMessage, setToastMessage] = useState('');

  // Editing structures
  const [editedSettings, setEditedSettings] = useState<AgencySettings>({ ...settings });

  // Portfolio addition / editing structure
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const [portfolioForm, setPortfolioForm] = useState<{
    title: string;
    category: 'Graphics Design' | 'Video Editing' | 'Web Development';
    imageUrl: string;
    demoLink: string;
  }>({
    title: '',
    category: 'Graphics Design',
    imageUrl: '',
    demoLink: ''
  });

  // Course addition / editing structure
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState<{
    title: string;
    coverImage: string;
    price: string;
    description: string;
    modules: string;
    driveLink: string;
  }>({
    title: '',
    coverImage: '',
    price: '',
    description: '',
    modules: '',
    driveLink: ''
  });

  // Ebook addition / editing structure
  const [isEbookModalOpen, setIsEbookModalOpen] = useState(false);
  const [selectedEbookId, setSelectedEbookId] = useState<string | null>(null);
  const [ebookForm, setEbookForm] = useState<{
    title: string;
    coverImage: string;
    price: string;
    description: string;
    driveLink: string;
  }>({
    title: '',
    coverImage: '',
    price: '',
    description: '',
    driveLink: ''
  });

  // Partner addition / editing structure
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [partnerForm, setPartnerForm] = useState<{
    name: string;
    logoUrl: string;
    websiteUrl: string;
  }>({
    name: '',
    logoUrl: '',
    websiteUrl: ''
  });

  // Approved Drive Link fields for custom enrollment approvals
  const [approvedDriveLinks, setApprovedDriveLinks] = useState<Record<string, string>>({});

  // Credentials change fields
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');

  // Sync settings when props load
  useEffect(() => {
    setEditedSettings({ ...settings });
  }, [settings]);

  // Fetch enrollments and contacts when authorized
  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  const fetchAdminData = async () => {
    setIsLoadingDynamicData(true);
    try {
      const enrollList = await getEnrollments();
      const contactList = await getContactSubmissions();
      setEnrollments(enrollList);
      setContacts(contactList);

      // Initialize approved drive link text fields with standard drive links for that course/ebook item
      const initialLinks: Record<string, string> = {};
      enrollList.forEach((enroll) => {
        if (enroll.status === 'pending') {
          if (enroll.itemType === 'course') {
            const course = courses.find((c) => c.id === enroll.itemId);
            initialLinks[enroll.id] = course ? course.driveLink : '';
          } else {
            const ebook = ebooks.find((e) => e.id === enroll.itemId);
            initialLinks[enroll.id] = ebook ? ebook.driveLink : '';
          }
        }
      });
      setApprovedDriveLinks(initialLinks);

    } catch (err) {
      console.error('Error fetching admin info:', err);
    } finally {
      setIsLoadingDynamicData(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // --- LOGIN SUBMIT ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const creds = await getAdminCredentials();
      const isPasswordValid = await verifyPassword(password, creds.password || '');
      if (username.trim() === creds.username && isPasswordValid) {
        setIsAuthenticated(true);
        setNewAdminUsername(creds.username);
      } else {
        setLoginError('Invalid Username or Password. Please try again.');
      }
    } catch (err) {
      setLoginError('Failed to fetch admin credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // --- SAVE SITE SETTINGS ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateAgencySettings(editedSettings);
      showToast('Global Site Settings Updated Successfully!');
      onRefreshData();
    } catch (err) {
      showToast('Failed to update site settings.');
    }
  };

  // --- PORTFOLIO MUTATIONS ---
  const handleOpenPortfolioModal = (item?: PortfolioItem) => {
    if (item) {
      setSelectedPortfolioId(item.id);
      setPortfolioForm({
        title: item.title,
        category: item.category,
        imageUrl: item.imageUrl,
        demoLink: item.demoLink || ''
      });
    } else {
      setSelectedPortfolioId(null);
      setPortfolioForm({
        title: '',
        category: 'Graphics Design',
        imageUrl: '',
        demoLink: ''
      });
    }
    setIsPortfolioModalOpen(true);
  };

  const handleSavePortfolioItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedPortfolioId) {
        await updatePortfolioItem(selectedPortfolioId, portfolioForm);
        showToast('Portfolio Item Updated Successfully!');
      } else {
        await addPortfolioItem(portfolioForm);
        showToast('New Portfolio Item Created!');
      }
      setIsPortfolioModalOpen(false);
      onRefreshData();
    } catch (err) {
      showToast('Failed to save portfolio item.');
    }
  };

  const handleDeletePortfolioItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this portfolio item?')) {
      try {
        await deletePortfolioItem(id);
        showToast('Portfolio Item Deleted Successfully!');
        onRefreshData();
      } catch (err) {
        showToast('Failed to delete item.');
      }
    }
  };

  // --- COURSE MUTATIONS ---
  const handleOpenCourseModal = (item?: Course) => {
    if (item) {
      setSelectedCourseId(item.id);
      setCourseForm({
        title: item.title,
        coverImage: item.coverImage,
        price: item.price.toString(),
        description: item.description,
        modules: item.modules ? item.modules.join('\n') : '',
        driveLink: item.driveLink
      });
    } else {
      setSelectedCourseId(null);
      setCourseForm({
        title: '',
        coverImage: '',
        price: '',
        description: '',
        modules: '',
        driveLink: ''
      });
    }
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const modulesArray = courseForm.modules
      .split('\n')
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    const priceNum = parseFloat(courseForm.price) || 0;

    try {
      await saveCourse({
        title: courseForm.title,
        coverImage: courseForm.coverImage,
        price: priceNum,
        description: courseForm.description,
        modules: modulesArray,
        driveLink: courseForm.driveLink
      }, selectedCourseId || undefined);

      showToast('Course Saved Successfully!');
      setIsCourseModalOpen(false);
      onRefreshData();
    } catch (err) {
      showToast('Failed to save course.');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse(id);
        showToast('Course Deleted Successfully!');
        onRefreshData();
      } catch (err) {
        showToast('Failed to delete course.');
      }
    }
  };

  // --- EBOOK MUTATIONS ---
  const handleOpenEbookModal = (item?: Ebook) => {
    if (item) {
      setSelectedEbookId(item.id);
      setEbookForm({
        title: item.title,
        coverImage: item.coverImage,
        price: item.price.toString(),
        description: item.description,
        driveLink: item.driveLink
      });
    } else {
      setSelectedEbookId(null);
      setEbookForm({
        title: '',
        coverImage: '',
        price: '',
        description: '',
        driveLink: ''
      });
    }
    setIsEbookModalOpen(true);
  };

  const handleSaveEbook = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(ebookForm.price) || 0;

    try {
      await saveEbook({
        title: ebookForm.title,
        coverImage: ebookForm.coverImage,
        price: priceNum,
        description: ebookForm.description,
        driveLink: ebookForm.driveLink
      }, selectedEbookId || undefined);

      showToast('EBook Saved Successfully!');
      setIsEbookModalOpen(false);
      onRefreshData();
    } catch (err) {
      showToast('Failed to save ebook.');
    }
  };

  const handleDeleteEbook = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this eBook?')) {
      try {
        await deleteEbook(id);
        showToast('eBook Deleted Successfully!');
        onRefreshData();
      } catch (err) {
        showToast('Failed to delete eBook.');
      }
    }
  };

  // Partner Actions
  const openPartnerModal = (item?: Partner) => {
    if (item) {
      setSelectedPartnerId(item.id);
      setPartnerForm({
        name: item.name,
        logoUrl: item.logoUrl,
        websiteUrl: item.websiteUrl || ''
      });
    } else {
      setSelectedPartnerId(null);
      setPartnerForm({
        name: '',
        logoUrl: '',
        websiteUrl: ''
      });
    }
    setIsPartnerModalOpen(true);
  };

  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerForm.name || !partnerForm.logoUrl) {
      showToast('Name and Logo are required!');
      return;
    }
    try {
      await savePartner(partnerForm, selectedPartnerId || undefined);
      showToast(selectedPartnerId ? 'Partner Updated Successfully!' : 'New Partner Added Successfully!');
      setIsPartnerModalOpen(false);
      onRefreshData();
    } catch (err) {
      showToast('Failed to save partner.');
    }
  };

  const handleDeletePartner = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this partner/client company?')) {
      try {
        await deletePartner(id);
        showToast('Partner Deleted Successfully!');
        onRefreshData();
      } catch (err) {
        showToast('Failed to delete partner.');
      }
    }
  };

  // --- ENROLLMENT DECISIONS ---
  const handleEnrollmentApproval = async (id: string, decision: 'approved' | 'rejected') => {
    const customLink = approvedDriveLinks[id] || '';
    if (decision === 'approved' && !customLink.trim()) {
      alert('Please specify the Google Drive share link before approving this student.');
      return;
    }

    try {
      await updateEnrollmentStatus(id, decision, customLink.trim());
      showToast(`Enrollment Request Successfully ${decision === 'approved' ? 'Approved' : 'Rejected'}!`);
      fetchAdminData();
    } catch (err) {
      showToast('Failed to complete decision.');
    }
  };

  // --- CHANGE ADMIN PASS ---
  const handleChangeCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminUsername.trim() || !newAdminPassword.trim()) {
      showToast('Credentials cannot be empty.');
      return;
    }

    try {
      await updateAdminCredentials(newAdminUsername.trim(), newAdminPassword.trim());
      showToast('Admin Credentials Updated Successfully! Keep them safe.');
      setNewAdminPassword('');
    } catch (err) {
      showToast('Failed to update credentials.');
    }
  };

  // Admin summary counters
  const totalPendingEnrollments = enrollments.filter((e) => e.status === 'pending').length;
  const totalApprovedEnrollments = enrollments.filter((e) => e.status === 'approved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Toast Alert Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {!isAuthenticated ? (
        /* --- ADMIN LOGIN FORM --- */
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl rounded-3xl overflow-hidden mt-8 transition-colors">
          <div className="p-8 space-y-6 text-center">
            <div className="inline-flex p-4 bg-slate-900 dark:bg-slate-950 text-emerald-500 rounded-2xl border border-slate-800">
              <Lock className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-sans font-extrabold text-2xl text-slate-900 dark:text-white">Admin Control Center</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Access parameters require executive credentials.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-650"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-650"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showLoginPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {loginError && (
                <p className="text-red-500 text-xs font-semibold text-center">{loginError}</p>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 text-white font-bold text-sm py-4 rounded-2xl transition-colors disabled:opacity-50"
              >
                {isLoggingIn ? 'Verifying Credentials...' : 'Authenticate Access'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* --- AUTHENTICATED ADMIN PANEL --- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Admin Sidebar Navigation */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 text-left transition-colors">
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center space-x-2">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">System Console</p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">Administrator</p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100/50 dark:border-slate-800/80 transition-colors">
              <div className="text-center p-2 bg-white dark:bg-slate-900 rounded-xl transition-colors border border-slate-100/50 dark:border-slate-800/30">
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Pending</p>
                <p className="text-base font-extrabold text-amber-600 font-mono">{totalPendingEnrollments}</p>
              </div>
              <div className="text-center p-2 bg-white dark:bg-slate-900 rounded-xl transition-colors border border-slate-100/50 dark:border-slate-800/30">
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Approved</p>
                <p className="text-base font-extrabold text-emerald-600 font-mono">{totalApprovedEnrollments}</p>
              </div>
            </div>

            {/* Nav Tabs */}
            <nav className="flex flex-col space-y-1">
              {[
                { id: 'enrollments', label: `Student Orders (${totalPendingEnrollments})`, icon: Users },
                { id: 'settings', label: 'Site settings', icon: Settings },
                { id: 'portfolio', label: 'Portfolio Items', icon: Briefcase },
                { id: 'courses', label: 'Course Manager', icon: BookOpen },
                { id: 'ebooks', label: 'EBook Shelf', icon: FileText },
                { id: 'partners', label: 'Partner/Client Logos', icon: Handshake },
                { id: 'contacts', label: 'Client Inquiries', icon: MessageSquare },
                { id: 'password', label: 'Security Password', icon: Lock },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2.5 w-full px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-md'
                        : 'text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-950 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Admin Contents Window */}
          <div className="lg:col-span-9 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm text-left transition-colors">
            
            {/* --- TAB: STUDENT ORDERS / ENROLLMENTS --- */}
            {activeTab === 'enrollments' && (() => {
              // Local filtering logic
              const filteredEnrollments = enrollments.filter((enroll) => {
                const sQuery = orderSearchQuery.toLowerCase();
                const matchesSearch = !sQuery ||
                  enroll.studentName.toLowerCase().includes(sQuery) ||
                  enroll.studentEmail.toLowerCase().includes(sQuery) ||
                  enroll.studentPhone.includes(sQuery) ||
                  (enroll.transactionId && enroll.transactionId.toLowerCase().includes(sQuery)) ||
                  enroll.itemTitle.toLowerCase().includes(sQuery);

                const matchesStatus = statusFilter === 'all' || enroll.status === statusFilter;
                const matchesMethod = methodFilter === 'all' || enroll.paymentMethod.toLowerCase() === methodFilter.toLowerCase();

                return matchesSearch && matchesStatus && matchesMethod;
              });

              // Notification handlers
              const handleWhatsAppNotification = (enroll: Enrollment) => {
                const cleanPhone = enroll.studentPhone.replace(/[^0-9]/g, '');
                const formattedPhone = cleanPhone.startsWith('88') ? cleanPhone : '88' + cleanPhone;
                const statusBangla = enroll.status === 'approved' ? 'অনুমোদিত (Approved)' : enroll.status === 'rejected' ? 'প্রত্যাখ্যাত (Rejected)' : 'যাচাই করা হচ্ছে (Pending)';
                const message = `Hello ${enroll.studentName},\n\nWe have reviewed your manual payment of ${enroll.paidAmount || 'the course price'} BDT via ${enroll.paymentMethod} for "${enroll.itemTitle}".\n\nYour order is now: ${statusBangla}.\n\nTxID: ${enroll.transactionId}\n\nThank you for choosing ${settings.agencyName}!`;
                window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
              };

              const handleEmailNotification = (enroll: Enrollment) => {
                const subject = `Order Update - ${enroll.itemTitle}`;
                const body = `Dear ${enroll.studentName},\n\nThis is an update regarding your order for "${enroll.itemTitle}".\n\nOrder Status: ${enroll.status.toUpperCase()}\nMethod: ${enroll.paymentMethod}\nTransaction ID: ${enroll.transactionId}\nPaid Amount: ${enroll.paidAmount || 'Full'}\n\nIf approved, you can log in to your Student Portal using your email to access the resources.\n\nBest Regards,\n${settings.agencyName}`;
                window.open(`mailto:${enroll.studentEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
              };

              return (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="font-sans font-bold text-lg text-slate-900 dark:text-white">Student Orders & Ledger Review</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-550 font-medium">Verify bank receipts, filter records, and authorize student course access.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={fetchAdminData} 
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all"
                    >
                      Refresh List
                    </button>
                  </div>

                  {/* Search and Filters Dashboard */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-4">
                    
                    {/* Search Field */}
                    <div className="md:col-span-4 relative">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Search Students / Orders</label>
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text"
                          value={orderSearchQuery}
                          onChange={(e) => setOrderSearchQuery(e.target.value)}
                          placeholder="Name, email, phone, TxID..."
                          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-700 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div className="md:col-span-4">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Filter Status</label>
                      <div className="flex flex-wrap gap-1.5">
                        {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setStatusFilter(st)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                              statusFilter === st
                                ? 'bg-slate-950 dark:bg-emerald-500 border-slate-950 dark:border-emerald-500 text-white dark:text-slate-950 shadow-sm'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
                            }`}
                          >
                            {st === 'all' ? 'All' : st === 'pending' ? 'Pending' : st === 'approved' ? 'Approved' : 'Rejected'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Method Filter */}
                    <div className="md:col-span-4">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Filter Method</label>
                      <div className="flex flex-wrap gap-1.5">
                        {(['all', 'bKash', 'Nagad', 'Rocket', 'Upay'] as const).map((meth) => (
                          <button
                            key={meth}
                            type="button"
                            onClick={() => setMethodFilter(meth)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                              methodFilter === meth
                                ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500 text-white shadow-sm'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
                            }`}
                          >
                            {meth}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {isLoadingDynamicData ? (
                    <p className="text-slate-400 font-medium py-12 text-center">Loading orders...</p>
                  ) : filteredEnrollments.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      <p className="text-slate-400 dark:text-slate-550 font-semibold text-sm">No student orders found matching filters.</p>
                      <button 
                        onClick={() => {
                          setOrderSearchQuery('');
                          setStatusFilter('all');
                          setMethodFilter('all');
                        }}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold mt-2"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {filteredEnrollments.map((enroll) => (
                        <div
                          key={enroll.id}
                          className={`p-5 rounded-3xl border transition-all hover:shadow-sm ${
                            enroll.status === 'pending'
                              ? 'bg-amber-50/10 dark:bg-amber-950/10 border-amber-200/60 dark:border-amber-800/40'
                              : enroll.status === 'rejected'
                              ? 'bg-red-50/10 dark:bg-red-950/10 border-red-200/60 dark:border-red-800/40'
                              : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-150 dark:border-slate-800'
                          } flex flex-col lg:flex-row justify-between gap-6 items-stretch`}
                        >
                          <div className="space-y-4 flex-grow max-w-2xl text-left">
                            
                            {/* Header row */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-sans font-extrabold text-base text-slate-900 dark:text-white">
                                {enroll.studentName}
                              </span>
                              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
                                {enroll.itemType}
                              </span>
                              
                              {/* status pill */}
                              {enroll.status === 'approved' ? (
                                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full font-bold border border-emerald-100/50 dark:border-emerald-900/30">Approved</span>
                              ) : enroll.status === 'rejected' ? (
                                <span className="text-[10px] text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2.5 py-0.5 rounded-full font-bold border border-red-100/50 dark:border-red-900/30">Rejected</span>
                              ) : (
                                <span className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full font-bold animate-pulse border border-amber-100/50 dark:border-amber-900/30">Pending Review</span>
                              )}
                              
                              {/* Date badge */}
                              {enroll.createdAt && (
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-medium flex items-center gap-1 ml-auto sm:ml-0">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>{new Date(enroll.createdAt).toLocaleDateString()}</span>
                                </span>
                              )}
                            </div>

                            {/* Info grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                              <div>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Email</p>
                                <p className="break-all font-mono text-slate-800 dark:text-slate-200">{enroll.studentEmail}</p>
                              </div>
                              <div>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Phone</p>
                                <p className="font-mono text-slate-800 dark:text-slate-200">{enroll.studentPhone}</p>
                              </div>
                              <div>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Asset Title</p>
                                <p className="line-clamp-2 text-slate-900 dark:text-white">{enroll.itemTitle}</p>
                              </div>
                            </div>

                            {/* Additional geographical and optional notes fields */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs border-t border-slate-100 dark:border-slate-800/60 pt-3">
                              <div>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Country / Region</p>
                                <p className="text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                  <Globe className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                  <span>{enroll.country || 'Bangladesh'}</span>
                                </p>
                              </div>
                              <div>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">District</p>
                                <p className="text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                  <span>{enroll.district || 'Not Specified'}</span>
                                </p>
                              </div>
                              <div>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Optional Note</p>
                                <p className="text-slate-600 dark:text-slate-400 italic line-clamp-2 leading-tight">{enroll.notes ? `"${enroll.notes}"` : 'None'}</p>
                              </div>
                            </div>

                            {/* Payment Ledger detail strip */}
                            <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                              <div>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Method</p>
                                <p className="font-extrabold text-blue-600 dark:text-blue-400">{enroll.paymentMethod}</p>
                              </div>
                              <div>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Sender Number</p>
                                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{enroll.paymentPhone}</p>
                              </div>
                              <div>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">TxID</p>
                                <p className="font-mono font-extrabold text-slate-950 dark:text-white uppercase tracking-wider">{enroll.transactionId}</p>
                              </div>
                              <div>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Paid Amount</p>
                                <p className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">{enroll.paidAmount ? `${enroll.paidAmount} BDT` : 'Full price'}</p>
                              </div>
                            </div>

                            {/* Real Integration Communications Panel */}
                            <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Notify Student:</span>
                              
                              <button 
                                type="button"
                                onClick={() => handleWhatsAppNotification(enroll)}
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-[10px] rounded-lg transition-colors shadow-sm cursor-pointer"
                                title="Send WhatsApp Confirmation"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>WhatsApp Status</span>
                              </button>

                              <button 
                                type="button"
                                onClick={() => handleEmailNotification(enroll)}
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-800 text-white font-bold text-[10px] rounded-lg transition-colors border border-transparent dark:border-slate-800 cursor-pointer"
                                title="Send Email Confirmation"
                              >
                                <Mail className="w-3 h-3" />
                                <span>Send Email</span>
                              </button>

                              {/* Image receipt lightbox trigger if screenshot is present */}
                              {enroll.screenshotUrl && (
                                <button 
                                  type="button"
                                  onClick={() => setLightboxImage(enroll.screenshotUrl!)}
                                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/80 font-bold text-[10px] rounded-lg transition-colors ml-auto animate-pulse cursor-pointer"
                                >
                                  <ImageIcon className="w-3 h-3" />
                                  <span>View Screenshot</span>
                                </button>
                              )}
                            </div>

                          </div>

                          {/* Approvals Action Block */}
                          <div className="w-full lg:w-[240px] flex flex-col justify-between bg-white/40 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 p-4 rounded-3xl gap-4 flex-shrink-0 transition-colors">
                            {enroll.status === 'pending' ? (
                              <div className="space-y-3 h-full flex flex-col justify-between">
                                <div className="space-y-1.5">
                                  <label className="block text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Verify Drive Link</label>
                                  <input
                                    type="text"
                                    value={approvedDriveLinks[enroll.id] || ''}
                                    onChange={(e) => setApprovedDriveLinks({
                                      ...approvedDriveLinks,
                                      [enroll.id]: e.target.value
                                    })}
                                    placeholder="https://drive.google.com/..."
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                                  />
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleEnrollmentApproval(enroll.id, 'approved')}
                                    className="flex-grow flex items-center justify-center space-x-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleEnrollmentApproval(enroll.id, 'rejected')}
                                    className="flex-grow flex items-center justify-center space-x-1 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 font-bold text-xs rounded-xl transition-colors border border-red-200/50 dark:border-red-900/40 cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Reject</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-right text-xs text-slate-500 flex flex-col justify-between h-full">
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1 text-left">Verified drive asset link:</p>
                                <p className="break-all text-[11px] font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl text-left font-semibold border border-slate-100 dark:border-slate-800 line-clamp-3">
                                  {enroll.driveLink || 'None specified'}
                                </p>
                              </div>
                            )}
                          </div>

                        </div>
                      ))}
                    </div>
                  )}

                  {/* SCREENSHOT LIGHTBOX POPUP */}
                  {lightboxImage && (
                    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh] border border-slate-150 dark:border-slate-800">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                          <span className="font-sans font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-blue-500" />
                            <span>Payment Verification Slip</span>
                          </span>
                          <button 
                            type="button"
                            onClick={() => setLightboxImage(null)}
                            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="flex-grow overflow-y-auto p-4 flex items-center justify-center bg-slate-900/10 dark:bg-slate-950/40">
                          <img 
                            src={lightboxImage} 
                            alt="Payment receipt slip" 
                            className="max-h-[60vh] object-contain rounded-2xl border dark:border-slate-800"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                          <button 
                            type="button"
                            onClick={() => setLightboxImage(null)}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                          >
                            Close Preview
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })()}

            {/* --- TAB: SITE SETTINGS --- */}
            {activeTab === 'settings' && (
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <h4 className="font-sans font-bold text-lg text-slate-900 dark:text-white">Global Agency Settings</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Agency Name</label>
                    <input
                      type="text"
                      required
                      value={editedSettings.agencyName}
                      onChange={(e) => setEditedSettings({ ...editedSettings, agencyName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <ImageUploader 
                      label="Logo Image"
                      value={editedSettings.logoUrl}
                      onChange={(newValue) => setEditedSettings({ ...editedSettings, logoUrl: newValue })}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">WhatsApp Direct Number (No spaces)</label>
                    <input
                      type="text"
                      required
                      value={editedSettings.whatsappNumber}
                      onChange={(e) => setEditedSettings({ ...editedSettings, whatsappNumber: e.target.value })}
                      placeholder="e.g. 8801700000000"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Footer Details Text</label>
                    <input
                      type="text"
                      required
                      value={editedSettings.footerText}
                      onChange={(e) => setEditedSettings({ ...editedSettings, footerText: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">bKash Payer Instruction (Number)</label>
                    <input
                      type="text"
                      required
                      value={editedSettings.bkashNumber}
                      onChange={(e) => setEditedSettings({ ...editedSettings, bkashNumber: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none font-semibold text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Nagad Instruction (Number)</label>
                    <input
                      type="text"
                      required
                      value={editedSettings.nagadNumber}
                      onChange={(e) => setEditedSettings({ ...editedSettings, nagadNumber: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none font-semibold text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Rocket Instruction (Number)</label>
                    <input
                      type="text"
                      required
                      value={editedSettings.rocketNumber}
                      onChange={(e) => setEditedSettings({ ...editedSettings, rocketNumber: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none font-semibold text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Upay Instruction (Number)</label>
                    <input
                      type="text"
                      required
                      value={editedSettings.upayNumber || ''}
                      onChange={(e) => setEditedSettings({ ...editedSettings, upayNumber: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none font-semibold text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Hero Section Display Heading</label>
                    <input
                      type="text"
                      required
                      value={editedSettings.heroTitle}
                      onChange={(e) => setEditedSettings({ ...editedSettings, heroTitle: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Hero Description Paragraph</label>
                    <textarea
                      required
                      rows={3}
                      value={editedSettings.heroSubtitle}
                      onChange={(e) => setEditedSettings({ ...editedSettings, heroSubtitle: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none resize-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <ImageUploader 
                      label="Hero Cover Illustration / Banner Image"
                      value={editedSettings.heroImage}
                      onChange={(newValue) => setEditedSettings({ ...editedSettings, heroImage: newValue })}
                      placeholder="https://example.com/hero-banner.jpg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">See All Design Link (Behance/Drive)</label>
                    <input
                      type="text"
                      required
                      value={editedSettings.graphicsSeeAllLink}
                      onChange={(e) => setEditedSettings({ ...editedSettings, graphicsSeeAllLink: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">See All Video Link (YouTube/Drive)</label>
                    <input
                      type="text"
                      required
                      value={editedSettings.videoSeeAllLink}
                      onChange={(e) => setEditedSettings({ ...editedSettings, videoSeeAllLink: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">See All Web Link (GitHub/Portfolio)</label>
                    <input
                      type="text"
                      required
                      value={editedSettings.webSeeAllLink}
                      onChange={(e) => setEditedSettings({ ...editedSettings, webSeeAllLink: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Meta Facebook Pixel Configuration */}
                <div className="bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100/70 dark:border-blue-900/30 p-6 rounded-3xl space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-600 text-white p-2.5 rounded-2xl shadow-md shadow-blue-600/10 shrink-0">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-sans font-bold text-sm text-slate-900 dark:text-white">Facebook Pixel (Meta Pixel) Integration</h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Track standard and custom events (PageView, ViewContent, InitiateCheckout, Lead, and Purchase) automatically. Ideal for running high-converting ads targeting students, course buyers, and agency clients.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">Facebook Pixel ID</label>
                      <input
                        type="text"
                        value={editedSettings.facebookPixelId || ''}
                        onChange={(e) => setEditedSettings({ ...editedSettings, facebookPixelId: e.target.value.trim() })}
                        placeholder="e.g. 102458934523912 (Leave blank to disable tracking)"
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-emerald-500 text-white font-bold text-sm px-8 py-3.5 rounded-2xl hover:bg-emerald-600 transition-colors shadow-lg cursor-pointer"
                >
                  Save Global Parameters
                </button>
              </form>
            )}

            {/* --- TAB: PORTFOLIO MANAGER --- */}
            {activeTab === 'portfolio' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 flex justify-between items-center">
                  <h4 className="font-sans font-bold text-lg text-slate-900 dark:text-white">Manage Portfolio Items</h4>
                  <button
                    onClick={() => handleOpenPortfolioModal()}
                    className="bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-emerald-500 dark:hover:bg-emerald-600 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Item</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {portfolioItems.map((item) => (
                    <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between">
                      <div className="space-y-3">
                        <img src={item.imageUrl} alt="" className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-800" />
                        <div>
                          <span className="text-[9px] bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider border border-slate-100 dark:border-slate-800">{item.category}</span>
                          <h5 className="font-sans font-bold text-slate-800 dark:text-slate-200 text-xs mt-1.5 line-clamp-1">{item.title}</h5>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t border-slate-200/50 dark:border-slate-800/60 mt-4">
                        <button
                          onClick={() => handleOpenPortfolioModal(item)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePortfolioItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- TAB: COURSE MANAGER --- */}
            {activeTab === 'courses' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 flex justify-between items-center">
                  <h4 className="font-sans font-bold text-lg text-slate-900 dark:text-white">Manage Live Courses</h4>
                  <button
                    onClick={() => handleOpenCourseModal()}
                    className="bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-emerald-500 dark:hover:bg-emerald-600 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Course</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {courses.map((course) => (
                    <div key={course.id} className="p-5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between">
                      <div className="space-y-3">
                        <img src={course.coverImage} alt="" className="w-full h-40 object-cover rounded-xl border border-slate-100 dark:border-slate-800" />
                        <div className="flex justify-between items-start">
                          <h5 className="font-sans font-bold text-slate-900 dark:text-white text-sm">{course.title}</h5>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs text-right whitespace-nowrap">৳{course.price}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{course.description}</p>
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t border-slate-200/50 dark:border-slate-800/60 mt-4">
                        <button
                          onClick={() => handleOpenCourseModal(course)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- TAB: EBOOK SHELF --- */}
            {activeTab === 'ebooks' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 flex justify-between items-center">
                  <h4 className="font-sans font-bold text-lg text-slate-900 dark:text-white">Manage eBook Inventory</h4>
                  <button
                    onClick={() => handleOpenEbookModal()}
                    className="bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-emerald-500 dark:hover:bg-emerald-600 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload New eBook</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ebooks.map((book) => (
                    <div key={book.id} className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between">
                      <div className="space-y-3">
                        <img src={book.coverImage} alt="" className="w-full h-40 object-cover rounded-xl border border-slate-100 dark:border-slate-800" />
                        <div className="flex justify-between items-start">
                          <h5 className="font-sans font-bold text-slate-800 dark:text-white text-xs mt-1">{book.title}</h5>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">৳{book.price}</span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t border-slate-200/50 dark:border-slate-800/60 mt-4">
                        <button
                          onClick={() => handleOpenEbookModal(book)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEbook(book.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- TAB: CLIENT INQUIRIES --- */}
            {activeTab === 'contacts' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <h4 className="font-sans font-bold text-lg text-slate-900 dark:text-white">Client Inquiries & Messages</h4>
                </div>

                {contacts.length === 0 ? (
                  <p className="text-slate-400 dark:text-slate-500 font-medium py-12 text-center text-sm">No client submissions found.</p>
                ) : (
                  <div className="space-y-4">
                    {contacts.map((c) => (
                      <div key={c.id} className="p-5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-sans font-bold text-slate-900 dark:text-white text-sm">{c.name}</h5>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{c.email}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-medium">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 inline-block px-2.5 py-1 rounded-lg border border-slate-100/50 dark:border-slate-800">
                          Subject: {c.subject}
                        </p>
                        <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100/50 dark:border-slate-800">
                          {c.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* --- TAB: SECURITY PASSWORD --- */}
            {activeTab === 'password' && (
              <form onSubmit={handleChangeCredentials} className="space-y-6 max-w-md">
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <h4 className="font-sans font-bold text-lg text-slate-900 dark:text-white">Update System Security Password</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Changes are saved securely in our cloud datastore immediately.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Admin Username</label>
                    <input
                      type="text"
                      required
                      value={newAdminUsername}
                      onChange={(e) => setNewAdminUsername(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">New Admin Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-4 pr-12 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-slate-900 dark:bg-slate-800 hover:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold text-sm px-6 py-3.5 rounded-2xl transition-colors shadow-lg cursor-pointer"
                >
                  Save New Password
                </button>
              </form>
            )}

            {/* --- TAB: PARTNER LOGOS --- */}
            {activeTab === 'partners' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800/80 pb-4 gap-4">
                  <div>
                    <h4 className="font-sans font-bold text-lg text-slate-900 dark:text-white">Partner & Client Logos</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Manage company names, website links, and logos for the homepage slideshow carousel.</p>
                  </div>
                  <button
                    onClick={() => openPartnerModal()}
                    className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap self-stretch sm:self-auto justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Partner Logo</span>
                  </button>
                </div>

                {partners.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-3xl">
                    <p className="text-slate-400 dark:text-slate-500 font-medium text-sm">No partner logo found.</p>
                    <button
                      onClick={() => openPartnerModal()}
                      className="mt-3 px-4 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Add First Partner Logo
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {partners.map((partner) => (
                      <div 
                        key={partner.id} 
                        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative group flex flex-col items-center text-center space-y-4"
                      >
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center p-3 border border-slate-100 dark:border-slate-800 shadow-inner overflow-hidden">
                          <img 
                            src={partner.logoUrl} 
                            alt={partner.name} 
                            className="max-w-full max-h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <h5 className="font-sans font-bold text-slate-900 dark:text-white text-sm">{partner.name}</h5>
                          {partner.websiteUrl ? (
                            <a 
                              href={partner.websiteUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-mono inline-flex items-center space-x-1 mt-0.5 max-w-[200px] truncate"
                            >
                              <span>{partner.websiteUrl}</span>
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 dark:text-slate-500 italic">No website link</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 pt-2 w-full justify-center border-t border-slate-50 dark:border-slate-800/60">
                          <button
                            onClick={() => openPartnerModal(partner)}
                            className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePartner(partner.id)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-red-950/40 dark:hover:bg-red-950/60 rounded-lg text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* --- MODAL: PARTNER ADD/EDIT --- */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm text-left">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <h4 className="font-sans font-bold text-lg text-slate-950 dark:text-white">
                {selectedPartnerId ? 'Edit Partner/Brand Logo' : 'Add Partner/Brand Logo'}
              </h4>
              <button onClick={() => setIsPartnerModalOpen(false)} className="text-slate-400 hover:text-slate-950 dark:hover:text-white text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSavePartner} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Company/Brand Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corporation"
                  value={partnerForm.name}
                  onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Website URL (Optional)</label>
                <input
                  type="url"
                  placeholder="e.g. https://acme.com"
                  value={partnerForm.websiteUrl}
                  onChange={(e) => setPartnerForm({ ...partnerForm, websiteUrl: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <ImageUploader
                  label="Company Logo Image"
                  value={partnerForm.logoUrl}
                  onChange={(val) => setPartnerForm({ ...partnerForm, logoUrl: val })}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPartnerModalOpen(false)}
                  className="w-1/2 py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-sm font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-slate-900 dark:bg-slate-800 hover:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer"
                >
                  {selectedPartnerId ? 'Update Brand' : 'Save Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: PORTFOLIO ADD/EDIT --- */}
      {isPortfolioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm text-left">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <h4 className="font-sans font-bold text-lg text-slate-950 dark:text-white">
                {selectedPortfolioId ? 'Edit Portfolio Asset' : 'Create Portfolio Asset'}
              </h4>
              <button onClick={() => setIsPortfolioModalOpen(false)} className="text-slate-400 hover:text-slate-950 dark:hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSavePortfolioItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">Asset Title</label>
                <input
                  type="text"
                  required
                  value={portfolioForm.title}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                  placeholder="Cinematic Corporate Ad Series"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">Category</label>
                <select
                  value={portfolioForm.category}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, category: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none font-semibold text-slate-700 dark:text-slate-200"
                >
                  <option value="Graphics Design" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Graphics Design</option>
                  <option value="Video Editing" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Video Editing</option>
                  <option value="Web Development" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Web Development</option>
                </select>
              </div>

              <div>
                <ImageUploader 
                  label="Portfolio Image / Thumbnail"
                  value={portfolioForm.imageUrl}
                  onChange={(newValue) => setPortfolioForm({ ...portfolioForm, imageUrl: newValue })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              {(portfolioForm.category === 'Web Development' || portfolioForm.category === 'Video Editing') && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">
                    {portfolioForm.category === 'Web Development' ? 'Live Demo URL' : 'Drive Link / Video Link'}
                  </label>
                  <input
                    type="text"
                    required
                    value={portfolioForm.demoLink}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, demoLink: e.target.value })}
                    placeholder={portfolioForm.category === 'Web Development' ? "https://my-live-demo-web.web.app" : "https://drive.google.com/..."}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-colors cursor-pointer"
              >
                Save Portfolio Item
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: COURSE ADD/EDIT --- */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm text-left">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h4 className="font-sans font-bold text-lg text-slate-950 dark:text-white">
                {selectedCourseId ? 'Edit Course Settings' : 'Create Course'}
              </h4>
              <button onClick={() => setIsCourseModalOpen(false)} className="text-slate-400 hover:text-slate-950 dark:hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">Course Title</label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">Price (BDT ৳)</label>
                  <input
                    type="number"
                    required
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none font-mono text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <ImageUploader 
                    label="Course Cover Image / Thumbnail"
                    value={courseForm.coverImage}
                    onChange={(newValue) => setCourseForm({ ...courseForm, coverImage: newValue })}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">Description Overview</label>
                <textarea
                  required
                  rows={3}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none resize-none text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">Syllabus Modules (One line per module)</label>
                <textarea
                  required
                  rows={4}
                  value={courseForm.modules}
                  onChange={(e) => setCourseForm({ ...courseForm, modules: e.target.value })}
                  placeholder="Module 1: Semantic HTML/CSS&#10;Module 2: Advanced JavaScript (ES6)"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none font-semibold text-slate-600 dark:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">Google Drive Share Folder Link</label>
                <input
                  type="text"
                  required
                  value={courseForm.driveLink}
                  onChange={(e) => setCourseForm({ ...courseForm, driveLink: e.target.value })}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-colors cursor-pointer"
              >
                Save Course Details
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: EBOOK ADD/EDIT --- */}
      {isEbookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm text-left">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h4 className="font-sans font-bold text-lg text-slate-950 dark:text-white">
                {selectedEbookId ? 'Edit eBook Settings' : 'Upload eBook'}
              </h4>
              <button onClick={() => setIsEbookModalOpen(false)} className="text-slate-400 hover:text-slate-950 dark:hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveEbook} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">eBook Title</label>
                <input
                  type="text"
                  required
                  value={ebookForm.title}
                  onChange={(e) => setEbookForm({ ...ebookForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">Price (BDT ৳)</label>
                  <input
                    type="number"
                    required
                    value={ebookForm.price}
                    onChange={(e) => setEbookForm({ ...ebookForm, price: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none font-mono text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <ImageUploader 
                    label="eBook Cover Photo / Thumbnail"
                    value={ebookForm.coverImage}
                    onChange={(newValue) => setEbookForm({ ...ebookForm, coverImage: newValue })}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">Description Overview</label>
                <textarea
                  required
                  rows={4}
                  value={ebookForm.description}
                  onChange={(e) => setEbookForm({ ...ebookForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none resize-none text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">Google Drive Download File Link</label>
                <input
                  type="text"
                  required
                  value={ebookForm.driveLink}
                  onChange={(e) => setEbookForm({ ...ebookForm, driveLink: e.target.value })}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-colors cursor-pointer"
              >
                Save eBook
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
