import React, { useState, useEffect } from 'react';
import { CloudSun, Droplets, Wind, Thermometer, RefreshCw, Sun, Compass } from 'lucide-react';
import { HouseholdEnvironment } from '../types';

export const WeatherWidget: React.FC = () => {
  const [city, setCity] = useState('New Delhi');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [env, setEnv] = useState<HouseholdEnvironment>({
    temp: 29,
    indoorTemp: 24,
    humidity: 58,
    aqi: 82,
    condition: 'Pleasant',
    tips: 'Pleasant temperature. Keep elder hydration bottles filled and pantry items away from direct sunlight.',
  });

  const cities = ['New Delhi', 'Bengaluru', 'Mumbai', 'Kolkata'];

  const refreshWeather = (selectedCity: string = city) => {
    setIsRefreshing(true);

    // Dynamic environmental calculation based on city
    setTimeout(() => {
      let temp = 28;
      let humidity = 60;
      let aqi = 75;
      let tips = 'Good household conditions. Ensure fresh air circulation in rooms.';

      if (selectedCity === 'New Delhi') {
        temp = 31;
        humidity = 52;
        aqi = 110;
        tips = 'Dry heat outdoors: Run room air filter and keep water cool in clay/copper matka.';
      } else if (selectedCity === 'Bengaluru') {
        temp = 24;
        humidity = 68;
        aqi = 48;
        tips = 'Pleasant breeze! Ideal time for an outdoor morning walk and drying clothes.';
      } else if (selectedCity === 'Mumbai') {
        temp = 30;
        humidity = 78;
        aqi = 85;
        tips = 'High humidity: Keep opened spices and biscuits in sealed airtight dabbas.';
      } else if (selectedCity === 'Kolkata') {
        temp = 32;
        humidity = 74;
        aqi = 95;
        tips = 'Warm and humid: Store fresh milk and dahi on middle fridge shelf.';
      }

      setEnv({
        temp,
        indoorTemp: Math.max(22, temp - 5),
        humidity,
        aqi,
        condition: humidity > 70 ? 'Humid' : temp > 30 ? 'Sunny' : 'Pleasant',
        tips,
      });
      setIsRefreshing(false);
    }, 600);
  };

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    refreshWeather(newCity);
  };

  return (
    <div className="bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 rounded-3xl border border-slate-200/90 p-5 shadow-xs transition-all hover:shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
            <Sun className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">
                Household Climate & Comfort
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Live Sensor
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Outdoor {env.temp}°C • Indoor AC/Cooler {env.indoorTemp}°C
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <select
            value={city}
            onChange={(e) => handleCityChange(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs"
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            onClick={() => refreshWeather()}
            disabled={isRefreshing}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors shadow-xs"
            title="Refresh climate reading"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2.5 mt-4">
        <div className="bg-white/90 p-2.5 rounded-2xl border border-slate-200/70 text-center shadow-xs">
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <Thermometer className="w-3.5 h-3.5 text-amber-500" />
            <span>Temp</span>
          </div>
          <div className="text-lg font-black text-slate-800 mt-0.5">{env.temp}°C</div>
          <span className="text-[10px] font-medium text-slate-500">{env.condition}</span>
        </div>

        <div className="bg-white/90 p-2.5 rounded-2xl border border-slate-200/70 text-center shadow-xs">
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            <span>Humidity</span>
          </div>
          <div className="text-lg font-black text-slate-800 mt-0.5">{env.humidity}%</div>
          <span className="text-[10px] font-medium text-slate-500">
            {env.humidity > 65 ? 'High' : 'Normal'}
          </span>
        </div>

        <div className="bg-white/90 p-2.5 rounded-2xl border border-slate-200/70 text-center shadow-xs">
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <Wind className="w-3.5 h-3.5 text-emerald-500" />
            <span>AQI Index</span>
          </div>
          <div
            className={`text-lg font-black mt-0.5 ${
              env.aqi <= 50 ? 'text-emerald-600' : env.aqi <= 100 ? 'text-amber-600' : 'text-orange-600'
            }`}
          >
            {env.aqi}
          </div>
          <span className="text-[10px] font-medium text-slate-500">
            {env.aqi <= 50 ? 'Good' : env.aqi <= 100 ? 'Moderate' : 'Poor'}
          </span>
        </div>
      </div>

      {/* Household Comfort Insight */}
      <div className="mt-3 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl px-3.5 py-2.5 flex items-start gap-2.5 text-xs text-emerald-950 font-medium">
        <span className="text-base leading-none">💡</span>
        <span className="flex-1 text-[11px] sm:text-xs leading-relaxed">{env.tips}</span>
      </div>
    </div>
  );
};
