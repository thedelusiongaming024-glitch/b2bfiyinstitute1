import { initializeLocalStorage, sanitizeDataOfHugeBase64 } from "./script";
import { syncLoadFromServer, syncSaveToServer, SYNC_KEYS } from "./sync";

// Safe helper to save and sync automatically without risky prototype overrides
function saveAndSyncItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
    if (!(window as any).isSyncingServerLoad && SYNC_KEYS.includes(key)) {
      syncSaveToServer();
    }
  } catch (e: any) {
    console.error("Storage save failed. Attempting automatic sanitization...", e);
    try {
      // If we exceed quota (usually because of huge base64 images), sanitize/clean up the database and retry
      sanitizeDataOfHugeBase64();
      localStorage.setItem(key, value);
      if (!(window as any).isSyncingServerLoad && SYNC_KEYS.includes(key)) {
        syncSaveToServer();
      }
      showToast("স্টোরেজ ডিক্ল্যাটার করা হয়েছে এবং ডাটা সফলভাবে সংরক্ষণ করা হয়েছে!");
    } catch (retryError: any) {
      console.error("Critical storage error after sanitization retry:", retryError);
      showToast("স্টোরেজ সম্পূর্ণ ফুল! অনুগ্রহ করে কিছু প্রজেক্ট ডিলিট করুন অথবা ছবি ছোট করে আপলোড করুন।", true);
    }
  }
}

// Credentials as secure high-entropy hashes (Username: "admin1", Password: "rakib1122@#")
const ADMIN_USERNAME_HASH = "25f43b1486ad95a1398e3eeb3d83bc4010015fcc9bedb35b432e00298d5021f7";
const ADMIN_PASSWORD_HASH = "3b76a31c1021da8fb1c5c94191159aea3c4a4fef5588b9a08315f6a3c5aa6e6a";

