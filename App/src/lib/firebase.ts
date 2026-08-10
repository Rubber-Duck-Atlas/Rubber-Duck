import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD3w594qOZo30IWZ5KvhET2vtBG1F035ns",
  authDomain: "rubberduck-d845a.firebaseapp.com",
  projectId: "rubberduck-d845a",
  storageBucket: "rubberduck-d845a.firebasestorage.app",
  messagingSenderId: "429001165100",
  appId: "1:429001165100:web:4aac0d8260abd01ea8c489",
  measurementId: "G-K3YNJZ2NLW",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const verificationUrl =
  typeof window !== "undefined" && window.location.origin.startsWith("http")
    ? `${window.location.origin}/verifyemail`
    : "https://rubberduck-d845a.firebaseapp.com/verifyemail";

const emailVerificationActionCodeSettings = {
  url: verificationUrl,
  handleCodeInApp: false,
};

void setPersistence(auth, browserLocalPersistence).catch(() => undefined);

export { app, auth, emailVerificationActionCodeSettings };