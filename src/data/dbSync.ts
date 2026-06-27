import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where,
  orderBy
} from '../firebase';
import { isSupabaseEnabled, supabase } from '../supabase';
import { hashPassword } from '../utils/crypto';
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
  DEFAULT_SETTINGS, 
  DEFAULT_PORTFOLIO, 
  DEFAULT_COURSES, 
  DEFAULT_EBOOKS 
} from './defaultData';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleDbError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path
  };
  console.error('Database Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- SUPABASE DATA CONVERTERS ---
function mapToSupabaseSettings(s: AgencySettings) {
  return {
    id: 'settings',
    agency_name: s.agencyName,
    logo_url: s.logoUrl,
    whatsapp_number: s.whatsappNumber,
    bkash_number: s.bkashNumber,
    nagad_number: s.nagadNumber,
    rocket_number: s.rocketNumber,
    upay_number: s.upayNumber || '',
    footer_text: s.footerText,
    about_text: s.aboutText,
    hero_title: s.heroTitle,
    hero_subtitle: s.heroSubtitle,
    hero_image: s.heroImage,
    graphics_see_all_link: s.graphicsSeeAllLink,
    video_see_all_link: s.videoSeeAllLink,
    web_see_all_link: s.webSeeAllLink,
    facebook_pixel_id: s.facebookPixelId || ''
  };
}

function mapFromSupabaseSettings(row: any): AgencySettings {
  return {
    id: 'settings',
    agencyName: row.agency_name || '',
    logoUrl: row.logo_url || '',
    whatsappNumber: row.whatsapp_number || '',
    bkashNumber: row.bkash_number || '',
    nagadNumber: row.nagad_number || '',
    rocketNumber: row.rocket_number || '',
    upayNumber: row.upay_number || '',
    footerText: row.footer_text || '',
    aboutText: row.about_text || '',
    heroTitle: row.hero_title || '',
    heroSubtitle: row.hero_subtitle || '',
    heroImage: row.hero_image || '',
    graphicsSeeAllLink: row.graphics_see_all_link || '#',
    videoSeeAllLink: row.video_see_all_link || '#',
    webSeeAllLink: row.web_see_all_link || '#',
    facebookPixelId: row.facebook_pixel_id || ''
  };
}

function mapToSupabasePortfolio(p: PortfolioItem) {
  return {
    id: p.id,
    title: p.title,
    category: p.category,
    image_url: p.imageUrl,
    demo_link: p.demoLink || '',
    created_at: p.createdAt
  };
}

function mapFromSupabasePortfolio(row: any): PortfolioItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category as any,
    imageUrl: row.image_url || '',
    demoLink: row.demo_link || '',
    createdAt: Number(row.created_at || Date.now())
  };
}

function mapToSupabaseCourse(c: Course) {
  return {
    id: c.id,
    title: c.title,
    cover_image: c.coverImage,
    price: c.price,
    description: c.description,
    modules: c.modules,
    drive_link: c.driveLink,
    created_at: c.createdAt
  };
}

function mapFromSupabaseCourse(row: any): Course {
  return {
    id: row.id,
    title: row.title,
    coverImage: row.cover_image || '',
    price: Number(row.price || 0),
    description: row.description || '',
    modules: Array.isArray(row.modules) ? row.modules : [],
    driveLink: row.drive_link || '',
    createdAt: Number(row.created_at || Date.now())
  };
}

function mapToSupabaseEbook(e: Ebook) {
  return {
    id: e.id,
    title: e.title,
    cover_image: e.coverImage,
    price: e.price,
    description: e.description,
    drive_link: e.driveLink,
    created_at: e.createdAt
  };
}

function mapFromSupabaseEbook(row: any): Ebook {
  return {
    id: row.id,
    title: row.title,
    coverImage: row.cover_image || '',
    price: Number(row.price || 0),
    description: row.description || '',
    driveLink: row.drive_link || '',
    createdAt: Number(row.created_at || Date.now())
  };
}

function mapToSupabaseEnrollment(en: Enrollment) {
  return {
    id: en.id,
    student_id: en.studentId,
    student_name: en.studentName,
    student_email: en.studentEmail,
    student_phone: en.studentPhone,
    item_type: en.itemType,
    item_id: en.itemId,
    item_title: en.itemTitle,
    payment_method: en.paymentMethod,
    payment_phone: en.paymentPhone,
    transaction_id: en.transactionId,
    status: en.status,
    drive_link: en.driveLink || '',
    country: en.country || '',
    district: en.district || '',
    notes: en.notes || '',
    paid_amount: en.paidAmount || 0,
    screenshot_url: en.screenshotUrl || '',
    created_at: en.createdAt
  };
}

