// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
  authDomain: "assignr-taskmanager.firebaseapp.com",
  projectId: "assignr-taskmanager",
  storageBucket: "assignr-taskmanager.appspot.com",
  messagingSenderId: "200191846430",
  appId: "1:200191846430:web:806b69a3710dbe756a260f",
  measurementId: "G-V4RL8KC2EW",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
