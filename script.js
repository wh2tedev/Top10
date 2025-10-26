document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.querySelector("#tabla-jugadores tbody");

  // Sidebar
  const switchMedallas = document.getElementById("switch-medallas");
  const selectOrden = document.getElementById("select-orden");
  const btnConfig = document.getElementById("btn-config");
  const sidebar = document.getElementById("sidebar-config");
  // Switch de tema
const switchTema = document.getElementById("switch-tema");

// Leer tema guardado
const temaActual = localStorage.getItem("tema") || "oscuro";
if (temaActual === "claro") {
  document.body.classList.add("light");
  switchTema.checked = true;
}

// Cambiar tema
switchTema.addEventListener("change", () => {
  if (switchTema.checked) {
    document.body.classList.add("light");
    localStorage.setItem("tema", "claro");
  } else {
    document.body.classList.remove("light");
    localStorage.setItem("tema", "oscuro");
  }
});

  // Abrir/cerrar sidebar
  btnConfig.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    btnConfig.style.display = sidebar.classList.contains("open") ? "none" : "flex";
  });

  // Cerrar sidebar al hacer clic fuera
  document.addEventListener("click", (e) => {
    if (!sidebar.contains(e.target) && !btnConfig.contains(e.target) && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
      btnConfig.style.display = "flex";
    }
  });

  // Cargar preferencias
  const mostrarMedallas = localStorage.getItem("mostrarMedallas") === "true";
  const ordenPreferido = localStorage.getItem("ordenRanking") || "puntaje";
  switchMedallas.checked = mostrarMedallas;
  selectOrden.value = ordenPreferido;

  // Cargar JSON
  let jugadores = [];
  try {
    const response = await fetch("jugadores.json");
    jugadores = await response.json();
  } catch (err) {
    console.error("Error al cargar jugadores.json", err);
    tableBody.innerHTML = "<tr><td colspan='2'>Error al cargar datos.</td></tr>";
    return;
  }

  // Calcular puntaje
  jugadores.forEach(j => { j.puntaje = j.goles * 2 + j.asistencias; });

  // Renderizar tabla
  function renderTabla() {
    tableBody.innerHTML = "";
    jugadores.forEach((j, i) => {
      const playerRow = document.createElement("tr");
      playerRow.className = "player";
      playerRow.tabIndex = 0;
      playerRow.dataset.index = i;
      playerRow.innerHTML = `<td>${i + 1}</td><td>${j.nombre}</td>`;

      const statsRow = document.createElement("tr");
      statsRow.className = "stats-row";
      statsRow.setAttribute("aria-hidden", "true");
      statsRow.innerHTML = `
        <td colspan="2">
          <div class="stats-content">
            ⚽ <strong>Goles:</strong> ${j.goles} &nbsp;|&nbsp;
            🎯 <strong>Asistencias:</strong> ${j.asistencias} &nbsp;|&nbsp;
            📊 <strong>G/P:</strong> ${j.gp} &nbsp;|&nbsp;
            ⭐ <strong>Puntaje Total:</strong> ${j.puntaje}
          </div>
        </td>
      `;
      tableBody.appendChild(playerRow);
      tableBody.appendChild(statsRow);
    });
    aplicarMedallas();
    agregarEventos();
  }

  // Medallas con emojis 🥇🥈🥉
  function aplicarMedallas() {
    if (!switchMedallas.checked) return;
    document.querySelectorAll(".player").forEach((tr, i) => {
      const nombreCell = tr.children[1];
      if (i === 0) nombreCell.innerHTML = `🥇 ${jugadores[i].nombre}`;
      else if (i === 1) nombreCell.innerHTML = `🥈 ${jugadores[i].nombre}`;
      else if (i === 2) nombreCell.innerHTML = `🥉 ${jugadores[i].nombre}`;
      else nombreCell.innerHTML = jugadores[i].nombre;
    });
  }

  // Ordenar ranking
  function ordenarRanking(criterio) {
    jugadores.sort((a, b) => b[criterio] - a[criterio]);
    renderTabla();
  }

  // Eventos de desplegar estadísticas
  function agregarEventos() {
    const table = document.getElementById("tabla-jugadores");
    table.querySelectorAll(".player").forEach(playerRow => {
      playerRow.addEventListener("click", () => toggleStats(playerRow));
      playerRow.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          toggleStats(playerRow);
        }
      });
    });
  }

  function closeAllStats() {
    document.querySelectorAll(".stats-row.open").forEach(row => {
      const content = row.querySelector(".stats-content");
      if (content) {
        content.style.maxHeight = content.scrollHeight + "px";
        requestAnimationFrame(() => { content.style.maxHeight = "0px"; });
      }
      row.classList.remove("open");
      row.setAttribute("aria-hidden", "true");
    });
  }

  function openStatsRow(statsRow) {
    const content = statsRow.querySelector(".stats-content");
    if (!content) return;
    statsRow.classList.add("open");
    statsRow.setAttribute("aria-hidden", "false");
    content.style.maxHeight = "0px";
    requestAnimationFrame(() => content.style.maxHeight = content.scrollHeight + "px");
  }

  function toggleStats(playerRow) {
    const statsRow = playerRow.nextElementSibling;
    if (!statsRow || !statsRow.classList.contains("stats-row")) return;
    if (statsRow.classList.contains("open")) {
      const content = statsRow.querySelector(".stats-content");
      if (content) {
        content.style.maxHeight = content.scrollHeight + "px";
        requestAnimationFrame(() => { content.style.maxHeight = "0px"; });
      }
      statsRow.classList.remove("open");
      statsRow.setAttribute("aria-hidden", "true");
      return;
    }
    closeAllStats();
    openStatsRow(statsRow);
    setTimeout(() => playerRow.scrollIntoView({ behavior: "smooth", block: "nearest" }), 350);
  }

  // Eventos de configuración
  switchMedallas.addEventListener("change", () => {
    localStorage.setItem("mostrarMedallas", switchMedallas.checked);
    renderTabla();
  });

  selectOrden.addEventListener("change", () => {
    localStorage.setItem("ordenRanking", selectOrden.value);
    ordenarRanking(selectOrden.value);
  });

  // Inicializar tabla
  ordenarRanking(ordenPreferido);
});
