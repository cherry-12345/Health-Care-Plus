"use client";
import { useEffect, useState } from "react";

interface RealtimeUpdate {
  type: string;
  hospitalId?: string;
  bedType?: string;
  change?: number;
  timestamp: string;
}

export default function LiveUpdates() {
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource("/api/realtime/stream");

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type !== "HEARTBEAT") {
        setUpdates((prev) => [data, ...prev.slice(0, 9)]); // Keep last 10
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Live Updates</h2>
        <div className={`w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} title={isConnected ? 'Connected' : 'Disconnected'} />
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {updates.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No updates yet...</p>
        ) : (
          updates.map((update, i) => (
            <div key={i} className={`p-3 rounded border-l-4 ${
              update.type === 'BED_UPDATE' ? 'border-blue-500 bg-blue-50' :
              update.type === 'EMERGENCY_MODE' ? 'border-red-500 bg-red-50' :
              'border-gray-500 bg-gray-50'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-sm">
                    {update.type.replace('_', ' ')}
                  </span>
                  {update.hospitalId && (
                    <p className="text-xs text-gray-600 mt-1">
                      Hospital: {update.hospitalId}
                      {update.bedType && ` | ${update.bedType} beds: ${update.change}`}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(update.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}