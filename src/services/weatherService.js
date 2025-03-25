import axios from "axios";

const NOAA_API_URL = "https://api.weather.gov/alerts/active";

export const fetchWeatherAlerts = async () => {
  try {
    const response = await axios.get(NOAA_API_URL, {
      headers: {
        "User-Agent": "weather-alert-dashboard (pj.gudz@example.com)",
        "Accept": "application/ld+json",
      },
    });
    return response.data.features;
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return [];
  }
};
