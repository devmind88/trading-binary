import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimeZoneClock {
  name: string;
  timezone: string;
  offset: string;
}

const timeZones: TimeZoneClock[] = [
  { name: 'New York', timezone: 'America/New_York', offset: 'EST/EDT' },
  { name: 'London', timezone: 'Europe/London', offset: 'GMT/BST' },
  { name: 'Tokyo', timezone: 'Asia/Tokyo', offset: 'JST' },
  { name: 'Sydney', timezone: 'Australia/Sydney', offset: 'AEDT/AEST' },
  { name: 'Dubai', timezone: 'Asia/Dubai', offset: 'GST' },
  { name: 'Singapore', timezone: 'Asia/Singapore', offset: 'SGT' },
  { name: 'Hong Kong', timezone: 'Asia/Hong_Kong', offset: 'HKT' },
  { name: 'Mumbai', timezone: 'Asia/Kolkata', offset: 'IST' },
  { name: 'São Paulo', timezone: 'America/Sao_Paulo', offset: 'BRT/BRST' },
  { name: 'Los Angeles', timezone: 'America/Los_Angeles', offset: 'PST/PDT' },
];

const DigitalClock: React.FC = () => {
  const [times, setTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    const updateTimes = () => {
      const newTimes: Record<string, string> = {};
      
      timeZones.forEach(({ timezone }) => {
        const time = new Date().toLocaleString('en-US', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });
        newTimes[timezone] = time;
      });
      
      setTimes(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Clock className="w-10 h-10 text-blue-400" />
            <h1 className="text-5xl font-bold text-white">World Clock</h1>
          </div>
          <p className="text-slate-400 text-lg">Current time across major cities</p>
        </div>

        {/* Clock Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {timeZones.map(({ name, timezone, offset }) => (
            <div
              key={timezone}
              className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 border border-slate-600 hover:border-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-400/20"
            >
              {/* City Name */}
              <h2 className="text-xl font-bold text-white mb-2">{name}</h2>
              
              {/* Timezone Info */}
              <p className="text-sm text-slate-400 mb-4">{offset}</p>
              
              {/* Digital Time Display */}
              <div className="bg-black rounded-lg p-6 mb-4 font-mono text-center border border-slate-600">
                <div className="text-4xl font-bold text-green-400 tracking-widest">
                  {times[timezone] || '--:--:--'}
                </div>
              </div>

              {/* Day/Night Indicator */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Status:</span>
                <div className="flex items-center gap-2">
                  {times[timezone] ? (
                    <>
                      <div className={`w-3 h-3 rounded-full ${
                        parseInt(times[timezone].split(':')[0]) >= 6 && 
                        parseInt(times[timezone].split(':')[0]) < 18
                          ? 'bg-yellow-400'
                          : 'bg-blue-400'
                      }`} />
                      <span className="text-slate-300">
                        {parseInt(times[timezone].split(':')[0]) >= 6 && 
                         parseInt(times[timezone].split(':')[0]) < 18
                          ? 'Day'
                          : 'Night'}
                      </span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-slate-400">
          <p className="text-sm">Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default DigitalClock;
