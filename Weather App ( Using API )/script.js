
const apiKey = "11e8f77c6c62d0d331217721503162df";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const input = document.getElementById("search-input");
const btn = document.getElementById("search-btn");
const errorBox = document.getElementById("error");
const weatherBox = document.getElementById("weather");
const cityEl = document.getElementById("city");
const tempEl = document.getElementById("temp");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const iconEl = document.getElementById("weather-icon");


function showError(msg) {
  errorBox.textContent = msg || "Invalid city name. Please try again.";
  errorBox.style.display = "block";
  weatherBox.style.opacity = "0.5";
}
function hideError() {
  errorBox.style.display = "none";
  weatherBox.style.opacity = "1";
}

function chooseIcon(main) {
  switch (main) {
    case "Clouds": return "images/clouds.png";
    case "Clear":  return "images/clear.png";
    case "Rain":   return "images/rain.png";
    case "Drizzle":return "images/drizzle.png";
    case "Mist":   return "images/mist.png";
    case "Snow":   return "images/snow.png";
    default:       return "images/rain.png"; 
  }
}

async function checkWeather(city) {
  if (!city || city.trim().length === 0) {
    showError("Please enter a city name.");
    return;
  }

  hideError();

  try {
    
    const res = await fetch(apiUrl + encodeURIComponent(city.trim()) + `&appid=${apiKey}`);
    if (!res.ok) {
      if (res.status === 404) {
        showError("City not found. Check spelling and try again.");
      } else {
        showError("Unable to fetch weather. Try again later.");
      }
      return;
    }

    const data = await res.json();


    cityEl.textContent = `${data.name}, ${data.sys?.country || ""}`;
    tempEl.textContent = `${Math.round(data.main.temp)}°C`;
    humidityEl.textContent = `${data.main.humidity}%`;
   
    const windKmh = Math.round((data.wind.speed || 0) * 3.6);
    windEl.textContent = `${windKmh} km/h`;

   
    const main = data.weather && data.weather[0] && data.weather[0].main;
    iconEl.src = chooseIcon(main);
    iconEl.alt = main || "weather";

    weatherBox.style.display = "block";
    hideError();
  } catch (err) {
    console.error(err);
    showError("Network error. Check your connection.");
  }
}

btn.addEventListener("click", () => checkWeather(input.value));
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkWeather(input.value);
});


checkWeather("Lucknow");