// Client-side secure SHA-256 hasher utilising native subtle crypto which supports all browsers
async function hashStringToSHA256(str: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Utility Toast notifier
function showToast(message: string, isError: boolean = false) {
  const existingToasts = document.querySelectorAll(".admin-toast");
  existingToasts.forEach((t) => t.remove());

  const toast = document.createElement("div");
  toast.className = `admin-toast fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl font-bold text-xs lg:text-sm shadow-2xl flex items-center gap-3 transform translate-y-4 opacity-0 transition-all duration-300 ${
    isError ? "bg-red-500 text-white" : "bg-amber-400 text-slate-950"
  }`;
  toast.innerHTML = `
    <i class="fa-solid ${isError ? 'fa-triangle-exclamation' : 'fa-circle-check'} text-lg"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  // Trigger entering transition
  setTimeout(() => {
    toast.classList.remove("translate-y-4", "opacity-0");
  }, 10);

  // Leave and teardown
  setTimeout(() => {
    toast.classList.add("translate-y-4", "opacity-0");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Upload file to cPanel server, or fallback to Base64 in local studio
async function uploadFileToServer(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const headers: Record<string, string> = {};
  if (sessionStorage.getItem("admin_logged_in") === "true") {
    headers["X-Admin-Auth"] = "3b76a31c1021da8fb1c5c94191159aea3c4a4fef5588b9a08315f6a3c5aa6e6a";
  }

  try {
    const response = await fetch("api.php?action=upload", {
      method: "POST",
      headers,
      body: formData
    });
    
    if (response.ok) {
      const resData = await response.json();
      if (resData && resData.status === "success" && resData.url) {
        return resData.url;
      }
    } else {
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          showToast("সার্ভার আপলোড এরর: " + errorData.message, true);
        }
      } catch (e) {
        showToast("সার্ভার আপলোড ব্যর্থ হয়েছে! cPanel-এ uploads ফোল্ডারের Write Permission (755 বা 777) চেক করুন।", true);
      }
    }
  } catch (err) {
    console.log("PHP Upload Endpoint not active or running locally. Using local base64 fallback.", err);
  }

  // Fallback to local base64 Reader
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

// Compress image before saving to stay under localStorage 5MB limit on local development
async function compressImageFile(file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            quality
          );
        } else {
          resolve(file);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// Convert files uploaded to base64 synchronously or upload to PHP directory
function handleFileToBase64(fileInputId: string, previewId: string | null, callback: (urlOrBase64: string) => void) {
  const input = document.getElementById(fileInputId) as HTMLInputElement;
  if (!input) return;

  input.addEventListener("change", async (e) => {
    let file = input.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith("video/");
      const maxSize = isVideo ? 500 * 1024 * 1024 : 20 * 1024 * 1024;
      const sizeLimitName = isVideo ? "৫০০ মেগাবাইট (500MB)" : "২০ মেগাবাইট (20MB)";
      
      if (file.size > maxSize) {
        showToast(`ফাইলের আকার সর্বোচ্চ ${sizeLimitName} হতে পারবে!`, true);
        input.value = "";
        return;
      }

      showToast("ফাইল প্রসেসিং ও আপলোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...");

      try {
        // Compress image file if it is an image
        if (file.type.startsWith("image/")) {
          file = await compressImageFile(file, 800, 800, 0.7);
        }

        const urlOrBase64 = await uploadFileToServer(file);
        if (previewId) {
          const preview = document.getElementById(previewId);
          if (preview) {
            if (preview instanceof HTMLImageElement) {
              preview.src = urlOrBase64;
              preview.classList.remove("hidden");
            } else if (preview instanceof HTMLVideoElement) {
              preview.src = urlOrBase64;
              preview.classList.remove("hidden");
              preview.load();
            }
          }
        }
        callback(urlOrBase64);
        showToast("সফলভাবে ফাইল প্রসেস ও সেভ করা হয়েছে!");
      } catch (err) {
        console.error(err);
        showToast("ফাইল লোড করতে ব্যর্থ হয়েছে!", true);
      }
    }
  });
}

// Check session status on DOM Content Load
document.addEventListener("DOMContentLoaded", async () => {
  // Pull central database state from PHP backend before rendering
  await syncLoadFromServer();
  
  initializeLocalStorage();
  checkSession();
  setupLoginHandler();
  setupNavigation();
  setupFilePickers();
  loadAllAdminData();
  setupActionForms();
  setupEditModal();
});

function checkSession() {
  const loginLayout = document.getElementById("admin-login-layout");
  const dashboardLayout = document.getElementById("admin-dashboard-layout");

  if (sessionStorage.getItem("admin_logged_in") === "true") {
    loginLayout?.classList.add("hidden");
    dashboardLayout?.classList.remove("hidden");
    renderOverviewStats();
  } else {
    loginLayout?.classList.remove("hidden");
    dashboardLayout?.classList.add("hidden");
  }
}

// Setup Username and Password checks
function setupLoginHandler() {
  const loginForm = document.getElementById("admin-login-form") as HTMLFormElement;
  const errorMsg = document.getElementById("login-error-msg");
  const togglePassBtn = document.getElementById("toggle-password");
  const passInput = document.getElementById("admin_input_password") as HTMLInputElement;

  // Eye toggle visibility
  if (togglePassBtn && passInput) {
    togglePassBtn.addEventListener("click", () => {
      const isPass = passInput.type === "password";
      passInput.type = isPass ? "text" : "password";
      
      const icon = togglePassBtn.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const usernameInput = (document.getElementById("admin_input_user") as HTMLInputElement).value.trim();
      const passwordInput = (document.getElementById("admin_input_password") as HTMLInputElement).value;

      try {
        const hashedUser = await hashStringToSHA256(usernameInput);
        const r_hashedPass = await hashStringToSHA256(passwordInput);

        if (hashedUser === ADMIN_USERNAME_HASH && r_hashedPass === ADMIN_PASSWORD_HASH) {
          sessionStorage.setItem("admin_logged_in", "true");
          if (errorMsg) errorMsg.classList.add("hidden");
          loginForm.reset();
          checkSession();
          loadAllAdminData();
          showToast("সাফল্যপূর্বক লগইন করা হয়েছে! ড্যাশবোর্ডে স্বাগতম।");
        } else {
          if (errorMsg) {
            errorMsg.textContent = "ভুল ইউজারনেম অথবা পাসওয়ার্ড দেওয়া হয়েছে। আবার চেষ্টা করুন!";
            errorMsg.classList.remove("hidden");
          }
          showToast("লগইন ব্যর্থ হয়েছে!", true);
        }
      } catch (err) {
        console.error("Cryptographic hash failure during login:", err);
        showToast("ক্রিপ্টোগ্রাফিক ত্রুটি! অনুগ্রহ করে পুনরায় চেষ্টা করুন বা ব্রাউজার আপডেট করুন।", true);
      }
    });
  }
}

// Setup Sidebar tabs switching
function setupNavigation() {
  const menuButtons = document.querySelectorAll(".admin-sidebar-btn");
  const contentPanels = document.querySelectorAll(".admin-panel-section");
  const panelTitle = document.getElementById("admin-active-panel-title");

  menuButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetSection = btn.getAttribute("data-target");
      if (!targetSection) return;

      if (targetSection === "logout") {
        // Log out clean trigger
        if (confirm("আপনি কি নিশ্চিতভাবে লগআউট করতে চান?")) {
          sessionStorage.removeItem("admin_logged_in");
          checkSession();
          showToast("সফলভাবে লগআউট করা হয়েছে।");
        }
        return;
      }

      // Mark buttons active
      menuButtons.forEach((b) => {
        b.classList.remove("bg-amber-500", "text-slate-950", "font-bold");
        b.classList.add("text-slate-400", "hover:bg-slate-900/40", "hover:text-white");
      });
      btn.classList.add("bg-amber-500", "text-slate-950", "font-bold");
      btn.classList.remove("text-slate-400", "hover:bg-slate-900/40", "hover:text-white");

      // Render correct panel
      contentPanels.forEach((panel) => {
        panel.classList.add("hidden");
        if (panel.getAttribute("id") === `section-${targetSection}`) {
          panel.classList.remove("hidden");
        }
      });

      // Update Header Text title
      if (panelTitle) {
        panelTitle.textContent = btn.querySelector("span")?.textContent || "ড্যাশবোর্ড";
      }
    });
  });
}

// Convert image pickers seamlessly on change
function setupFilePickers() {
  // [1] Logo uploader
  handleFileToBase64("input_logo_file", "logo_preview_img", (base64) => {
    saveAndSyncItem("site_logo", base64);
    
    // Dynamically update favicon and sidebar logo representations on-the-fly
    const faviconEl = document.getElementById("favicon") as HTMLLinkElement;
    if (faviconEl) {
      faviconEl.href = base64;
    }
    const sideLogos = document.querySelectorAll(".site-logo-img");
    sideLogos.forEach((el) => {
      (el as HTMLImageElement).src = base64;
    });

    showToast("লোগো পরিবর্তন করা হয়েছে! সেভ বাটনে ক্লিক করুন।");
  });

  // [2] Hero Owner photo uploader
  handleFileToBase64("input_hero_photo_file", "hero_photo_preview_img", (base64) => {
    saveAndSyncItem("hero_photo", base64);
    showToast("হিরো ফটো সাবমিট করা হয়েছে! সেভ বাটনে ক্লিক করুন।");
  });

  // [3] Portfolio item image preview creation
  handleFileToBase64("portfolio_input_image", "portfolio_preview_img", (base64) => {
    // Stores temporarily on this element to read on submission
    const el = document.getElementById("portfolio_input_image") as HTMLElement;
    el.setAttribute("data-base64", base64);
  });

  // [3.5] Portfolio video file uploader
  handleFileToBase64("portfolio_input_videofile", "portfolio_video_preview", (url) => {
    const videoUrlInput = document.getElementById("portfolio_input_videourl") as HTMLInputElement;
    if (videoUrlInput) {
      videoUrlInput.value = url;
    }
  });

  // [4] Client logo image uploader
  handleFileToBase64("client_input_logo", "client_preview_img", (base64) => {
    const el = document.getElementById("client_input_logo") as HTMLElement;
    el.setAttribute("data-base64", base64);
  });

  // [5] Review Customer photo uploader
  handleFileToBase64("review_input_photo", "review_preview_img", (base64) => {
    const el = document.getElementById("review_input_photo") as HTMLElement;
    el.setAttribute("data-base64", base64);
  });

  // [6] Team Member photo uploader
  handleFileToBase64("about_team_input_photo", "about_team_preview_img", (base64) => {
    const el = document.getElementById("about_team_input_photo") as HTMLElement;
    el.setAttribute("data-base64", base64);
  });

  // [7] Edit modal image uploader
  handleFileToBase64("edit_image_picker", "edit_image_pre", (base64) => {
    const el = document.getElementById("edit_image_picker") as HTMLElement;
    el.setAttribute("data-base64", base64);
  });
}

function loadAllAdminData() {
  // Site Logo Settings
  const logoSrc = localStorage.getItem("site_logo") || "assets/images/site_logo_1781814933236.jpg";
  const logoPreview = document.getElementById("logo_preview_img") as HTMLImageElement;
  if (logoPreview) logoPreview.src = logoSrc;

  // Also update header/sidebar logo elements
  const sideLogos = document.querySelectorAll(".site-logo-img");
  sideLogos.forEach((el) => {
    (el as HTMLImageElement).src = logoSrc;
  });

  const faviconEl = document.getElementById("favicon") as HTMLLinkElement;
  if (faviconEl) {
    faviconEl.href = logoSrc;
  }

  // Site general info
  const siteTitle = localStorage.getItem("sub_site_title") || "B2Bfiy Institute | Digital Outsourcing Service Panel";
  const siteDesc = localStorage.getItem("sub_site_meta_desc") || "Professional Web Development, Video Editing, Graphics Design, Social Media Management & Facebook Ads";
  
  const siteTitleInput = document.getElementById("input_site_title") as HTMLInputElement;
  if (siteTitleInput) siteTitleInput.value = siteTitle;

  const siteDescInput = document.getElementById("input_site_meta_desc") as HTMLTextAreaElement;
  if (siteDescInput) siteDescInput.value = siteDesc;

  // Hero Section
  const heroPhotoSrc = localStorage.getItem("hero_photo") || "assets/images/hero_owner_1781814920666.jpg";
  const heroPhotoPreview = document.getElementById("hero_photo_preview_img") as HTMLImageElement;
  if (heroPhotoPreview) heroPhotoPreview.src = heroPhotoSrc;

  const ownerTitleInput = document.getElementById("input_hero_owner_title") as HTMLInputElement;
  if (ownerTitleInput) ownerTitleInput.value = localStorage.getItem("hero_owner_title") || "CO - FOUNDER & CEO";

  const taglineInput = document.getElementById("input_hero_tagline") as HTMLInputElement;
  if (taglineInput) taglineInput.value = localStorage.getItem("hero_tagline") || "";

  const subtextInput = document.getElementById("input_hero_subtext") as HTMLTextAreaElement;
  if (subtextInput) subtextInput.value = localStorage.getItem("hero_subtext") || "";

  // Lists loader helpers
  renderAdminServicesList();
  renderAdminPortfolioList();
  renderAdminClientsList();
  renderAdminReviewsList();
  renderAdminAboutSettings();
  renderAdminContactAndSocial();
  renderAdminFooterSettings();
  renderAdminContactSubmissions();
}

// Calculate dashboard metrics on load
function renderOverviewStats() {
  const services = JSON.parse(localStorage.getItem("services_data") || "[]");
  const portfolio = JSON.parse(localStorage.getItem("portfolio_data") || "[]");
  const clients = JSON.parse(localStorage.getItem("clients_data") || "[]");
  const reviews = JSON.parse(localStorage.getItem("reviews_data") || "[]");
  const submissions = JSON.parse(localStorage.getItem("contact_submissions") || "[]");

  const statSvs = document.getElementById("stat_total_services");
  const statPort = document.getElementById("stat_total_portfolio");
  const statCli = document.getElementById("stat_total_clients");
  const statSub = document.getElementById("stat_total_submissions");

  if (statSvs) statSvs.textContent = services.length.toString();
  if (statPort) statPort.textContent = portfolio.length.toString();
  if (statCli) statCli.textContent = clients.length.toString();
  if (statSub) statSub.textContent = submissions.length.toString();
}

function renderAdminServicesList() {
  const servicesRaw = localStorage.getItem("services_data") || "[]";
  const parent = document.getElementById("admin_services_table_body");
  if (!parent) return;

  try {
    const services = JSON.parse(servicesRaw);
    parent.innerHTML = "";

    if (services.length === 0) {
      parent.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-slate-500 text-xs">কোন সার্ভিস ক্যাটাগরি তৈরি করা হয়নি।</td></tr>`;
      return;
    }

    services.forEach((s: any, idx: number) => {
      parent.innerHTML += `
        <tr class="border-b border-slate-900/60 hover:bg-slate-900/20 text-xs lg:text-sm">
          <td class="p-4 font-mono font-bold text-amber-500">${idx + 1}</td>
          <td class="p-4 font-semibold text-slate-100 flex items-center gap-2">
            <span class="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-amber-500">${s.icon}</span>
            <span>${s.title}</span>
          </td>
          <td class="p-4 text-slate-400 truncate max-w-xs">${s.description}</td>
          <td class="p-4 text-center">
            <div class="flex items-center justify-center gap-2">
              <button onclick="window.editAdminService('${s.id}')" class="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 rounded-lg text-[11px] font-bold cursor-pointer transition-colors">
                <i class="fa-solid fa-pen-to-square mr-1"></i> এডিট
              </button>
              <button onclick="window.deleteAdminService('${s.id}')" class="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-900/30 text-red-400 rounded-lg text-[11px] font-bold cursor-pointer transition-colors">
                <i class="fa-solid fa-trash-can mr-1"></i> ডিলিট
              </button>
            </div>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error(err);
  }
}

function renderAdminPortfolioList() {
  const portfolioRaw = localStorage.getItem("portfolio_data") || "[]";
  const parent = document.getElementById("admin_portfolio_table_body");
  if (!parent) return;

  try {
    const portfolio = JSON.parse(portfolioRaw);
    parent.innerHTML = "";

    if (portfolio.length === 0) {
      parent.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-500 text-xs">কোন পোর্টফোলিও আইটেম পাওয়া যায়নি!</td></tr>`;
      return;
    }

    portfolio.forEach((p: any, idx: number) => {
      const displayUrl = p.category === "Video Editing" ? (p.videoUrl || "N/A") : (p.siteUrl || "N/A");
      
      parent.innerHTML += `
        <tr class="border-b border-slate-900/60 hover:bg-slate-900/20 text-xs lg:text-sm">
          <td class="p-4"><img class="w-12 h-10 object-cover rounded border border-slate-800" src="${p.imageUrl}" alt="${p.title}"></td>
          <td class="p-4 font-bold text-white font-medium">${p.title}</td>
          <td class="p-4"><span class="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold rounded-full">${p.category}</span></td>
          <td class="p-4 text-slate-400 text-xs truncate max-w-[200px]" title="${displayUrl}">${displayUrl}</td>
          <td class="p-4 text-center">
            <div class="flex items-center justify-center gap-2">
              <button onclick="window.editAdminPortfolio('${p.id}')" class="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 rounded-lg text-[11px] font-bold cursor-pointer transition-colors">
                <i class="fa-solid fa-pen-to-square mr-1"></i> এডিট
              </button>
              <button onclick="window.deleteAdminPortfolio('${p.id}')" class="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-900/30 text-red-400 rounded-lg text-[11px] font-bold cursor-pointer transition-colors">
                <i class="fa-solid fa-trash-can mr-1"></i> ডিলিট
              </button>
            </div>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error(err);
  }
}

function renderAdminClientsList() {
  const clientsRaw = localStorage.getItem("clients_data") || "[]";
  const parent = document.getElementById("admin_clients_table_body");
  if (!parent) return;

  try {
    const clients = JSON.parse(clientsRaw);
    parent.innerHTML = "";

    if (clients.length === 0) {
      parent.innerHTML = `<tr><td colspan="3" class="p-6 text-center text-slate-500 text-xs">কোন ক্লায়েন্ট লোগো পাওয়া যায় নি।</td></tr>`;
      return;
    }

    clients.forEach((c: any, index: number) => {
      parent.innerHTML += `
        <tr class="border-b border-slate-900/60 hover:bg-slate-900/20 text-xs lg:text-sm">
          <td class="p-4"><img class="w-12 h-8 object-contain rounded bg-slate-950 border border-slate-800 p-1" src="${c.logoUrl}" alt="${c.name}"></td>
          <td class="p-4 text-white font-bold text-slate-200">${c.name}</td>
          <td class="p-4 text-center">
            <div class="flex items-center justify-center gap-2">
              <button onclick="window.editAdminClient(${index})" class="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 rounded-lg text-[11px] font-bold cursor-pointer transition-colors">
                <i class="fa-solid fa-pen-to-square mr-1"></i> এডিট
              </button>
              <button onclick="window.deleteAdminClient(${index})" class="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-900/30 text-red-400 rounded-lg text-[11px] font-bold cursor-pointer transition-colors">
                <i class="fa-solid fa-trash-can mr-1"></i> ডিলিট
              </button>
            </div>
          </td>
        </tr>
      `;
    });
  } catch (e) {
    console.error(e);
  }
}

function renderAdminReviewsList() {
  const reviewsRaw = localStorage.getItem("reviews_data") || "[]";
  const parent = document.getElementById("admin_reviews_table_body");
  if (!parent) return;

  try {
    const reviews = JSON.parse(reviewsRaw);
    parent.innerHTML = "";

    if (reviews.length === 0) {
      parent.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-500 text-xs">কোন রিভিউ রেকর্ড পাওয়া যায়নি!</td></tr>`;
      return;
    }

    reviews.forEach((r: any) => {
      parent.innerHTML += `
        <tr class="border-b border-slate-900/60 hover:bg-slate-900/20 text-xs lg:text-sm">
          <td class="p-4"><img class="w-10 h-10 object-cover rounded-full border border-amber-500/30" src="${r.photoUrl}" alt="${r.name}"></td>
          <td class="p-4">
            <h4 class="text-white font-bold leading-none">${r.name}</h4>
            <span class="text-[10px] text-amber-500 mt-1 block">${r.company}</span>
          </td>
          <td class="p-4 font-bold text-amber-400 text-xs"><i class="fa-solid fa-star mr-1"></i> ${r.rating}.0</td>
          <td class="p-4 text-slate-400 truncate max-w-xs">${r.text}</td>
          <td class="p-4 text-center">
            <div class="flex items-center justify-center gap-2">
              <button onclick="window.editAdminReview('${r.id}')" class="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 rounded-lg text-[11px] font-bold cursor-pointer transition-colors">
                <i class="fa-solid fa-pen-to-square mr-1"></i> এডিট
              </button>
              <button onclick="window.deleteAdminReview('${r.id}')" class="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-900/30 text-red-400 rounded-lg text-[11px] font-bold cursor-pointer transition-colors">
                <i class="fa-solid fa-trash-can mr-1"></i> ডিলিট
              </button>
            </div>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error(err);
  }
}

function renderAdminAboutSettings() {
  const aboutRaw = localStorage.getItem("about_data");
  if (!aboutRaw) return;

  try {
    const about = JSON.parse(aboutRaw);

    // Bio
    const bioText = document.getElementById("about_input_bio") as HTMLTextAreaElement;
    if (bioText) bioText.value = about.bio || "";

    // Stats
    const statsContainer = document.getElementById("admin_about_stats_list");
    if (statsContainer && about.stats) {
      statsContainer.innerHTML = "";
      about.stats.forEach((stat: { label: string; value: string }, index: number) => {
        statsContainer.innerHTML += `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-900/80 pb-4 last:border-b-0 last:pb-0">
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] text-slate-500 uppercase font-bold">স্টেটস ট্যাগ/লেবেল</label>
              <input type="text" id="stat_label_${index}" value="${stat.label}" class="px-4 py-2.5 bg-slate-950 border border-slate-900 rounded-xl focus:border-amber-550 focus:outline-none text-xs text-white">
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] text-slate-500 uppercase font-bold">ভ্যালু / সংখ্যা (যেমন: 50+)</label>
              <input type="text" id="stat_value_${index}" value="${stat.value}" class="px-4 py-2.5 bg-slate-950 border border-slate-900 rounded-xl focus:border-amber-550 focus:outline-none text-xs text-white">
            </div>
          </div>
        `;
      });
    }

    // Team Row
    const teamContainer = document.getElementById("admin_about_team_list");
    if (teamContainer && about.team) {
      teamContainer.innerHTML = "";
      about.team.forEach((t: any, index: number) => {
        teamContainer.innerHTML += `
          <div class="p-4 bg-slate-950 border border-slate-900 rounded-2xl flex items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <img class="w-12 h-12 rounded-full object-cover border border-slate-800" src="${t.photoUrl}" alt="${t.name}">
              <div>
                <h4 class="text-white font-bold leading-snug">${t.name}</h4>
                <p class="text-xs text-amber-500 font-semibold mt-1">${t.role}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="window.editAdminTeamMember(${index})" class="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 rounded-xl text-[10px] font-bold cursor-pointer transition-all duration-200">
                <i class="fa-solid fa-user-pen"></i> এডিট
              </button>
              <button onclick="window.deleteAdminTeamMember(${index})" class="px-3 py-1.5 bg-red-950/50 hover:bg-red-900/70 border border-red-900/30 text-red-400 rounded-xl text-[10px] font-bold cursor-pointer transition-all duration-200">
                <i class="fa-solid fa-user-minus"></i> ডিলিট
              </button>
            </div>
          </div>
        `;
      });
    }
  } catch (e) {
    console.error(e);
  }
}

function renderAdminContactAndSocial() {
  const contactRaw = localStorage.getItem("contact_info");
  const socialRaw = localStorage.getItem("social_links");

  if (contactRaw) {
    try {
      const contact = JSON.parse(contactRaw);
      
      const whatsappInput = document.getElementById("contact_input_whatsapp") as HTMLInputElement;
      if (whatsappInput) whatsappInput.value = contact.whatsapp || "";

      const emailInput = document.getElementById("contact_input_email_admin") as HTMLInputElement;
      if (emailInput) emailInput.value = contact.email || "";

      const locationInput = document.getElementById("contact_input_location") as HTMLInputElement;
      if (locationInput) locationInput.value = contact.location || "";
    } catch (err) {
      console.error(err);
    }
  }

  if (socialRaw) {
    try {
      const socials = JSON.parse(socialRaw);
      
      const fbInput = document.getElementById("social_input_facebook") as HTMLInputElement;
      if (fbInput) fbInput.value = socials.facebook || "";

      const igInput = document.getElementById("social_input_instagram") as HTMLInputElement;
      if (igInput) igInput.value = socials.instagram || "";

      const ytInput = document.getElementById("social_input_youtube") as HTMLInputElement;
      if (ytInput) ytInput.value = socials.youtube || "";
    } catch (e) {
      console.error(e);
    }
  }
}

function renderAdminFooterSettings() {
  const footerRaw = localStorage.getItem("footer_data");
  if (!footerRaw) return;

  try {
    const footer = JSON.parse(footerRaw);

    const desc = document.getElementById("footer_input_desc") as HTMLTextAreaElement;
    if (desc) desc.value = footer.desc || "";

    const copy = document.getElementById("footer_input_copy") as HTMLInputElement;
    if (copy) copy.value = footer.copyright || "";
  } catch (err) {
    console.error(err);
  }
}

// Contacts Requests submission table
function renderAdminContactSubmissions() {
  const submissionsRaw = localStorage.getItem("contact_submissions") || "[]";
  const parent = document.getElementById("admin_submissions_table_body");
  if (!parent) return;

  try {
    const submissions = JSON.parse(submissionsRaw);
    parent.innerHTML = "";

    if (submissions.length === 0) {
      parent.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-500 text-xs">কোনো কন্টাক্ট রিকোয়েস্ট জমা পড়েনি।</td></tr>`;
      return;
    }

    // Render in reverse order to show newest first!
    submissions.slice().reverse().forEach((sub: any, index: number) => {
      parent.innerHTML += `
        <tr class="border-b border-slate-900/60 hover:bg-slate-900/20 text-xs">
          <td class="p-4 font-mono font-semibold text-slate-500">${sub.date}</td>
          <td class="p-4 font-extrabold text-amber-500">${sub.name}</td>
          <td class="p-4 text-white font-medium">${sub.phone}</td>
          <td class="p-4 text-slate-300 font-mono">${sub.email}</td>
          <td class="p-4 text-slate-400 font-medium whitespace-pre-wrap max-w-xs leading-relaxed">${sub.message}</td>
          <td class="p-4 text-center">
            <button onclick="window.deleteAdminSubmission('${sub.id}')" class="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-900/30 text-red-400 rounded-lg text-[10px] font-bold cursor-pointer transition-colors">
              ডিলিট
            </button>
          </td>
        </tr>
      `;
    });
  } catch (e) {
    console.error(e);
  }
}

