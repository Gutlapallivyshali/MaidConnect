// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 Paste your NEW config here
const firebaseConfig = {
  apiKey: "AIzaSyDzHJLT624JM_nNVmvciTJAPhPfQIjwH_0",
  authDomain: "maid-connect-ed4b1.firebaseapp.com",
  projectId: "maid-connect-ed4b1",
  storageBucket: "maid-connect-ed4b1.firebasestorage.app",
  messagingSenderId: "427018773756",
  appId: "1:427018773756:web:709ea465af69cb943d6379"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
