// lib/firebaseClient.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Only initialize Firebase if we have the required config
let app: any = null;
let auth: any = null;

if (typeof window !== 'undefined' && firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId) {
    try {
        app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
        auth = getAuth(app);
    } catch (error) {
        console.error('Firebase initialization error:', error);
    }
}

export { auth };