// Action form submission triggers
function setupActionForms() {
  // [1] Change Site Settings form
  const siteSettingsForm = document.getElementById("admin-settings-form");
  if (siteSettingsForm) {
    siteSettingsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const siteTitle = (document.getElementById("input_site_title") as HTMLInputElement).value;
      const siteDesc = (document.getElementById("input_site_meta_desc") as HTMLTextAreaElement).value;

      saveAndSyncItem("sub_site_title", siteTitle);
      saveAndSyncItem("sub_site_meta_desc", siteDesc);

      showToast("সাইট সেটিংস সেভ করা হয়েছে!");
      renderOverviewStats();
    });
  }

  // [2] Hero Section updates form
  const heroSettingsForm = document.getElementById("admin-hero-form");
  if (heroSettingsForm) {
    heroSettingsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const ownerTitle = (document.getElementById("input_hero_owner_title") as HTMLInputElement).value;
      const tagline = (document.getElementById("input_hero_tagline") as HTMLInputElement).value;
      const subtext = (document.getElementById("input_hero_subtext") as HTMLTextAreaElement).value;

      saveAndSyncItem("hero_owner_title", ownerTitle);
      saveAndSyncItem("hero_tagline", tagline);
      saveAndSyncItem("hero_subtext", subtext);

      showToast("হিরো সেকশন আপডেট করা হয়েছে!");
      renderOverviewStats();
    });
  }

  // [3] Add Service form
  const addServiceForm = document.getElementById("form_add_service") as HTMLFormElement;
  if (addServiceForm) {
    addServiceForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = (document.getElementById("service_input_title") as HTMLInputElement).value;
      const icon = (document.getElementById("service_input_icon") as HTMLInputElement).value;
      const desc = (document.getElementById("service_input_description") as HTMLTextAreaElement).value;

      const servicesRaw = localStorage.getItem("services_data") || "[]";
      try {
        const services = JSON.parse(servicesRaw);
        services.push({
          id: "s_" + Date.now(),
          title,
          icon,
          description: desc
        });
        saveAndSyncItem("services_data", JSON.stringify(services));

        showToast("নতুন সার্ভিস যুক্ত করা হয়েছে!");
        addServiceForm.reset();
        renderAdminServicesList();
        renderOverviewStats();
      } catch (err) {
        console.error(err);
      }
    });
  }

  // [4] Add Portfolio Item
  const addPortfolioForm = document.getElementById("form_add_portfolio") as HTMLFormElement;
  if (addPortfolioForm) {
    addPortfolioForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const category = (document.getElementById("portfolio_input_category") as HTMLSelectElement).value;
      const title = (document.getElementById("portfolio_input_title") as HTMLInputElement).value;
      const videoUrl = (document.getElementById("portfolio_input_videourl") as HTMLInputElement).value;
      const siteUrl = (document.getElementById("portfolio_input_siteurl") as HTMLInputElement).value;

      const fileInput = document.getElementById("portfolio_input_image") as HTMLElement;
      let base64 = fileInput.getAttribute("data-base64") || "";

      if (!base64) {
        // Fallback placeholder image URL based on category
        base64 = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80";
      }

      const portfolioRaw = localStorage.getItem("portfolio_data") || "[]";
      try {
        const portfolio = JSON.parse(portfolioRaw);
        portfolio.push({
          id: "p_" + Date.now(),
          category,
          title,
          imageUrl: base64,
          videoUrl: category === "Video Editing" ? videoUrl : undefined,
          siteUrl: category === "Website" ? siteUrl : undefined
        });

        saveAndSyncItem("portfolio_data", JSON.stringify(portfolio));
        showToast("নতুন পোর্টফোলিও প্রজেক্ট যুক্ত করা হয়েছে!");

        addPortfolioForm.reset();
        fileInput.removeAttribute("data-base64");
        const preview = document.getElementById("portfolio_preview_img") as HTMLImageElement;
        if (preview) preview.classList.add("hidden");
        const videoPreview = document.getElementById("portfolio_video_preview") as HTMLVideoElement;
        if (videoPreview) {
          videoPreview.src = "";
          videoPreview.classList.add("hidden");
        }

        renderAdminPortfolioList();
        renderOverviewStats();
      } catch (err) {
        console.error(err);
      }
    });
  }

  // [5] Add Client Form
  const addClientForm = document.getElementById("form_add_client") as HTMLFormElement;
  if (addClientForm) {
    addClientForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = (document.getElementById("client_input_name") as HTMLInputElement).value;
      
      const fileInput = document.getElementById("client_input_logo") as HTMLElement;
      const logoBase64 = fileInput.getAttribute("data-base64") || "";

      if (!logoBase64) {
        showToast("দয়া করে একটি লোগো ছবি আপলোড করুন!", true);
        return;
      }

      const clientsRaw = localStorage.getItem("clients_data") || "[]";
      try {
        const clients = JSON.parse(clientsRaw);
        clients.push({ name, logoUrl: logoBase64 });

        saveAndSyncItem("clients_data", JSON.stringify(clients));
        showToast("নতুন ক্লায়েন্ট লোগো যুক্ত করা হয়েছে!");

        addClientForm.reset();
        fileInput.removeAttribute("data-base64");
        const pImg = document.getElementById("client_preview_img") as HTMLImageElement;
        if (pImg) pImg.classList.add("hidden");

        renderAdminClientsList();
        renderOverviewStats();
      } catch (err) {
        console.error(err);
      }
    });
  }

  // [6] Add Review Form
  const addReviewForm = document.getElementById("form_add_review") as HTMLFormElement;
  if (addReviewForm) {
    addReviewForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = (document.getElementById("review_input_name") as HTMLInputElement).value;
      const company = (document.getElementById("review_input_company") as HTMLInputElement).value;
      const rating = parseInt((document.getElementById("review_input_rating") as HTMLSelectElement).value, 10);
      const text = (document.getElementById("review_input_text") as HTMLTextAreaElement).value;

      const fileInput = document.getElementById("review_input_photo") as HTMLElement;
      let photoBase64 = fileInput.getAttribute("data-base64") || "";

      if (!photoBase64) {
        // Fallback default avatar values
        photoBase64 = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";
      }

      const reviewsRaw = localStorage.getItem("reviews_data") || "[]";
      try {
        const reviews = JSON.parse(reviewsRaw);
        reviews.push({
          id: "r_" + Date.now(),
          name,
          company,
          rating,
          text,
          photoUrl: photoBase64
        });

        saveAndSyncItem("reviews_data", JSON.stringify(reviews));
        showToast("নিউট রিভিউ এবং মতামত রেকর্ড করা হয়েছে!");

        addReviewForm.reset();
        fileInput.removeAttribute("data-base64");
        const prev = document.getElementById("review_preview_img") as HTMLImageElement;
        if (prev) prev.classList.add("hidden");

        renderAdminReviewsList();
        renderOverviewStats();
      } catch (err) {
        console.error(err);
      }
    });
  }

  // [7] Save About Us Info
  const aboutForm = document.getElementById("admin-about-general-form");
  if (aboutForm) {
    aboutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const bioValue = (document.getElementById("about_input_bio") as HTMLTextAreaElement).value;

      const aboutRaw = localStorage.getItem("about_data") || "{}";
      try {
        const about = JSON.parse(aboutRaw);
        about.bio = bioValue;

        // Collect stats values dynamically
        if (about.stats) {
          about.stats.forEach((stat: any, index: number) => {
            const labelEl = document.getElementById(`stat_label_${index}`) as HTMLInputElement;
            const valueEl = document.getElementById(`stat_value_${index}`) as HTMLInputElement;
            if (labelEl && valueEl) {
              stat.label = labelEl.value;
              stat.value = valueEl.value;
            }
          });
        }

        saveAndSyncItem("about_data", JSON.stringify(about));
        showToast("পরিচিতি এবং পরিসংখ্যান সেভ করা হয়েছে!");
        renderOverviewStats();
      } catch (err) {
        console.error(err);
      }
    });
  }

  // [8] Add Team Member Form
  const addTeamMember = document.getElementById("form_add_team_member") as HTMLFormElement;
  if (addTeamMember) {
    addTeamMember.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = (document.getElementById("about_team_input_name") as HTMLInputElement).value;
      const role = (document.getElementById("about_team_input_role") as HTMLInputElement).value;

      const fileInput = document.getElementById("about_team_input_photo") as HTMLElement;
      let photoBase64 = fileInput.getAttribute("data-base64") || "";

      if (!photoBase64) {
        photoBase64 = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80";
      }

      const aboutRaw = localStorage.getItem("about_data") || "{}";
      try {
        const about = JSON.parse(aboutRaw);
        if (!about.team) about.team = [];

        about.team.push({ name, role, photoUrl: photoBase64 });
        saveAndSyncItem("about_data", JSON.stringify(about));

        showToast("টিমের নতুন সদস্য যুক্ত করা হয়েছে!");
        
        addTeamMember.reset();
        fileInput.removeAttribute("data-base64");
        const preview = document.getElementById("about_team_preview_img") as HTMLImageElement;
        if (preview) preview.classList.add("hidden");

        renderAdminAboutSettings();
        renderOverviewStats();
      } catch (err) {
        console.error(err);
      }
    });
  }

  // [9] Save Contact and Social settings
  const contactForm = document.getElementById("admin-contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const whatsapp = (document.getElementById("contact_input_whatsapp") as HTMLInputElement).value;
      const email = (document.getElementById("contact_input_email_admin") as HTMLInputElement).value;
      const location = (document.getElementById("contact_input_location") as HTMLInputElement).value;

      const facebook = (document.getElementById("social_input_facebook") as HTMLInputElement).value;
      const instagram = (document.getElementById("social_input_instagram") as HTMLInputElement).value;
      const youtube = (document.getElementById("social_input_youtube") as HTMLInputElement).value;

      saveAndSyncItem("contact_info", JSON.stringify({ whatsapp, email, location }));
      saveAndSyncItem("social_links", JSON.stringify({ facebook, instagram, youtube }));

      showToast("যোগাযোগ এবং সোশ্যাল ডাটা আপডেট করা হয়েছে!");
    });
  }

  // [10] Save Footer data
  const footerForm = document.getElementById("admin-footer-form");
  if (footerForm) {
    footerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const desc = (document.getElementById("footer_input_desc") as HTMLTextAreaElement).value;
      const copyright = (document.getElementById("footer_input_copy") as HTMLInputElement).value;

      saveAndSyncItem("footer_data", JSON.stringify({ desc, copyright }));
      showToast("ফুটার কপিরাইট এবং ডেসক্রিপশন সেভ হয়েছে!");
    });
  }
}

