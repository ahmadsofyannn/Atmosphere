import './style.css';
import { fetchWeather, fetchForecast } from './api/weather.js';
import { renderWeatherCard } from './components/WeatherCard.js';
import { Dictionary } from './utils/i18n.js';

const form = document.querySelector('#search-form');
const input = document.querySelector('#city-input');
const searchBtn = document.querySelector('#search-btn');
const container = document.querySelector('#weather-container');
const themeToggleBtn = document.querySelector('#theme-toggle');
const themeIcon = document.querySelector('#theme-icon');
const langToggleBtn = document.querySelector('#lang-toggle-btn');

let currentWeatherData = null;
let currentForecastData = null;
let currentUnit = 'C';
let currentLang = localStorage.getItem('lang') || 'id';

// --- Theme Logic ---
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark');
    if (themeIcon) themeIcon.textContent = '🌙';
  } else {
    document.documentElement.classList.add('dark');
    if (themeIcon) themeIcon.textContent = '☀️';
    localStorage.setItem('theme', 'dark');
  }
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    if (themeIcon) themeIcon.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}

// --- Language Logic ---
function updateLanguageUI(lang) {
  const t = Dictionary[lang] || Dictionary.id;
  if (input) input.placeholder = t.searchPlaceholder;
  if (searchBtn) searchBtn.textContent = t.searchBtn;
  if (langToggleBtn) langToggleBtn.textContent = lang.toUpperCase();
}

if (langToggleBtn) {
  langToggleBtn.addEventListener('click', () => {
    currentLang = currentLang === 'id' ? 'en' : 'id';
    localStorage.setItem('lang', currentLang);
    updateLanguageUI(currentLang);

    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
      loadWeatherData(lastCity);
    } else {
      showDefaultMessage();
    }
  });
}

// --- Unit Selector Logic (Delegasi Event pada Container) ---
if (container) {
  container.addEventListener('click', (e) => {
    const unitBtn = e.target.closest('.unit-btn');
    if (!unitBtn) return;

    const selectedUnit = unitBtn.dataset.unit;
    if (selectedUnit === currentUnit) return;

    currentUnit = selectedUnit;
    if (currentWeatherData && currentForecastData) {
      container.innerHTML = renderWeatherCard(currentWeatherData, currentForecastData, currentUnit, currentLang);
    }
  });
}

// --- Weather Data Logic ---
async function loadWeatherData(query) {
  if (!container) return;
  const t = Dictionary[currentLang] || Dictionary.id;

  try {
    container.innerHTML = `<p class="text-center text-zinc-500 dark:text-zinc-400 text-sm py-8 animate-pulse">${t.loading}</p>`;

    const [weather, forecast] = await Promise.all([
      fetchWeather(query, currentLang),
      fetchForecast(query, currentLang)
    ]);

    currentWeatherData = weather;
    currentForecastData = forecast;

    container.innerHTML = renderWeatherCard(weather, forecast, currentUnit, currentLang);
    if (weather.name) {
      localStorage.setItem('lastCity', weather.name);
    }
  } catch (err) {
    const errorMsg = t[err.message] || err.message;
    container.innerHTML = `
      <div role="alert" class="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-center text-sm">
        ${errorMsg}
      </div>
    `;
  }
}

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!input) return;
    const city = input.value.trim();
    if (city) loadWeatherData(city);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateLanguageUI(currentLang);

  const lastCity = localStorage.getItem('lastCity');
  if (lastCity) {
    if (input) input.value = lastCity;
    loadWeatherData(lastCity);
  } else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        loadWeatherData({ lat: latitude, lon: longitude });
      },
      () => showDefaultMessage()
    );
  } else {
    showDefaultMessage();
  }
});

function showDefaultMessage() {
  if (!container) return;
  const t = Dictionary[currentLang] || Dictionary.id;
  container.innerHTML = `
    <p class="text-center text-zinc-500 dark:text-zinc-400 text-sm py-8">
      ${t.defaultMsg}
    </p>
  `;
}