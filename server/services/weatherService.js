import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
// Start with a default location if none provided, or throw error
// For MVP, we can mock if key is missing to allow user to test flow

export const getWeatherData = async (lat, lon) => {
  if (!OPENWEATHER_API_KEY) {
    console.warn('⚠️ No API Key for OpenWeatherMap found. Returning mock data.');
    return {
      temp: 22,
      humidity: 45,
      soil_moisture: 0.3, // m3/m3
      soil_temp_10cm: 20
    };
  }

  try {
    // Current weather
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const weatherRes = await axios.get(weatherUrl);

    // Soil data (Agro API often needs separate subscription, using standard OneCall or separate endpoint if available)
    // For this MVP, we'll try to get what we can or mock the soil part if the standard key doesn't support Agro API
    // Standard weather API gives Main Temp, Humidity.
    
    return {
      temp: weatherRes.data.main.temp,
      humidity: weatherRes.data.main.humidity,
      description: weatherRes.data.weather[0].description,
      // Mocking soil data as it requires paid/specialized API endpoint usually
      soil_moisture: 0.25 + (Math.random() * 0.1), 
      soil_temp_10cm: weatherRes.data.main.temp - 2
    };
  } catch (error) {
    console.error('Error fetching Weather data:', error.message);
    throw new Error('Failed to fetch weather data');
  }
};

export const getClimateData = async (lat, lon) => {
  // NASA POWER API is free and doesn't always require a key for low volume, but good to check docs
  // Base URL: https://power.larc.nasa.gov/api/temporal/daily/point
  // We can fetch last 30 days of data for history
  
  try {
    // Mocking for speed/reliability in this MVP step unless we want to do the real complex query
    // Real implementation would be:
    // const endDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
    // const startDate = ... 
    // const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN,T2M&community=AG&longitude=${lon}&latitude=${lat}&start=${startDate}&end=${endDate}&format=JSON`;
    
    // Returning mock climate profile for the region
    return {
      avg_radiation: 5.5, // kWh/m2/day
      avg_temp_history: 18,
      rainfall_history: 'Moderate'
    };
  } catch (error) {
    console.error('Error fetching NASA data:', error.message);
    return { error: 'Could not fetch climate history' };
  }
};
