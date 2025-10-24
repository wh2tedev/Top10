// script.js
document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.querySelector("#tabla-jugadores tbody");

  let jugadores = [];
  try {
    const response = await fetch("jugadores.json");
    jugadores = await response.json();
  } catch (err) {
    console.error("Error al cargar jugadores.json", err);
    tableBody.innerHTML = "<tr><td colspan='2'>Error al cargar datos.</td></tr>";
    return;
  }

  // 🧮 Calcular puntaje y ordenar
  jugadores.forEach(j => {
    j.puntaje = j.goles * 2 + j.asistencias; // fórmula personalizada
  });

  // 🔢 Ordenar de mayor a menor puntaje
  jugadores.sort((a, b) => b.puntaje - a.puntaje);

  // 🏗️ Generar filas
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

  // 🧩 Misma lógica de animación
  const table = document.getElementById("tabla-jugadores");

  table.addEventListener("click", (ev) => {
    const tr = ev.target.closest("tr");
    if (!tr || !tr.classList.contains("player")) return;
    toggleStatsForPlayerRow(tr);
  });

  table.addEventListener("keydown", (ev) => {
    const tr = ev.target.closest("tr");
    if (!tr || !tr.classList.contains("player")) return;
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      toggleStatsForPlayerRow(tr);
    }
  });

  function closeAllStats() {
    document.querySelectorAll(".stats-row.open").forEach(row => {
      const content = row.querySelector(".stats-content");
      if (content) {
        content.style.maxHeight = content.scrollHeight + "px";
        requestAnimationFrame(() => {
          content.style.maxHeight = "0px";
        });
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
      const h = content.scrollHeight;
      content.style.maxHeight = h + "px";
    });
  }

  function toggleStatsForPlayerRow(playerRow) {
    const statsRow = playerRow.nextElementSibling;
    if (!statsRow || !statsRow.classList.contains("stats-row")) return;

    if (statsRow.classList.contains("open")) {
      const content = statsRow.querySelector(".stats-content");
      if (content) {
        content.style.maxHeight = content.scrollHeight + "px";
        requestAnimationFrame(() => {
          content.style.maxHeight = "0px";
        });
      }
      statsRow.classList.remove("open");
      statsRow.setAttribute("aria-hidden", "true");
      return;
    }

    closeAllStats();
    openStatsRow(statsRow);
    setTimeout(() => {
      playerRow.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 350);
  }
});