export default async function handler(req, res) {
  const { endpoint, query, lang } = req.query;
  const API_KEY = process.env.VITE_WEATHER_API_KEY; // Dibaca aman di server Vercel

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const BASE_URL = 'https://api.openweathermap.org/data/2.5';
  let queryParams = '';

  // Cek apakah query berupa JSON string dari koordinat {lat, lon}
  try {
    const parsed = JSON.parse(query);
    if (parsed.lat !== undefined && parsed.lon !== undefined) {
      queryParams = `lat=${parsed.lat}&lon=${parsed.lon}`;
    } else {
      queryParams = `q=${encodeURIComponent(query)}`;
    }
  } catch {
    queryParams = `q=${encodeURIComponent(query)}`;
  }

  const targetUrl = `${BASE_URL}/${endpoint || 'weather'}?${queryParams}&units=metric&appid=${API_KEY}&lang=${lang || 'id'}`;

  try {
    const response = await fetch(targetUrl);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch weather data' });
  }
}