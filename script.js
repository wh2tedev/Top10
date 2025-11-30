/* script.js — Auth0 (popup) + dashboard original integrado
   - Usa popup para login/signup (mejor UX)
   - Si popup es bloqueado: fallback a redirect
   - Muestra errores en #auth-error
   - Requiere que en Auth0 agregues:
     Allowed Web Origins: https://wh2tedev.github.io  AND https://wh2tedev.github.io/Top10/
     Allowed Callback URLs: https://wh2tedev.github.io/Top10/
     Allowed Logout URLs: https://wh2tedev.github.io/Top10/
*/

/* ---------------------
   CONFIG
   --------------------- */
const AUTH0_DOMAIN = "dev-euyjaxn4mla0dqq4.us.auth0.com";
const AUTH0_CLIENT_ID = "pjYxk7KUl2UQGlii03v2b6kbeSYjJoK1";

/* Your GitHub Pages project url (exact) */
const APP_URL = "https://wh2tedev.github.io/Top10/";

/* ---------------------
   AUTH0 INIT
   --------------------- */
let auth0Client = null;

async function initAuth() {
  try {
    auth0Client = await createAuth0Client({
      domain: AUTH0_DOMAIN,
      client_id: AUTH0_CLIENT_ID,
      cacheLocation: "localstorage",
      useRefreshTokens: true,
      // for popups we don't strictly need redirect_uri, but keep consistent
      authorizationParams: { redirect_uri: APP_URL }
    });
  } catch (err) {
    showAuthError("Error inicializando Auth0. Revisa la consola.");
    console.error("Auth0 init error:", err);
    return;
  }

  // If returning from a redirect (only possible if fallback redirect used)
  if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
    try {
      await auth0Client.handleRedirectCallback();
      // remove query params (safe)
      window.history.replaceState({}, document.title, APP_URL);
    } catch (err) {
      console.warn("handleRedirectCallback error:", err);
    }
  }

  const isAuthenticated = await auth0Client.isAuthenticated();

  if (!isAuthenticated) {
    // show auth screen
    showAuthScreen();
  } else {
    // logged in
    await onLoginSuccess();
  }

  // wire buttons
  wireAuthButtons();
}

/* ---------------------
  UI helpers
   --------------------- */
function showAuthScreen() {
  const auth = document.getElementById("auth-screen");
  const app = document.getElementById("app-content");
  if (auth) auth.classList.remove("hidden");
  if (app) app.classList.add("hidden");
}

function hideAuthScreen() {
  const auth = document.getElementById("auth-screen");
  if (auth) auth.classList.add("hidden");
}

function showAuthError(msg) {
  const el = document.getElementById("auth-error");
  if (!el) return;
  el.style.display = "block";
  el.innerText = msg;
  setTimeout(()=> { el.style.display = "none"; }, 6000);
}

/* ---------------------
   AUTH ACTIONS (popup with fallback)
   --------------------- */
async function loginPopup(isSignup = false) {
  if (!auth0Client) { showAuthError("Auth0 no inicializado"); return; }
  // disable buttons while working
  setAuthButtonsDisabled(true);
  try {
    const options = isSignup ? { authorizationParams: { screen_hint: "signup" } } : {};
    // try popup
    await auth0Client.loginWithPopup(options);
    await onLoginSuccess();
  } catch (err) {
    console.warn("Popup login failed, fallback to redirect:", err);
    // fallback to redirect (also handles blocked popups)
    try {
      const params = isSignup ? { authorizationParams: { screen_hint: "signup", redirect_uri: APP_URL } } : { authorizationParams: { redirect_uri: APP_URL } };
      await auth0Client.loginWithRedirect(params);
      // redirect happens; no further code
    } catch (err2) {
      console.error("Redirect fallback failed:", err2);
      showAuthError("No se pudo iniciar sesión. Revisa la consola.");
    }
  } finally {
    setAuthButtonsDisabled(false);
  }
}

