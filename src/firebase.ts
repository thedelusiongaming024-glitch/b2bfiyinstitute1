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

// Initialize Firestore with the custom databaseId from config
const db = getFirestore(app, "ai-studio-75006d77-c024-4702-bd24-ea1d3fdfe717");

export { 
  db,
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