// Global hookups so we can easily bind standard inline clicks of Dynamically Rendered layout tables

(window as any).deleteAdminService = function (id: string) {
  if (confirm("আপনি কি নিশ্চিতভাবে এই সার্ভিসটি মুছে ফেলতে চান?")) {
    const servicesRaw = localStorage.getItem("services_data") || "[]";
    try {
      const services = JSON.parse(servicesRaw);
      const filtered = services.filter((s: any) => s.id !== id);
      saveAndSyncItem("services_data", JSON.stringify(filtered));
      
      showToast("সার্ভিসটি ডিলিট করা হয়েছে।");
      renderAdminServicesList();
      renderOverviewStats();
    } catch (e) {
      console.error(e);
    }
  }
};

(window as any).deleteAdminPortfolio = function (id: string) {
  if (confirm("আপনি কি এই প্রজেক্টটি গ্যালারি থেকে বাদ দিতে চান?")) {
    const portfolioRaw = localStorage.getItem("portfolio_data") || "[]";
    try {
      const portfolio = JSON.parse(portfolioRaw);
      const filtered = portfolio.filter((p: any) => p.id !== id);
      saveAndSyncItem("portfolio_data", JSON.stringify(filtered));

      showToast("পোর্টফোলিও আইটেম বাদ দেওয়া হয়েছে!");
      renderAdminPortfolioList();
      renderOverviewStats();
    } catch (error) {
      console.error(error);
    }
  }
};

