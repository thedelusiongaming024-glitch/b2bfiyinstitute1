import { syncLoadFromServer, syncSaveToServer } from "./sync";

// Default high-quality images generated for the agency
const DEFAULT_LOGO = "assets/images/site_logo_1781814933236.jpg";
const DEFAULT_HERO_PHOTO = "assets/images/hero_owner_1781814920666.jpg";

// Pre-fill localStorage with beautiful default content if empty
export function initializeLocalStorage() {
  // Migrate any legacy/stale developer paths (e.g. /src/assets/images/...) to production public assets
  const currentLogo = localStorage.getItem("site_logo");
  if (currentLogo && currentLogo.includes("/src/assets/images/")) {
    localStorage.setItem("site_logo", currentLogo.replace("/src/assets/images/", "assets/images/"));
  }
  const currentHero = localStorage.getItem("hero_photo");
  if (currentHero && currentHero.includes("/src/assets/images/")) {
    localStorage.setItem("hero_photo", currentHero.replace("/src/assets/images/", "assets/images/"));
  }

  if (!localStorage.getItem("site_logo")) {
    localStorage.setItem("site_logo", DEFAULT_LOGO);
  }
  if (!localStorage.getItem("hero_photo")) {
    localStorage.setItem("hero_photo", DEFAULT_HERO_PHOTO);
  }
  if (!localStorage.getItem("hero_tagline")) {
    localStorage.setItem("hero_tagline", "আমরা আপনার ব্যবসাকে ডিজিটাল জগতে নিয়ে যাই");
  }
  if (!localStorage.getItem("hero_owner_title")) {
    localStorage.setItem("hero_owner_title", "CO - FOUNDER & CEO");
  }
  if (!localStorage.getItem("hero_subtext")) {
    localStorage.setItem("hero_subtext", "Professional Web Development, Video Editing, Graphics Design, Social Media Management & Facebook Ads — all under one roof.");
  }
  
  // Default Services Data
  if (!localStorage.getItem("services_data")) {
    const defaultServices = [
      {
        id: "s1",
        icon: "ri-code-s-slash-line",
        title: "Web Development",
        description: "আমরা আপনার ব্যবসার জন্য আধুনিক, রেসপন্সিভ এবং ফাস্ট ওয়েবসাইট তৈরি করি যা ক্লায়েন্ট আকর্ষণ করতে সাহায্য করবে।"
      },
      {
        id: "s2",
        icon: "ri-video-line",
        title: "Video Editing",
        description: "পেশাদার ভিডিও এডিটিং এর মাধ্যমে আপনার প্রোডাক্ট বা ব্র্যান্ডের প্রচার দ্বিগুণ করুন। চমৎকার সিনেমাটিক লুক ও পারফেক্ট সাউন্ড।"
      },
      {
        id: "s3",
        icon: "ri-palette-line",
        title: "Graphics Design",
        description: "আমরা নিয়ে এসেছি প্রফেশনাল ব্যানার, ক্রিয়েটিভ লোগো, ব্র্যান্ড আইডেন্টিটি এবং বুক কভার ডিজাইনের সেরা সার্ভিস।"
      },
      {
        id: "s4",
        icon: "ri-image-line",
        title: "Social Media Post Design",
        description: "সোশ্যাল মিডিয়ায় আপনার পোস্টের ডিজাইন গ্রাহক আকর্ষণে বড় ভূমিকা রাখে। আমরাই দেব ইউনিক আইডিয়া এবং টেম্পলেট ডিজাইন।"
      },
      {
        id: "s5",
        icon: "ri-share-line",
        title: "Social Media Management",
        description: "আপনার ফেসবুক বা ইন্সটাগ্রাম বিজনেস পেজে নিয়মিত পোস্ট রেডি করা এবং পেজের রিচ বৃদ্ধি করার কাজের সর্বোচ্চ দায়িত্ব আমাদের।"
      },
      {
        id: "s6",
        icon: "ri-facebook-circle-line",
        title: "Facebook Ads Management",
        description: "সরাসরি টার্গেটেড ওডিয়েন্সের কাছে ক্যাম্পেইন করার মাধ্যমে আপনার ব্যবসা ও বিক্রয় কয়েকগুণ বাড়িয়ে তুলতে কাজ করি।"
      }
    ];
    localStorage.setItem("services_data", JSON.stringify(defaultServices));
  }

  // Default Portfolio Data
  if (!localStorage.getItem("portfolio_data")) {
    const defaultPortfolio = [
      {
        id: "p1",
        category: "Website",
        title: "E-Commerce Business Solution",
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
        siteUrl: "https://example.com"
      },
      {
        id: "p2",
        category: "Website",
        title: "Corporate Agency Hub",
        imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600&q=80",
        siteUrl: "https://example.com"
      },
      {
        id: "p3",
        category: "Graphics Design",
        title: "Social Media Branding Kit",
        imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "p4",
        category: "Graphics Design",
        title: "Minimalist Executive Business Card",
        imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "p5",
        category: "Video Editing",
        title: "High-Caliber Corporate Reel",
        imageUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
      },
      {
        id: "p6",
        category: "Video Editing",
        title: "Cinematic Product Ad Intro",
        imageUrl: "https://images.unsplash.com/photo-1601506521937-0121a7fc2a6b?auto=format&fit=crop&w=600&q=80",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
      }
    ];
    localStorage.setItem("portfolio_data", JSON.stringify(defaultPortfolio));
  }

  // Default Clients Logo Data
  if (!localStorage.getItem("clients_data")) {
    const defaultClients = [
      { name: "Digital Solution BD", logoUrl: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&w=200&q=80" },
      { name: "Sylhet Tech", logoUrl: "https://images.unsplash.com/photo-1614680376739-414d95ff43df?auto=format&fit=crop&w=200&q=80" },
      { name: "Dhaka Softies", logoUrl: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?auto=format&fit=crop&w=200&q=80" },
      { name: "Comilla Agro", logoUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=200&q=80" },
      { name: "Bishal Bazar", logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&q=80" }
    ];
    localStorage.setItem("clients_data", JSON.stringify(defaultClients));
  }

  // Default Testimonials Data
  if (!localStorage.getItem("reviews_data")) {
    const defaultReviews = [
      {
        id: "r1",
        name: "Rakibul Islam",
        company: "BanglaTech Ltd.",
        photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        rating: 5,
        text: "বি টু বি ফাই ইন্সটিটিউট এর ভিডিও এডিটিং এবং ডিজাইন সার্ভিস অসাধারণ। তাদের কাজের পেশাদারিত্ব আমাদের ব্যবসার কাস্টমার এঙ্গেজমেন্ট অনেক বাড়িয়ে দিয়েছে।"
      },
      {
        id: "r2",
        name: "Farhana Yasmin",
        company: "Founder, StyleHub",
        photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
        rating: 5,
        text: "They managed our Facebook Ads campaigns and our return on investment increased by 200%. High quality workflow, on-time delivery, and stellar response times!"
      },
      {
        id: "r3",
        name: "Tanvir Rahman",
        company: "AgroGrow Market",
        photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
        rating: 4,
        text: "সহজ যোগাযোগ, দ্রুত ডেলিভারি এবং নিখুঁত কাজ। আমাদের কোম্পানির জন্য তারা যে সুন্দর এটুজেড ওয়েবসাইটটি তৈরি করেছে, ক্লায়েন্টরা সেটি দেখেই প্রথম অর্ডার দিয়েছে।"
      }
    ];
    localStorage.setItem("reviews_data", JSON.stringify(defaultReviews));
  }

  // Default About Us Data
  if (!localStorage.getItem("about_data")) {
    const defaultAbout = {
      bio: "B2Bfiy Institute একটি বাংলাদেশি বিশ্বস্ত ডিজিটাল সার্ভিস ও প্রফেশনাল স্কিল ডেভেলপমেন্ট পার্টনার। গত ২ বছর ধরে আমরা দেশি এবং বিদেশি ক্লায়েন্টদের ব্র্যান্ড ডেভেলপমেন্ট, ওয়েব ডিজাইন, সোশ্যাল মিডিয়া মার্কেটিং, টার্গেটেড ফেসবুক বিজ্ঞাপন এবং সিনেমাটিক ভিডিও এডিটিং সলিউশন দিয়ে আসছি। আমাদের একমাত্র লক্ষ্য হলো আপনার ব্যবসাকে ডিজিটাল মাধ্যমে তরান্বিত করা।",
      photoUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
      stats: [
        { label: "সার্ভিস প্রজেক্ট সম্পন্ন", value: "150" },
        { label: "সন্তুষ্ট দেশি-বিদেশি ক্লায়েন্ট", value: "80" },
        { label: "অভিজ্ঞ এক্সপার্ট ও মেন্টর", value: "12" },
        { label: "সাফল্যের হার", value: "98" }
      ],
      team: [
        {
          name: "Rakib Hassan",
          role: "Founder & Lead Digital Analyst",
          photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
        },
        {
          name: "Sumit Saha",
          role: "Senior Full-Stack Developer",
          photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80"
        }
      ]
    };
    localStorage.setItem("about_data", JSON.stringify(defaultAbout));
  }

  // Default Contact Info
  if (!localStorage.getItem("contact_info")) {
    const defaultContact = {
      whatsapp: "+8801712345678",
      email: "contact@b2bfiyinstitute.com",
      location: "মিরপুর, ঢাকা - ১২১৬, বাংলাদেশ"
    };
    localStorage.setItem("contact_info", JSON.stringify(defaultContact));
  }

  // Default Social Links
  if (!localStorage.getItem("social_links")) {
    const defaultSocials = {
      facebook: "https://facebook.com/b2bfiy",
      instagram: "https://instagram.com/b2bfiy",
      youtube: "https://youtube.com/b2bfiy"
    };
    localStorage.setItem("social_links", JSON.stringify(defaultSocials));
  }

  // Default Footer Data
  if (!localStorage.getItem("footer_data")) {
    const defaultFooter = {
      desc: "B2Bfiy Institute — আপনার ব্যবসার একটি বিশ্বস্ত ডিজিটাল পার্টনার। প্রফেশনাল গ্রাফিক্স, ভিডিও এডিটিং, সোশ্যাল মিডিয়া মার্কেটিং ও ওয়েব সলিউশন নিয়ে আমরা সর্বদা প্রস্তুত।",
      copyright: "© 2026 B2Bfiy Institute. All Rights Reserved."
    };
    localStorage.setItem("footer_data", JSON.stringify(defaultFooter));
  }

  // Clear any extremely large legacy Base64 strings to prevent QuotaExceededError in localStorage
  sanitizeDataOfHugeBase64();
}

export function sanitizeDataOfHugeBase64() {
  try {
    const SIZE_THRESHOLD = 2000000; // Increase threshold to 2MB for robust local uploads
    // 1. Logo
    const logo = localStorage.getItem("site_logo");
    if (logo && logo.startsWith("data:") && logo.length > SIZE_THRESHOLD) {
      localStorage.setItem("site_logo", "assets/images/site_logo_1781814933236.jpg");
    }

    // 2. Hero photo
    const hero = localStorage.getItem("hero_photo");
    if (hero && hero.startsWith("data:") && hero.length > SIZE_THRESHOLD) {
      localStorage.setItem("hero_photo", "assets/images/hero_owner_1781814920666.jpg");
    }

    // 3. Portfolio
    const portRaw = localStorage.getItem("portfolio_data");
    if (portRaw) {
      let changed = false;
      const port = JSON.parse(portRaw);
      if (Array.isArray(port)) {
        port.forEach((p: any) => {
          if (p.imageUrl && p.imageUrl.startsWith("data:") && p.imageUrl.length > SIZE_THRESHOLD) {
            p.imageUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80";
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem("portfolio_data", JSON.stringify(port));
        }
      }
    }

    // 4. Clients
    const clientRaw = localStorage.getItem("clients_data");
    if (clientRaw) {
      let changed = false;
      const clients = JSON.parse(clientRaw);
      if (Array.isArray(clients)) {
        clients.forEach((c: any) => {
          if (c.logoUrl && c.logoUrl.startsWith("data:") && c.logoUrl.length > SIZE_THRESHOLD) {
            c.logoUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80";
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem("clients_data", JSON.stringify(clients));
        }
      }
    }

    // 5. Reviews
    const revRaw = localStorage.getItem("reviews_data");
    if (revRaw) {
      let changed = false;
      const reviews = JSON.parse(revRaw);
      if (Array.isArray(reviews)) {
        reviews.forEach((r: any) => {
          if (r.photoUrl && r.photoUrl.startsWith("data:") && r.photoUrl.length > SIZE_THRESHOLD) {
            r.photoUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem("reviews_data", JSON.stringify(reviews));
        }
      }
    }

    // 6. Team
    const aboutRaw = localStorage.getItem("about_data");
    if (aboutRaw) {
      let changed = false;
      const about = JSON.parse(aboutRaw);
      if (about && about.team && Array.isArray(about.team)) {
        about.team.forEach((t: any) => {
          if (t.photoUrl && t.photoUrl.startsWith("data:") && t.photoUrl.length > SIZE_THRESHOLD) {
            t.photoUrl = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80";
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem("about_data", JSON.stringify(about));
        }
      }
    }
  } catch (err) {
    console.error("Migration error:", err);
  }
}

// Function to populate elements with their localStorage counter-parts on DOM load
document.addEventListener("DOMContentLoaded", async () => {
  // First attempt to pull central database state from PHP backend
  await syncLoadFromServer();
  
  initializeLocalStorage();
  renderLandingPage();
  setupAOS();
  setupNavigation();
  setupPortfolioFilter();
  setupLightbox();
  setupContactForm();
  animateCounterOnScroll();
});

// Render dynamic fields
function renderLandingPage() {
  // Site Logo (Header & Footer)
  const siteLogoBase64 = localStorage.getItem("site_logo") || DEFAULT_LOGO;
  const logoElements = document.querySelectorAll(".site-logo-img");
  logoElements.forEach((el) => {
    (el as HTMLImageElement).src = siteLogoBase64;
  });

  const faviconEl = document.getElementById("favicon") as HTMLLinkElement;
  if (faviconEl) {
    faviconEl.href = siteLogoBase64;
  }

  // Hero Section
  const heroPhoto = localStorage.getItem("hero_photo");
  const heroPhotoEl = document.getElementById("hero_photo_display") as HTMLImageElement;
  if (heroPhotoEl && heroPhoto) {
    heroPhotoEl.src = heroPhoto;
  }

  const heroTagline = localStorage.getItem("hero_tagline");
  const heroTaglineEl = document.getElementById("hero_tagline_display");
  if (heroTaglineEl && heroTagline) {
    heroTaglineEl.textContent = heroTagline;
  }

  const heroOwnerTitle = localStorage.getItem("hero_owner_title") || "CO - FOUNDER & CEO";
  const heroOwnerTitleEl = document.getElementById("hero_owner_title_display");
  if (heroOwnerTitleEl) {
    heroOwnerTitleEl.textContent = heroOwnerTitle;
  }

  const heroSubtext = localStorage.getItem("hero_subtext");
  const heroSubtextEl = document.getElementById("hero_subtext_display");
  if (heroSubtextEl && heroSubtext) {
    heroSubtextEl.textContent = heroSubtext;
  }

  // Configure Hire Me button / WhatsApp Button with direct link
  const contactInfoRaw = localStorage.getItem("contact_info");
  let whatsappNum = "+8801712345678";
  if (contactInfoRaw) {
    try {
      const contactInfo = JSON.parse(contactInfoRaw);
      whatsappNum = contactInfo.whatsapp;
    } catch (e) {
      console.error(e);
    }
  }

  // Strip spaces, dashes, or non-numeric items to get clean whatsapp link
  const cleanWhatsapp = whatsappNum.replace(/[^\d+]/g, "");
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}`;
  
  const hireMeBtn = document.querySelectorAll(".whatsapp-link-btn");
  hireMeBtn.forEach((el) => {
    (el as HTMLAnchorElement).href = whatsappUrl;
  });

  // Floating WhatsApp indicator link
  const floatingWhatsApp = document.getElementById("floating_whatsapp_btn") as HTMLAnchorElement;
  if (floatingWhatsApp) {
    floatingWhatsApp.href = whatsappUrl;
  }

  // Footer Hotline Link and Text displays
  const footerHotlineBtn = document.getElementById("footer_hotline_whatsapp") as HTMLAnchorElement;
  if (footerHotlineBtn) {
    footerHotlineBtn.href = whatsappUrl;
  }
  const footerHotlineNum = document.getElementById("footer_hotline_whatsapp_num");
  if (footerHotlineNum) {
    footerHotlineNum.textContent = whatsappNum;
  }

  // Render Services list
  const servicesRaw = localStorage.getItem("services_data");
  const servicesListGrid = document.getElementById("services_list_grid");
  if (servicesListGrid && servicesRaw) {
    try {
      const services = JSON.parse(servicesRaw);
      servicesListGrid.innerHTML = "";
      services.forEach((s: { id: string; icon: string; title: string; description: string }) => {
        // Icon mapping helper (checks if it's emoji or remix/fontawesome)
        const isIconClass = s.icon.startsWith("ri-") || s.icon.startsWith("fa-") || s.icon.startsWith("fas ");
        const iconMarkup = isIconClass 
          ? `<i class="${s.icon} text-4xl text-amber-500 mb-4 inline-block"></i>`
          : `<span class="text-4xl mb-4 inline-block text-amber-500">${s.icon}</span>`;

        servicesListGrid.innerHTML += `
          <div class="glass-panel glass-panel-hover p-8 rounded-2xl relative overflow-hidden group" data-aos="fade-up">
            <div class="absolute top-0 left-0 w-2 h-0 bg-amber-500 transition-all duration-300 group-hover:h-full"></div>
            ${iconMarkup}
            <h3 class="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors duration-300">${s.title}</h3>
            <p class="text-slate-400 text-sm leading-relaxed">${s.description}</p>
          </div>
        `;
      });
    } catch (e) {
      console.error(e);
    }
  }

  // Render Portfolio items
  renderPortfolioGrid();

  // Render Clients Auto-scrolling grid
  const clientsRaw = localStorage.getItem("clients_data");
  const clientsTrack = document.getElementById("clients_scroller_track");
  if (clientsTrack && clientsRaw) {
    try {
      const clients = JSON.parse(clientsRaw);
      clientsTrack.innerHTML = "";
      
      // Duplicate clients list to create seamless infinite scrolling effect
      const extendedClients = [...clients, ...clients, ...clients];
      extendedClients.forEach((c: { name: string; logoUrl: string }, index: number) => {
        clientsTrack.innerHTML += `
          <div class="flex flex-col items-center justify-center p-6 bg-slate-900/30 border border-slate-800/60 rounded-xl hover:border-amber-500/20 transition-all duration-300 mx-4 w-44 shrink-0 group">
            <img class="h-10 w-auto object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300 rounded mb-2" src="${c.logoUrl}" alt="${c.name}">
            <span class="text-xs text-slate-500 group-hover:text-amber-400 text-center font-medium truncate w-full">${c.name}</span>
          </div>
        `;
      });
    } catch (e) {
      console.error(e);
    }
  }

  // Render Testimonials Reviews carousel (load in Swiper markup structure)
  const reviewsRaw = localStorage.getItem("reviews_data");
  const swiperWrapper = document.getElementById("reviews_swiper_wrapper");
  if (swiperWrapper && reviewsRaw) {
    try {
      const reviews = JSON.parse(reviewsRaw);
      swiperWrapper.innerHTML = "";
      reviews.forEach((r: { id: string; name: string; company: string; photoUrl: string; rating: number; text: string }) => {
        const starMarkup = Array.from({ length: 5 }, (_, i) => {
          return i < r.rating 
            ? `<i class="fa-solid fa-star text-amber-500"></i>`
            : `<i class="fa-regular fa-star text-slate-600"></i>`;
        }).join("");

        swiperWrapper.innerHTML += `
          <div class="swiper-slide h-auto">
            <div class="glass-panel p-8 rounded-2xl border border-slate-800/80 hover:border-amber-500/30 transition-all duration-300 h-full flex flex-col justify-between">
              <div>
                <div class="flex items-center gap-1 mb-4">
                  ${starMarkup}
                </div>
                <p class="text-slate-300 italic leading-relaxed text-sm lg:text-base mb-6">"${r.text}"</p>
              </div>
              <div class="flex items-center gap-4 border-t border-slate-800/60 pt-4 mt-auto">
                <img class="w-12 h-12 rounded-full object-cover border-2 border-amber-500/30" src="${r.photoUrl}" alt="${r.name}">
                <div>
                  <h4 class="text-white font-bold text-base leading-tight">${r.name}</h4>
                  <span class="text-xs text-amber-500 font-medium">${r.company}</span>
                </div>
              </div>
            </div>
          </div>
        `;
      });

      // Initialize Swiper.js for Reviews Slider
      new (window as any).Swiper(".reviews-swiper", {
        slidesPerView: 1,
        spaceBetween: 24,
        loop: true,
        autoplay: {
          delay: 5000,
          disableOnInteraction: false,
        },
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
          dynamicBullets: true,
        },
        breakpoints: {
          640: {
            slidesPerView: 1,
          },
          768: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          }
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  // Render About & Stats
  const aboutRaw = localStorage.getItem("about_data");
  if (aboutRaw) {
    try {
      const about = JSON.parse(aboutRaw);
      
      // Bio
      const bioEl = document.getElementById("about_bio_display");
      if (bioEl && about.bio) {
        bioEl.textContent = about.bio;
      }

      // Main image
      const aboutPhotoEl = document.getElementById("about_photo_display") as HTMLImageElement;
      if (aboutPhotoEl && about.photoUrl) {
        aboutPhotoEl.src = about.photoUrl;
      }

      // Stats counters container
      const statsListGrid = document.getElementById("about_stats_grid");
      if (statsListGrid && about.stats) {
        statsListGrid.innerHTML = "";
        about.stats.forEach((stat: { label: string; value: string }, index: number) => {
          // Extract numeric parts to assist animated counter
          const numValue = parseInt(stat.value.replace(/[^\d]/g, ""), 10) || 0;
          const suffix = stat.value.replace(/[\d]/g, "");

          statsListGrid.innerHTML += `
            <div class="p-6 bg-slate-900/30 border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center text-center">
              <span class="text-3xl lg:text-4xl font-extrabold text-amber-500 mb-1 count-number" data-target="${numValue}" data-suffix="${suffix}">0${suffix}</span>
              <span class="text-slate-400 text-xs tracking-wider uppercase font-semibold mt-1">${stat.label}</span>
            </div>
          `;
        });
      }

      // Optional Team grid
      const teamGrid = document.getElementById("about_team_grid");
      if (teamGrid && about.team) {
        teamGrid.innerHTML = "";
        about.team.forEach((t: { name: string; role: string; photoUrl: string }) => {
          teamGrid.innerHTML += `
            <div class="glass-panel p-4 rounded-2xl flex flex-col items-center text-center hover:border-amber-500/20 transition-all duration-300">
              <img class="w-24 h-24 rounded-full object-cover border-2 border-amber-500/20 mb-4" src="${t.photoUrl}" alt="${t.name}">
              <h4 class="text-white font-bold mb-1">${t.name}</h4>
              <span class="text-xs text-amber-500 font-medium">${t.role}</span>
            </div>
          `;
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Render Contact Info (Sidebar details)
  if (contactInfoRaw) {
    try {
      const contactInfo = JSON.parse(contactInfoRaw);
      
      const emailDisplay = document.getElementById("contact_email_display");
      if (emailDisplay) {
        emailDisplay.textContent = contactInfo.email;
        const mailLink = document.getElementById("contact_email_link") as HTMLAnchorElement;
        if (mailLink) mailLink.href = `mailto:${contactInfo.email}`;
      }

      const whatsappDisplay = document.getElementById("contact_whatsapp_display");
      if (whatsappDisplay) {
        whatsappDisplay.textContent = contactInfo.whatsapp;
      }

      const locationDisplay = document.getElementById("contact_location_display");
      if (locationDisplay) {
        locationDisplay.textContent = contactInfo.location;
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Render Social Media link icons
  const socialRaw = localStorage.getItem("social_links");
  if (socialRaw) {
    try {
      const socials = JSON.parse(socialRaw);
      
      const fbLinks = document.querySelectorAll(".social-facebook-link");
      fbLinks.forEach((el) => {
        (el as HTMLAnchorElement).href = socials.facebook || "#";
      });

      const igLinks = document.querySelectorAll(".social-instagram-link");
      igLinks.forEach((el) => {
        (el as HTMLAnchorElement).href = socials.instagram || "#";
      });

      const ytLinks = document.querySelectorAll(".social-youtube-link");
      ytLinks.forEach((el) => {
        (el as HTMLAnchorElement).href = socials.youtube || "#";
      });
    } catch (e) {
      console.error(e);
    }
  }

  // Render Footer settings
  const footerRaw = localStorage.getItem("footer_data");
  if (footerRaw) {
    try {
      const footer = JSON.parse(footerRaw);
      
      const footerDesc = document.getElementById("footer_desc_display");
      if (footerDesc) footerDesc.textContent = footer.desc;

      const footerCopy = document.getElementById("footer_copyright_display");
      if (footerCopy) footerCopy.textContent = footer.copyright;
    } catch (e) {
      console.error(e);
    }
  }
}

// Render portfolio grid dynamically according to active tab filter state
function renderPortfolioGrid(activeCategory: string = "all") {
  const portfolioRaw = localStorage.getItem("portfolio_data");
  const portfolioGridContainer = document.getElementById("portfolio_grid");
  
  if (portfolioGridContainer && portfolioRaw) {
    try {
      const items = JSON.parse(portfolioRaw);
      portfolioGridContainer.innerHTML = "";

      const filteredItems = activeCategory === "all" 
        ? items 
        : items.filter((item: any) => item.category === activeCategory);

      if (filteredItems.length === 0) {
        portfolioGridContainer.innerHTML = `
          <div class="col-span-full py-20 text-center text-slate-500">
            <i class="ri-gallery-line text-5xl mb-3"></i>
            <p>এই ক্যাটাগরিতে কোনো আইটেম পাওয়া যায়নি!</p>
          </div>
        `;
        return;
      }

      filteredItems.forEach((item: any) => {
        let actionMarkup = "";

        if (item.category === "Video Editing" && item.videoUrl) {
          // Trigger Video Embed playback or link opens
          actionMarkup = `
            <button class="portfolio-video-play-btn inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-slate-900 shadow hover:bg-amber-400 transition-colors pointer-events-auto" data-video-url="${item.videoUrl}">
              <i class="fa-solid fa-play text-sm"></i>
            </button>
          `;
        } else if (item.category === "Website" && item.siteUrl) {
          actionMarkup = `
            <a href="${item.siteUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-slate-900 shadow hover:bg-amber-400 transition-colors pointer-events-auto" title="ভিজিট করুন">
              <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
            </a>
          `;
        } else {
          // Graphics view / general lightbox
          actionMarkup = `
            <button class="portfolio-lightbox-trigger-btn inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-slate-900 shadow hover:bg-amber-400 transition-colors pointer-events-auto" data-image-url="${item.imageUrl}" data-title="${item.title}">
              <i class="fa-solid fa-magnifying-glass text-xs"></i>
            </button>
          `;
        }

        portfolioGridContainer.innerHTML += `
          <div class="portfolio-card relative overflow-hidden rounded-2xl group border border-slate-900 bg-slate-950/20 cursor-pointer text-left" data-category="${item.category}" data-aos="fade-up">
            <div class="relative overflow-hidden aspect-video">
              <img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="${item.imageUrl}" alt="${item.title}" loading="lazy">
              <!-- Overlay hover -->
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 border-b-2 border-amber-500 pointer-events-none">
                <div class="flex items-center justify-between w-full">
                  <div class="pr-4 pointer-events-none">
                    <span class="text-[10px] tracking-wider uppercase text-amber-500 font-bold block mb-1">${item.category}</span>
                    <h4 class="text-white font-bold leading-snug text-base line-clamp-1">${item.title}</h4>
                  </div>
                  <!-- Buttons with dynamic links -->
                  <div class="shrink-0 flex gap-2">
                    ${actionMarkup}
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      });

      // Bind dynamically created card triggers
      rebindPortfolioTriggers();
    } catch (e) {
      console.error(e);
    }
  }
}

// Bind custom events on dynamically rendered portfolio items
function rebindPortfolioTriggers() {
  // Video buttons
  const videoBtns = document.querySelectorAll(".portfolio-video-play-btn");
  videoBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const videoUrl = (btn as HTMLButtonElement).getAttribute("data-video-url");
      if (videoUrl) {
        openVideoModal(videoUrl);
      }
    });
  });

  // Lightbox buttons
  const lightboxBtns = document.querySelectorAll(".portfolio-lightbox-trigger-btn");
  lightboxBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const imageUrl = (btn as HTMLButtonElement).getAttribute("data-image-url");
      const title = (btn as HTMLButtonElement).getAttribute("data-title");
      if (imageUrl) {
        openGeneralLightbox(imageUrl, title || "");
      }
    });
  });

  // Clicking the whole card can act as a trigger as well
  const cardItems = document.querySelectorAll(".portfolio-card");
  cardItems.forEach((card) => {
    card.addEventListener("click", () => {
      const category = card.getAttribute("data-category");
      if (category === "Video Editing") {
        const videoBtn = card.querySelector(".portfolio-video-play-btn") as HTMLButtonElement;
        if (videoBtn) videoBtn.click();
      } else if (category === "Website") {
        const webBtn = card.querySelector("a") as HTMLAnchorElement;
        if (webBtn) webBtn.click();
      } else {
        const zoomBtn = card.querySelector(".portfolio-lightbox-trigger-btn") as HTMLButtonElement;
        if (zoomBtn) zoomBtn.click();
      }
    });
  });
}

