import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);

/* Elements */
const authScreen = document.getElementById("auth-screen");
const registerScreen = document.getElementById("register-screen");
const mainContent = document.getElementById("main");
const sidebar = document.getElementById("sidebar-config");

/* Inputs */
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const regEmail = document.getElementById("regEmail");
const regPassword = document.getElementById("regPassword");
const regUsername = document.getElementById("regUsername");

/* Buttons */
document.getElementById("go-register").onclick = () => {
  authScreen.classList.add("hidden");
  registerScreen.classList.remove("hidden");
};

document.getElementById("go-login").onclick = () => {
  registerScreen.classList.add("hidden");
  authScreen.classList.remove("hidden");
};

document.getElementById("login-btn").onclick = async () => {
  try {
    await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
  } catch (err) {
    alert("Error: " + err.code);
  }
};

document.getElementById("register-btn").onclick = async () => {
  try {
    const res = await createUserWithEmailAndPassword(auth, regEmail.value, regPassword.value);
    await updateProfile(res.user, { displayName: regUsername.value });
  } catch (err) {
    alert("Error: " + err.code);
  }
};

document.getElementById("reset-pass").onclick = async () => {
  const email = prompt("Ingresa tu correo:");
  if (!email) return;
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Correo enviado");
  } catch (err) {
    alert(err.code);
  }
};

/* Session Control */
onAuthStateChanged(auth, (user) => {
  if (user) {
    authScreen.classList.add("hidden");
    registerScreen.classList.add("hidden");
    mainContent.style.display = "block";
    sidebar.style.display = "block";
  } else {
    mainContent.style.display = "none";
    sidebar.style.display = "none";
    authScreen.classList.remove("hidden");
  }
});
