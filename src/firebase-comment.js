import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { collection, addDoc } from "@firebase/firestore";

// Match the main app config
const firebaseConfig = {
  apiKey: "AIzaSyDfR1Z-6HHy68rFTAz3GxZplO9l-w4EXxw",
  authDomain: "testing-cec2c.firebaseapp.com",
  projectId: "testing-cec2c",
  storageBucket: "testing-cec2c.appspot.com",
  messagingSenderId: "559533993603",
  appId: "1:559533993603:web:91cdf64d6821332ed4b5b6"
};

// Reuse existing default app if available
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage, collection, addDoc };