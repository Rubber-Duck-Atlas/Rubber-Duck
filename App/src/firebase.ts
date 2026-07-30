// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD3w594qOZo30IWZ5KvhET2vtBG1F035ns",
  authDomain: "rubberduck-d845a.firebaseapp.com",
  projectId: "rubberduck-d845a",
  storageBucket: "rubberduck-d845a.firebasestorage.app",
  messagingSenderId: "429001165100",
  appId: "1:429001165100:web:4aac0d8260abd01ea8c489",
  measurementId: "G-K3YNJZ2NLW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;