function mapFromSupabaseEnrollment(row: any): Enrollment {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    studentEmail: row.student_email,
    studentPhone: row.student_phone,
    itemType: row.item_type as any,
    itemId: row.item_id,
    itemTitle: row.item_title,
    paymentMethod: row.payment_method as any,
    paymentPhone: row.payment_phone,
    transactionId: row.transaction_id,
    status: row.status as any,
    driveLink: row.drive_link || '',
    country: row.country || '',
    district: row.district || '',
    notes: row.notes || '',
    paidAmount: row.paid_amount ? Number(row.paid_amount) : 0,
    screenshotUrl: row.screenshot_url || '',
    createdAt: Number(row.created_at || Date.now())
  };
}

function mapToSupabaseSubmission(s: ContactSubmission) {
  return {
    id: s.id,
    name: s.name,
    email: s.email,
    subject: s.subject,
    message: s.message,
    created_at: s.createdAt
  };
}

function mapFromSupabaseSubmission(row: any): ContactSubmission {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    createdAt: Number(row.created_at || Date.now())
  };
}

function mapToSupabasePartner(p: Partner) {
  return {
    id: p.id,
    name: p.name,
    logo_url: p.logoUrl,
    website_url: p.websiteUrl || '',
    created_at: p.createdAt
  };
}

function mapFromSupabasePartner(row: any): Partner {
  return {
    id: row.id,
    name: row.name,
    logoUrl: row.logo_url || '',
    websiteUrl: row.website_url || '',
    createdAt: Number(row.created_at || Date.now())
  };
}