(window as any).deleteAdminClient = function (idx: number) {
  if (confirm("আপনি কি এই ক্লায়েন্ট ব্যান্ড লোগোটি ডিলিট করতে চান?")) {
    const clientsRaw = localStorage.getItem("clients_data") || "[]";
    try {
      const clients = JSON.parse(clientsRaw);
      clients.splice(idx, 1);
      saveAndSyncItem("clients_data", JSON.stringify(clients));

      showToast("লোগো ডিলিট করা হয়েছে।");
      renderAdminClientsList();
      renderOverviewStats();
    } catch (e) {
      console.error(e);
    }
  }
};

(window as any).deleteAdminReview = function (id: string) {
  if (confirm("আপনি কি এই ক্লায়েন্ট রিভিউ মেসেজটি ডিলিট করতে চান?")) {
    const reviewsRaw = localStorage.getItem("reviews_data") || "[]";
    try {
      const reviews = JSON.parse(reviewsRaw);
      const filtered = reviews.filter((r: any) => r.id !== id);
      saveAndSyncItem("reviews_data", JSON.stringify(filtered));

      showToast("রিভিউ মুছে ফেলা হয়েছে!");
      renderAdminReviewsList();
      renderOverviewStats();
    } catch (e) {
      console.error(e);
    }
  }
};

