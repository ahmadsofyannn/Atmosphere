import { Dictionary } from '../utils/i18n.js';

const convertTemp = (celsius, unit) => {
  switch (unit) {
    case 'F': return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    case 'K': return `${Math.round(celsius + 273.15)} K`;
    case 'R': return `${Math.round((celsius * 4) / 5)}°R`;
    case 'C':
    default: return `${Math.round(celsius)}°C`;
  }
};

// Helper sanitasi XSS
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, (match) => {
    const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return escapeMap[match];
  });
}

export function renderWeatherCard(currentData, forecastData, unit = 'C', lang = 'id') {
  const t = Dictionary[lang] || Dictionary.id;
  
  // Sanitasi data teks dari API
  const name = escapeHTML(currentData.name);
  const country = escapeHTML(currentData.sys.country);
  const description = escapeHTML(currentData.weather[0].description);
  
  const { main, weather, wind } = currentData;
  const iconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@4x.png`;

  const dailyList = forecastData?.list || [];
  const dailyForecasts = dailyList
    .filter((item) => item.dt_txt.includes('12:00:00'))
    .slice(0, 5);

  const forecastHTML = dailyForecasts.map((day) => {
    const date = new Date(day.dt_txt).toLocaleDateString(t.locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
    const dayIcon = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
    const dayDesc = escapeHTML(day.weather[0].description);

    return `
      <div class="bg-zinc-100/80 dark:bg-zinc-950/60 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/80 flex flex-col items-center justify-between min-w-22.5">
        <p class="text-xs text-zinc-600 dark:text-zinc-400 font-medium">${date}</p>
        <img src="${dayIcon}" alt="${dayDesc}" class="w-10 h-10 my-1" loading="lazy" />
        <p class="text-sm font-bold text-zinc-800 dark:text-zinc-200">${convertTemp(day.main.temp, unit)}</p>
      </div>
    `;
  }).join('');

  const units = ['C', 'F', 'K', 'R'];
  const unitButtonsHTML = units.map((u) => {
    const isSelected = u === unit;
    const activeClass = 'bg-blue-700 text-white font-bold shadow-xs';
    const inactiveClass = 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-semibold';
    return `
      <button type="button" data-unit="${u}" class="unit-btn px-2 py-0.5 rounded-md text-[11px] transition cursor-pointer ${isSelected ? activeClass : inactiveClass}">
        °${u === 'K' ? 'K' : u}
      </button>
    `;
  }).join('');

  return `
    <article class="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-2xl p-6 shadow-xs dark:shadow-2xl transition-colors space-y-6">
      
      <!-- Header Kartu Cuaca -->
      <div>
        <header class="flex justify-between items-start border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">${name}, <span class="text-zinc-500 dark:text-zinc-400 text-lg">${country}</span></h2>
            <p class="text-sm text-blue-700 dark:text-blue-700 capitalize font-medium mt-1">${description}</p>
          </div>

          <div class="flex flex-col items-end gap-2">
            <div id="unit-selector" class="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 gap-0.5">
              ${unitButtonsHTML}
            </div>
            <img src="${iconUrl}" alt="${description}" class="w-14 h-14 -my-2 drop-shadow-xs" />
          </div>
        </header>

        <div class="my-6 text-center">
          <p class="text-6xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            ${convertTemp(main.temp, unit)}
          </p>
          <p class="text-xs text-zinc-600 dark:text-zinc-400 mt-2">${t.feelsLike} ${convertTemp(main.feels_like, unit)}</p>
        </div>

        <dl class="grid grid-cols-2 gap-3 pt-2 text-sm">
          <div class="bg-zinc-50 dark:bg-zinc-950/50 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/50">
            <dt class="text-xs text-zinc-600 dark:text-zinc-400">${t.humidity}</dt>
            <dd class="text-base font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">${main.humidity}%</dd>
          </div>
          <div class="bg-zinc-50 dark:bg-zinc-950/50 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/50">
            <dt class="text-xs text-zinc-600 dark:text-zinc-400">${t.windSpeed}</dt>
            <dd class="text-base font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">${Math.round(wind.speed * 3.6)} ${t.windUnit}</dd>
          </div>
          <div class="bg-zinc-50 dark:bg-zinc-950/50 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/50">
            <dt class="text-xs text-zinc-600 dark:text-zinc-400">${t.pressure}</dt>
            <dd class="text-base font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">${main.pressure} hPa</dd>
          </div>
          <div class="bg-zinc-50 dark:bg-zinc-950/50 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/50">
            <dt class="text-xs text-zinc-600 dark:text-zinc-400">${t.minMaxTemp}</dt>
            <dd class="text-base font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">${convertTemp(main.temp_min, unit)} / ${convertTemp(main.temp_max, unit)}</dd>
          </div>
        </dl>
      </div>

      <!-- Section Forecast -->
      <section class="border-t border-zinc-200 dark:border-zinc-800 pt-4">
        <h3 class="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">${t.forecastTitle}</h3>
        <div class="grid grid-cols-5 gap-2 overflow-x-auto pb-1">
          ${forecastHTML}
        </div>
      </section>

    </article>
  `;
}