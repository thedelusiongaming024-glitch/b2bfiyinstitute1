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

let supabaseSchemaMissing = false;

export function getSupabaseSchemaMissing() {
  return supabaseSchemaMissing;
}

export function setSupabaseSchemaMissing(val: boolean) {
  supabaseSchemaMissing = val;
}

function handleSupabaseError(error: any, context: string) {
  const errMsg = error && (error.message ? String(error.message).toLowerCase() : '');
  const errCode = error && error.code;
  if (
    error && (
      errCode === 'PGRST205' || 
      errCode === '42P01' || 
      errMsg.includes('schema cache') || 
      errMsg.includes('does not exist') || 
      errMsg.includes('not found') ||
      errMsg.includes('relation')
    )
  ) {
    supabaseSchemaMissing = true;
  }
  if (supabaseSchemaMissing) {
    console.info(`Supabase setup status: missing tables. Falling back to local cache for: ${context}`);
  } else {
    console.warn(`Error fetching ${context}, falling back to cache:`, error);
  }
}

// --- LOCAL STORAGE CACHING HELPERS ---
const CACHE_KEYS = {
  SETTINGS: 'pixelcraft_cache_settings',
  PORTFOLIO: 'pixelcraft_cache_portfolio',
  COURSES: 'pixelcraft_cache_courses',
  EBOOKS: 'pixelcraft_cache_ebooks',
  PARTNERS: 'pixelcraft_cache_partners',
  ADMIN: 'pixelcraft_cache_admin',
  ENROLLMENTS: 'pixelcraft_cache_enrollments',
  SUBMISSIONS: 'pixelcraft_cache_submissions',
};

function getLocalCache<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : defaultValue;
  } catch (e) {
    console.error('Cache read error:', e);
    return defaultValue;
  }
}

function setLocalCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Cache write error:', e);
  }
}

// --- IDENTITY / SANITIZE HELPER ---
export function sanitizeForFirestore<T>(obj: T): T {
  return obj;
}

// --- SUPABASE DATA CONVERTERS ---
function mapToSupabaseSettings(s: AgencySettings) {
  return {
    id: 'settings',
    agency_name: s.agencyName,
    logo_url: s.logoUrl,
    favicon_url: s.faviconUrl || '',
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
    faviconUrl: row.favicon_url || '',
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

function parseSupabaseDate(val: any): number {
  if (!val) return Date.now();
  if (typeof val === 'number') return val;
  if (typeof val === 'string' && /^\d+$/.test(val)) {
    return Number(val);
  }
  const parsed = new Date(val).getTime();
  return isNaN(parsed) ? Date.now() : parsed;
}

function toSupabaseDate(val: number | string | undefined | null): string {
  if (!val) return new Date().toISOString();
  if (typeof val === 'number') {
    return new Date(val).toISOString();
  }
  if (typeof val === 'string' && /^\d+$/.test(val)) {
    return new Date(Number(val)).toISOString();
  }
  const parsed = new Date(val).getTime();
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString();
  }
  return new Date().toISOString();
}

function mapToSupabasePortfolio(p: PortfolioItem) {
  return {
    id: p.id,
    title: p.title,
    category: p.category,
    image_url: p.imageUrl,
    demo_link: p.demoLink || '',
    created_at: toSupabaseDate(p.createdAt)
  };
}

function mapFromSupabasePortfolio(row: any): PortfolioItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category as any,
    imageUrl: row.image_url || '',
    demoLink: row.demo_link || '',
    createdAt: parseSupabaseDate(row.created_at)
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
    created_at: toSupabaseDate(c.createdAt)
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
    createdAt: parseSupabaseDate(row.created_at)
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
    created_at: toSupabaseDate(e.createdAt)
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
    createdAt: parseSupabaseDate(row.created_at)
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
    created_at: toSupabaseDate(en.createdAt)
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
    createdAt: parseSupabaseDate(row.created_at)
  };
}

function mapToSupabaseSubmission(s: ContactSubmission) {
  return {
    id: s.id,
    name: s.name,
    email: s.email,
    subject: s.subject,
    message: s.message,
    created_at: toSupabaseDate(s.createdAt)
  };
}

function mapFromSupabaseSubmission(row: any): ContactSubmission {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    createdAt: parseSupabaseDate(row.created_at)
  };
}

