const API_URL = "https://v2.nba.api-sports.io/games";
const API_HEADERS = {
  "x-rapidapi-host": "v2.nba.api-sports.io",
  "x-rapidapi-key": "b07396cd9122b8302112d6ce1a746e8e",
};

function isWithinESTDayRange(utcDateStr) {
  const gameUtc = new Date(utcDateStr);
  const estTimestamp = gameUtc.getTime() - 5 * 60 * 60 * 1000;
  const gameEstDate = new Date(estTimestamp);
  const now = new Date();
  const estNow = new Date(now.getTime() - 5 * 60 * 60 * 1000);

  return (
    gameEstDate.getFullYear() === estNow.getFullYear() &&
    gameEstDate.getMonth() === estNow.getMonth() &&
    gameEstDate.getDate() === estNow.getDate()
  );
}

async function getData() {
  try {
    const allGames = [];
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    const day = String(today.getDate()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;
    const response = await fetch(`${API_URL}?date=${formattedDate}`, {
      method: "GET",
      headers: API_HEADERS,
    });

    if (!response.ok) throw new Error(`API error: ${response.statusText}`);

    const data = await response.json();
    allGames.push(...data.response);

    const day2 = String(today.getDate() + 1).padStart(2, "0");
    const formattedDate2 = `${year}-${month}-${day2}`;
    const response2 = await fetch(`${API_URL}?date=${formattedDate2}`, {
      method: "GET",
      headers: API_HEADERS,
    });
    if (!response2.ok) throw new Error(`API error: ${response2.statusText}`);
    const data2 = await response2.json();
    allGames.push(...data2.response);

    displayDate(month, day, year);
    displayESTGamesOnly(allGames);
  } catch (error) {
    console.error("Error fetching NBA data:", error);
    document.getElementById(
      "display"
    ).innerHTML = `<p class="notyet">Failed to load game data. Please try again later.</p>`;
  }
}

function displayESTGamesOnly(games) {
  const displayDiv = document.getElementById("display");
  displayDiv.innerHTML = "";
  const estGames = games.filter((game) => isWithinESTDayRange(game.date.start));

  if (estGames.length === 0) {
    displayDiv.innerHTML = `<p class="notyet">No games scheduled today.</p>`;
    return;
  }
  estGames.forEach(handleDisplayData);
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
  const utcDate = new Date(data.date.start);
  const localTimeString = utcDate.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const teamInfo = `${awayTeam} @ ${homeTeam}`;
  const scoreInfo = `${awayTeamScore} - ${homeTeamScore}`;
  const displayDiv = document.getElementById("display");

  const gameDiv = document.createElement("div");
  gameDiv.classList.add("game-card");

  if (status === "Scheduled") {
    gameDiv.innerHTML = `
      <p class="team">${teamInfo}</p>
      <p class="notyet">Starts at ${localTimeString}</p>
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

  gameDiv.addEventListener("click", () => {
    showGameDetails({
      teamInfo,
      status,
      score: scoreInfo,
      time: localTimeString,
      period: status === "In Play" ? `Q${period} - ${time}` : "",
    });
  });

  displayDiv.appendChild(gameDiv);
}

function showGameDetails(data) {
  const displayDiv = document.getElementById("display");
  const detailsDiv = document.getElementById("game-details");

  // Determine header text based on game status
  let gameStatusTop = "";
  if (data.status === "Scheduled") {
    gameStatusTop = `<p class="notyet game-status-top">Starts at ${data.time}</p>`;
  } else if (data.status === "In Play") {
    gameStatusTop = `<p class="period game-status-top">${data.period}</p>`;
  } else {
    gameStatusTop = `<p class="notyet game-status-top">${data.status}</p>`;
  }

  detailsDiv.innerHTML = `
    <button id="back-button" class="back-btn">Back</button>
    ${gameStatusTop}
    <div class="game-detail-layout">
      <div class="team-column">
        <h3 class="team away-team">${data.teamInfo.split(" @ ")[0]}</h3>
        <p class="score">${
          data.status === "Scheduled" ? "—" : data.score.split(" - ")[0]
        }</p>
      </div>
      <div class="team-column">
        <h3 class="team home-team">${data.teamInfo.split(" @ ")[1]}</h3>
        <p class="score">${
          data.status === "Scheduled" ? "—" : data.score.split(" - ")[1]
        }</p>
      </div>
    </div>
  `;

  document
    .getElementById("back-button")
    .addEventListener("click", goBackToMainView);

  displayDiv.style.display = "none";
  detailsDiv.style.display = "block";
}

function goBackToMainView() {
  document.getElementById("display").style.display = "flex";
  document.getElementById("game-details").style.display = "none";
}

getData();
