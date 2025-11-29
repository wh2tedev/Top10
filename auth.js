const overlay = document.getElementById("auth-overlay");
const tabLogin = document.getElementById("tab-login");
const tabSignup = document.getElementById("tab-signup");
const formLogin = document.getElementById("form-login");
const formSignup = document.getElementById("form-signup");
const authError = document.getElementById("auth-error");

function showError(msg){
  authError.style.display = "block";
  authError.textContent = msg;
}

// Tabs
tabLogin.onclick = () => {
  formLogin.classList.remove("hidden");
  formSignup.classList.add("hidden");
  tabLogin.classList.add("active");
  tabSignup.classList.remove("active");
};

tabSignup.onclick = () => {
  formSignup.classList.remove("hidden");
  formLogin.classList.add("hidden");
  tabSignup.classList.add("active");
  tabLogin.classList.remove("active");
};

// Firebase or Local
let authReady = false;

function finishLogin() {
  overlay.style.display = "none";
  initApp(); // <- aquí se inicializa tu app real
}

formLogin.addEventListener("submit", (e)=>{
  e.preventDefault();

  const email = loginEmail.value.trim();
  const pass = loginPassword.value.trim();

  if (!email || !pass) return showError("Completa todos los campos");

  if (!window.__firebaseConfigPresent) {
    // modo local
    finishLogin();
  } else {
    firebase.auth().signInWithEmailAndPassword(email, pass)
      .then(()=> finishLogin())
      .catch(err=> showError(err.message));
  }
});

formSignup.addEventListener("submit", (e)=>{
  e.preventDefault();

  const user = signupUsername.value.trim();
  const email = signupEmail.value.trim();
  const pass = signupPassword.value.trim();

  if (user.length < 3) return showError("Usuario demasiado corto");

  if (!window.__firebaseConfigPresent) {
    finishLogin();
  } else {
    firebase.auth().createUserWithEmailAndPassword(email, pass)
      .then(()=> finishLogin())
      .catch(err=> showError(err.message));
  }
});