/**
 * Client-Server State Synchronization Core
 * Supports both standard cPanel PHP storage (api.php) and real-time Cloud Supabase Database (Vercel)
 */

import { createClient } from "@supabase/supabase-js";

export const SYNC_KEYS = [
  "site_logo",
  "hero_photo",
  "hero_owner_title",
  "hero_tagline",
  "hero_subtext",
  "services_data",
  "portfolio_data",
  "clients_data",
  "reviews_data",
  "about_data",
  "contact_info",
  "social_links",
  "footer_data",
  "sub_site_title",
  "sub_site_meta_desc",
  "contact_submissions"
];

// Initialize Supabase Client with strict protection
const SUPABASE_URL = ((import.meta as any).env.VITE_SUPABASE_URL || "").trim();
const SUPABASE_ANON_KEY = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY || "").trim();

let supabase: any = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase Client initialized for secure data sync.");
  } catch (e) {
    console.error("Failed to initialize Supabase client:", e);
  }
}

// Load server data and save directly into browser localStorage so all devices match the state
export async function syncLoadFromServer(): Promise<boolean> {
  // Option 1: Supabase Load
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("site_data")
        .select("key, value");

      if (error) {
        console.error("Supabase load error:", error.message);
      } else if (data && data.length > 0) {
        (window as any).isSyncingServerLoad = true;
        let updatedAny = false;

        const lookup: Record<string, string> = {};
        for (const item of data) {
          lookup[item.key] = item.value;
        }

        for (const key of SYNC_KEYS) {
          if (lookup[key] !== undefined && lookup[key] !== null) {
            localStorage.setItem(key, lookup[key]);
            updatedAny = true;
          }
        }

        (window as any).isSyncingServerLoad = false;
        console.log("Website synced and loaded securely from Supabase Database!");
        return updatedAny;
      }
    } catch (e) {
      console.error("Supabase select failed:", e);
    }
  }

  // Option 2: PHP Fallback
  try {
    const response = await fetch("api.php");
    if (response.ok) {
      const data = await response.json();
      if (data && typeof data === "object" && Object.keys(data).length > 0) {
        (window as any).isSyncingServerLoad = true;
        let updatedAny = false;
        for (const key of SYNC_KEYS) {
          if (data[key] !== undefined && data[key] !== null) {
            localStorage.setItem(key, data[key]);
            updatedAny = true;
          }
        }
        (window as any).isSyncingServerLoad = false;
        return updatedAny;
      }
    }
  } catch (e) {
    (window as any).isSyncingServerLoad = false;
    console.log("PHP sync server not detected or running locally. Using local storage.", e);
  }
  return false;
}

// Push current local storage state to PHP backend or Cloud Supabase Database
export async function syncSaveToServer(): Promise<void> {
  const payload: Record<string, string | null> = {};
  for (const key of SYNC_KEYS) {
    payload[key] = localStorage.getItem(key);
  }

  // Option 1: Supabase Save
  if (supabase) {
    try {
      const rows = SYNC_KEYS.map((key) => ({
        key,
        value: payload[key] || ""
      }));

      // Bulk upsert into site_data table using "key" as the unique conflict target
      const { error } = await supabase
        .from("site_data")
        .upsert(rows, { onConflict: "key" });

      if (error) {
        console.error("Supabase upsert error:", error.message);
      } else {
        console.log("Successfully hosted and persistent in Supabase cloud!");
      }
    } catch (e) {
      console.error("Failed to write to Supabase:", e);
    }
  }
  
  // Option 2: PHP backend integration (Sync as secondary to maintain double safety)
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  
  if (sessionStorage.getItem("admin_logged_in") === "true") {
    headers["X-Admin-Auth"] = "3b76a31c1021da8fb1c5c94191159aea3c4a4fef5588b9a08315f6a3c5aa6e6a";
  }

  try {
    const response = await fetch("api.php", {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      console.error("Failed to sync changes with PHP server:", response.statusText);
    } else {
      console.log("Central cPanel database synced successfully!");
    }
  } catch (e) {
    console.log("PHP sync server not detected, changes saved in local storage or Supabase.", e);
  }
}
