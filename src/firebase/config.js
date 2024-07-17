import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import firebase from 'firebase/app'
import 'firebase/auth'; 
import 'firebase/firestore'; 


const firebaseConfig = {
  apiKey: "AIzaSyAk85QRsnMQ3wzOYjxETBV2-zMkIjndi30",
  authDomain: "time-tracker-app-265ce.firebaseapp.com",
  databaseURL: "https://time-tracker-app-265ce-default-rtdb.firebaseio.com",
  projectId: "time-tracker-app-265ce",
  storageBucket: "time-tracker-app-265ce.appspot.com",
  messagingSenderId: "327323582622",
  appId: "1:327323582622:web:123e7a681dbb5ee77afb8f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };
export default app; 