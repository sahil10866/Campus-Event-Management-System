// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCcvt8WYGh0hfF7j5Xyj_SMwfFJ7C6NA0Y",
  authDomain: "campus-event-mang.firebaseapp.com",
  projectId: "campus-event-mang",
  storageBucket: "campus-event-mang.firebasestorage.app",
  messagingSenderId: "280015602554",
  appId: "1:280015602554:web:4c23befd69b7678ef94cc3",
  measurementId: "G-CC958PLNCZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 
export const messaging = getMessaging(app);

// Function to request notification permission and get the Device Token
export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, { 
      // 🛑 PASTE YOUR KEY FROM STEP 1 HERE:
      vapidKey: 'BLT4HOJ5Ma3Eiwzl1EtEI0VAkW-NSyZnN6_VmGkivM-PAX8rnjTAdbkWgHySpXHUS0XCKthE1IVxgEa-mNzSpbA' 
    });
    
    if (currentToken) {
      console.log('Firebase Device Token:', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
    return null;
  }
};

// Listen for messages while the app is open on the screen
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });