import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';




const firebaseConfig = {
  apiKey: "AIzaSyAkRoTeereHNdo6-0iP7xIDEVlDxesiE0U",
  authDomain: "smart-recipe-generator-b381b.firebaseapp.com",
  projectId: "smart-recipe-generator-b381b",
  storageBucket: "smart-recipe-generator-b381b.firebasestorage.app",
  messagingSenderId: "915730070779",
  appId: "1:915730070779:web:dd4e41139db850430ac45e",
  measurementId: "G-8HCGB3FQ68"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Anonymous sign-in helper
export function signInAsGuest() {
  return signInAnonymously(auth);
}

export { auth, provider };
