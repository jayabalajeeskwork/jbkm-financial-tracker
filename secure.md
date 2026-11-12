// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBGpg5V209ToL1zB7-Z0mhb4Y-sBSlgUmgAIzaSyBGpg5V209ToL1zB7-Z0mhb4Y-sBSlgUmg",
  authDomain: "jbkm-finance.firebaseapp.com",
  projectId: "jbkm-finance",
  storageBucket: "jbkm-finance.firebasestorage.app",
  messagingSenderId: "98060646374",
  appId: "1:98060646374:web:be0af6e2ab4abac73fc827",
  measurementId: "G-ZXR9BZQ8BS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}