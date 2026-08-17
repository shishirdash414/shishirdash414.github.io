import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyCZoK2Ulrml9l62kkGk98ZDbbehWSIDclo",
  authDomain: "shishir-portfolio-cms.firebaseapp.com",
  projectId: "shishir-portfolio-cms",
  storageBucket: "shishir-portfolio-cms.firebasestorage.app",
  messagingSenderId: "175072208368",
  appId: "1:175072208368:web:7de55737d851dd890a2935"

};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);


export { app, auth };
