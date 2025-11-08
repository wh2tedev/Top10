document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.querySelector("#tabla-jugadores tbody");

  // --- ELEMENTOS ---
  const switchMedallas = document.getElementById("switch-medallas");
  const switchTema = document.getElementById("switch-tema");
  const selectOrden = document.getElementById("select-orden");
  const btnConfig = document.getElementById("btn-config");
  const sidebar = document.getElementById("sidebar-config");

  // --- SIDEBAR ---
  btnConfig.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    btnConfig.style.display = sidebar.classList.contains("open") ? "none" : "flex";
  });

  document.addEventListener("click", (e) => {
    if (!sidebar.contains(e.target) && !btnConfig.contains(e.target) && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
      btnConfig.style.display = "flex";
    }
  });

  // --- PREFERENCIAS ---
  const mostrarMedallas = localStorage.getItem("mostrarMedallas") === "true";
  const ordenPreferido = localStorage.getItem("ordenRanking") || "puntaje";
  const temaClaro = localStorage.getItem("temaClaro") === "true";

  switchMedallas.checked = mostrarMedallas;
  selectOrden.value = ordenPreferido;
  switchTema.checked = temaClaro;
  if (temaClaro) document.body.classList.add("light");

  // --- CARGAR JSON ---
  let jugadores = [];
  try {
    const response = await fetch(`jugadores.json?nocache=${Date.now()}`);
    jugadores = await response.json();
  } catch (err) {
    console.error("Error al cargar jugadores.json", err);
    tableBody.innerHTML = "<tr><td colspan='2'>Error al cargar datos.</td></tr>";
    return;
  }

  jugadores.forEach(j => {
  // ❌ Eliminado el cálculo automático de A/P
  // ✅ Solo usamos el valor que venga del JSON (o "-" si no existe)
  j.ap = j.ap ?? "-";

  if (j.nombre.includes("(POR)")) {
    j.salvadas = j.salvadas || 0;
    j.puntaje = j.goles * 2 + j.asistencias + j.salvadas * 0.5;
  } else if (j.nombre.includes("(DFC)")) {
    j.bloqueos = j.bloqueos || 0;
    j.entradas = j.entradas || 0;
    j.puntaje = j.goles * 2 + j.asistencias + j.bloqueos * 0.5;
  } else {
    j.hattricks = j.hattricks || 0;
    j.puntaje = j.goles * 2 + j.asistencias + j.hattricks * 3;
  }
});

  // --- RENDERIZAR TABLA ---
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

      let extraStats = "";

      if (j.nombre.includes("(POR)")) {
        extraStats = `🧤 <strong>Salvadas/Atajadas:</strong> ${j.salvadas || 0}`;
      } else if (j.nombre.includes("(DFC)")) {
        extraStats = `🛡️ <strong>Bloqueos:</strong> ${j.bloqueos || 0} &nbsp;|&nbsp; ⚔️ <strong>Entradas:</strong> ${j.entradas || 0}`;
      } else {
        extraStats = `🎩 <strong>Hat-tricks:</strong> ${j.hattricks || 0}`;
      }

      statsRow.innerHTML = `
        <td colspan="2">
          <div class="stats-content">
            ⚽ <strong>Goles:</strong> ${j.goles} &nbsp;|&nbsp;
            🎯 <strong>Asistencias:</strong> ${j.asistencias} &nbsp;|&nbsp;
            📊 <strong>G/P:</strong> ${j.gp ?? "-"} &nbsp;|&nbsp;
            📈 <strong>A/P:</strong> ${j.ap} &nbsp;|&nbsp;
            ${extraStats}
            ⭐ <strong>Puntaje Total:</strong> ${j.puntaje} &nbsp;|&nbsp;
          </div>
        </td>
      `;

      tableBody.appendChild(playerRow);
      tableBody.appendChild(statsRow);
    });
    aplicarMedallas();
    agregarEventos();
  }

  // --- MEDALLAS ---
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

  // --- ORDENAR RANKING ---
  function ordenarRanking(criterio) {
    jugadores.sort((a, b) => b[criterio] - a[criterio]);
    renderTabla();
    mostrarJugadorSemana();
  }

  // --- EVENTOS DE STATS ---
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

  // --- ANIMACIONES DE STATS ---
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
    requestAnimationFrame(() => {
      content.style.maxHeight = content.scrollHeight + "px";
    });
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

  // --- EVENTOS DE CONFIGURACIÓN ---
  switchMedallas.addEventListener("change", () => {
    localStorage.setItem("mostrarMedallas", switchMedallas.checked);
    renderTabla();
  });

  selectOrden.addEventListener("change", () => {
    localStorage.setItem("ordenRanking", selectOrden.value);
    ordenarRanking(selectOrden.value);
  });

  switchTema.addEventListener("change", () => {
    const isLight = switchTema.checked;
    localStorage.setItem("temaClaro", isLight);
    document.body.classList.add("transicion-tema");
    requestAnimationFrame(() => {
      if (isLight) document.body.classList.add("light");
      else document.body.classList.remove("light");
      setTimeout(() => document.body.classList.remove("transicion-tema"), 350);
    });
  });
  function mostrarJugadorSemana() {
  const jugadorSemanaEl = document.getElementById("jugador-semana");
  if (!jugadorSemanaEl || jugadores.length === 0) return;

  // ✅ Jugador con más puntaje semanal
  const jugadoresSemana = jugadores.map(j => {
    const s = j.semana || {};
    let puntajeSemana = 0;

    if (j.nombre.includes("(POR)")) {
      puntajeSemana = (s.goles || 0) * 2 + (s.asistencias || 0) + (s.salvadas || 0) * 0.5;
    } else if (j.nombre.includes("(DFC)")) {
      puntajeSemana = (s.goles || 0) * 2 + (s.asistencias || 0) + (s.bloqueos || 0) * 0.5;
    } else {
      puntajeSemana = (s.goles || 0) * 2 + (s.asistencias || 0) + (s.hattricks || 0) * 3;
    }

    return { ...j, puntajeSemana };
  });

  const topJugador = jugadoresSemana.sort((a, b) => b.puntajeSemana - a.puntajeSemana)[0];

  jugadorSemanaEl.innerHTML = `
    <p><strong>${topJugador.nombre}</strong></p>
    <p>⭐️ ${topJugador.puntajeSemana} pts (semana)</p>
    <p>⚽ ${topJugador.semana?.goles || 0} &nbsp;|&nbsp; 🎯 ${topJugador.semana?.asistencias || 0}</p>
  `;
  }

  // --- INICIALIZAR ---
  ordenarRanking(ordenPreferido);

  // --- BOTÓN FLOTANTE VER MÁS ---
  const btnVerMas = document.getElementById("btn-vermas");
  const sectionPartidos = document.getElementById("partidos-balon");

  // Desplazamiento suave hacia la sección
  btnVerMas.addEventListener("click", () => {
    if (sectionPartidos) {
      sectionPartidos.scrollIntoView({ behavior: "smooth" });
    }
  });

  // Mostrar / ocultar según el scroll
  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;

    const atBottom = scrollTop + winHeight >= docHeight - 120;

    if (scrollTop < 100) {
      btnVerMas.classList.remove("oculto");
    } else if (atBottom) {
      btnVerMas.classList.add("oculto");
    } else {
      btnVerMas.classList.add("oculto");
    }
  });
});
