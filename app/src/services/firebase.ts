import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Lifeline Web 앱 설정 (프로젝트 wheresick-5617a). 웹 전용.
const firebaseConfig = {
  apiKey: 'AIzaSyDR-Nd4hactI-CaCQurWn9gCa2VgcUa29A',
  authDomain: 'wheresick-5617a.firebaseapp.com',
  projectId: 'wheresick-5617a',
  storageBucket: 'wheresick-5617a.firebasestorage.app',
  messagingSenderId: '782955015449',
  appId: '1:782955015449:web:e25ca26b497ec236b12988',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
