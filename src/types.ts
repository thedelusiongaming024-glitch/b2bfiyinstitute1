export interface AgencySettings {
  id: string;
  agencyName: string;
  logoUrl: string;
  faviconUrl?: string;
  whatsappNumber: string;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  upayNumber?: string;
  footerText: string;
  aboutText: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  graphicsSeeAllLink: string;
  videoSeeAllLink: string;
  webSeeAllLink: string;
  facebookPixelId?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: 'Graphics Design' | 'Video Editing' | 'Web Development';
  imageUrl: string;
  demoLink?: string; // Optional web demo link
  createdAt: number;
}

export interface Course {
  id: string;
  title: string;
  coverImage: string;
  price: number;
  description: string;
  modules: string[];
  driveLink: string;
  createdAt: number;
}

export interface Ebook {
  id: string;
  title: string;
  coverImage: string;
  price: number;
  description: string;
  driveLink: string;
  createdAt: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: number;
}

export interface Enrollment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  itemType: 'course' | 'ebook';
  itemId: string;
  itemTitle: string;
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Upay';
  paymentPhone: string;
  transactionId: string;
  status: 'pending' | 'approved' | 'rejected';
  driveLink: string;
  createdAt: number;
  country?: string;
  district?: string;
  notes?: string;
  paidAmount?: number;
  screenshotUrl?: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: number;
}

export interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  createdAt: number;
}
