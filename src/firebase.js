import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { collection, addDoc, getDocs } from "@firebase/firestore";


// User-provided Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfR1Z-6HHy68rFTAz3GxZplO9l-w4EXxw",
  authDomain: "testing-cec2c.firebaseapp.com",
  projectId: "testing-cec2c",
  storageBucket: "testing-cec2c.firebasestorage.app",
  messagingSenderId: "559533993603",
  appId: "1:559533993603:web:91cdf64d6821332ed4b5b6",
  measurementId: "G-QL6J5JE459"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
// Initialize analytics only in browser
if (typeof window !== 'undefined') {
  try { getAnalytics(app); } catch {}
}

export { db, storage, collection, addDoc };