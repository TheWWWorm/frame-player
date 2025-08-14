async function getVideos() {
  const res = await fetch("/list");
  return await res.json();
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Clock
function updateTime() {
  const now = new Date();
  document.getElementById("time").textContent =
    now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}
setInterval(updateTime, 1000);
updateTime();

let userLat = 0; // fallback lat
let userLon = 0; // fallback lon

function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&timezone=auto`;
  return fetch(url).then(res => res.json());
}

async function updateWeather() {
  try {
    const data = await fetchWeather(userLat, userLon);
    const temp = Math.round(data.current.temperature_2m);
    const code = data.current.weathercode;
    const [emoji, desc] = weatherDescription(code);

    document.getElementById("weather").textContent = `${emoji} ${temp}°C, ${desc}`;
  } catch (err) {
    document.getElementById("weather").textContent = "Weather unavailable";
  }
}

// Try to get user location
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    pos => {
      userLat = pos.coords.latitude;
      userLon = pos.coords.longitude;
      updateWeather();
    },
    err => {
      console.warn("Geolocation denied or failed, using fallback.", err);
      updateWeather();
    }
  );
} else {
  updateWeather();
}

// Update every 10 min
setInterval(updateWeather, 10 * 60 * 1000);

function weatherDescription(code) {
  const map = {
    0: ["☀️", "Clear sky"],
    1: ["🌤️", "Mainly clear"],
    2: ["⛅", "Partly cloudy"],
    3: ["☁️", "Overcast"],
    45: ["🌫️", "Fog"],
    48: ["🌫️", "Depositing rime fog"],
    51: ["🌦️", "Light drizzle"],
    53: ["🌦️", "Moderate drizzle"],
    55: ["🌧️", "Dense drizzle"],
    56: ["🌧️", "Freezing drizzle"],
    57: ["🌧️", "Freezing drizzle"],
    61: ["🌧️", "Slight rain"],
    63: ["🌧️", "Moderate rain"],
    65: ["🌧️", "Heavy rain"],
    66: ["🌧️❄️", "Freezing rain"],
    67: ["🌧️❄️", "Freezing rain"],
    71: ["❄️", "Slight snow fall"],
    73: ["❄️", "Moderate snow fall"],
    75: ["❄️", "Heavy snow fall"],
    77: ["❄️", "Snow grains"],
    80: ["🌦️", "Slight rain showers"],
    81: ["🌦️", "Moderate rain showers"],
    82: ["🌧️", "Violent rain showers"],
    85: ["🌨️", "Slight snow showers"],
    86: ["🌨️", "Heavy snow showers"],
    95: ["⛈️", "Thunderstorm"],
    96: ["⛈️", "Thunderstorm with hail"],
    99: ["⛈️", "Thunderstorm with hail"]
  };
  return map[code] || ["❓", "Unknown"];
}

// Video playlist
(async () => {
  const videos = await getVideos();
  if (!videos.length) {
    alert("No videos found");
    return;
  }

  let queue = shuffle([...videos]);
  const player = document.getElementById("player");
  const nextBtn = document.getElementById("next-btn");
  const muteBtn = document.getElementById("mute-btn");
  const fsBtn = document.getElementById("fs-btn");

  function playNext() {
    if (queue.length === 0) {
      queue = shuffle([...videos]);
    }
    const next = queue.pop();
    player.src = `/videos/${encodeURIComponent(next)}`;
    player.play();
  }

  player.addEventListener("ended", playNext);

  // Start muted so autoplay works
  player.muted = true;
  playNext();

  nextBtn.addEventListener("click", playNext);

  // Mute/unmute toggle
  muteBtn.addEventListener("click", () => {
    player.muted = !player.muted;
    muteBtn.textContent = player.muted ? "🔇" : "🔊";
  });

  // Fullscreen toggle
  fsBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });
})();


let hideCursorTimer;

function resetCursorTimer() {
  document.body.classList.remove("hide-cursor");
  clearTimeout(hideCursorTimer);
  hideCursorTimer = setTimeout(() => {
    document.body.classList.add("hide-cursor");
  }, 3000); // 3 seconds
}

// Reset timer on mouse movement
document.addEventListener("mousemove", resetCursorTimer);

// Start the timer on page load
resetCursorTimer();