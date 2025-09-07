import { NextRequest, NextResponse } from 'next/server';

// Mock weather data for demonstration
interface ForecastDay {
  day: string;
  date: string;
  high: number;
  low: number;
  condition: string;
  precipitation: number;
  windSpeed: number;
}

const MOCK_WEATHER_DATA: {
  current: {
    location: string;
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    pressure: number;
    visibility: number;
    uvIndex: number;
    feelsLike: number;
  };
  forecast: ForecastDay[];
} = {
  current: {
    location: 'New York, NY',
    temperature: Math.round(Math.random() * 30 + 10), // 10-40°C
    condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy', 'Thunderstorm'][Math.floor(Math.random() * 5)],
    humidity: Math.round(Math.random() * 60 + 30), // 30-90%
    windSpeed: Math.round(Math.random() * 20 + 5), // 5-25 km/h
    pressure: Math.round(Math.random() * 50 + 1000), // 1000-1050 hPa
    visibility: Math.round(Math.random() * 10 + 5), // 5-15 km
    uvIndex: Math.round(Math.random() * 10 + 1), // 1-11
    feelsLike: Math.round(Math.random() * 30 + 10 + (Math.random() > 0.5 ? 3 : -3))
  },
  forecast: []
};

// Generate 5-day forecast
for (let i = 1; i <= 5; i++) {
  MOCK_WEATHER_DATA.forecast.push({
    day: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
    date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString(),
    high: Math.round(Math.random() * 15 + 20),
    low: Math.round(Math.random() * 15 + 5),
    condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy', 'Snow'][Math.floor(Math.random() * 5)],
    precipitation: Math.round(Math.random() * 80), // 0-80%
    windSpeed: Math.round(Math.random() * 25 + 5)
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location') || 'New York, NY';
    const units = searchParams.get('units') || 'celsius';

    // In a real implementation, you would fetch from a weather API like:
    // OpenWeatherMap, WeatherAPI, or AccuWeather
    
    const weatherData = {
      ...MOCK_WEATHER_DATA,
      current: {
        ...MOCK_WEATHER_DATA.current,
        location: location,
        units: units
      }
    };

    // Convert temperature units if needed
    if (units === 'fahrenheit') {
      weatherData.current.temperature = Math.round(weatherData.current.temperature * 9/5 + 32);
      weatherData.current.feelsLike = Math.round(weatherData.current.feelsLike * 9/5 + 32);
      weatherData.forecast.forEach(day => {
        day.high = Math.round(day.high * 9/5 + 32);
        day.low = Math.round(day.low * 9/5 + 32);
      });
    }

    return NextResponse.json({
      success: true,
      data: weatherData,
      timestamp: new Date().toISOString(),
      source: 'JARVIS Weather Service'
    });

  } catch (error) {
    console.error('Weather API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch weather data',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { location, preferences } = await request.json();
    
    if (!location) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    // Save weather preferences (in a real app, this would go to a database)
    const savedPreferences = {
      location,
      units: preferences?.units || 'celsius',
      notifications: preferences?.notifications || false,
      alertTypes: preferences?.alertTypes || ['severe', 'precipitation'],
      updateInterval: preferences?.updateInterval || 30, // minutes
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Weather preferences updated',
      preferences: savedPreferences
    });

  } catch (error) {
    console.error('Weather Preferences Error:', error);
    
    return NextResponse.json(
      { error: 'Failed to update weather preferences' },
      { status: 500 }
    );
  }
}

// Helper function to get weather recommendations
export function getWeatherRecommendations(weatherData: any): string[] {
  const recommendations = [];
  const { current } = weatherData;

  if (current.temperature < 5) {
    recommendations.push('Bundle up! Temperature is quite cold today.');
  } else if (current.temperature > 30) {
    recommendations.push('Stay hydrated! It\'s quite hot outside.');
  }

  if (current.condition.toLowerCase().includes('rain')) {
    recommendations.push('Don\'t forget your umbrella!');
  }

  if (current.windSpeed > 20) {
    recommendations.push('Windy conditions expected. Secure loose objects.');
  }

  if (current.uvIndex > 7) {
    recommendations.push('High UV index. Apply sunscreen and wear protective clothing.');
  }

  if (current.humidity > 80) {
    recommendations.push('High humidity levels. Stay cool and avoid strenuous outdoor activities.');
  }

  return recommendations;
}