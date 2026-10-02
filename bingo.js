const CONFIG = {
  csvPath: "canciones.csv",
  columns: 3,
  rows: 5,
  freeCenter: true,
};

const TITLE_HEADERS = [
  "cancion",
  "canción",
  "titulo",
  "título",
  "track name",
  "track",
  "song",
  "name",
];

const ARTIST_HEADERS = ["artista", "artist", "artist name(s)", "artists"];

const homeScreen = document.getElementById("home");
const gameScreen = document.getElementById("game");
const generateButton = document.getElementById("generateButton");
const homeStatus = document.getElementById("homeStatus");
const bingoGrid = document.getElementById("bingoGrid");
const markedCount = document.getElementById("markedCount");
const totalCount = document.getElementById("totalCount");
const bingoOverlay = document.getElementById("bingoOverlay");
const closeOverlayButton = document.getElementById("closeOverlayButton");

let cardCells = [];
let bingoShown = false;

generateButton.addEventListener("click", generateCard);
closeOverlayButton.addEventListener("click", () => {
  bingoOverlay.classList.add("hidden");
});

async function generateCard() {
  generateButton.disabled = true;
  homeStatus.textContent = "Cargando canciones...";

  try {
    const songs = await loadSongs(CONFIG.csvPath);

    const totalCells = CONFIG.columns * CONFIG.rows;
    const neededSongs = totalCells - (CONFIG.freeCenter ? 1 : 0);

    if (songs.length < neededSongs) {
      throw new Error(
        `Se necesitan al menos ${neededSongs} canciones distintas y el CSV tiene ${songs.length}.`,
      );
    }

    const selected = shuffle([...songs]).slice(0, neededSongs);
    cardCells = buildCard(
      selected,
      CONFIG.rows,
      CONFIG.columns,
      CONFIG.freeCenter,
    );
    renderCard(cardCells);

    homeScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    window.scrollTo({ top: 0, behavior: "instant" });
  } catch (error) {
    console.error(error);
    homeStatus.textContent = error.message || "No se pudo cargar el bingo.";
    generateButton.disabled = false;
  }
}

async function loadSongs(csvPath) {
  const response = await fetch(csvPath, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      `No pude cargar ${csvPath}. Verificá que el archivo exista junto a index.html.`,
    );
  }

  const text = await response.text();
  const rows = parseCSV(text);

  if (rows.length < 2) {
    throw new Error("El CSV está vacío o no tiene filas de canciones.");
  }

  const headers = rows[0].map((header) => normalizeHeader(header));

  const titleIndex = findHeaderIndex(headers, TITLE_HEADERS);
  const artistIndex = findHeaderIndex(headers, ARTIST_HEADERS);

  if (titleIndex === -1) {
    throw new Error(
      "No encuentro una columna de canción. Usá, por ejemplo, 'cancion' o 'Track Name'.",
    );
  }

  const seen = new Set();
  const songs = [];

  for (const row of rows.slice(1)) {
    const title = (row[titleIndex] || "").trim();
    const artist =
      artistIndex === -1
        ? ""
        : (row[artistIndex] || "")
            .split(/,|;|&|\/|\bfeat\.?\b|\bft\.?\b/i)[0]
            .trim();
    if (!title) {
      continue;
    }

    const key = `${title.toLocaleLowerCase()}|||${artist.toLocaleLowerCase()}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    songs.push({ title, artist });
  }

  return songs;
}

function normalizeHeader(value) {
  return String(value || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLocaleLowerCase();
}

function findHeaderIndex(headers, candidates) {
  const normalizedCandidates = candidates.map(normalizeHeader);
  return headers.findIndex((header) => normalizedCandidates.includes(header));
}

function buildCard(selectedSongs, rows, columns, freeCenter) {
  const cells = [];
  let songIndex = 0;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const isCenter =
        freeCenter &&
        row === Math.floor(rows / 2) &&
        col === Math.floor(columns / 2);

      if (isCenter) {
        cells.push({
          type: "free",
          marked: true,
        });
      } else {
        cells.push({
          type: "song",
          song: selectedSongs[songIndex],
          marked: false,
        });
        songIndex += 1;
      }
    }
  }

  return cells;
}

function renderCard(cells) {
  bingoGrid.innerHTML = "";
  bingoGrid.style.gridTemplateColumns = `repeat(${CONFIG.columns}, minmax(0, 1fr))`;
  const playableCount = cells.filter((cell) => cell.type === "song").length;
  totalCount.textContent = String(playableCount);

  cells.forEach((cell, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "bingo-cell";

    if (cell.type === "free") {
      button.classList.add("free");
      button.disabled = true;
      button.setAttribute("aria-label", "Casillero libre");
      button.innerHTML = `<span class="free-label">LIBRE</span>`;
    } else {
      button.setAttribute(
        "aria-label",
        `${cell.song.title}${cell.song.artist ? `, ${cell.song.artist}` : ""}`,
      );

      button.innerHTML = `
        <span class="song-title"></span>
        <span class="song-artist"></span>
      `;

      button.querySelector(".song-title").textContent = cell.song.title;
      button.querySelector(".song-artist").textContent = cell.song.artist;

      button.addEventListener("click", () => toggleCell(index, button));
    }

    bingoGrid.appendChild(button);
  });

  updateCounter();
}

function toggleCell(index, button) {
  const cell = cardCells[index];

  if (!cell || cell.type !== "song") {
    return;
  }

  cell.marked = !cell.marked;
  button.classList.toggle("marked", cell.marked);
  button.setAttribute("aria-pressed", String(cell.marked));

  updateCounter();
  checkBingo();
}

function updateCounter() {
  const markedSongs = cardCells.filter(
    (cell) => cell.type === "song" && cell.marked,
  ).length;

  markedCount.textContent = String(markedSongs);
}

function checkBingo() {
  const playable = cardCells.filter((cell) => cell.type === "song");
  const complete = playable.length > 0 && playable.every((cell) => cell.marked);

  if (complete && !bingoShown) {
    bingoShown = true;
    bingoOverlay.classList.remove("hidden");
  }

  if (!complete) {
    bingoShown = false;
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

/*
  Parser CSV simple compatible con:
  - comas dentro de campos entre comillas
  - comillas escapadas como ""
  - saltos de línea CRLF / LF
*/
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }

      row.push(field);
      field = "";

      if (row.some((value) => value.trim() !== "")) {
        rows.push(row);
      }

      row = [];
      continue;
    }

    field += char;
  }

  row.push(field);

  if (row.some((value) => value.trim() !== "")) {
    rows.push(row);
  }

  return rows;
}
