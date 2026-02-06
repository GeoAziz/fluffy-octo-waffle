'use client';

import {initializeApp, getApp, getApps, FirebaseApp} from 'firebase/app';
import {getAuth, Auth} from 'firebase/auth';
import {getFirestore, Firestore} from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "studio-5381270789-53c19",
  "appId": "1:222004652932:web:661421367be7ba80b10bd1",
  "apiKey": "AIzaSyDPh2FY2dXI4gTR9n1N3PCkVn1497kpUJs",
  "authDomain": "studio-5381270789-53c19.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "222004652932",
  "storageBucket": "studio-5381270789-53c19.appspot.com"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
auth = getAuth(app);
db = getFirestore(app);

export {app, auth, db};