function openVideoModal(embedUrl: string) {
  const lightboxModal = document.getElementById("lightbox-modal");
  const lightboxContentContainer = document.getElementById("lightbox-content-container");
  const lightboxTitleContainer = document.getElementById("lightbox-title-container");

  if (lightboxModal && lightboxContentContainer && lightboxTitleContainer) {
    lightboxTitleContainer.textContent = "পেশাদার ভিডিও প্রজেক্ট";

    const isDirectVideo = embedUrl.endsWith(".mp4") || embedUrl.endsWith(".webm") || embedUrl.includes("uploads/") || embedUrl.startsWith("data:video");

    if (isDirectVideo) {
      lightboxContentContainer.innerHTML = `
        <div class="relative aspect-video w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl bg-black flex items-center justify-center">
          <video class="w-full h-full object-contain" controls autoplay src="${embedUrl}"></video>
        </div>
      `;
    } else {
      // Format youtube or google drive link into secure embed automatically if standard link is given
      let formattedSrc = embedUrl;
      let isGoogleDrive = false;
      if (embedUrl.includes("youtube.com/watch?v=")) {
        const vidId = embedUrl.split("watch?v=")[1]?.split("&")[0];
        formattedSrc = `https://www.youtube.com/embed/${vidId}`;
      } else if (embedUrl.includes("youtu.be/")) {
        const vidId = embedUrl.split("youtu.be/")[1]?.split("?")[0];
        formattedSrc = `https://www.youtube.com/embed/${vidId}`;
      } else if (embedUrl.includes("drive.google.com")) {
        isGoogleDrive = true;
        let fileId = "";
        if (embedUrl.includes("/file/d/")) {
          fileId = embedUrl.split("/file/d/")[1]?.split("/")[0]?.split("?")[0] || "";
        } else if (embedUrl.includes("?id=")) {
          fileId = embedUrl.split("?id=")[1]?.split("&")[0] || "";
        } else if (embedUrl.includes("&id=")) {
          fileId = embedUrl.split("&id=")[1]?.split("&")[0] || "";
        }
        if (fileId) {
          formattedSrc = `https://drive.google.com/file/d/${fileId}/preview`;
        }
      }

      lightboxContentContainer.innerHTML = `
        <div class="relative aspect-video w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl bg-black">
          <iframe class="absolute top-0 left-0 w-full h-full border-none" src="${formattedSrc}${!isGoogleDrive ? "?autoplay=1" : ""}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
        ${isGoogleDrive ? `
          <div class="mt-4 flex flex-col items-center gap-2">
            <span class="text-[11px] text-slate-400">ভিডিওটি লোড না হলে নিচের বাটনে ক্লিক করে সরাসরি গুগল ড্রাইভে দেখতে পারেন:</span>
            <a href="${embedUrl}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              গুগল ড্রাইভ লিঙ্কে সরাসরি যান (Open in Google Drive)
            </a>
            <span class="text-[9px] text-amber-500/80">নোট: নিশ্চিত করুন যে ড্রাইভ ভিডিওটির শেয়ারিং পারমিশন "Anyone with the link can view / যে কেউ দেখতে পারবে" দেওয়া আছে।</span>
          </div>
        ` : ""}
      `;
    }

    lightboxModal.classList.remove("hidden");
    lightboxModal.classList.add("flex");
  }
}