(window as any).deleteAdminTeamMember = function (idx: number) {
  if (confirm("আপনি কি টিম থেকে এই সদস্যকে বাদ দিতে চান?")) {
    const aboutRaw = localStorage.getItem("about_data") || "{}";
    try {
      const about = JSON.parse(aboutRaw);
      if (about.team) {
        about.team.splice(idx, 1);
        saveAndSyncItem("about_data", JSON.stringify(about));
      }
      showToast("টিম মেম্বারকে বাদ দেওয়া হয়েছে!");
      renderAdminAboutSettings();
      renderOverviewStats();
    } catch (err) {
      console.error(err);
    }
  }
};

(window as any).deleteAdminSubmission = function (id: string) {
  if (confirm("আপনি কি বুক করা এই কন্টাক্ট রিকোয়েস্ট মেসেজটি ডিলিট করতে চান?")) {
    const submissionsRaw = localStorage.getItem("contact_submissions") || "[]";
    try {
      const submissions = JSON.parse(submissionsRaw);
      const filtered = submissions.filter((s: any) => s.id !== id);
      saveAndSyncItem("contact_submissions", JSON.stringify(filtered));

      showToast("রিকোয়েস্ট মেসেজটি ডিলিট করা হয়েছে।");
      renderAdminContactSubmissions();
      renderOverviewStats();
    } catch (err) {
      console.error(err);
    }
  }
};


// ==================== [EDIT MODAL CONTROLLERS & HOOKS] ====================

