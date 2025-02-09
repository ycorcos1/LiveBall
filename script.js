const API_URL = "https://v2.nba.api-sports.io/games";
const API_HEADERS = {
  "x-rapidapi-host": "v2.nba.api-sports.io",
  "x-rapidapi-key": "b07396cd9122b8302112d6ce1a746e8e",
};

async function getData() {
  try {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    const day = String(today.getDate() + 1).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;
    const response = await fetch(`${API_URL}?date=${formattedDate}`, {
      method: "GET",
      headers: API_HEADERS,
    });

    if (!response.ok) throw new Error(`API error: ${response.statusText}`);

    const data = await response.json();
    displayDate(month, day - 1, year);
    displayData(data.response);
  } catch (error) {
    console.error("Error fetching NBA data:", error);
    document.getElementById("display").innerHTML = `<p class="notyet">Failed to load game data. Please try again later.</p>`;
  }
}

function displayDate(month, day, year) {
  document.getElementById("date").innerHTML = `${month} / ${day} / ${year}`;
}

function displayData(data) {
  const displayDiv = document.getElementById("display");
  displayDiv.innerHTML = "";

  if (!Array.isArray(data) || data.length === 0) {
    displayDiv.innerHTML = `<p class="notyet">No games scheduled today.</p>`;
    return;
  }

  data.forEach(handleDisplayData);
}

function handleDisplayData(data) {
  const awayTeam = data.teams.visitors.name;
  const homeTeam = data.teams.home.name;
  const period = data.periods.current || "—";
  const time = data.status.clock || "--:--";
  const awayTeamScore = data.scores.visitors.points ?? 0;
  const homeTeamScore = data.scores.home.points ?? 0;
  const status = data.status.long;

  const teamInfo = `${awayTeam} @ ${homeTeam}`;
  const scoreInfo = `${awayTeamScore} - ${homeTeamScore}`;
  const displayDiv = document.getElementById("display");

  const gameDiv = document.createElement("div");
  gameDiv.classList.add("game-card");

  if (status === "Scheduled") {
    gameDiv.innerHTML = `
      <p class="team">${teamInfo}</p>
      <p class="notyet">Game Starts Soon</p>
    `;
  } else if (status === "In Play") {
    gameDiv.innerHTML = `
      <span class="live-game">Live</span>
      <p class="team">${teamInfo}</p>
      <p class="period">Q${period} - ${time}</p>
      <p class="score">${scoreInfo}</p>
    `;
  } else if (status === "Finished") {
    gameDiv.innerHTML = `
      <span class="finished">Finished</span>
      <p class="team">${teamInfo}</p>
      <p class="score">${scoreInfo}</p>
    `;
  } else {
    gameDiv.innerHTML = `<p class="notyet">No Games Scheduled</p>`;
  }

  displayDiv.appendChild(gameDiv);
}

getData();
