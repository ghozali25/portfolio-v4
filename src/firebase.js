import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { collection, addDoc, getDocs } from "@firebase/firestore"; // Perbarui ini


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBiRi7UsjeGrg5yQmP2XdC1EqAybyyEjg8",
  authDomain: "transretail-e7318.firebaseapp.com",
  projectId: "transretail-e7318",
  storageBucket: "transretail-e7318.firebasestorage.app",
  messagingSenderId: "856404642895",
  appId: "1:856404642895:web:2170bde84fbd0dbe8f6e3a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage, collection, addDoc };