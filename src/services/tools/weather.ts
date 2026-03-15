import { registerTool } from './registry';

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'tokyo': { lat: 35.6762, lng: 139.6503 },
  'new york': { lat: 40.7128, lng: -74.0060 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  'paris': { lat: 48.8566, lng: 2.3522 },
  'singapore': { lat: 1.3521, lng: 103.8198 },
  'sydney': { lat: -33.8688, lng: 151.2093 },
  'beijing': { lat: 39.9042, lng: 116.4074 },
  'dubai': { lat: 25.2048, lng: 55.2708 },
  'mumbai': { lat: 19.0760, lng: 72.8777 }
};

const mockGetWeather = (location: string) => {
  const conditions = ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy', 'Thunderstorm', 'Snowy'];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];

  let baseTemp = 20;
  if (condition === 'Snowy') baseTemp = -5;
  if (condition === 'Rainy') baseTemp = 15;
  if (condition === 'Sunny') baseTemp = 28;

  const temp = Math.floor(baseTemp + (Math.random() * 10 - 5));

  return {
    location,
    temperature: `${temp}°C`,
    condition,
    humidity: `${Math.floor(Math.random() * 60) + 30}%`,
    windSpeed: `${Math.floor(Math.random() * 30) + 5} km/h`,
    forecast: `Expect ${condition.toLowerCase()} conditions throughout the day.`,
    source: "Mock Data"
  };
};

const fetchRealWeather = async (location: string) => {
  const normalizedLoc = location.toLowerCase().trim();
  const coords = CITY_COORDS[normalizedLoc];

  if (!coords) {
    return { ...mockGetWeather(location), isMock: true, mockReason: 'City not in coordinate list' };
  }

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
    );

    if (!response.ok) throw new Error('Weather API failed');

    const data = await response.json();
    const current = data.current;

    const weatherCode = current.weather_code;
    let condition = "Clear";
    if (weatherCode > 0 && weatherCode <= 3) condition = "Cloudy";
    if (weatherCode >= 45 && weatherCode <= 48) condition = "Foggy";
    if (weatherCode >= 51 && weatherCode <= 67) condition = "Rainy";
    if (weatherCode >= 71 && weatherCode <= 77) condition = "Snowy";
    if (weatherCode >= 95) condition = "Thunderstorm";

    return {
      location,
      temperature: `${current.temperature_2m}${data.current_units.temperature_2m}`,
      condition,
      humidity: `${current.relative_humidity_2m}%`,
      windSpeed: `${current.wind_speed_10m} ${data.current_units.wind_speed_10m}`,
      source: "Open-Meteo API (Real-time)",
      rawCode: weatherCode
    };

  } catch {
    return { ...mockGetWeather(location), isMock: true, mockReason: 'API request failed' };
  }
};

registerTool('get_weather', async (args) => {
  if (!args.location) throw new Error("Missing 'location' argument");
  return await fetchRealWeather(args.location);
});
