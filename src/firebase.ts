import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD7VTU15sIzuSkrpDGgWTJ-OlsBT8slcKs",
  authDomain: "cybernetic-velocity-mnzsc.firebaseapp.com",
  projectId: "cybernetic-velocity-mnzsc",
  storageBucket: "cybernetic-velocity-mnzsc.firebasestorage.app",
  messagingSenderId: "156830206343",
  appId: "1:156830206343:web:c27bc48aa40d3464b46b22"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

const customDb = getFirestore(app, "ai-studio-75006d77-c024-4702-bd24-ea1d3fdfe717");
const defaultDb = getFirestore(app);

// Use customDb by default, but allow live reassignment to defaultDb
export let db = customDb;
let activeDb = customDb;

export function getDb() {
  return activeDb;
}

let checkPromise: Promise<void> | null = null;

export async function ensureDbConnected(): Promise<void> {
  if (checkPromise) return checkPromise;
  
  checkPromise = (async () => {
    try {
      // Perform a lightweight check against the settings collection on customDb
      const testRef = doc(customDb, 'settings', 'settings');
      await getDoc(testRef);
      console.log('✅ Firestore custom database connection verified!');
      activeDb = customDb;
      db = customDb;
    } catch (err) {
      console.warn('⚠️ Firestore custom database not available. Falling back to default database.', err);
      activeDb = defaultDb;
      db = defaultDb;
    }
  })();
  
  return checkPromise;
}

// Start checking early on load
if (typeof window !== 'undefined') {
  ensureDbConnected().catch(() => {});
}

export { 
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy
};