function configureEditFields(fieldsToOpen: string[]) {
  const groups = ["title", "subfield", "category", "rating", "url1", "description", "image"];
  groups.forEach((g) => {
    const el = document.getElementById(`edit-group-${g}`);
    if (el) {
      if (fieldsToOpen.includes(g)) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
      }
    }
  });
}

function setupEditModal() {
  const modal = document.getElementById("admin-edit-modal");
  const form = document.getElementById("admin-edit-form") as HTMLFormElement;
  const btnClose = document.getElementById("close-edit-modal");
  const btnCancel = document.getElementById("btn-cancel-edit");

  if (!modal || !form) return;

  const closeModal = () => {
    modal.classList.add("hidden");
    form.reset();
    const picker = document.getElementById("edit_image_picker") as HTMLElement;
    if (picker) picker.removeAttribute("data-base64");
    const preview = document.getElementById("edit_image_pre") as HTMLImageElement;
    if (preview) {
      preview.src = "";
      preview.classList.add("hidden");
    }
  };

  btnClose?.addEventListener("click", closeModal);
  btnCancel?.addEventListener("click", closeModal);

  // Form submit handler
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = (document.getElementById("edit_item_id") as HTMLInputElement).value;
    const indexStr = (document.getElementById("edit_item_index") as HTMLInputElement).value;
    const type = (document.getElementById("edit_item_type") as HTMLInputElement).value;

    const titleValue = (document.getElementById("edit_input_title") as HTMLInputElement).value.trim();
    const subfieldValue = (document.getElementById("edit_input_subfield") as HTMLInputElement).value.trim();
    const categoryValue = (document.getElementById("edit_input_category") as HTMLSelectElement).value;
    const ratingValue = parseInt((document.getElementById("edit_input_rating") as HTMLSelectElement).value, 10);
    const url1Value = (document.getElementById("edit_input_url1") as HTMLInputElement).value.trim();
    const descValue = (document.getElementById("edit_input_description") as HTMLTextAreaElement).value.trim();

    const picker = document.getElementById("edit_image_picker") as HTMLElement;
    const newBase64 = picker.getAttribute("data-base64") || "";

    if (type === "service") {
      const servicesRaw = localStorage.getItem("services_data") || "[]";
      try {
        const services = JSON.parse(servicesRaw);
        const item = services.find((s: any) => s.id === id);
        if (item) {
          item.title = titleValue;
          item.icon = subfieldValue;
          item.description = descValue;
          saveAndSyncItem("services_data", JSON.stringify(services));
          showToast("সার্ভিস সফলভাবে আপডেট করা হয়েছে!");
          renderAdminServicesList();
        }
      } catch (err) { console.error(err); }
    } else if (type === "portfolio") {
      const portfolioRaw = localStorage.getItem("portfolio_data") || "[]";
      try {
        const portfolio = JSON.parse(portfolioRaw);
        const item = portfolio.find((p: any) => p.id === id);
        if (item) {
          item.title = titleValue;
          item.category = categoryValue;
          item.imageUrl = newBase64 || item.imageUrl;
          item.videoUrl = categoryValue === "Video Editing" ? url1Value : undefined;
          item.siteUrl = categoryValue === "Website" ? url1Value : undefined;
          saveAndSyncItem("portfolio_data", JSON.stringify(portfolio));
          showToast("প্রজেক্ট সফলভাবে আপডেট করা হয়েছে!");
          renderAdminPortfolioList();
        }
      } catch (err) { console.error(err); }
    } else if (type === "client") {
      const idx = parseInt(indexStr, 10);
      const clientsRaw = localStorage.getItem("clients_data") || "[]";
      try {
        const clients = JSON.parse(clientsRaw);
        if (clients[idx]) {
          clients[idx].name = titleValue;
          clients[idx].logoUrl = newBase64 || clients[idx].logoUrl;
          saveAndSyncItem("clients_data", JSON.stringify(clients));
          showToast("অংশীদার ব্যান্ড লোগো সফলভাবে আপডেট করা হয়েছে!");
          renderAdminClientsList();
        }
      } catch (err) { console.error(err); }
    } else if (type === "review") {
      const reviewsRaw = localStorage.getItem("reviews_data") || "[]";
      try {
        const reviews = JSON.parse(reviewsRaw);
        const item = reviews.find((r: any) => r.id === id);
        if (item) {
          item.name = titleValue;
          item.company = subfieldValue;
          item.rating = ratingValue;
          item.text = descValue;
          item.photoUrl = newBase64 || item.photoUrl;
          saveAndSyncItem("reviews_data", JSON.stringify(reviews));
          showToast("ক্লায়েন্ট রিভিউ সফলভাবে আপডেট করা হয়েছে!");
          renderAdminReviewsList();
        }
      } catch (err) { console.error(err); }
    } else if (type === "team") {
      const idx = parseInt(indexStr, 10);
      const aboutRaw = localStorage.getItem("about_data") || "{}";
      try {
        const about = JSON.parse(aboutRaw);
        if (about.team && about.team[idx]) {
          about.team[idx].name = titleValue;
          about.team[idx].role = subfieldValue;
          about.team[idx].photoUrl = newBase64 || about.team[idx].photoUrl;
          saveAndSyncItem("about_data", JSON.stringify(about));
          showToast("টিম মেম্বারের তথ্য সফলভাবে আপডেট করা হয়েছে!");
          renderAdminAboutSettings();
        }
      } catch (err) { console.error(err); }
    }

    renderOverviewStats();
    closeModal();
  });
}

(window as any).editAdminService = function (id: string) {
  const servicesRaw = localStorage.getItem("services_data") || "[]";
  try {
    const services = JSON.parse(servicesRaw);
    const item = services.find((s: any) => s.id === id);
    if (!item) return;

    const modal = document.getElementById("admin-edit-modal");
    if (!modal) return;

    modal.classList.remove("hidden");

    // Configure headers and metadata
    const modalTitle = document.getElementById("edit-modal-title")?.querySelector("span");
    if (modalTitle) modalTitle.textContent = "সার্ভিস ক্যাটাগরি সংশোধন";

    (document.getElementById("edit_item_id") as HTMLInputElement).value = id;
    (document.getElementById("edit_item_type") as HTMLInputElement).value = "service";

    // Set labels
    const lblTitle = document.getElementById("edit-label-title");
    if (lblTitle) lblTitle.textContent = "সার্ভিস টাইটেল / নাম";
    
    const lblSub = document.getElementById("edit-label-subfield");
    if (lblSub) lblSub.textContent = "সার্ভিস আইকন ক্লাস (Remixicon বা Emoji)";

    const lblDesc = document.getElementById("edit-label-description");
    if (lblDesc) lblDesc.textContent = "সংক্ষিপ্ত বিবরণ";

    // Show/hide correct groups
    configureEditFields(["title", "subfield", "description"]);

    // Set values
    (document.getElementById("edit_input_title") as HTMLInputElement).value = item.title;
    (document.getElementById("edit_input_subfield") as HTMLInputElement).value = item.icon || "";
    (document.getElementById("edit_input_description") as HTMLTextAreaElement).value = item.description || "";

  } catch (err) { console.error(err); }
};