// --- SEED DATABASE IF EMPTY ---
export async function seedDatabaseIfEmpty() {
  try {
    if (typeof window !== 'undefined' && localStorage.getItem('pixelcraft_db_seeded') === 'true') {
      return;
    }

    if (isSupabaseEnabled && supabase) {
      console.log('Seeding Supabase checking process started...');
      const { data: settingsData } = await supabase.from('settings').select('*');
      const { data: adminData } = await supabase.from('admin').select('*');
      const { data: portfolioData } = await supabase.from('portfolio').select('*');
      const { data: coursesData } = await supabase.from('courses').select('*');
      const { data: ebooksData } = await supabase.from('ebooks').select('*');

      const seedPromises: Promise<any>[] = [];

      if (!settingsData || settingsData.length === 0) {
        seedPromises.push(Promise.resolve(supabase.from('settings').insert([mapToSupabaseSettings(DEFAULT_SETTINGS)])));
      }
      if (!adminData || adminData.length === 0) {
        const defaultHash = await hashPassword('admin1');
        seedPromises.push(Promise.resolve(supabase.from('admin').insert([{ username: 'admin', password: defaultHash }])));
      }
      if (!portfolioData || portfolioData.length === 0) {
        seedPromises.push(Promise.resolve(supabase.from('portfolio').insert(DEFAULT_PORTFOLIO.map(mapToSupabasePortfolio))));
      }
      if (!coursesData || coursesData.length === 0) {
        seedPromises.push(Promise.resolve(supabase.from('courses').insert(DEFAULT_COURSES.map(mapToSupabaseCourse))));
      }
      if (!ebooksData || ebooksData.length === 0) {
        seedPromises.push(Promise.resolve(supabase.from('ebooks').insert(DEFAULT_EBOOKS.map(mapToSupabaseEbook))));
      }

      if (seedPromises.length > 0) {
        await Promise.all(seedPromises);
        console.log('Supabase Seed Complete!');
      }
    } else {
      // Seed Firestore fallback
      const settingsRef = doc(db, 'settings', 'settings');
      const adminRef = doc(db, 'admin', 'credentials');
      const portfolioCol = collection(db, 'portfolio');
      const coursesCol = collection(db, 'courses');
      const ebooksCol = collection(db, 'ebooks');

      const [settingsSnap, adminSnap, portfolioSnap, coursesSnap, ebooksSnap] = await Promise.all([
        getDoc(settingsRef).catch((error) => handleDbError(error, OperationType.GET, 'settings/settings')),
        getDoc(adminRef).catch((error) => handleDbError(error, OperationType.GET, 'admin/credentials')),
        getDocs(portfolioCol).catch((error) => handleDbError(error, OperationType.LIST, 'portfolio')),
        getDocs(coursesCol).catch((error) => handleDbError(error, OperationType.LIST, 'courses')),
        getDocs(ebooksCol).catch((error) => handleDbError(error, OperationType.LIST, 'ebooks'))
      ]);

      const seedPromises: Promise<any>[] = [];

      if (settingsSnap && !settingsSnap.exists()) {
        seedPromises.push(setDoc(settingsRef, DEFAULT_SETTINGS));
      }

      if (adminSnap && !adminSnap.exists()) {
        const defaultHash = await hashPassword('admin1');
        seedPromises.push(setDoc(adminRef, { username: 'admin', password: defaultHash }));
      }

      if (portfolioSnap && portfolioSnap.empty) {
        for (const item of DEFAULT_PORTFOLIO) {
          seedPromises.push(setDoc(doc(portfolioCol, item.id), item));
        }
      }

      if (coursesSnap && coursesSnap.empty) {
        for (const item of DEFAULT_COURSES) {
          seedPromises.push(setDoc(doc(coursesCol, item.id), item));
        }
      }

      if (ebooksSnap && ebooksSnap.empty) {
        for (const item of DEFAULT_EBOOKS) {
          seedPromises.push(setDoc(doc(ebooksCol, item.id), item));
        }
      }

      if (seedPromises.length > 0) {
        await Promise.all(seedPromises);
        console.log('Firestore Seed Complete!');
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('pixelcraft_db_seeded', 'true');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// --- GETTERS ---

export async function getAgencySettings(): Promise<AgencySettings> {
  try {
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase.from('settings').select('*').eq('id', 'settings').single();
      if (error) {
        // Fallback if settings table hasn't been seeded yet
        return DEFAULT_SETTINGS;
      }
      return mapFromSupabaseSettings(data);
    } else {
      const settingsRef = doc(db, 'settings', 'settings');
      const snap = await getDoc(settingsRef);
      if (snap.exists()) {
        return snap.data() as AgencySettings;
      }
      return DEFAULT_SETTINGS;
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function getAdminCredentials() {
  try {
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase.from('admin').select('*').limit(1);
      if (error || !data || data.length === 0) {
        const defaultHash = await hashPassword('admin1');
        return { username: 'admin', password: defaultHash };
      }
      return { username: data[0].username, password: data[0].password };
    } else {
      const adminRef = doc(db, 'admin', 'credentials');
      const snap = await getDoc(adminRef);
      if (snap.exists()) {
        return snap.data() as { username: string; password?: string };
      }
      const defaultHash = await hashPassword('admin1');
      return { username: 'admin', password: defaultHash };
    }
  } catch (error) {
    console.error('Error fetching admin credentials:', error);
    const defaultHash = await hashPassword('admin1');
    return { username: 'admin', password: defaultHash };
  }
}

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  try {
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase.from('portfolio').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapFromSupabasePortfolio);
    } else {
      const colRef = collection(db, 'portfolio');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const items: PortfolioItem[] = [];
      snap.forEach((doc) => {
        items.push(doc.data() as PortfolioItem);
      });
      return items;
    }
  } catch (error) {
    handleDbError(error, OperationType.LIST, 'portfolio');
    return [];
  }
}

export async function getCourses(): Promise<Course[]> {
  try {
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapFromSupabaseCourse);
    } else {
      const colRef = collection(db, 'courses');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const items: Course[] = [];
      snap.forEach((doc) => {
        items.push(doc.data() as Course);
      });
      return items;
    }
  } catch (error) {
    handleDbError(error, OperationType.LIST, 'courses');
    return [];
  }
}

export async function getEbooks(): Promise<Ebook[]> {
  try {
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase.from('ebooks').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapFromSupabaseEbook);
    } else {
      const colRef = collection(db, 'ebooks');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const items: Ebook[] = [];
      snap.forEach((doc) => {
        items.push(doc.data() as Ebook);
      });
      return items;
    }
  } catch (error) {
    handleDbError(error, OperationType.LIST, 'ebooks');
    return [];
  }
}

export async function getEnrollments(): Promise<Enrollment[]> {
  try {
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase.from('enrollments').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapFromSupabaseEnrollment);
    } else {
      const colRef = collection(db, 'enrollments');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const items: Enrollment[] = [];
      snap.forEach((doc) => {
        items.push(doc.data() as Enrollment);
      });
      return items;
    }
  } catch (error) {
    handleDbError(error, OperationType.LIST, 'enrollments');
    return [];
  }
}

export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  try {
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase.from('submissions').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapFromSupabaseSubmission);
    } else {
      const colRef = collection(db, 'submissions');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const items: ContactSubmission[] = [];
      snap.forEach((doc) => {
        items.push(doc.data() as ContactSubmission);
      });
      return items;
    }
  } catch (error) {
    handleDbError(error, OperationType.LIST, 'submissions');
    return [];
  }
}