function setAuthButtonsDisabled(state) {
  const btns = document.querySelectorAll("#btn-login, #btn-signup");
  btns.forEach(b => b.disabled = state);
}

/* ---------------------
   LOGOUT
   --------------------- */
async function logout() {
  if (!auth0Client) return;
  try {
    // clear local session then call auth0 logout
    await auth0Client.logout({ logoutParams: { returnTo: APP_URL } });
  } catch (err) {
    console.error("Logout error:", err);
    // fallback: reload the page
    window.location.href = APP_URL;
  }
}

/* ---------------------
   AFTER LOGIN
   --------------------- */
async function onLoginSuccess() {
  try {
    const user = await auth0Client.getUser();
    // Update UI: name + picture
    const elName = document.getElementById("user-name");
    const elPic = document.getElementById("user-pic");
    if (elName) elName.innerText = user.name || user.email || "Usuario";
    if (elPic && user.picture) {
      elPic.src = user.picture;
      elPic.style.display = "block";
    }
    // hide auth screen and show app
    hideAuthScreen();
    setTimeout(()=> document.getElementById("app-content").classList.remove("hidden"), 260);

    // Roles detection (custom claim https://myapp.example/roles)
    const roles = user["https://myapp.example/roles"] || user.roles || user.app_metadata?.roles || [];
    if (Array.isArray(roles) && roles.includes("admin")) addAdminBadge();

    // Start dashboard
    await startDashboard();
  } catch (err) {
    console.error("onLoginSuccess error:", err);
    showAuthError("Error al obtener perfil del usuario.");
  }
}

/* ---------------------
   Wire auth UI buttons
   --------------------- */
function wireAuthButtons() {
  const btnLogin = document.getElementById("btn-login");
  const btnSignup = document.getElementById("btn-signup");
  const btnLogout = document.getElementById("btn-logout");

  if (btnLogin) btnLogin.onclick = () => loginPopup(false);
  if (btnSignup) btnSignup.onclick = () => loginPopup(true);
  if (btnLogout) btnLogout.onclick = () => logout();
}

/* ---------------------
   ADD ADMIN BADGE
   --------------------- */
function addAdminBadge(){
  const header = document.querySelector(".header");
  if (!header) return;
  if (document.getElementById("admin-badge")) return;
  const span = document.createElement("div");
  span.id = "admin-badge";
  span.style.marginTop = "8px";
  span.style.color = "var(--accent)";
  span.style.fontWeight = "700";
  span.innerText = "⚙️ Admin";
  header.appendChild(span);
}

/* ---------------------
   INIT
   --------------------- */
window.addEventListener("load", () => {
  initAuth().catch(err => {
    console.error("initAuth error:", err);
    showAuthError("No se pudo inicializar autenticación.");
  });
});

/* ============================
   START DASHBOARD (tu código original)
   ============================ */
/* He pegado exactamente tu `startDashboard()` original aquí — no cambié la lógica. */