function openGeneralLightbox(imageUrl: string, title: string) {
  const lightboxModal = document.getElementById("lightbox-modal");
  const lightboxContentContainer = document.getElementById("lightbox-content-container");
  const lightboxTitleContainer = document.getElementById("lightbox-title-container");

  if (lightboxModal && lightboxContentContainer && lightboxTitleContainer) {
    lightboxTitleContainer.textContent = title;
    lightboxContentContainer.innerHTML = `
      <div class="relative max-h-[80vh] flex items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800">
        <img class="max-w-full max-h-[70vh] rounded-lg object-contain" src="${imageUrl}" alt="${title}">
      </div>
    `;
    lightboxModal.classList.remove("hidden");
    lightboxModal.classList.add("flex");
  }
}

// Close lightbox settings
function setupLightbox() {
  const lightboxModal = document.getElementById("lightbox-modal");
  const closeBtn = document.getElementById("lightbox-close");
  
  if (lightboxModal) {
    closeBtn?.addEventListener("click", () => {
      // Empty the content so frame/videos stop playing
      const content = document.getElementById("lightbox-content-container");
      if (content) content.innerHTML = "";
      lightboxModal.classList.add("hidden");
      lightboxModal.classList.remove("flex");
    });

    lightboxModal.addEventListener("click", (e) => {
      if (e.target === lightboxModal) {
        const content = document.getElementById("lightbox-content-container");
        if (content) content.innerHTML = "";
        lightboxModal.classList.add("hidden");
        lightboxModal.classList.remove("flex");
      }
    });

    // Close on ESC key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !lightboxModal.classList.contains("hidden")) {
        const content = document.getElementById("lightbox-content-container");
        if (content) content.innerHTML = "";
        lightboxModal.classList.add("hidden");
        lightboxModal.classList.remove("flex");
      }
    });
  }
}

