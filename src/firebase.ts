import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAjGO-HcleC83FEWEdV70NDRjJl_-WA6z8",
  authDomain: "gen-lang-client-0360036299.firebaseapp.com",
  projectId: "gen-lang-client-0360036299",
  storageBucket: "gen-lang-client-0360036299.firebasestorage.app",
  messagingSenderId: "616938180902",
  appId: "1:616938180902:web:d9d6baa43f8aa6bc4571e7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore with custom databaseId
export const db = getFirestore(app, "ai-studio-509b77e0-6aa0-4129-81f0-f4f14aa3c750");