async function startDashboard(){
  /* VERSION C — script.js
     Mantiene y mejora toda la lógica:
     - carga JSON (nocache)
     - calcula puntajes totales y semanales
     - render tabla (mismo HTML)
     - medallas (no borra puntaje)
     - sidebar, switches, persisted prefs
     - collapse stats con animación suave
     - botón "ver más" centrado y show/hide
  */

  // Elements (scoped to app-content)
  const tableBody = document.querySelector("#tabla-jugadores tbody");
  const switchMedallas = document.getElementById("switch-medallas");
  const switchTema = document.getElementById("switch-tema");
  const selectOrden = document.getElementById("select-orden");
  const btnConfig = document.getElementById("btn-config");
  const sidebar = document.getElementById("sidebar-config");
  const btnVerMas = document.getElementById("btn-vermas");
  const sectionPartidos = document.getElementById("partidos-balon");
  const elJugadorSemana = document.getElementById("jugador-semana");

  // Preferences
  const prefMedallas = localStorage.getItem("mostrarMedallas") === "true";
  const prefOrden = localStorage.getItem("ordenRanking") || "puntaje";
  const prefTema = localStorage.getItem("temaClaro") === "true";

  // Apply stored prefs
  if (switchMedallas) switchMedallas.checked = prefMedallas;
  if (selectOrden) selectOrden.value = prefOrden;
  if (switchTema) switchTema.checked = prefTema;
  if (prefTema) document.body.classList.add("light");

  // Sidebar open/close
  if (btnConfig && sidebar) {
    btnConfig.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      btnConfig.style.display = sidebar.classList.contains("open") ? "none" : "flex";
      sidebar.setAttribute("aria-hidden", String(!sidebar.classList.contains("open")));
    });
  }

  document.addEventListener("click", (e) => {
    if (sidebar && btnConfig && !sidebar.contains(e.target) && !btnConfig.contains(e.target) && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
      btnConfig.style.display = "flex";
      sidebar.setAttribute("aria-hidden", "true");
    }
  });

  // Load JSON (force fresh by adding timestamp)
  let jugadores = [];
  try {
    const res = await fetch(`jugadores.json?nocache=${Date.now()}`);
    jugadores = await res.json();
  } catch (err) {
    console.error("Error al cargar jugadores.json", err);
    if (tableBody) tableBody.innerHTML = "<tr><td colspan='2'>Error al cargar datos.</td></tr>";
    return;
  }

  // Normalize & compute total scores
  jugadores.forEach(j => {
    j.ap = j.ap ?? "-";
    j.goles = j.goles ?? 0;
    j.asistencias = j.asistencias ?? 0;
    j.hattricks = j.hattricks ?? 0;
    j.salvadas = j.salvadas ?? 0;
    j.bloqueos = j.bloqueos ?? 0;
    j.entradas = j.entradas ?? 0;
    // total puntaje: rules
    if (j.nombre.includes("(POR)")) {
      j.puntaje = (j.goles * 2) + (j.asistencias) + (j.salvadas * 0.5);
    } else if (j.nombre.includes("(DFC)")) {
      j.puntaje = (j.goles * 2) + (j.asistencias) + (j.bloqueos * 0.5);
    } else {
      j.puntaje = (j.goles * 2) + (j.asistencias) + (j.hattricks * 3);
    }
    // ensure numeric precision to one decimal when needed
    j.puntaje = Number(Number(j.puntaje).toFixed(2));
  });

  /* ---------- RENDER ---------- */
  function renderTabla() {
    if (!tableBody) return;
    tableBody.innerHTML = "";
    jugadores.forEach((j, idx) => {
      const tr = document.createElement("tr");
      tr.className = "player";
      tr.tabIndex = 0;
      tr.dataset.index = idx;

      // cell: rank
      const tdRank = document.createElement("td");
      tdRank.innerText = idx + 1;

      // cell: name + score (we keep separate spans)
      const tdName = document.createElement("td");
      const wrap = document.createElement("div");
      wrap.className = "name-wrap";
      const scoreSpan = document.createElement("span");
      scoreSpan.className = "puntaje-inline";
      // display as: "⭐ 20" (if integer) else with 1 decimal
      const niceScore = Number.isInteger(j.puntaje) ? j.puntaje : j.puntaje.toFixed(1);
      scoreSpan.innerText = `⭐ ${niceScore}`;
      const nameSpan = document.createElement("span");
      nameSpan.className = "nombre-jugador";
      nameSpan.innerText = j.nombre;

      wrap.appendChild(scoreSpan);
      wrap.appendChild(nameSpan);
      tdName.appendChild(wrap);

      tr.appendChild(tdRank);
      tr.appendChild(tdName);

      // stats row
      const trStats = document.createElement("tr");
      trStats.className = "stats-row";
      trStats.setAttribute("aria-hidden", "true");

      // extra stats conditional
      let extraStats = "";
      if (j.nombre.includes("(POR)")) {
        extraStats = `🧤 <strong>Salvadas:</strong> ${j.salvadas}`;
      } else if (j.nombre.includes("(DFC)")) {
        extraStats = `🛡️ <strong>Bloqueos:</strong> ${j.bloqueos} &nbsp;|&nbsp; ⚔️ <strong>Entradas:</strong> ${j.entradas}`;
      } else {
        extraStats = `🎩 <strong>Hat-tricks:</strong> ${j.hattricks}`;
      }

      trStats.innerHTML = `
        <td colspan="2">
          <div class="stats-content">
            ⚽ <strong>Goles:</strong> ${j.goles} &nbsp;|&nbsp;
            🎯 <strong>Asistencias:</strong> ${j.asistencias} &nbsp;|&nbsp;
            📊 <strong>G/P:</strong> ${j.gp ?? "-"} &nbsp;|&nbsp;
            📈 <strong>A/P:</strong> ${j.ap} &nbsp;|&nbsp;
            ${extraStats}
          </div>
        </td>
      `;

      tableBody.appendChild(tr);
      tableBody.appendChild(trStats);
    });

    aplicarMedallas(); // if enabled
    attachRowEvents();
  }

  /* ---------- MEDALS ---------- */
  function aplicarMedallas() {
    // only set visual medal on the name span (not overwrite score)
    if (!switchMedallas || !switchMedallas.checked) return;
    document.querySelectorAll(".player").forEach((tr, i) => {
      const nameSpan = tr.querySelector(".nombre-jugador");
      if (!nameSpan) return;
      const baseName = jugadores[i].nombre;
      if (i === 0) nameSpan.innerText = `🥇 ${baseName}`;
      else if (i === 1) nameSpan.innerText = `🥈 ${baseName}`;
      else if (i === 2) nameSpan.innerText = `🥉 ${baseName}`;
      else nameSpan.innerText = baseName;
    });
  }

  /* ---------- SORT / ORDER ---------- */
  function ordenarRanking(criterio) {
    // Defensive compare: numeric fallback to 0
    jugadores.sort((a, b) => ((b[criterio] || 0) - (a[criterio] || 0)));
    renderTabla();
    mostrarJugadorSemana();
  }

  /* ---------- STATS ROWS (collapsible) ---------- */
  function attachRowEvents(){
    const rows = document.querySelectorAll(".tabla-jugadores .player");
    rows.forEach(row => {
      row.addEventListener("click", () => toggleStats(row));
      row.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          toggleStats(row);
        }
      });
    });
  }

  function closeAllStats(){
    document.querySelectorAll(".stats-row.open").forEach(row => {
      const content = row.querySelector(".stats-content");
      if (content) {
        content.style.maxHeight = content.scrollHeight + "px";
        requestAnimationFrame(() => {
          content.style.maxHeight = "0px";
        });
      }
      row.classList.remove("open");
      row.setAttribute("aria-hidden","true");
    });
  }

  function openStatsRow(statsRow){
    const content = statsRow.querySelector(".stats-content");
    if (!content) return;
    statsRow.classList.add("open");
    statsRow.setAttribute("aria-hidden","false");
    // set to measured height
    content.style.maxHeight = "0px";
    requestAnimationFrame(()=> {
      content.style.maxHeight = content.scrollHeight + "px";
    });
  }

  function toggleStats(playerRow){
    const statsRow = playerRow.nextElementSibling;
    if (!statsRow || !statsRow.classList.contains("stats-row")) return;
    if (statsRow.classList.contains("open")) {
      const content = statsRow.querySelector(".stats-content");
      if (content) {
        content.style.maxHeight = content.scrollHeight + "px";
        requestAnimationFrame(()=> content.style.maxHeight = "0px");
      }
      statsRow.classList.remove("open");
      statsRow.setAttribute("aria-hidden","true");
      return;
    }
    closeAllStats();
    openStatsRow(statsRow);
    setTimeout(()=> playerRow.scrollIntoView({behavior:"smooth", block:"nearest"}), 360);
  }

  /* ---------- CONFIG EVENTS ---------- */
  if (switchMedallas) switchMedallas.addEventListener("change", () => {
    localStorage.setItem("mostrarMedallas", switchMedallas.checked);
    renderTabla();
  });

  if (selectOrden) selectOrden.addEventListener("change", () => {
    localStorage.setItem("ordenRanking", selectOrden.value);
    ordenarRanking(selectOrden.value);
  });

  if (switchTema) switchTema.addEventListener("change", () => {
    const light = switchTema.checked;
    localStorage.setItem("temaClaro", light);
    document.body.classList.add("transicion-tema");
    requestAnimationFrame(()=> {
      if (light) document.body.classList.add("light");
      else document.body.classList.remove("light");
      setTimeout(()=> document.body.classList.remove("transicion-tema"), 340);
    });
  });

  /* ---------- JUGADOR DE LA SEMANA (usa sección semana) ---------- */
  function mostrarJugadorSemana(){
    if (!elJugadorSemana) return;
    if (!jugadores.length) {
      elJugadorSemana.innerHTML = `<div class="jugador-placeholder"><p>No hay jugadores</p></div>`;
      return;
    }

    // compute weekly scores from j.semana (if missing treat as zeros)
    const withSemana = jugadores.map(j => {
      const s = j.semana || {};
      const golesS = s.goles || 0;
      const asiS = s.asistencias || 0;
      const hatS = s.hattricks || 0;
      const salvS = s.salvadas || 0;
      const bloqS = s.bloqueos || 0;
      // rules: same weights as totals: goles*2 + asist + extras
      let puntajeSemana = 0;
      if (j.nombre.includes("(POR)")) puntajeSemana = (golesS * 2) + (asiS) + (salvS * 0.5);
      else if (j.nombre.includes("(DFC)")) puntajeSemana = (golesS * 2) + (asiS) + (bloqS * 0.5);
      else puntajeSemana = (golesS * 2) + (asiS) + (hatS * 3);
      return {...j, puntajeSemana: Number(puntajeSemana.toFixed(2)), semanaObj: s};
    });

    const top = withSemana.sort((a,b) => (b.puntajeSemana || 0) - (a.puntajeSemana || 0))[0];
    if (!top) {
      elJugadorSemana.innerHTML = `<div class="jugador-placeholder"><p>No hay datos de la semana</p></div>`;
      return;
    }

    elJugadorSemana.innerHTML = `
      <div class="jugador-info">
        <div style="font-size:18px; color:var(--accent)">🏅 Jugador de la semana</div>
        <strong>${top.nombre}</strong>
        <div class="meta" aria-hidden="true">⭐ ${top.puntajeSemana} pts (semana)</div>
        <div class="meta" style="margin-top:6px;">
          ⚽ ${top.semanaObj?.goles || 0} &nbsp;|&nbsp;
          🎯 ${top.semanaObj?.asistencias || 0}
        </div>
      </div>
    `;
  }

  /* ---------- BOTÓN VER MÁS (centrado, show/hide logic) ---------- */
  if (btnVerMas && sectionPartidos) {
    btnVerMas.addEventListener("click", () => sectionPartidos.scrollIntoView({behavior:"smooth"}));
    function updateVerMas(){
      const st = window.scrollY || document.documentElement.scrollTop;
      const docH = document.documentElement.scrollHeight;
      const winH = window.innerHeight;
      const atBottom = st + winH >= docH - 120;
      if (st < 120) btnVerMas.classList.remove("oculto");
      else btnVerMas.classList.add("oculto");
      if (atBottom) btnVerMas.classList.add("oculto");
    }
    window.addEventListener("scroll", updateVerMas);
    updateVerMas();
  }

  /* ---------- INITIALIZE (order, render, semana) ---------- */
  ordenarRanking(prefOrden); // this will call renderTabla() and mostrarJugadorSemana() internally
  mostrarJugadorSemana(); // ensure it's present
}
