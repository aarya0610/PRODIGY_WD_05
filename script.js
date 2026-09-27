const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const refreshBtn = document.getElementById("refreshBtn");

const loading = document.getElementById("loading");
const weatherContent = document.getElementById("weatherContent");
const errorMessage = document.getElementById("errorMessage");

const cityName = document.getElementById("cityName");
const countryName = document.getElementById("countryName");
const currentDate = document.getElementById("currentDate");

const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const weatherDescription = document.getElementById("weatherDescription");
const feelsLike = document.getElementById("feelsLike");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const precipitation = document.getElementById("precipitation");
const feelsLikeDetail = document.getElementById("feelsLikeDetail");

const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

const forecastContainer = document.getElementById("forecastContainer");
const lastUpdated = document.getElementById("lastUpdated");

const weatherPopup = document.getElementById("weatherPopup");
const closePopup = document.getElementById("closePopup");
const viewWeatherBtn = document.getElementById("viewWeatherBtn");

const popupIcon = document.getElementById("popupIcon");
const popupWeather = document.getElementById("popupWeather");
const popupLocation = document.getElementById("popupLocation");
const popupTemperature = document.getElementById("popupTemperature");
const popupFeelsLike = document.getElementById("popupFeelsLike");


// ===============================
// CURRENT LOCATION DATA
// ===============================

let currentLatitude = null;
let currentLongitude = null;
let currentLocationName = "";


// ===============================
// WEATHER CODE INFORMATION
// ===============================

function getWeatherInfo(code, isDay = true) {

    if (code === 0) {
        return {
            description: "Clear Sky",
            icon: isDay ? "☀️" : "🌙"
        };
    }

    if (code === 1) {
        return {
            description: "Mainly Clear",
            icon: isDay ? "🌤️" : "🌙"
        };
    }

    if (code === 2) {
        return {
            description: "Partly Cloudy",
            icon: "⛅"
        };
    }

    if (code === 3) {
        return {
            description: "Overcast",
            icon: "☁️"
        };
    }

    if ([45, 48].includes(code)) {
        return {
            description: "Foggy",
            icon: "🌫️"
        };
    }

    if ([51, 53, 55].includes(code)) {
        return {
            description: "Drizzle",
            icon: "🌦️"
        };
    }

    if ([56, 57].includes(code)) {
        return {
            description: "Freezing Drizzle",
            icon: "🌧️"
        };
    }

    if ([61, 63, 65].includes(code)) {
        return {
            description: "Rain",
            icon: "🌧️"
        };
    }

    if ([66, 67].includes(code)) {
        return {
            description: "Freezing Rain",
            icon: "🌧️"
        };
    }

    if ([71, 73, 75, 77].includes(code)) {
        return {
            description: "Snow",
            icon: "❄️"
        };
    }

    if ([80, 81, 82].includes(code)) {
        return {
            description: "Rain Showers",
            icon: "🌦️"
        };
    }

    if ([85, 86].includes(code)) {
        return {
            description: "Snow Showers",
            icon: "🌨️"
        };
    }

    if ([95].includes(code)) {
        return {
            description: "Thunderstorm",
            icon: "⛈️"
        };
    }

    if ([96, 99].includes(code)) {
        return {
            description: "Thunderstorm with Hail",
            icon: "⛈️"
        };
    }

    return {
        description: "Unknown Weather",
        icon: "🌡️"
    };
}


// ===============================
// SHOW / HIDE LOADING
// ===============================

function showLoading() {

    loading.classList.remove("hidden");
    weatherContent.classList.add("hidden");

    errorMessage.textContent = "";
}


function hideLoading() {
    loading.classList.add("hidden");
}


// ===============================
// ERROR MESSAGE
// ===============================

function showError(message) {

    hideLoading();

    weatherContent.classList.add("hidden");

    errorMessage.textContent = message;
}


// ===============================
// SEARCH CITY
// ===============================

async function searchCity(city) {

    if (!city.trim()) {

        showError("Please enter a city name.");

        return;
    }

    showLoading();

    try {

        const url =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Location search failed.");
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {

            showError(
                "City not found. Please check the spelling and try again."
            );

            return;
        }

        const location = data.results[0];

        currentLatitude = location.latitude;
        currentLongitude = location.longitude;

        currentLocationName = location.name;

        localStorage.setItem(
        "lastWeatherCity",
        location.name
);

        await fetchWeather(
            currentLatitude,
            currentLongitude,
            location.name,
            location.country
        );

    } catch (error) {

        console.error(error);

        showError(
            "Unable to fetch location. Please check your internet connection."
        );
    }
}