function mapToSupabasePartner(p: Partner) {
  return {
    id: p.id,
    name: p.name,
    logo_url: p.logoUrl,
    website_url: p.websiteUrl || '',
    created_at: toSupabaseDate(p.createdAt)
  };
}

function mapFromSupabasePartner(row: any): Partner {
  return {
    id: row.id,
    name: row.name,
    logoUrl: row.logo_url || '',
    websiteUrl: row.website_url || '',
    createdAt: parseSupabaseDate(row.created_at)
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
      // Seed local storage cache
      if (!localStorage.getItem(CACHE_KEYS.SETTINGS)) {
        setLocalCache(CACHE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      }
      if (!localStorage.getItem(CACHE_KEYS.ADMIN)) {
        const defaultHash = await hashPassword('admin1');
        setLocalCache(CACHE_KEYS.ADMIN, { username: 'admin', password: defaultHash });
      }
      if (!localStorage.getItem(CACHE_KEYS.PORTFOLIO)) {
        setLocalCache(CACHE_KEYS.PORTFOLIO, DEFAULT_PORTFOLIO);
      }
      if (!localStorage.getItem(CACHE_KEYS.COURSES)) {
        setLocalCache(CACHE_KEYS.COURSES, DEFAULT_COURSES);
      }
      if (!localStorage.getItem(CACHE_KEYS.EBOOKS)) {
        setLocalCache(CACHE_KEYS.EBOOKS, DEFAULT_EBOOKS);
      }
      console.log('Local Cache Seed Complete!');
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
  if (isSupabaseEnabled && supabase && !getSupabaseSchemaMissing()) {
    try {
      const { data, error } = await supabase.from('settings').select('*').eq('id', 'settings').maybeSingle();
      if (error) {
        handleSupabaseError(error, 'settings');
        return getLocalCache<AgencySettings>(CACHE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      }
      
      if (!data) {
        console.info('No settings found in Supabase. Using local settings or defaults...');
        const currentLocal = getLocalCache<AgencySettings>(CACHE_KEYS.SETTINGS, DEFAULT_SETTINGS);
        const mappedLocal = mapToSupabaseSettings(currentLocal);
        const { error: insertError } = await supabase.from('settings').upsert([mappedLocal]);
        if (insertError) {
          if (insertError.code === '23505') {
            console.info('Settings already inserted by another concurrent process.');
          } else {
            handleSupabaseError(insertError, 'settings default insert');
          }
        }
        return currentLocal;
      }

      const settings = mapFromSupabaseSettings(data);
      setLocalCache(CACHE_KEYS.SETTINGS, settings);
      return settings;
    } catch (error) {
      handleSupabaseError(error, 'settings');
      return getLocalCache<AgencySettings>(CACHE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
  }
  return getLocalCache<AgencySettings>(CACHE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export async function getAdminCredentials() {
  const defaultHash = await hashPassword('admin1');
  const defaultCreds = { username: 'admin', password: defaultHash };

  if (isSupabaseEnabled && supabase && !getSupabaseSchemaMissing()) {
    try {
      const { data, error } = await supabase.from('admin').select('*').limit(1);
      if (error) {
        handleSupabaseError(error, 'admin credentials');
        return getLocalCache(CACHE_KEYS.ADMIN, defaultCreds);
      } else if (!data || data.length === 0) {
        return defaultCreds;
      } else {
        const creds = { username: data[0].username, password: data[0].password };
        setLocalCache(CACHE_KEYS.ADMIN, creds);
        return creds;
      }
    } catch (error) {
      handleSupabaseError(error, 'admin credentials');
      return getLocalCache(CACHE_KEYS.ADMIN, defaultCreds);
    }
  }
  return getLocalCache(CACHE_KEYS.ADMIN, defaultCreds);
}

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  if (isSupabaseEnabled && supabase && !getSupabaseSchemaMissing()) {
    try {
      const { data, error } = await supabase.from('portfolio').select('*').order('created_at', { ascending: false });
      if (error) {
        handleSupabaseError(error, 'portfolio items');
        return getLocalCache<PortfolioItem[]>(CACHE_KEYS.PORTFOLIO, DEFAULT_PORTFOLIO);
      } else {
        const items = (data || []).map(mapFromSupabasePortfolio);
        setLocalCache(CACHE_KEYS.PORTFOLIO, items);
        return items;
      }
    } catch (error) {
      handleSupabaseError(error, 'portfolio items');
      return getLocalCache<PortfolioItem[]>(CACHE_KEYS.PORTFOLIO, DEFAULT_PORTFOLIO);
    }
  }
  return getLocalCache<PortfolioItem[]>(CACHE_KEYS.PORTFOLIO, DEFAULT_PORTFOLIO);
}

export async function getCourses(): Promise<Course[]> {
  if (isSupabaseEnabled && supabase && !getSupabaseSchemaMissing()) {
    try {
      const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
      if (error) {
        handleSupabaseError(error, 'courses');
        return getLocalCache<Course[]>(CACHE_KEYS.COURSES, DEFAULT_COURSES);
      } else {
        const items = (data || []).map(mapFromSupabaseCourse);
        setLocalCache(CACHE_KEYS.COURSES, items);
        return items;
      }
    } catch (error) {
      handleSupabaseError(error, 'courses');
      return getLocalCache<Course[]>(CACHE_KEYS.COURSES, DEFAULT_COURSES);
    }
  }
  return getLocalCache<Course[]>(CACHE_KEYS.COURSES, DEFAULT_COURSES);
}

export async function getEbooks(): Promise<Ebook[]> {
  if (isSupabaseEnabled && supabase && !getSupabaseSchemaMissing()) {
    try {
      const { data, error } = await supabase.from('ebooks').select('*').order('created_at', { ascending: false });
      if (error) {
        handleSupabaseError(error, 'ebooks');
        return getLocalCache<Ebook[]>(CACHE_KEYS.EBOOKS, DEFAULT_EBOOKS);
      } else {
        const items = (data || []).map(mapFromSupabaseEbook);
        setLocalCache(CACHE_KEYS.EBOOKS, items);
        return items;
      }
    } catch (error) {
      handleSupabaseError(error, 'ebooks');
      return getLocalCache<Ebook[]>(CACHE_KEYS.EBOOKS, DEFAULT_EBOOKS);
    }
  }
  return getLocalCache<Ebook[]>(CACHE_KEYS.EBOOKS, DEFAULT_EBOOKS);
}

export async function getEnrollments(): Promise<Enrollment[]> {
  if (isSupabaseEnabled && supabase && !getSupabaseSchemaMissing()) {
    try {
      const { data, error } = await supabase.from('enrollments').select('*').order('created_at', { ascending: false });
      if (error) {
        handleSupabaseError(error, 'enrollments');
        return getLocalCache<Enrollment[]>(CACHE_KEYS.ENROLLMENTS, []);
      } else {
        const items = (data || []).map(mapFromSupabaseEnrollment);
        setLocalCache(CACHE_KEYS.ENROLLMENTS, items);
        return items;
      }
    } catch (error) {
      handleSupabaseError(error, 'enrollments');
      return getLocalCache<Enrollment[]>(CACHE_KEYS.ENROLLMENTS, []);
    }
  }
  return getLocalCache<Enrollment[]>(CACHE_KEYS.ENROLLMENTS, []);
}

export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  if (isSupabaseEnabled && supabase && !getSupabaseSchemaMissing()) {
    try {
      const { data, error } = await supabase.from('submissions').select('*').order('created_at', { ascending: false });
      if (error) {
        handleSupabaseError(error, 'submissions');
        return getLocalCache<ContactSubmission[]>(CACHE_KEYS.SUBMISSIONS, []);
      } else {
        const items = (data || []).map(mapFromSupabaseSubmission);
        setLocalCache(CACHE_KEYS.SUBMISSIONS, items);
        return items;
      }
    } catch (error) {
      handleSupabaseError(error, 'submissions');
      return getLocalCache<ContactSubmission[]>(CACHE_KEYS.SUBMISSIONS, []);
    }
  }
  return getLocalCache<ContactSubmission[]>(CACHE_KEYS.SUBMISSIONS, []);
}

// --- SETTERS & MUTATIONS ---
export async function updateAgencySettings(settings: AgencySettings): Promise<void> {
  setLocalCache(CACHE_KEYS.SETTINGS, settings);

  if (isSupabaseEnabled && supabase && !getSupabaseSchemaMissing()) {
    try {
      const { error } = await supabase.from('settings').upsert([mapToSupabaseSettings(settings)]);
      if (error) {
        handleSupabaseError(error, 'settings update');
        throw error;
      }
    } catch (error) {
      handleSupabaseError(error, 'settings update');
      throw error;
    }
  }
}

export async function updateAdminCredentials(username: string, passwordPlain: string): Promise<void> {
  const passwordHash = await hashPassword(passwordPlain);
  const creds = { username, password: passwordHash };
  setLocalCache(CACHE_KEYS.ADMIN, creds);

  if (isSupabaseEnabled && supabase && !getSupabaseSchemaMissing()) {
    try {
      const { error } = await supabase.from('admin').upsert([{ username, password: passwordHash }]);
      if (error) {
        handleSupabaseError(error, 'admin update');
        throw error;
      }
    } catch (error) {
      handleSupabaseError(error, 'admin update');
      throw error;
    }
  }
}

export async function addPortfolioItem(item: Omit<PortfolioItem, 'id' | 'createdAt'>): Promise<void> {
  const id = 'port_' + Math.random().toString(36).substr(2, 9);
  const newItem: PortfolioItem = {
    ...item,
    id,
    createdAt: Date.now()
  };

  const cached = getLocalCache<PortfolioItem[]>(CACHE_KEYS.PORTFOLIO, DEFAULT_PORTFOLIO);
  setLocalCache(CACHE_KEYS.PORTFOLIO, [newItem, ...cached]);

  if (isSupabaseEnabled && supabase && !getSupabaseSchemaMissing()) {
    try {
      const { error } = await supabase.from('portfolio').insert([mapToSupabasePortfolio(newItem)]);
      if (error) {
        handleSupabaseError(error, 'portfolio item insert');
        throw error;
      }
    } catch (error) {
      handleSupabaseError(error, 'portfolio item insert');
      throw error;
    }
  }
}

export async function updatePortfolioItem(id: string, updates: Partial<PortfolioItem>): Promise<void> {
  const cached = getLocalCache<PortfolioItem[]>(CACHE_KEYS.PORTFOLIO, DEFAULT_PORTFOLIO);
  const updated = cached.map(item => item.id === id ? { ...item, ...updates } : item);
  setLocalCache(CACHE_KEYS.PORTFOLIO, updated);

  if (isSupabaseEnabled && supabase && !getSupabaseSchemaMissing()) {
    try {
      const mappedUpdates: any = {};
      if (updates.title !== undefined) mappedUpdates.title = updates.title;
      if (updates.category !== undefined) mappedUpdates.category = updates.category;
      if (updates.imageUrl !== undefined) mappedUpdates.image_url = updates.imageUrl;
      if (updates.demoLink !== undefined) mappedUpdates.demo_link = updates.demoLink;
      
      const { error } = await supabase.from('portfolio').update(mappedUpdates).eq('id', id);
      if (error) {
        handleSupabaseError(error, 'portfolio item update');
        throw error;
      }
    } catch (error) {
      handleSupabaseError(error, 'portfolio item update');
      throw error;
    }
  }
}

export async function deletePortfolioItem(id: string): Promise<void> {
  const cached = getLocalCache<PortfolioItem[]>(CACHE_KEYS.PORTFOLIO, DEFAULT_PORTFOLIO);
  const updated = cached.filter(item => item.id !== id);
  setLocalCache(CACHE_KEYS.PORTFOLIO, updated);

  if (isSupabaseEnabled && supabase && !getSupabaseSchemaMissing()) {
    try {
      const { error } = await supabase.from('portfolio').delete().eq('id', id);
      if (error) {
        handleSupabaseError(error, 'portfolio item delete');
        throw error;
      }
    } catch (error) {
      handleSupabaseError(error, 'portfolio item delete');
      throw error;
    }
  }
}

export async function saveCourse(course: Omit<Course, 'id' | 'createdAt'>, id?: string): Promise<void> {
  const courseId = id || 'course_' + Math.random().toString(36).substr(2, 9);
  const data: Course = {
    ...course,
    id: courseId,
    createdAt: Date.now()
  };

  const cached = getLocalCache<Course[]>(CACHE_KEYS.COURSES, DEFAULT_COURSES);
  let updated: Course[];
  if (id) {
    updated = cached.map(item => item.id === id ? data : item);
  } else {
    updated = [data, ...cached];
  }
  setLocalCache(CACHE_KEYS.COURSES, updated);

  if (isSupabaseEnabled && supabase && !getSupabaseSchemaMissing()) {
    try {
      const { error } = await supabase.from('courses').upsert([mapToSupabaseCourse(data)]);
      if (error) {
        handleSupabaseError(error, 'course save');
        throw error;
      }
    } catch (error) {
      handleSupabaseError(error, 'course save');
      throw error;
    }
  }
}

export async function deleteCourse(id: string): Promise<void> {
  const cached = getLocalCache<Course[]>(CACHE_KEYS.COURSES, DEFAULT_COURSES);
  const updated = cached.filter(item => item.id !== id);
  setLocalCache(CACHE_KEYS.COURSES, updated);

  if (isSupabaseEnabled && supabase && !getSupabaseSchemaMissing()) {
    try {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) {
        handleSupabaseError(error, 'course delete');
        throw error;
      }
    } catch (error) {
      handleSupabaseError(error, 'course delete');
      throw error;
    }
  }
}

export async function saveEbook(ebook: Omit<Ebook, 'id' | 'createdAt'>, id?: string): Promise<void> {
  const ebookId = id || 'ebook_' + Math.random().toString(36).substr(2, 9);
  const data: Ebook = {
    ...ebook,
    id: ebookId,
    createdAt: Date.now()
  };

  const cached = getLocalCache<Ebook[]>(CACHE_KEYS.EBOOKS, DEFAULT_EBOOKS);
  let updated: Ebook[];
  if (id) {
    updated = cached.map(item => item.id === id ? data : item);
  } else {
    updated = [data, ...cached];
  }
  setLocalCache(CACHE_KEYS.EBOOKS, updated);

  if (isSupabaseEnabled && supabase && !getSupabaseSchemaMissing()) {
    try {
      const { error } = await supabase.from('ebooks').upsert([mapToSupabaseEbook(data)]);
      if (error) {
        handleSupabaseError(error, 'ebook save');
        throw error;
      }
    } catch (error) {
      handleSupabaseError(error, 'ebook save');
      throw error;
    }
  }
}

export async function deleteEbook(id: string): Promise<void> {
  const cached = getLocalCache<Ebook[]>(CACHE_KEYS.EBOOKS, DEFAULT_EBOOKS);
  const updated = cached.filter(item => item.id !== id);
  setLocalCache(CACHE_KEYS.EBOOKS, updated);

  if (isSupabaseEnabled && supabase && !getSupabaseSchemaMissing()) {
    try {
      const { error } = await supabase.from('ebooks').delete().eq('id', id);
      if (error) {
        handleSupabaseError(error, 'ebook delete');
        throw error;
      }
    } catch (error) {
      handleSupabaseError(error, 'ebook delete');
      throw error;
    }
  }
}

export async function addContactSubmission(submission: Omit<ContactSubmission, 'id' | 'createdAt'>): Promise<void> {
  const id = 'sub_' + Math.random().toString(36).substr(2, 9);
  const data: ContactSubmission = {
    ...submission,
    id,
    createdAt: Date.now()
  };

  const cached = getLocalCache<ContactSubmission[]>(CACHE_KEYS.SUBMISSIONS, []);
  setLocalCache(CACHE_KEYS.SUBMISSIONS, [data, ...cached]);

  if (isSupabaseEnabled && supabase && !getSupabaseSchemaMissing()) {
    try {
      const { error } = await supabase.from('submissions').insert([mapToSupabaseSubmission(data)]);
      if (error) {
        handleSupabaseError(error, 'submission add');
        throw error;
      }
    } catch (error) {
      handleSupabaseError(error, 'submission add');
      throw error;
    }
  }
}

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

  const cached = getLocalCache<Enrollment[]>(CACHE_KEYS.ENROLLMENTS, []);
  setLocalCache(CACHE_KEYS.ENROLLMENTS, [newEnrollment, ...cached]);

  if (isSupabaseEnabled && supabase && !getSupabaseSchemaMissing()) {
    try {
      const { error } = await supabase.from('enrollments').insert([mapToSupabaseEnrollment(newEnrollment)]);
      if (error) {
        handleSupabaseError(error, 'enrollment create');
        throw error;
      }
    } catch (error) {
      handleSupabaseError(error, 'enrollment create');
      throw error;
    }
  }
}

export async function updateEnrollmentStatus(
  id: string, 
  status: 'pending' | 'approved' | 'rejected', 
  driveLink: string
): Promise<void> {
  const cached = getLocalCache<Enrollment[]>(CACHE_KEYS.ENROLLMENTS, []);
  const updated = cached.map(item => item.id === id ? { ...item, status, driveLink } : item);
  setLocalCache(CACHE_KEYS.ENROLLMENTS, updated);

  if (isSupabaseEnabled && supabase && !getSupabaseSchemaMissing()) {
    try {
      const { error } = await supabase.from('enrollments').update({ status, drive_link: driveLink }).eq('id', id);
      if (error) {
        handleSupabaseError(error, 'enrollment status update');
        throw error;
      }
    } catch (error) {
      handleSupabaseError(error, 'enrollment status update');
      throw error;
    }
  }
}

export async function getStudentEnrollments(phone: string, email: string): Promise<Enrollment[]> {
  if (isSupabaseEnabled && supabase && !getSupabaseSchemaMissing()) {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_email', email.trim().toLowerCase());
        
      if (error) {
        handleSupabaseError(error, 'student enrollments');
        const cached = getLocalCache<Enrollment[]>(CACHE_KEYS.ENROLLMENTS, []);
        return cached.filter(item => item.studentEmail.trim().toLowerCase() === email.trim().toLowerCase() && item.studentPhone.trim() === phone.trim());
      } else {
        const enrollments = (data || []).map(mapFromSupabaseEnrollment);
        return enrollments.filter((item) => item.studentPhone.trim() === phone.trim());
      }
    } catch (error) {
      handleSupabaseError(error, 'student enrollments');
      const cached = getLocalCache<Enrollment[]>(CACHE_KEYS.ENROLLMENTS, []);
      return cached.filter(item => item.studentEmail.trim().toLowerCase() === email.trim().toLowerCase() && item.studentPhone.trim() === phone.trim());
    }
  }
  const cached = getLocalCache<Enrollment[]>(CACHE_KEYS.ENROLLMENTS, []);
  return cached.filter(item => item.studentEmail.trim().toLowerCase() === email.trim().toLowerCase() && item.studentPhone.trim() === phone.trim());
}

// --- PARTNERS ---
export async function getPartners(): Promise<Partner[]> {
  if (isSupabaseEnabled && supabase && !getSupabaseSchemaMissing()) {
    try {
      const { data, error } = await supabase.from('partners').select('*').order('created_at', { ascending: false });
      if (error) {
        handleSupabaseError(error, 'partners');
        return getLocalCache<Partner[]>(CACHE_KEYS.PARTNERS, []);
      } else {
        const items = (data || []).map(mapFromSupabasePartner);
        setLocalCache(CACHE_KEYS.PARTNERS, items);
        return items;
      }
    } catch (error) {
      handleSupabaseError(error, 'partners');
      return getLocalCache<Partner[]>(CACHE_KEYS.PARTNERS, []);
    }
  }
  return getLocalCache<Partner[]>(CACHE_KEYS.PARTNERS, []);
}

export async function savePartner(partner: Omit<Partner, 'id' | 'createdAt'>, id?: string): Promise<void> {
  const partnerId = id || 'partner_' + Math.random().toString(36).substr(2, 9);
  const data: Partner = {
    ...partner,
    id: partnerId,
    createdAt: Date.now()
  };

  const cached = getLocalCache<Partner[]>(CACHE_KEYS.PARTNERS, []);
  let updated: Partner[];
  if (id) {
    updated = cached.map(item => item.id === id ? data : item);
  } else {
    updated = [data, ...cached];
  }
  setLocalCache(CACHE_KEYS.PARTNERS, updated);

  if (isSupabaseEnabled && supabase && !getSupabaseSchemaMissing()) {
    try {
      const { error } = await supabase.from('partners').upsert([mapToSupabasePartner(data)]);
      if (error) {
        handleSupabaseError(error, 'partner save');
        throw error;
      }
    } catch (error) {
      handleSupabaseError(error, 'partner save');
      throw error;
    }
  }
}

export async function deletePartner(id: string): Promise<void> {
  const cached = getLocalCache<Partner[]>(CACHE_KEYS.PARTNERS, []);
  const updated = cached.filter(item => item.id !== id);
  setLocalCache(CACHE_KEYS.PARTNERS, updated);

  if (isSupabaseEnabled && supabase && !getSupabaseSchemaMissing()) {
    try {
      const { error } = await supabase.from('partners').delete().eq('id', id);
      if (error) {
        handleSupabaseError(error, 'partner delete');
        throw error;
      }
    } catch (error) {
      handleSupabaseError(error, 'partner delete');
      throw error;
    }
  }
}
