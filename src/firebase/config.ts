import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate that credentials are set and are not placeholder values
const isConfigValid = 
  typeof firebaseConfig.apiKey === 'string' && 
  firebaseConfig.apiKey.length > 0 &&
  !firebaseConfig.apiKey.includes('your_') &&
  typeof firebaseConfig.projectId === 'string' &&
  firebaseConfig.projectId.length > 0;

let auth: any = null;
let googleProvider: any = null;
let isMockAuth = false;

if (isConfigValid) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (error) {
    console.warn("Failed to initialize Firebase app. Switching to mock authentication.", error);
    isMockAuth = true;
  }
} else {
  console.info("Firebase API Key is missing or invalid. Dashboard is running in Mock Auth Mode.");
  isMockAuth = true;
}

export { auth, googleProvider, isMockAuth };