// Portfolio Tab Filter switching
function setupPortfolioFilter() {
  const tabFilterButtons = document.querySelectorAll(".portfolio-tab-btn");
  tabFilterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Deactivate all active status states
      tabFilterButtons.forEach((b) => {
        b.classList.remove("bg-amber-500", "text-slate-950", "shadow-amber-500/10");
        b.classList.add("bg-slate-900/40", "text-slate-400", "border-slate-800");
      });
      
      // Mark current active
      btn.classList.add("bg-amber-500", "text-slate-950", "shadow-amber-500/10");
      btn.classList.remove("bg-slate-900/40", "text-slate-400", "border-slate-800");

      const category = (btn as HTMLButtonElement).getAttribute("data-category") || "all";
      renderPortfolioGrid(category);
    });
  });
}

function setupAOS() {
  if ((window as any).AOS) {
    (window as any).AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
      disable: 'mobile'
    });
  }
}

// Sticky header navigation & active indicator highlighted on scroll
function setupNavigation() {
  const header = document.getElementById("site-header");
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const mobileMenuDrawer = document.getElementById("mobile-menu-drawer");
  const navLinks = document.querySelectorAll(".nav-link-btn");

  // Sticky header class injection
  window.addEventListener("scroll", () => {
    if (header) {
      if (window.scrollY > 40) {
        header.classList.add("bg-slate-950/95", "shadow-md", "py-3");
        header.classList.remove("bg-transparent", "py-5");
      } else {
        header.classList.add("bg-transparent", "py-5");
        header.classList.remove("bg-slate-950/95", "shadow-md", "py-3");
      }
    }

    // ScrollSpy Highlight corresponding Nav Links
    const sections = document.querySelectorAll("section[id]");
    const scrollPosition = window.scrollY + 120; // offset

    sections.forEach((section) => {
      const sectionTop = (section as HTMLElement).offsetTop;
      const sectionHeight = (section as HTMLElement).offsetHeight;
      const sectionId = section.getAttribute("id");

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.classList.remove("text-amber-500", "font-bold");
          link.classList.add("text-slate-300");
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("text-amber-500", "font-bold");
            link.classList.remove("text-slate-300");
          }
        });
      }
    });
  });

  // Toggle responsive menu
  if (mobileMenuToggle && mobileMenuDrawer) {
    mobileMenuToggle.addEventListener("click", () => {
      mobileMenuDrawer.classList.toggle("hidden");
      const icon = mobileMenuToggle.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-bars");
        icon.classList.toggle("fa-xmark");
      }
    });

    // Close mobile drawer on link click
    const mobileLinks = mobileMenuDrawer.querySelectorAll("a");
    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenuDrawer.classList.add("hidden");
        const icon = mobileMenuToggle.querySelector("i");
        if (icon) {
          icon.classList.add("fa-bars");
          icon.classList.remove("fa-xmark");
        }
      });
    });
  }
}