(window as any).editAdminPortfolio = function (id: string) {
  const portfolioRaw = localStorage.getItem("portfolio_data") || "[]";
  try {
    const portfolio = JSON.parse(portfolioRaw);
    const item = portfolio.find((p: any) => p.id === id);
    if (!item) return;

    const modal = document.getElementById("admin-edit-modal");
    if (!modal) return;

    modal.classList.remove("hidden");

    const modalTitle = document.getElementById("edit-modal-title")?.querySelector("span");
    if (modalTitle) modalTitle.textContent = "প্রজেক্ট পোর্টফোলিও সংশোধন";

    (document.getElementById("edit_item_id") as HTMLInputElement).value = id;
    (document.getElementById("edit_item_type") as HTMLInputElement).value = "portfolio";

    const lblTitle = document.getElementById("edit-label-title");
    if (lblTitle) lblTitle.textContent = "প্রজেক্ট টাইটেল / নাম";

    const lblUrl1 = document.getElementById("edit-label-url1");
    if (lblUrl1) lblUrl1.textContent = "প্রজেক্ট ভিডিও বা লাইভ সাইট ইউআরএল (URL)";

    const lblImg = document.getElementById("edit-label-image");
    if (lblImg) lblImg.textContent = "প্রজেক্ট থাম্বনেইল ছবি";

    configureEditFields(["title", "category", "url1", "image"]);

    (document.getElementById("edit_input_title") as HTMLInputElement).value = item.title;
    (document.getElementById("edit_input_category") as HTMLSelectElement).value = item.category;
    (document.getElementById("edit_input_url1") as HTMLInputElement).value = item.category === "Video Editing" ? (item.videoUrl || "") : (item.siteUrl || "");
    
    const pre = document.getElementById("edit_image_pre") as HTMLImageElement;
    if (pre && item.imageUrl) {
      pre.src = item.imageUrl;
      pre.classList.remove("hidden");
    }

    const catSelect = document.getElementById("edit_input_category") as HTMLSelectElement;
    if (catSelect) {
      const updateUrlLabel = () => {
        if (lblUrl1) {
          if (catSelect.value === "Video Editing") {
            lblUrl1.textContent = "ভিডিও প্রজেক্ট URL (যেমন https://www.youtube.com/embed/...)";
          } else if (catSelect.value === "Website") {
            lblUrl1.textContent = "লাইভ সাইট লিঙ্ক / ইউআরএল";
          } else {
            lblUrl1.textContent = "লিঙ্ক / ইউআরএল";
          }
        }
      };
      catSelect.onchange = updateUrlLabel;
      updateUrlLabel();
    }

  } catch (err) { console.error(err); }
};

(window as any).editAdminClient = function (idx: number) {
  const clientsRaw = localStorage.getItem("clients_data") || "[]";
  try {
    const clients = JSON.parse(clientsRaw);
    const item = clients[idx];
    if (!item) return;

    const modal = document.getElementById("admin-edit-modal");
    if (!modal) return;

    modal.classList.remove("hidden");

    const modalTitle = document.getElementById("edit-modal-title")?.querySelector("span");
    if (modalTitle) modalTitle.textContent = "অংশীদার ব্র্যান্ড তথ্য সংশোধন";

    (document.getElementById("edit_item_index") as HTMLInputElement).value = idx.toString();
    (document.getElementById("edit_item_type") as HTMLInputElement).value = "client";

    const lblTitle = document.getElementById("edit-label-title");
    if (lblTitle) lblTitle.textContent = "কোম্পানি / ব্র্যান্ডের নাম";

    const lblImg = document.getElementById("edit-label-image");
    if (lblImg) lblImg.textContent = "ব্র্যান্ড লোগো ইমেজ";

    configureEditFields(["title", "image"]);

    (document.getElementById("edit_input_title") as HTMLInputElement).value = item.name;
    const pre = document.getElementById("edit_image_pre") as HTMLImageElement;
    if (pre && item.logoUrl) {
      pre.src = item.logoUrl;
      pre.classList.remove("hidden");
    }

  } catch (err) { console.error(err); }
};

(window as any).editAdminReview = function (id: string) {
  const reviewsRaw = localStorage.getItem("reviews_data") || "[]";
  try {
    const reviews = JSON.parse(reviewsRaw);
    const item = reviews.find((r: any) => r.id === id);
    if (!item) return;

    const modal = document.getElementById("admin-edit-modal");
    if (!modal) return;

    modal.classList.remove("hidden");

    const modalTitle = document.getElementById("edit-modal-title")?.querySelector("span");
    if (modalTitle) modalTitle.textContent = "গ্রাহক রিভিউ ও ডেটা সংশোধন";

    (document.getElementById("edit_item_id") as HTMLInputElement).value = id;
    (document.getElementById("edit_item_type") as HTMLInputElement).value = "review";

    const lblTitle = document.getElementById("edit-label-title");
    if (lblTitle) lblTitle.textContent = "গ্রাহকের নাম (বাংলা বা ইংরেজি)";

    const lblSub = document.getElementById("edit-label-subfield");
    if (lblSub) lblSub.textContent = "কোম্পানি / ডেজিগনেশন";

    const lblDesc = document.getElementById("edit-label-description");
    if (lblDesc) lblDesc.textContent = "রিভিউ বিবরণ / মতামত বার্তা";

    const lblImg = document.getElementById("edit-label-image");
    if (lblImg) lblImg.textContent = "গ্রাহকের প্রোফাইল ছবি";

    configureEditFields(["title", "subfield", "rating", "description", "image"]);

    (document.getElementById("edit_input_title") as HTMLInputElement).value = item.name;
    (document.getElementById("edit_input_subfield") as HTMLInputElement).value = item.company || "";
    (document.getElementById("edit_input_rating") as HTMLSelectElement).value = (item.rating || 5).toString();
    (document.getElementById("edit_input_description") as HTMLTextAreaElement).value = item.text || "";

    const pre = document.getElementById("edit_image_pre") as HTMLImageElement;
    if (pre && item.photoUrl) {
      pre.src = item.photoUrl;
      pre.classList.remove("hidden");
    }

  } catch (err) { console.error(err); }
};

(window as any).editAdminTeamMember = function (idx: number) {
  const aboutRaw = localStorage.getItem("about_data") || "{}";
  try {
    const about = JSON.parse(aboutRaw);
    const item = about.team?.[idx];
    if (!item) return;

    const modal = document.getElementById("admin-edit-modal");
    if (!modal) return;

    modal.classList.remove("hidden");

    const modalTitle = document.getElementById("edit-modal-title")?.querySelector("span");
    if (modalTitle) modalTitle.textContent = "টিম সদস্য তথ্য সংশোধন";

    (document.getElementById("edit_item_index") as HTMLInputElement).value = idx.toString();
    (document.getElementById("edit_item_type") as HTMLInputElement).value = "team";

    const lblTitle = document.getElementById("edit-label-title");
    if (lblTitle) lblTitle.textContent = "সদস্যের নাম";

    const lblSub = document.getElementById("edit-label-subfield");
    if (lblSub) lblSub.textContent = "তার পদবী (Role)";

    const lblImg = document.getElementById("edit-label-image");
    if (lblImg) lblImg.textContent = "সদস্যের প্রোফাইল ছবি";

    configureEditFields(["title", "subfield", "image"]);

    (document.getElementById("edit_input_title") as HTMLInputElement).value = item.name;
    (document.getElementById("edit_input_subfield") as HTMLInputElement).value = item.role || "";

    const pre = document.getElementById("edit_image_pre") as HTMLImageElement;
    if (pre && item.photoUrl) {
      pre.src = item.photoUrl;
      pre.classList.remove("hidden");
    }

  } catch (err) { console.error(err); }
};
