import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firestore security rules (set in Firebase Console):
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /users/{uid}/fitlife {
//       allow read, write: if request.auth != null && request.auth.uid == uid;
//     }
//   }
// }

const firebaseConfig = {
  apiKey: "AIzaSyC1dNgRfbj9CExzP-f_8a4KHA-7sudouLo",
  authDomain: "fitlife-94ba5.firebaseapp.com",
  projectId: "fitlife-94ba5",
  storageBucket: "fitlife-94ba5.firebasestorage.app",
  messagingSenderId: "1030290659708",
  appId: "1:1030290659708:web:69825eecee0b0ef2032cf9"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
