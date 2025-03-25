import axios from "axios";

// Using CORS proxy to avoid browser restrictions on User-Agent header
const NOAA_API_URL = "https://corsproxy.io/?https://api.weather.gov/alerts/active";

export const fetchWeatherAlerts = async () => {
  try {
    const response = await axios.get(NOAA_API_URL);
    return response.data.features;
  } catch (error) {
    console.error("Error fetching weather alerts:", error);
    return [];
  }
};
