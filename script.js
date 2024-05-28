async function getData() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const day = today.getDate() + 1;

  const URL = `https://v2.nba.api-sports.io/games?date=${year}-${
    month <= 9 ? "0" + month : month
  }-${day <= 9 ? "0" + day : day}`;
  const res = await fetch(URL, {
    method: "GET",
    headers: {
      "x-rapidapi-host": "v2.nba.api-sports.io",
      "x-rapidapi-key": "b07396cd9122b8302112d6ce1a746e8e",
    },
  });
  const data = await res.json();
  displayDate(month, day - 1, year);
  displayData(data.response);
}

function displayDate(month, day, year) {
  let date = `${month} / ${day} / ${year}`;
  document.getElementById("date").innerHTML = date;
}

// function displayData(data) {
//   let i = 0;
//   while (i < data.length) {
//     handleDisplayData(data[i]);
//     i++;
//   }
// }

// Blackbox AI code
function displayData(data) {
  // clear existing divs
  document.getElementById("display").innerHTML = "";
  if (Array.isArray(data)) {
    let i = 0;
    while (i < data.length) {
      handleDisplayData(data[i]);
      i++;
    }
  } else {
    console.error("Unexpected data format:", data);
  }
}

function handleDisplayData(data) {
  let awayTeam = data.teams.visitors.name;
  let homeTeam = data.teams.home.name;
  let period = data.periods.current;
  let time = data.status.clock;
  let awayTeamScore = data.scores.visitors.points;
  let homeTeamScore = data.scores.home.points;
  let status = data.status.long;

  let team = `${awayTeam} @ ${homeTeam}`;
  let score = `${awayTeamScore} - ${homeTeamScore}`;

  let div = document.createElement("div");
  if (status === "Scheduled") {
    div.innerHTML = `<b class="team">${team}</b><br><p class="notyet">Has Not Started</p>`;
  } else if (status === "In Play") {
    div.innerHTML = `<b class="team">${team}</b><br><p class="period">Q${period}\t${
      time === null ? `--:--` : time
    }</p><br><p class="score">${score}</p><br><br>`;
  } else if (status === "Finished") {
    div.innerHTML = `<b class="team">${team}</b><br><p class="period">Game Ended</p><br><p class="score">${score}</p><br><br>`;
  } else {
    div.innerHTML = "No Games Scheduled";
  }
  document.getElementById("display").appendChild(div);
}

getData();
