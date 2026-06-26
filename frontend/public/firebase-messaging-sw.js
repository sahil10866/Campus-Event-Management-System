// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCcvt8WYGh0hfF7j5Xyj_SMwfFJ7C6NA0Y",
  authDomain: "campus-event-mang.firebaseapp.com",
  projectId: "campus-event-mang",
  storageBucket: "campus-event-mang.firebasestorage.app",
  messagingSenderId: "280015602554",
  appId: "1:280015602554:web:4c23befd69b7678ef94cc3",
  measurementId: "G-CC958PLNCZ"
};

// Initialize Firebase in the background
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Listen for background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg' // You can change this to your actual campus logo later
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});