async function fetchFromProxy(endpoint, query, lang) {
  const queryString = typeof query === 'object' ? JSON.stringify(query) : query;
  const url = `/api/weather?endpoint=${endpoint}&query=${encodeURIComponent(queryString)}&lang=${lang}`;

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('errorNotFound');
    }
    throw new Error('errorFetch');
  }

  return response.json();
}

export async function fetchWeather(query, lang = 'id') {
  return fetchFromProxy('weather', query, lang);
}

export async function fetchForecast(query, lang = 'id') {
  return fetchFromProxy('forecast', query, lang);
}