// Clean animated stats counter trigger on view
function animateCounterOnScroll() {
  const countNumbers = document.querySelectorAll(".count-number");
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLElement;
        const total = parseInt(target.getAttribute("data-target") || "0", 10);
        const suffix = target.getAttribute("data-suffix") || "";
        let current = 0;
        const speed = Math.ceil(total / 60); // complete in ~60 frames
        
        const countInterval = setInterval(() => {
          current += speed;
          if (current >= total) {
            target.textContent = total + suffix;
            clearInterval(countInterval);
          } else {
            target.textContent = current + suffix;
          }
        }, 30);
        
        observer.unobserve(target);
      }
    });
  }, { threshold: 0.1 });

  countNumbers.forEach((el) => observer.observe(el));
}

// Local mock contact database stored on contact form submitting
function setupContactForm() {
  const contactForm = document.getElementById("client-contact-form") as HTMLFormElement;
  const successModal = document.getElementById("form-success-modal");
  const successMessage = document.getElementById("success-modal-message");
  const closeSuccessBtn = document.getElementById("close-success-modal");

  if (contactForm && successModal) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = (document.getElementById("contact_input_name") as HTMLInputElement).value;
      const email = (document.getElementById("contact_input_email") as HTMLInputElement).value;
      const phone = (document.getElementById("contact_input_phone") as HTMLInputElement).value;
      const message = (document.getElementById("contact_input_message") as HTMLTextAreaElement).value;

      // Local storage log
      const pendingSubmissionsRaw = localStorage.getItem("contact_submissions") || "[]";
      try {
        const submissions = JSON.parse(pendingSubmissionsRaw);
        submissions.push({
          id: "sub_" + Date.now(),
          name,
          email,
          phone,
          message,
          date: new Date().toLocaleDateString()
        });
        localStorage.setItem("contact_submissions", JSON.stringify(submissions));
        syncSaveToServer();
      } catch (err) {
        console.error(err);
      }

      // Display beautiful confirmation toast/prompt modal container
      if (successMessage) {
        successMessage.innerHTML = `
          <h4 class="text-xl font-bold text-amber-500 mb-2">ধন্যবাদ, ${name}!</h4>
          <p class="text-slate-300 text-sm">আপনার বার্তাটি অত্যন্ত যত্নের সাথে রেকর্ড করা হয়েছে। B2Bfiy Institute এর প্রতিনিধি অতি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।</p>
        `;
      }
      successModal.classList.remove("hidden");
      successModal.classList.add("flex");

      // Reset form fields
      contactForm.reset();
    });

    closeSuccessBtn?.addEventListener("click", () => {
      successModal.classList.add("hidden");
      successModal.classList.remove("flex");
    });

    successModal.addEventListener("click", (e) => {
      if (e.target === successModal) {
        successModal.classList.add("hidden");
        successModal.classList.remove("flex");
      }
    });
  }
}