// --- SETTERS & MUTATIONS ---

export async function updateAgencySettings(settings: AgencySettings): Promise<void> {
  try {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('settings').upsert([mapToSupabaseSettings(settings)]);
      if (error) throw error;
    } else {
      const settingsRef = doc(db, 'settings', 'settings');
      await setDoc(settingsRef, settings);
    }
  } catch (error) {
    handleDbError(error, OperationType.WRITE, 'settings/settings');
  }
}

export async function updateAdminCredentials(username: string, passwordPlain: string): Promise<void> {
  try {
    // Encrypt/Hash the password before saving for high security!
    const passwordHash = await hashPassword(passwordPlain);

    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('admin').upsert([{ username, password: passwordHash }]);
      if (error) throw error;
    } else {
      const adminRef = doc(db, 'admin', 'credentials');
      await setDoc(adminRef, { username, password: passwordHash });
    }
  } catch (error) {
    handleDbError(error, OperationType.WRITE, 'admin/credentials');
  }
}

// Portfolio Mutations
export async function addPortfolioItem(item: Omit<PortfolioItem, 'id' | 'createdAt'>): Promise<void> {
  const id = 'portfolio_' + Math.random().toString(36).substr(2, 9);
  const newItem: PortfolioItem = {
    ...item,
    id,
    createdAt: Date.now()
  };
  try {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('portfolio').insert([mapToSupabasePortfolio(newItem)]);
      if (error) throw error;
    } else {
      const colRef = collection(db, 'portfolio');
      await setDoc(doc(colRef, id), newItem);
    }
  } catch (error) {
    handleDbError(error, OperationType.WRITE, `portfolio/${id}`);
  }
}

export async function updatePortfolioItem(id: string, updates: Partial<PortfolioItem>): Promise<void> {
  try {
    if (isSupabaseEnabled && supabase) {
      // Map parameters
      const mappedUpdates: any = {};
      if (updates.title !== undefined) mappedUpdates.title = updates.title;
      if (updates.category !== undefined) mappedUpdates.category = updates.category;
      if (updates.imageUrl !== undefined) mappedUpdates.image_url = updates.imageUrl;
      if (updates.demoLink !== undefined) mappedUpdates.demo_link = updates.demoLink;
      
      const { error } = await supabase.from('portfolio').update(mappedUpdates).eq('id', id);
      if (error) throw error;
    } else {
      const docRef = doc(db, 'portfolio', id);
      await updateDoc(docRef, updates);
    }
  } catch (error) {
    handleDbError(error, OperationType.WRITE, `portfolio/${id}`);
  }
}

export async function deletePortfolioItem(id: string): Promise<void> {
  try {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('portfolio').delete().eq('id', id);
      if (error) throw error;
    } else {
      const docRef = doc(db, 'portfolio', id);
      await deleteDoc(docRef);
    }
  } catch (error) {
    handleDbError(error, OperationType.DELETE, `portfolio/${id}`);
  }
}

// Course Mutations
export async function saveCourse(course: Omit<Course, 'id' | 'createdAt'>, id?: string): Promise<void> {
  const courseId = id || 'course_' + Math.random().toString(36).substr(2, 9);
  const data: Course = {
    ...course,
    id: courseId,
    createdAt: Date.now()
  };
  try {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('courses').upsert([mapToSupabaseCourse(data)]);
      if (error) throw error;
    } else {
      const colRef = collection(db, 'courses');
      await setDoc(doc(colRef, courseId), data);
    }
  } catch (error) {
    handleDbError(error, OperationType.WRITE, `courses/${courseId}`);
  }
}

export async function deleteCourse(id: string): Promise<void> {
  try {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
    } else {
      const docRef = doc(db, 'courses', id);
      await deleteDoc(docRef);
    }
  } catch (error) {
    handleDbError(error, OperationType.DELETE, `courses/${id}`);
  }
}

// Ebook Mutations
export async function saveEbook(ebook: Omit<Ebook, 'id' | 'createdAt'>, id?: string): Promise<void> {
  const ebookId = id || 'ebook_' + Math.random().toString(36).substr(2, 9);
  const data: Ebook = {
    ...ebook,
    id: ebookId,
    createdAt: Date.now()
  };
  try {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('ebooks').upsert([mapToSupabaseEbook(data)]);
      if (error) throw error;
    } else {
      const colRef = collection(db, 'ebooks');
      await setDoc(doc(colRef, ebookId), data);
    }
  } catch (error) {
    handleDbError(error, OperationType.WRITE, `ebooks/${ebookId}`);
  }
}

