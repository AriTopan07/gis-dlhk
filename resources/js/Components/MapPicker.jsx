import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IconSearch, IconMapPin, IconRoute, IconArrowBackUp } from '@tabler/icons-react';
import TextInput from '@/Components/TextInput';

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, type, path, setPosition, setPath }) => {
    useMapEvents({
        click(e) {
            const newPoint = { lat: e.latlng.lat, lng: e.latlng.lng };
            if (type === 'point') {
                setPosition(newPoint);
            } else if (type === 'line') {
                if (!position) {
                    setPosition(newPoint); // First point is the main pin
                }
                setPath(prev => [...(prev || []), newPoint]);
            }
        },
    });

    return (
        <>
            {position && <Marker position={[position.lat, position.lng]} />}
            {type === 'line' && path && path.length > 0 && (
                <Polyline 
                    positions={path.map(p => [p.lat, p.lng])} 
                    color="indigo" 
                    weight={4}
                />
            )}
            {type === 'line' && path && path.length > 0 && path.map((p, idx) => (
                <Marker 
                    key={idx} 
                    position={[p.lat, p.lng]} 
                    icon={L.divIcon({ className: 'bg-indigo-500 rounded-full border-2 border-white w-3 h-3', iconSize: [12, 12], iconAnchor: [6, 6] })} 
                />
            ))}
        </>
    );
};

const MapController = ({ searchKeyword }) => {
    const map = useMap();
    
    useEffect(() => {
        if (!searchKeyword) return;
        
        // Simple search using nominatim API
        const fetchLocation = async () => {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchKeyword)}`);
                const data = await response.json();
                if (data && data.length > 0) {
                    map.flyTo([data[0].lat, data[0].lon], 15);
                }
            } catch (error) {
                console.error("Geocoding failed", error);
            }
        };
        
        const timeoutId = setTimeout(fetchLocation, 1000);
        return () => clearTimeout(timeoutId);
    }, [searchKeyword, map]);

    return null;
};

export default function MapPicker({ position, type = 'point', path = [], onChange }) {
    const defaultCenter = [-7.4478, 112.7183]; // Sidoarjo center
    const [search, setSearch] = useState('');

    const handleSetPosition = (newPos) => {
        if (onChange) {
            onChange({ lat: newPos.lat, lng: newPos.lng, type, path });
        }
    };

    const handleSetPath = (newPathFn) => {
        if (onChange) {
            const updatedPath = typeof newPathFn === 'function' ? newPathFn(path) : newPathFn;
            onChange({ lat: position?.lat, lng: position?.lng, type, path: updatedPath });
        }
    };

    const handleSetType = (newType) => {
        if (onChange) {
            // Jika pindah ke titik, reset path
            onChange({ 
                lat: position?.lat, 
                lng: position?.lng, 
                type: newType, 
                path: newType === 'point' ? [] : path 
            });
        }
    };

    const handleUndo = () => {
        if (path && path.length > 0) {
            const newPath = [...path];
            newPath.pop();
            handleSetPath(newPath);
            if (newPath.length === 0) {
                handleSetPosition({ lat: null, lng: null });
            }
        }
    };

    return (
        <div className="w-full h-full relative rounded-md overflow-hidden border border-slate-300 flex flex-col min-h-[300px]">
            <div className="absolute top-2 left-2 z-[1000] bg-white rounded-md shadow-md p-2 flex gap-2 items-center">
                <IconSearch size={16} className="text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Cari lokasi (Mis: SMAN 1 Sidoarjo)" 
                    className="border-none focus:ring-0 text-sm p-0 w-48"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}
                />
            </div>

            <div className="absolute top-2 right-2 z-[1000] flex gap-2">
                <div className="bg-white rounded-md shadow-md p-1 flex">
                    <button
                        type="button"
                        onClick={() => handleSetType('point')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded ${type === 'point' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <div className="flex items-center gap-1"><IconMapPin size={14} /> Titik</div>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSetType('line')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded ${type === 'line' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <div className="flex items-center gap-1"><IconRoute size={14} /> Garis (Rute)</div>
                    </button>
                </div>
            </div>
            
            <MapContainer 
                center={position && position.lat ? [position.lat, position.lng] : defaultCenter} 
                zoom={13} 
                style={{ flex: 1, minHeight: '200px', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />
                <LocationMarker 
                    position={position} 
                    type={type}
                    path={path}
                    setPosition={handleSetPosition} 
                    setPath={handleSetPath}
                />
                <MapController searchKeyword={search} />
            </MapContainer>
            
            <div className="bg-slate-100 p-2 text-xs text-slate-600 border-t flex justify-between items-center h-auto">
                <span>
                    {type === 'point' 
                        ? '* Klik pada peta untuk menitik lokasi.' 
                        : '* Klik pada peta beberapa kali untuk menggambar rute jalan.'}
                </span>
                
                <div className="flex gap-2 items-center">
                    {type === 'line' && path && path.length > 0 && (
                        <button 
                            type="button" 
                            onClick={handleUndo}
                            className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
                        >
                            <IconArrowBackUp size={14} /> Undo Titik
                        </button>
                    )}
                    {position && position.lat && (
                        <span className="font-mono bg-white px-2 py-1 rounded border">
                            {parseFloat(position.lat).toFixed(6)}, {parseFloat(position.lng).toFixed(6)}
                            {type === 'line' && ` (${path?.length || 0} titik)`}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
