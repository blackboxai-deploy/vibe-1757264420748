"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WeatherData {
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
    units?: string;
  };
  forecast: Array<{
    day: string;
    date: string;
    high: number;
    low: number;
    condition: string;
    precipitation: number;
    windSpeed: number;
  }>;
}

interface WeatherWidgetProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function WeatherWidget({ isVisible, onToggle }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [units, setUnits] = useState<'celsius' | 'fahrenheit'>('celsius');

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/weather?units=${units}&location=New York, NY`);
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      setWeather(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchWeather();
      
      // Update every 10 minutes
      const interval = setInterval(fetchWeather, 10 * 60 * 1000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [isVisible, units]);

  const getWeatherIcon = (condition: string): string => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) return '☀️';
    if (lowerCondition.includes('cloud')) return '☁️';
    if (lowerCondition.includes('rain')) return '🌧️';
    if (lowerCondition.includes('storm')) return '⛈️';
    if (lowerCondition.includes('snow')) return '❄️';
    return '🌤️';
  };

  const getUVLevel = (uvIndex: number): { level: string; color: string } => {
    if (uvIndex <= 2) return { level: 'Low', color: 'text-green-400' };
    if (uvIndex <= 5) return { level: 'Moderate', color: 'text-yellow-400' };
    if (uvIndex <= 7) return { level: 'High', color: 'text-orange-400' };
    if (uvIndex <= 10) return { level: 'Very High', color: 'text-red-400' };
    return { level: 'Extreme', color: 'text-purple-400' };
  };

  const toggleUnits = () => {
    setUnits(prev => prev === 'celsius' ? 'fahrenheit' : 'celsius');
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-blue-400 rounded-full pulse-animation" />
          <h2 className="text-2xl font-semibold text-yellow-400 jarvis-font">WEATHER</h2>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={toggleUnits}
            variant="outline"
            size="sm"
            className="border-blue-400/50 text-blue-400 hover:bg-blue-400/20"
          >
            °{units === 'celsius' ? 'C' : 'F'}
          </Button>
          <Button
            onClick={fetchWeather}
            disabled={loading}
            variant="outline"
            size="sm"
            className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/20"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            onClick={onToggle}
            variant="outline"
            size="sm"
            className="border-red-400/50 text-red-400 hover:bg-red-400/20"
          >
            Hide
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-400/30 p-4 rounded-lg">
          <div className="text-red-400">Error: {error}</div>
        </div>
      )}

      {loading && !weather && (
        <div className="flex items-center justify-center h-40">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-150" />
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-300" />
          </div>
        </div>
      )}

      {weather && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Weather */}
          <Card className="bg-black/40 border-yellow-400/30 p-6 hologram-effect lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-yellow-400 mb-1">
                  {weather.current.location}
                </h3>
                <p className="text-yellow-400/80">{new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric'
                })}</p>
              </div>
              <div className="text-6xl">
                {getWeatherIcon(weather.current.condition)}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-100 mb-1">
                  {weather.current.temperature}°
                </div>
                <div className="text-sm text-yellow-400/80">
                  {weather.current.condition}
                </div>
                <div className="text-xs text-yellow-400/60 mt-1">
                  Feels like {weather.current.feelsLike}°
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-yellow-400/80 text-sm">Humidity</span>
                  <span className="text-yellow-100 text-sm">{weather.current.humidity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-400/80 text-sm">Pressure</span>
                  <span className="text-yellow-100 text-sm">{weather.current.pressure} hPa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-400/80 text-sm">Visibility</span>
                  <span className="text-yellow-100 text-sm">{weather.current.visibility} km</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-yellow-400/80 text-sm">Wind Speed</span>
                  <span className="text-yellow-100 text-sm">{weather.current.windSpeed} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-400/80 text-sm">UV Index</span>
                  <span className={`text-sm ${getUVLevel(weather.current.uvIndex).color}`}>
                    {weather.current.uvIndex} ({getUVLevel(weather.current.uvIndex).level})
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-yellow-400/80">Weather Alerts</div>
                <div className="text-xs text-green-400">
                  ✓ No active alerts
                </div>
                <div className="text-xs text-yellow-400/60">
                  All systems normal
                </div>
              </div>
            </div>
          </Card>

          {/* 5-Day Forecast */}
          <Card className="bg-black/40 border-yellow-400/30 p-6 hologram-effect lg:col-span-2">
            <h3 className="text-xl font-semibold text-yellow-400 mb-4">5-Day Forecast</h3>
            <div className="grid grid-cols-5 gap-4">
              {weather.forecast.map((day, index) => (
                <div key={index} className="text-center p-4 bg-black/30 rounded border border-yellow-400/20 hover:border-yellow-400/40 transition-colors">
                  <div className="text-sm font-semibold text-yellow-400 mb-2">
                    {index === 0 ? 'Tomorrow' : day.day.slice(0, 3)}
                  </div>
                  <div className="text-2xl mb-2">
                    {getWeatherIcon(day.condition)}
                  </div>
                  <div className="text-sm text-yellow-100 mb-1">
                    <div className="font-semibold">{day.high}°</div>
                    <div className="text-yellow-400/60">{day.low}°</div>
                  </div>
                  <div className="text-xs text-yellow-400/80 mb-1">
                    {day.condition}
                  </div>
                  <div className="text-xs text-blue-400">
                    {day.precipitation}% rain
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}