export async function deleteEbook(id: string): Promise<void> {
  try {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('ebooks').delete().eq('id', id);
      if (error) throw error;
    } else {
      const docRef = doc(db, 'ebooks', id);
      await deleteDoc(docRef);
    }
  } catch (error) {
    handleDbError(error, OperationType.DELETE, `ebooks/${id}`);
  }
}

// Contact Submissions
export async function addContactSubmission(submission: Omit<ContactSubmission, 'id' | 'createdAt'>): Promise<void> {
  const id = 'sub_' + Math.random().toString(36).substr(2, 9);
  const data: ContactSubmission = {
    ...submission,
    id,
    createdAt: Date.now()
  };
  try {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('submissions').insert([mapToSupabaseSubmission(data)]);
      if (error) throw error;
    } else {
      const colRef = collection(db, 'submissions');
      await setDoc(doc(colRef, id), data);
    }
  } catch (error) {
    handleDbError(error, OperationType.WRITE, `submissions/${id}`);
  }
}

// Student & Enrollment Operations
export async function createStudentEnrollment(
  enrollment: Omit<Enrollment, 'id' | 'status' | 'driveLink' | 'createdAt'>
): Promise<void> {
  const id = 'enroll_' + Math.random().toString(36).substr(2, 9);
  
  const newEnrollment: Enrollment = {
    ...enrollment,
    id,
    status: 'pending',
    driveLink: '',
    createdAt: Date.now()
  };
  
  try {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('enrollments').insert([mapToSupabaseEnrollment(newEnrollment)]);
      if (error) throw error;
    } else {
      const colRef = collection(db, 'enrollments');
      await setDoc(doc(colRef, id), newEnrollment);
    }
  } catch (error) {
    handleDbError(error, OperationType.WRITE, `enrollments/${id}`);
  }
}

export async function updateEnrollmentStatus(
  id: string, 
  status: 'pending' | 'approved' | 'rejected', 
  driveLink: string
): Promise<void> {
  try {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('enrollments').update({ status, drive_link: driveLink }).eq('id', id);
      if (error) throw error;
    } else {
      const docRef = doc(db, 'enrollments', id);
      await updateDoc(docRef, { status, driveLink });
    }
  } catch (error) {
    handleDbError(error, OperationType.WRITE, `enrollments/${id}`);
  }
}

export async function getStudentEnrollments(phone: string, email: string): Promise<Enrollment[]> {
  try {
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_email', email.trim().toLowerCase());
        
      if (error) throw error;
      
      return (data || [])
        .map(mapFromSupabaseEnrollment)
        .filter((item) => item.studentPhone.trim() === phone.trim());
    } else {
      const colRef = collection(db, 'enrollments');
      const q = query(
        colRef, 
        where('studentEmail', '==', email.trim().toLowerCase())
      );
      const snap = await getDocs(q);
      const items: Enrollment[] = [];
      snap.forEach((doc) => {
        const data = doc.data() as Enrollment;
        if (data.studentPhone.trim() === phone.trim()) {
          items.push(data);
        }
      });
      return items;
    }
  } catch (error) {
    handleDbError(error, OperationType.LIST, 'enrollments');
    return [];
  }
}

// --- PARTNERS/CLIENTS MUTATIONS & GETTERS ---
export async function getPartners(): Promise<Partner[]> {
  try {
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase.from('partners').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapFromSupabasePartner);
    } else {
      const colRef = collection(db, 'partners');
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const items: Partner[] = [];
      snap.forEach((doc) => {
        items.push(doc.data() as Partner);
      });
      return items;
    }
  } catch (error) {
    handleDbError(error, OperationType.LIST, 'partners');
    return [];
  }
}

export async function savePartner(partner: Omit<Partner, 'id' | 'createdAt'>, id?: string): Promise<void> {
  const partnerId = id || 'partner_' + Math.random().toString(36).substr(2, 9);
  const data: Partner = {
    ...partner,
    id: partnerId,
    createdAt: Date.now()
  };
  try {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('partners').upsert([mapToSupabasePartner(data)]);
      if (error) throw error;
    } else {
      const colRef = collection(db, 'partners');
      await setDoc(doc(colRef, partnerId), data);
    }
  } catch (error) {
    handleDbError(error, OperationType.WRITE, `partners/${partnerId}`);
  }
}

export async function deletePartner(id: string): Promise<void> {
  try {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.from('partners').delete().eq('id', id);
      if (error) throw error;
    } else {
      const docRef = doc(db, 'partners', id);
      await deleteDoc(docRef);
    }
  } catch (error) {
    handleDbError(error, OperationType.DELETE, `partners/${id}`);
  }
}
