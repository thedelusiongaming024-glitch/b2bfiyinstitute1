import { AgencySettings, PortfolioItem, Course, Ebook } from '../types';

export const DEFAULT_SETTINGS: AgencySettings = {
  id: 'settings',
  agencyName: 'B2Bfiy Institute',
  logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
  faviconUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=32&q=80',
  whatsappNumber: '8801700000000',
  bkashNumber: '01700-000000 (Personal)',
  nagadNumber: '01800-000000 (Personal)',
  rocketNumber: '01900-000000-0 (Personal)',
  upayNumber: '01500-000000 (Personal)',
  footerText: '© 2026 B2Bfiy Institute. All rights reserved. Empowering your brand with custom digital solutions.',
  aboutText: 'We are a premier digital agency specializing in high-impact creative services. From full-stack web platforms and bespoke branding to high-energy social media ads and cinematic video production, our mission is to elevate your digital presence.',
  heroTitle: 'Crafting Next-Gen Digital Experiences',
  heroSubtitle: 'Transforming ideas into high-converting websites, visual designs, and marketing campaigns with industry-leading experts.',
  heroImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80',
  graphicsSeeAllLink: 'https://www.behance.net',
  videoSeeAllLink: 'https://www.youtube.com',
  webSeeAllLink: 'https://github.com',
  facebookPixelId: ''
};

export const DEFAULT_PORTFOLIO: PortfolioItem[] = [
  // Graphics Design (4 items)
  {
    id: 'g1',
    title: 'Brand Identity & Guidelines - Aurora',
    category: 'Graphics Design',
    imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
    createdAt: Date.now() - 10000
  },
  {
    id: 'g2',
    title: 'Retro Futursim Poster Series',
    category: 'Graphics Design',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&w=600&q=80',
    createdAt: Date.now() - 20000
  },
  {
    id: 'g3',
    title: 'Minimalist Package Design - EcoSoap',
    category: 'Graphics Design',
    imageUrl: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=600&q=80',
    createdAt: Date.now() - 30000
  },
  {
    id: 'g4',
    title: 'Creative Social Media Post Pack',
    category: 'Graphics Design',
    imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80',
    createdAt: Date.now() - 40000
  },

  // Video Editing (4 items)
  {
    id: 'v1',
    title: 'Cinematic Travel Vlog - Escape to Bali',
    category: 'Video Editing',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    createdAt: Date.now() - 50000
  },
  {
    id: 'v2',
    title: 'Commercial Product Video - CyberPhone',
    category: 'Video Editing',
    imageUrl: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=600&q=80',
    createdAt: Date.now() - 60000
  },
  {
    id: 'v3',
    title: 'High-Energy Corporate Promo Reel',
    category: 'Video Editing',
    imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=600&q=80',
    createdAt: Date.now() - 70000
  },
  {
    id: 'v4',
    title: 'Lofi Animation Loop - Coding Session',
    category: 'Video Editing',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80',
    createdAt: Date.now() - 80000
  },

  // Web Development (3 items with Demo Links)
  {
    id: 'w1',
    title: 'E-Commerce Store - Oasis Apparel',
    category: 'Web Development',
    imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=600&q=80',
    demoLink: 'https://example-oasis.web.app',
    createdAt: Date.now() - 90000
  },
  {
    id: 'w2',
    title: 'SaaS Analytics Dashboard - MetricsHub',
    category: 'Web Development',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    demoLink: 'https://example-metrics.web.app',
    createdAt: Date.now() - 100000
  },
  {
    id: 'w3',
    title: 'Interactive Travel Planner - Wanderlust',
    category: 'Web Development',
    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80',
    demoLink: 'https://example-wanderlust.web.app',
    createdAt: Date.now() - 110000
  }
];

export const DEFAULT_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Professional Web Development Mastery',
    coverImage: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=600&q=80',
    price: 3500,
    description: 'Master HTML, CSS, JavaScript, React, Tailwind, and Node.js. Build real-world agency projects, secure authorization systems, and deploy them on high-performance cloud networks. Includes 1-on-1 mentorship.',
    modules: [
      'Module 1: Web Fundamentals & semantic HTML/CSS',
      'Module 2: Advanced JavaScript (ES6+) and DOM manipulation',
      'Module 3: React 19 Essentials, state, hooks, and API fetching',
      'Module 4: Responsive styling with Tailwind CSS & micro-animations',
      'Module 5: Backend development with Express and Firestore',
      'Module 6: Capstone Project: Build & deploy an interactive e-commerce'
    ],
    driveLink: 'https://drive.google.com/drive/folders/web-dev-mastery',
    createdAt: Date.now() - 10000
  },
  {
    id: 'c2',
    title: 'Cinematic Video Editing & Storytelling',
    coverImage: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80',
    price: 2500,
    description: 'Learn cinematic storytelling, pacing, transitions, color grading, and audio mixing inside Premiere Pro and After Effects. Build an impressive video editing portfolio to land high-paying agency gigs.',
    modules: [
      'Module 1: Getting started with Timeline and workspace settings',
      'Module 2: Pacing, cuts, and organizing multi-cam clips',
      'Module 3: Cinematic color grading and LUT integration',
      'Module 4: Sound design: Equalizers, vocal cleanup, and background music',
      'Module 5: Creating high-impact text animations in After Effects',
      'Module 6: Portfolio generation and client acquisition strategy'
    ],
    driveLink: 'https://drive.google.com/drive/folders/video-editing-cinematic',
    createdAt: Date.now() - 20000
  }
];

export const DEFAULT_EBOOKS: Ebook[] = [
  {
    id: 'e1',
    title: 'The Ultimate UI/UX Secrets Guidebook',
    coverImage: 'https://images.unsplash.com/photo-1586075010923-2dd45e9b2d4f?auto=format&fit=crop&w=600&q=80',
    price: 499,
    description: 'Uncover the design patterns used by top-tier agencies to build beautiful products. Features actionable tips on typography scales, responsive layouts, aesthetic margin variations, high-contrast ratios, and micro-interaction formulas.',
    driveLink: 'https://drive.google.com/file/d/uiux-secrets-ebook',
    createdAt: Date.now() - 10000
  },
  {
    id: 'e2',
    title: 'Facebook Ads & Digital Growth Blueprint',
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    price: 399,
    description: 'A step-by-step master guide to designing high-converting social media creatives, building custom audience funnels, optimizing budget distribution, and bypassing common Facebook ad restrictions.',
    driveLink: 'https://drive.google.com/file/d/fb-ads-blueprint',
    createdAt: Date.now() - 20000
  }
];

export const DEFAULT_REVIEWS = [
  {
    name: 'Rahat Islam',
    role: 'CEO, Aurora Tech',
    text: 'PixelCraft did an exceptional job rebuilding our marketing website and brand guides. Our conversion rate increased by 40% in the first month! Highly recommended.',
    rating: 5
  },
  {
    name: 'Nusrat Jahan',
    role: 'Course Student',
    text: 'The Web Development course is unbelievably structured. The manual bKash enrollment process was approved within 15 minutes, and I immediately got access to the Google Drive full of high-quality lessons. Best decision ever!',
    rating: 5
  },
  {
    name: 'Mahmudul Hasan',
    role: 'Independent Content Creator',
    text: 'I bought their UI/UX secrets ebook. The design templates and spacing guidelines inside are gold. Totally worth every single taka!',
    rating: 5
  }
];
