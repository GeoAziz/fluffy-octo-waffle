'use client';

import {initializeApp, getApp, getApps, FirebaseApp} from 'firebase/app';
import {getAuth, Auth} from 'firebase/auth';
import {getFirestore, Firestore} from 'firebase/firestore';
import { getAnalytics, Analytics } from "firebase/analytics";
import { getPerformance, FirebasePerformance } from "firebase/performance";

const firebaseConfig = {
  apiKey: "AIzaSyDETO0ohxe5Hmu5XBoWwZrnGbLNQ5fYdTk",
  authDomain: "kenya-land-trust.firebaseapp.com",
  projectId: "kenya-land-trust",
  storageBucket: "kenya-land-trust.appspot.com",
  messagingSenderId: "390036863335",
  appId: "1:390036863335:web:295ecb4c46f298aa5597c2",
  measurementId: "G-8TEKGJSJD1"
};

let analytics: Analytics | undefined = undefined;
let performance: FirebasePerformance | undefined = undefined;
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
  // Only initialize performance in production to avoid logging noise during dev
  if (process.env.NODE_ENV === 'production') {
    performance = getPerformance(app);
  }
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export {app, auth, db, analytics, performance};
