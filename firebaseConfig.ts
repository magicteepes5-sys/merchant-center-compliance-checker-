
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Helper to safely access process.env without crashing in browser environments where process is undefined
const getEnv = (key: string, fallback: string) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return fallback;
};

// TODO: Replace the following with your app's Firebase project configuration
// You can find these in the Firebase Console -> Project Settings
const firebaseConfig = {
  apiKey: getEnv("FIREBASE_API_KEY", "YOUR_API_KEY_HERE"),
  authDomain: getEnv("FIREBASE_AUTH_DOMAIN", "YOUR_PROJECT_ID.firebaseapp.com"),
  projectId: getEnv("FIREBASE_PROJECT_ID", "YOUR_PROJECT_ID"),
  storageBucket: getEnv("FIREBASE_STORAGE_BUCKET", "YOUR_PROJECT_ID.appspot.com"),
  messagingSenderId: getEnv("FIREBASE_MESSAGING_SENDER_ID", "YOUR_MESSAGING_SENDER_ID"),
  appId: getEnv("FIREBASE_APP_ID", "YOUR_APP_ID")
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
