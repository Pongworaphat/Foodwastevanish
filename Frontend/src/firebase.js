import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCzqyBCDZxGDR3ht0v_Y9PucWa6CLT27f0",
  authDomain: "foodwastevanisih.firebaseapp.com",
  projectId: "foodwastevanisih",
  storageBucket: "foodwastevanisih.firebasestorage.app",
  messagingSenderId: "438857007204",
  appId: "1:438857007204:web:3a0f63bfd390da18901f71",
  measurementId: "G-ZSMGL5VXR1"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);

