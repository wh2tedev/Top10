// Rellena esto con tus credenciales de Firebase.
// Si lo dejas así, el login funcionará en modo local.

const firebaseConfig = {
  apiKey: "AIzaSyD6RiclfPQ2z5jMJylk27eTuydoHD2gDCk",
  authDomain: "topd-1be54.firebaseapp.com",
  projectId: "topd-1be54",
  storageBucket: "topd-1be54.firebasestorage.app",
  messagingSenderId: "428839382390",
  appId: "1:428839382390:web:ef33025bd5285fd9d09e57"
};

if (firebaseConfig.apiKey === "AIzaSyD6RiclfPQ2z5jMJylk27eTuydoHD2gDCk") {
  window.__firebaseConfigPresent = false;
} else {
  firebase.initializeApp(firebaseConfig);
  window.__firebaseConfigPresent = true;
}
