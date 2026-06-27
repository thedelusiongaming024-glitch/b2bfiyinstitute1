declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

let isPixelScriptLoaded = false;
let currentPixelId = '';

/**
 * Initializes the Facebook Pixel script dynamically on the page.
 */
export function initPixel(pixelId: string) {
  if (!pixelId || typeof window === 'undefined') return;

  // If pixel ID changes, re-initialize
  if (currentPixelId === pixelId && isPixelScriptLoaded) {
    return;
  }

  currentPixelId = pixelId;

  // Initialize the FBQ queue if not already done
  if (!window.fbq) {
    window.fbq = function (...args: any[]) {
      window.fbq.callMethod ? window.fbq.callMethod.apply(window.fbq, args) : window.fbq.queue.push(args);
    };
    if (!window._fbq) window._fbq = window.fbq;
    window.fbq.push = window.fbq;
    window.fbq.loaded = true;
    window.fbq.version = '2.0';
    window.fbq.queue = [];
  }

  // Inject the Meta script tag if not already done
  if (!isPixelScriptLoaded) {
    const existingScript = document.getElementById('facebook-pixel-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'facebook-pixel-script';
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      
      // Also inject noscript fallback
      const noscript = document.createElement('noscript');
      noscript.id = 'facebook-pixel-noscript';
      const img = document.createElement('img');
      img.height = 1;
      img.width = 1;
      img.style.display = 'none';
      img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
      noscript.appendChild(img);

      document.head.appendChild(script);
      document.head.appendChild(noscript);
    }
    isPixelScriptLoaded = true;
  }

  try {
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
    console.log(`[Pixel] Initialized & Tracked PageView for ID: ${pixelId}`);
  } catch (err) {
    console.error('[Pixel] Error during init:', err);
  }
}

/**
 * Tracks a custom or standard Facebook Pixel event.
 */
export function trackPixelEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window === 'undefined' || !window.fbq) {
    return;
  }
  try {
    if (params) {
      window.fbq('track', eventName, params);
      console.log(`[Pixel] Event tracked: ${eventName}`, params);
    } else {
      window.fbq('track', eventName);
      console.log(`[Pixel] Event tracked: ${eventName}`);
    }
  } catch (err) {
    console.error(`[Pixel] Error tracking event "${eventName}":`, err);
  }
}

/**
 * Standard Events Helpers
 */

export function trackPageView() {
  trackPixelEvent('PageView');
}

export function trackViewContent(type: 'course' | 'ebook' | 'portfolio' | 'service', id: string, name: string, price?: number) {
  trackPixelEvent('ViewContent', {
    content_type: 'product',
    content_ids: [id],
    content_name: name,
    content_category: type,
    value: price || 0,
    currency: 'BDT'
  });
}

export function trackInitiateCheckout(type: 'course' | 'ebook', id: string, name: string, price: number) {
  trackPixelEvent('InitiateCheckout', {
    content_type: 'product',
    content_ids: [id],
    content_name: name,
    content_category: type,
    value: price,
    currency: 'BDT'
  });
}

export function trackLead(leadType: 'WhatsAppChat' | 'ContactForm', label: string) {
  trackPixelEvent('Lead', {
    content_category: 'Lead',
    content_name: leadType,
    description: label
  });
}

export function trackPurchase(type: 'course' | 'ebook', id: string, name: string, price: number, transactionId: string) {
  trackPixelEvent('Purchase', {
    content_type: 'product',
    content_ids: [id],
    content_name: name,
    content_category: type,
    value: price,
    currency: 'BDT',
    transaction_id: transactionId
  });
}