// ===============================
// FETCH WEATHER
// ===============================

async function fetchWeather(
    latitude,
    longitude,
    locationName = "Your Location",
    country = ""
) {

    showLoading();

    try {

        const url =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m` +
            `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset` +
            `&timezone=auto&forecast_days=7`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Weather API request failed.");
        }

        const data = await response.json();

        displayWeather(
            data,
            locationName,
            country
        );

    } catch (error) {

        console.error(error);

        showError(
            "Unable to fetch weather data. Please try again."
        );
    }
}


// ===============================
// DISPLAY WEATHER
// ===============================

function displayWeather(data, locationName, country) {

    hideLoading();

    weatherContent.classList.remove("hidden");

    const current = data.current;
    const daily = data.daily;

    const weatherInfo = getWeatherInfo(
        current.weather_code,
        current.is_day === 1
    );
   
    showWeatherPopup(
    weatherInfo,
    locationName,
    country,
    current.temperature_2m,
    current.apparent_temperature
);

    applyWeatherTheme(
    current.weather_code,
    current.is_day === 1
   );

    // Location
    cityName.textContent = locationName;

    countryName.textContent =
        country || "Current Location";


    // Date
    currentDate.textContent =
        formatFullDate(current.time);


    // Main Weather
    weatherIcon.textContent =
        weatherInfo.icon;

    temperature.textContent =
        Math.round(current.temperature_2m);

    weatherDescription.textContent =
        weatherInfo.description;

    feelsLike.textContent =
        Math.round(current.apparent_temperature);


    // Details
    humidity.textContent =
        `${current.relative_humidity_2m}%`;

    windSpeed.textContent =
        `${Math.round(current.wind_speed_10m)} km/h`;

    precipitation.textContent =
        `${current.precipitation} mm`;

    feelsLikeDetail.textContent =
        `${Math.round(current.apparent_temperature)}°C`;


    // Sunrise / Sunset
    sunrise.textContent =
        formatTime(daily.sunrise[0]);

    sunset.textContent =
        formatTime(daily.sunset[0]);


    // Forecast
    displayForecast(daily);


    // Last Updated
    lastUpdated.textContent =
        `Last updated: ${formatTime(current.time)}`;


    // Save current coordinates
    currentLatitude = data.latitude;
    currentLongitude = data.longitude;
}


// ===============================
// DISPLAY 7-DAY FORECAST
// ===============================

function displayForecast(daily) {

    forecastContainer.innerHTML = "";

    for (let i = 0; i < daily.time.length; i++) {

        const date = daily.time[i];

        const weatherInfo =
            getWeatherInfo(
                daily.weather_code[i],
                true
            );

        const card =
            document.createElement("div");

        card.className = "forecast-card";

        card.innerHTML = `
            <div class="forecast-day">
                ${getDayName(date)}
            </div>

            <div class="forecast-icon">
                ${weatherInfo.icon}
            </div>

            <div class="forecast-temp">
                ${Math.round(daily.temperature_2m_max[i])}°
                /
                ${Math.round(daily.temperature_2m_min[i])}°
            </div>

            <div class="forecast-rain">
                🌧️ ${daily.precipitation_probability_max[i]}%
            </div>
        `;

        forecastContainer.appendChild(card);
    }
}


// ===============================
// DATE FORMATTING
// ===============================

function formatFullDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString(
        "en-IN",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}


function formatTime(dateString) {

    const date = new Date(dateString);

    return date.toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        }
    );
}


function getDayName(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString(
        "en-IN",
        {
            weekday: "short"
        }
    );
}


// ===============================
// SEARCH BUTTON
// ===============================

searchBtn.addEventListener(
    "click",
    function () {

        searchCity(
            cityInput.value.trim()
        );
    }
);


// ===============================
// ENTER KEY SEARCH
// ===============================

cityInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            searchCity(
                cityInput.value.trim()
            );
        }
    }
);


// ===============================
// USE MY LOCATION
// ===============================

locationBtn.addEventListener(
    "click",
    function () {

        if (!navigator.geolocation) {

            showError(
                "Geolocation is not supported by your browser."
            );

            return;
        }

        showLoading();

        navigator.geolocation.getCurrentPosition(
            function (position) {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;

                currentLatitude = latitude;
                currentLongitude = longitude;

                fetchWeather(
                    latitude,
                    longitude
                );

            },

            function (error) {

                console.error(error);

                showError(
                    "Location access was denied. Please search for a city instead."
                );
            }
        );
    }
);


// ===============================
// REFRESH WEATHER
// ===============================

refreshBtn.addEventListener(
    "click",
    function () {

        if (
            currentLatitude === null ||
            currentLongitude === null
        ) {

            if (cityInput.value.trim()) {

                searchCity(
                    cityInput.value.trim()
                );

            } else {

                showError(
                    "Search for a city or use your location first."
                );
            }

            return;
        }


        fetchWeather(
            currentLatitude,
            currentLongitude,
            currentLocationName
        );
    }
);
   // ===============================
  // LOAD LAST SEARCHED CITY
 // ===============================

const savedCity =
    localStorage.getItem("lastWeatherCity");

if (savedCity) {

    cityInput.value = savedCity;

    searchCity(savedCity);

} else {

    searchCity("New Delhi");
}

// ===============================
// DYNAMIC WEATHER THEME
// ===============================

function applyWeatherTheme(code, isDay) {

    // Remove previous themes
    document.body.classList.remove(
        "sunny",
        "cloudy",
        "rainy",
        "stormy",
        "snowy",
        "night"
    );

    clearWeatherEffects();


    // Night
    if (!isDay) {

        document.body.classList.add("night");

        return;
    }


    // Clear / Mainly clear
    if (code === 0 || code === 1) {

        document.body.classList.add("sunny");

        return;
    }


    // Cloudy
    if (code === 2 || code === 3 || code === 45 || code === 48) {

        document.body.classList.add("cloudy");

        return;
    }


    // Rain
    if (
        [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82]
            .includes(code)
    ) {

        document.body.classList.add("rainy");

        createRainEffect();

        return;
    }


    // Snow
    if (
        [71, 73, 75, 77, 85, 86]
            .includes(code)
    ) {

        document.body.classList.add("snowy");

        createSnowEffect();

        return;
    }


    // Thunderstorm
    if ([95, 96, 99].includes(code)) {

        document.body.classList.add("stormy");

        createRainEffect();
        createLightningEffect();

        return;
    }


    // Fallback
    document.body.classList.add("cloudy");
}


// ===============================
// RAIN EFFECT
// ===============================

function createRainEffect() {

    clearWeatherEffects();

    const container =
        document.createElement("div");

    container.className = "weather-particles";
    container.id = "weatherParticles";

    for (let i = 0; i < 45; i++) {

        const drop =
            document.createElement("span");

        drop.className = "raindrop";

        drop.style.left =
            Math.random() * 100 + "%";

        drop.style.animationDuration =
            (0.7 + Math.random() * 0.8) + "s";

        drop.style.animationDelay =
            Math.random() * 2 + "s";

        container.appendChild(drop);
    }

    document.body.appendChild(container);
}


// ===============================
// SNOW EFFECT
// ===============================

function createSnowEffect() {

    clearWeatherEffects();

    const container =
        document.createElement("div");

    container.className = "weather-particles";
    container.id = "weatherParticles";

    for (let i = 0; i < 30; i++) {

        const snow =
            document.createElement("span");

        snow.className = "snowflake";
        snow.textContent = "❄";

        snow.style.left =
            Math.random() * 100 + "%";

        snow.style.animationDuration =
            (5 + Math.random() * 7) + "s";

        snow.style.animationDelay =
            Math.random() * 5 + "s";

        snow.style.fontSize =
            (10 + Math.random() * 12) + "px";

        container.appendChild(snow);
    }

    document.body.appendChild(container);
}


// ===============================
// LIGHTNING
// ===============================

function createLightningEffect() {

    const lightning =
        document.createElement("div");

    lightning.className =
        "lightning active";

    lightning.id =
        "lightningEffect";

    document.body.appendChild(lightning);
}


// ===============================
// CLEAR EFFECTS
// ===============================

function clearWeatherEffects() {

    const particles =
        document.getElementById("weatherParticles");

    if (particles) {
        particles.remove();
    }

    const lightning =
        document.getElementById("lightningEffect");

    if (lightning) {
        lightning.remove();
    }
}

function showWeatherPopup(
    weatherInfo,
    locationName,
    country,
    temperature,
    feelsLike
) {
    popupIcon.textContent = weatherInfo.icon;

    popupWeather.textContent = weatherInfo.description;

    popupLocation.textContent =
        country
            ? `${locationName}, ${country}`
            : locationName;

    popupTemperature.textContent =
        Math.round(temperature);

    popupFeelsLike.textContent =
        Math.round(feelsLike);

    weatherPopup.classList.remove("hidden");
}

closePopup.addEventListener("click", () => {
    weatherPopup.classList.add("hidden");
});

viewWeatherBtn.addEventListener("click", () => {
    weatherPopup.classList.add("hidden");

    document.getElementById("weatherContent")
        .scrollIntoView({
            behavior: "smooth"
        });
});