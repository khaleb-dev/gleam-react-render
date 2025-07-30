import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { getActiveResponders } from '@/data/mockData';
import { Responder, MapLocation } from '@/types';
import { MapPin, User } from 'lucide-react';

type TaskMapProps = {
  onLocationSelect?: (location: MapLocation) => void;
  interactive?: boolean;
};

export const TaskMap = ({ onLocationSelect, interactive = true }: TaskMapProps) => {
  const { currentLocation, setCurrentLocation } = useAppContext();
  const [responders, setResponders] = useState<Responder[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Simulate map loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMapLoaded(true);
      setResponders(getActiveResponders());
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate relative position (0-1) and convert to lat/lng
    // This is a simplified version just for the demo
    const relativeX = x / rect.width;
    const relativeY = y / rect.height;
    
    // Create a small random variation around the current location
    const newLat = 40.7128 - 0.01 + (relativeY * 0.02);
    const newLng = -74.0060 - 0.01 + (relativeX * 0.02);
    
    const newLocation = { lat: newLat, lng: newLng };
    setCurrentLocation(newLocation);
    
    if (onLocationSelect) {
      onLocationSelect(newLocation);
    }
  };

  // This is a mock map - in a real app, you would use a proper map library
  return (
    <div 
      ref={mapRef}
      className="map-container bg-gray-200 relative" 
      onClick={handleMapClick}
    >
      {!isMapLoaded ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-taskApp-purple"></div>
        </div>
      ) : (
        <>
          {/* Mock Map Background */}
          <div className="absolute inset-0 bg-taskApp-softGray overflow-hidden">
            {/* Grid lines */}
            <div className="absolute inset-0" style={{ 
              backgroundImage: 'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
            
            {/* Main roads */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300 transform -translate-y-1/2"></div>
            <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-gray-300 transform -translate-x-1/2"></div>
            
            {/* Secondary roads */}
            <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-gray-200"></div>
            <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-gray-200"></div>
            <div className="absolute top-0 bottom-0 left-1/4 w-0.5 bg-gray-200"></div>
            <div className="absolute top-0 bottom-0 left-3/4 w-0.5 bg-gray-200"></div>
          </div>
          
          {/* User's selected location */}
          <div 
            className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: `${50 + ((currentLocation.lng + 74.0060) * 2500)}px`, 
              top: `${50 + ((currentLocation.lat - 40.7128) * 2500)}px` 
            }}
          >
            <MapPin size={32} className="text-red-500" />
            <div className="mt-1 px-2 py-1 bg-white rounded-md shadow-sm text-xs">
              You
            </div>
          </div>
          
          {/* Responders */}
          {responders.map((responder) => {
            // Safely handle location properties
            const lat = responder.location?.lat || 40.7128;
            const lng = responder.location?.lng || -74.006;
            const name = responder.name || `${responder.first_name} ${responder.last_name}`;
            
            return (
              <div 
                key={responder.id || responder._id}
                className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  left: `${50 + ((lng + 74.0060) * 2500)}px`, 
                  top: `${50 + ((lat - 40.7128) * 2500)}px` 
                }}
              >
                <div className="relative">
                  <User size={24} className="text-taskApp-purple" />
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                </div>
                <div className="mt-1 px-2 py-1 bg-white rounded-md shadow-sm text-xs">
                  {name.split(' ')[0]}
                </div>
              </div>
            );
          })}
          
          {interactive && (
            <div className="absolute bottom-4 left-4 bg-white p-2 rounded-md shadow-md text-xs">
              Click anywhere on the map to set your task location
            </div>
          )}
        </>
      )}
    </div>
  );
};
