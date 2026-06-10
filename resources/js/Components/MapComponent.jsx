import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, Marker, Popup, useMap, Polygon, Polyline } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import wellknown from 'wellknown';

// Custom SVG Icons to avoid dependency issues
const Icons = {
    Layers: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.8a2 2 0 0 0 0 3.6l8.57 4.62a2 2 0 0 0 1.66 0L21.4 10.4a2 2 0 0 0 0-3.6z"/><path d="m2 17 8.57 4.63a2 2 0 0 0 1.66 0L20.82 17"/><path d="m2 12 8.57 4.63a2 2 0 0 0 1.66 0L20.82 12"/></svg>
    ),
    Check: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
    ),
    Minus: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
    ),
    Plus: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
    ),
    ChevronDown: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    ),
    Refresh: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
    ),
    Target: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/></svg>
    )
};

// Fix for default marker icons in Leaflet with Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, zoom);
        }
    }, [center, zoom, map]);
    return null;
};

const MapComponent = ({ selectedKecamatan, onReset, canReview = false, onOpenReview }) => {
    const [kabupatenData, setKabupatenData] = useState(null);
    const [kecamatanData, setKecamatanData] = useState(null);
    const [desaData, setDesaData] = useState(null);
    const [maskPositions, setMaskPositions] = useState(null);
    const [activeMarkerId, setActiveMarkerId] = useState(null);
    const [locationDetails, setLocationDetails] = useState({});
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [showDetails, setShowDetails] = useState({});
    
    // Visibility state for layers
    const [layerVisibility, setLayerVisibility] = useState({
        kabupaten: true,
        kecamatan: false, // Default to off
        desa: false
    });

    // Accordion state
    const [expandedMenu, setExpandedMenu] = useState('basemap');

    const [mapState, setMapState] = useState({
        center: [-7.4726, 112.6675],
        zoom: 11
    });

    // Helper to strip Z coordinate from GeoJSON
    const cleanCoords = (coords) => {
        if (typeof coords[0] === 'number') {
            return [coords[0], coords[1]]; // Keep only Lon, Lat
        }
        return coords.map(cleanCoords);
    };

    const processData = (data, nameProp) => {
        const cleanData = Array.isArray(data[0]) ? data.flat() : data;
        
        return {
            type: "FeatureCollection",
            features: cleanData.map(item => {
                try {
                    // Strip ' Z' suffix from MULTIPOLYGON/POLYGON as wellknown might return empty coords for them
                    const wkt = item.lokasi.replace(/(POLYGON|MULTIPOLYGON)\s+Z/i, '$1');
                    let geo = wellknown.parse(wkt);
                    
                    // Fallback: If standard parsing fails or returns empty, try manual extraction
                    if (!geo || !geo.coordinates || geo.coordinates.length === 0) {
                        console.warn("Standard parsing failed for", item[nameProp], ". Trying fallback...");
                        const coordsStr = item.lokasi.match(/\(\(\(.*\)\)\)/);
                        if (coordsStr) {
                            const points = coordsStr[0].replace(/[()]/g, '').split(',');
                            const parsedCoords = points.map(p => {
                                const parts = p.trim().split(' ');
                                return [parseFloat(parts[0]), parseFloat(parts[1])]; // Lon, Lat
                            });
                            geo = { type: "Polygon", coordinates: [parsedCoords] };
                        }
                    }

                    if (geo && geo.coordinates) {
                        geo.coordinates = cleanCoords(geo.coordinates);
                    }
                    
                    return {
                        type: "Feature",
                        geometry: geo,
                        properties: { name: item[nameProp] || "Sidoarjo" }
                    };
                } catch (e) {
                    console.error("Critical error parsing geometry:", e);
                    return null;
                }
            }).filter(f => f && f.geometry)
        };
    };

    const [markersData, setMarkersData] = useState([]);

    const loadAllData = () => {
        // Load Kabupaten
        fetch('/data/sidoarjo.json')
            .then(res => res.json())
            .then(data => {
                const collection = processData(data, 'kecamatan');
                setKabupatenData(collection);
            }).catch(err => console.error("Error loading kabupaten:", err));

        // Load Kecamatan
        fetch('/data/sidoarjo-kecamatan.json')
            .then(res => res.json())
            .then(data => {
                setKecamatanData(processData(data, 'kecamatan'));
            }).catch(err => console.error("Error loading kecamatan:", err));

        // Load Desa (Villages)
        fetch('/data/sidoarjo-desa.json')
            .then(res => res.json())
            .then(data => {
                setDesaData(processData(data, 'desa'));
            }).catch(err => console.error("Error loading desa:", err));
            
        // Load Lokasi Markers from API
        fetch('/api/lokasi-markers')
            .then(res => res.json())
            .then(data => {
                setMarkersData(data);
            }).catch(err => console.error("Error loading markers:", err));
    };

    useEffect(() => {
        loadAllData();
    }, []);

    useEffect(() => {
        if (kabupatenData) {
            const rings = [];
            kabupatenData.features.forEach(feature => {
                const geo = feature.geometry;
                if (geo.type === 'Polygon') {
                    // Convert [lon, lat] to [lat, lon] for Leaflet Polygon
                    rings.push(geo.coordinates[0].map(c => [c[1], c[0]]));
                } else if (geo.type === 'MultiPolygon') {
                    geo.coordinates.forEach(poly => {
                        rings.push(poly[0].map(c => [c[1], c[0]]));
                    });
                }
            });

            // Create a huge square covering the world
            const world = [
                [90, -360],
                [90, 360],
                [-90, 360],
                [-90, -360]
            ];

            // The first array is the outer ring, subsequent arrays are "holes" (even-odd rule)
            setMaskPositions([world, ...rings]);
        }
    }, [kabupatenData]);

    useEffect(() => {
        if (selectedKecamatan && kecamatanData) {
            const selectedFeature = kecamatanData.features.find(
                f => f.properties.name === selectedKecamatan
            );
            
            if (selectedFeature) {
                // Force kecamatan layer visibility when one is selected
                setLayerVisibility(prev => ({ ...prev, kecamatan: true }));
                
                const bounds = L.geoJSON(selectedFeature.geometry).getBounds();
                if (bounds.isValid()) {
                    mapRef.current.fitBounds(bounds, { padding: [100, 100] });
                }
            }
        }
    }, [selectedKecamatan, kecamatanData]);

    // New: Auto-fit to Kabupaten on load
    const mapRef = useRef();
    const [hasFitted, setHasFitted] = useState(false);
    
    // Live Location states
    const [userLocation, setUserLocation] = useState(null);
    const [isTracking, setIsTracking] = useState(false);

    const locateUser = () => {
        if (!navigator.geolocation) {
            console.warn('Geolocation is not supported by your browser');
            return;
        }

        setIsTracking(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation([latitude, longitude]);
                if (mapRef.current) {
                    mapRef.current.flyTo([latitude, longitude], 15, {
                        animate: true,
                        duration: 1.5
                    });
                }
                setIsTracking(false);
            },
            (error) => {
                console.warn("User location not available or denied:", error);
                setIsTracking(false);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    useEffect(() => {
        // Automatically request location when map component mounts
        locateUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (kabupatenData && kabupatenData.features.length > 0 && !hasFitted && mapRef.current) {
            const layer = L.geoJSON(kabupatenData);
            const bounds = layer.getBounds();
            
            if (bounds.isValid()) {
                console.log("Fitting bounds to Kabupaten...");
                mapRef.current.fitBounds(bounds, { padding: [30, 30] });
                mapRef.current.setMaxBounds(bounds); // Lock the map to Sidoarjo bounds
                setHasFitted(true);
            } else {
                console.error("Invalid bounds calculated for Kabupaten data");
                // Fallback: Just center on Sidoarjo
                mapRef.current.setView([-7.4726, 112.6675], 11);
                setHasFitted(true);
            }
        }
    }, [kabupatenData, hasFitted]);

    const onEachFeature = (feature, layer) => {
        layer.on({
            mouseover: (e) => {
                // No change on hover as requested
            },
            mouseout: (e) => {
                const l = e.target;
                // Still ensure it reverts to correct state if something else triggered a change
                l.setStyle(geojsonStyle('kecamatan', feature));
            },
            click: (e) => {
                const l = e.target;
                l.bindPopup(`<strong>${feature.properties.name}</strong><br/>Kabupaten Sidoarjo`).openPopup();
            }
        });
    };

    const fetchLocationDetail = async (id) => {
        if (locationDetails[id]) return; // already loaded
        
        setIsLoadingDetail(true);
        try {
            const res = await fetch(`/api/lokasi/${id}/detail`);
            const data = await res.json();
            setLocationDetails(prev => ({ ...prev, [id]: data }));
        } catch (error) {
            console.error("Failed to fetch location detail:", error);
        } finally {
            setIsLoadingDetail(false);
        }
    };

    const toggleDetails = (e, id) => {
        e.stopPropagation();
        e.preventDefault();
        
        setShowDetails(prev => ({ ...prev, [id]: !prev[id] }));
        
        if (!locationDetails[id]) {
            fetchLocationDetail(id);
        }
    };

    const geojsonStyle = (type, feature) => {
        // Highlight logic for selected Kecamatan
        if (type === 'kecamatan' && feature && feature.properties.name === selectedKecamatan) {
            return {
                color: "#2563eb", // Lighter Blue border
                weight: 2,
                fillColor: "#60a5fa", // Sky Blue fill
                fillOpacity: 0.35,
                dashArray: ''
            };
        }

        const styles = {
            kabupaten: { 
                color: "#2563eb", // Elegant Blue
                weight: 3,        // Thicker border
                fillOpacity: 0,   // Handled by the mask polygon
                dashArray: '8, 8' // Dashed line as requested
            },
            kecamatan: { 
                color: "#166534", 
                weight: 1, 
                fillColor: "rgba(255, 255, 255, 0.2)", 
                fillOpacity: 0.05 
            },
            desa: { 
                color: "#475569", 
                weight: 1, 
                dashArray: '5, 5', 
                fillOpacity: 0 
            }
        };
        return styles[type] || styles.kecamatan;
    };

    const toggleLayer = (layer) => {
        setLayerVisibility(prev => ({ ...prev, [layer]: !prev[layer] }));
    };

    const handleLocalReset = () => {
        // Reset local state
        setHasFitted(false);
        setLayerVisibility({
            kabupaten: true,
            kecamatan: false,
            desa: false
        });
        setMapState({
            center: [-7.4726, 112.6675],
            zoom: 11
        });
        
        // Reload all data
        loadAllData();
        
        // Call parent reset
        if (onReset) onReset();
    };

    // DEBUG: Hardcoded test square around Sidoarjo center
    const testPolygon = {
        type: "Feature",
        geometry: {
            type: "Polygon",
            coordinates: [[
                [112.6, -7.4], [112.7, -7.4], [112.7, -7.5], [112.6, -7.5], [112.6, -7.4]
            ]]
        }
    };

    return (
        <div className="h-full w-full relative">
            <MapContainer 
                center={mapState.center} 
                zoom={mapState.zoom} 
                className="h-full w-full outline-none bg-[#334155]"
                zoomControl={false}
                dragging={true}           // Allow panning within bounds
                doubleClickZoom={false}   // Disable double click zoom to prevent accidental panning
                scrollWheelZoom={true}    // Allow zooming with scroll wheel
                touchZoom={true}          // Allow pinch zoom
                maxBoundsViscosity={1.0}  // Make bounds rigid
                minZoom={10}              // Prevent zooming out too far
                ref={mapRef}
            >
                <ChangeView center={mapState.center} zoom={mapState.zoom} />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {maskPositions && (
                    <Polygon 
                        positions={maskPositions} 
                        pathOptions={{
                            stroke: false,
                            fillColor: '#334155', // Dark slate mask for high contrast
                            fillOpacity: 1, 
                            fillRule: 'evenodd'
                        }} 
                    />
                )}

                {kabupatenData && kabupatenData.features && kabupatenData.features.length > 0 && layerVisibility.kabupaten && (
                    <GeoJSON 
                        key={`kab-force-${kabupatenData.features.length}-${layerVisibility.kabupaten}`} 
                        data={kabupatenData} 
                        style={geojsonStyle('kabupaten')} 
                    />
                )}

                {(kecamatanData && (layerVisibility.kecamatan || selectedKecamatan)) && (
                    <GeoJSON 
                        key={`kec-layer-${kecamatanData.features.length}-${layerVisibility.kecamatan}-${selectedKecamatan}`}
                        data={kecamatanData} 
                        style={(feature) => geojsonStyle('kecamatan', feature)}
                        onEachFeature={onEachFeature}
                    />
                )}

                {desaData && layerVisibility.desa && (
                    <GeoJSON 
                        key={`desa-layer-${desaData.features.length}-${layerVisibility.desa}`}
                        data={desaData} 
                        style={geojsonStyle('desa')} 
                    />
                )}

                {/* Render Custom Lokasi Markers with Clustering */}
                <MarkerClusterGroup
                    chunkedLoading
                    spiderfyOnMaxZoom={true}
                    showCoverageOnHover={false}
                >
                    {markersData.map((marker, idx) => {
                        // Array of vibrant colors
                        const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
                        const color = colors[idx % colors.length];

                        // Custom SVG Marker Icon
                        const customIcon = L.divIcon({
                            className: 'custom-div-icon',
                            html: `<div style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3" fill="white"></circle>
                                    </svg>
                                   </div>`,
                            iconSize: [32, 32],
                            iconAnchor: [16, 32],
                            popupAnchor: [0, -32],
                        });

                        return (
                            <Marker 
                                key={`marker-${marker.id}`} 
                                position={[parseFloat(marker.latitude), parseFloat(marker.longitude)]}
                                icon={customIcon}
                                eventHandlers={{
                                    click: () => setActiveMarkerId(marker.id),
                                }}
                            >
                                <Popup 
                                    minWidth={300} 
                                    maxWidth={400} 
                                    onClose={() => setActiveMarkerId(null)}
                                >
                                    <div className="font-sans p-2">
                                        <div className="flex items-center gap-2 mb-3 border-b pb-2 border-slate-100">
                                            <div className="w-2 h-8 rounded-full" style={{ backgroundColor: color }}></div>
                                            <h3 className="font-bold text-slate-800 text-base m-0">Detail Lokasi</h3>
                                        </div>
                                        <div className="text-slate-700 font-medium mb-3">
                                            {marker.lokasi}
                                        </div>

                                        {/* Rating & Total Ulasan */}
                                        <div className="flex items-center gap-3 mb-3 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <svg key={star} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                                        fill={star <= Math.round(marker.ulasan_avg || 0) ? "#F59E0B" : "#E2E8F0"}
                                                        stroke={star <= Math.round(marker.ulasan_avg || 0) ? "#F59E0B" : "#CBD5E1"}
                                                        strokeWidth="1.5">
                                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                                    </svg>
                                                ))}
                                            </div>
                                            <span className="text-sm font-bold text-amber-600">{marker.ulasan_avg || 0}</span>
                                            <span className="text-[11px] text-slate-400">({marker.ulasan_total || 0} ulasan)</span>
                                        </div>
                                        <div className="text-sm bg-slate-50 rounded-xl border border-slate-100 overflow-hidden transition-all duration-300">
                                            <div className="p-2 border-t border-slate-100 flex justify-center bg-white">
                                                <button 
                                                    onClick={(e) => toggleDetails(e, marker.id)}
                                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold rounded-lg transition-colors w-full"
                                                >
                                                    {showDetails[marker.id] ? (
                                                        <>
                                                            <span>Sembunyikan Detail</span>
                                                            <Icons.Minus />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span>Lihat Detail Pengawas & Petugas</span>
                                                            <Icons.Plus />
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            {showDetails[marker.id] && (
                                                <>
                                                    {isLoadingDetail && activeMarkerId === marker.id && !locationDetails[marker.id] ? (
                                                        <div className="flex flex-col items-center justify-center p-6 text-slate-400">
                                                            <Icons.Refresh className="animate-spin mb-2" />
                                                            <span className="text-xs">Memuat data...</span>
                                                        </div>
                                                    ) : locationDetails[marker.id] ? (
                                                        <div className="max-h-[250px] overflow-y-auto custom-scrollbar p-3 space-y-4 border-t border-slate-100">
                                                            <div>
                                                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5">Pengawas (Mandor)</span>
                                                                <div className="font-bold text-slate-800 text-[13px]">{locationDetails[marker.id]?.pengawas?.nama || <span className="text-slate-400 italic font-normal">Tidak ada pengawas</span>}</div>
                                                            </div>

                                                            <div className="pt-3 border-t border-slate-200/60">
                                                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Daftar Petugas</span>
                                                                {locationDetails[marker.id]?.pengawas?.petugas?.length > 0 ? (
                                                                    <ul className="space-y-1">
                                                                        {locationDetails[marker.id].pengawas.petugas.map(p => (
                                                                            <li key={p.id} className="flex items-start gap-2">
                                                                                <span className="text-[#10B981] mt-0.5 text-xs">•</span>
                                                                                <span className="text-slate-600 text-[12px]">{p.nama}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                ) : (
                                                                    <span className="text-slate-400 italic text-[11px]">Belum ada petugas</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                </>
                                            )}
                                        </div>

                                        {canReview && (
                                            <div className="mt-3 pt-2 border-t border-slate-100">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        if (onOpenReview) onOpenReview(marker);
                                                    }}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-md shadow-emerald-100 hover:shadow-lg hover:shadow-emerald-200"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                                    <span>Berikan Ulasan</span>
                                                </button>
                                            </div>
                                        )}

                                        <div className="mt-3 pt-2 border-t border-slate-50 flex justify-between items-center text-[10px] text-slate-400">
                                            <span>Sidoarjo Geoportal</span>
                                            <span>DLHK Kab. Sidoarjo</span>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MarkerClusterGroup>

                {/* Render Active Polyline Route */}
                {markersData.map((marker, idx) => {
                    if (activeMarkerId === marker.id && marker.type === 'line' && marker.path && marker.path.length > 0) {
                        const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
                        const color = colors[idx % colors.length];
                        return (
                            <Polyline 
                                key={`path-${marker.id}`}
                                positions={marker.path.map(p => [p.lat, p.lng])} 
                                color={color} 
                                weight={6} 
                                opacity={0.8}
                            />
                        );
                    }
                    return null;
                })}

                {/* User Live Location Marker */}
                {userLocation && (
                    <Marker 
                        position={userLocation}
                        icon={L.divIcon({
                            className: 'custom-div-icon',
                            html: `
                                <div class="relative flex h-6 w-6 items-center justify-center -ml-3 -mt-3">
                                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                  <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white shadow-md"></span>
                                </div>
                            `,
                            iconSize: [24, 24],
                            iconAnchor: [12, 12],
                        })}
                    >
                        <Popup>Lokasi Anda Saat Ini</Popup>
                    </Marker>
                )}

                {/* Custom Zoom Control */}
                <div className="absolute bottom-10 right-10 z-[1000] flex flex-col gap-2">
                    <button 
                        onClick={locateUser}
                        title="Live Location"
                        className={`w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center font-bold transition-colors mb-2 ${isTracking ? 'text-blue-500 animate-pulse' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                        <Icons.Target />
                    </button>
                    <button 
                        onClick={handleLocalReset}
                        title="Reset Map & Filter"
                        className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center font-bold text-gray-700 hover:bg-gray-50 transition-colors mb-2"
                    >
                        <Icons.Refresh />
                    </button>
                    <button 
                        onClick={() => setMapState(prev => ({ ...prev, zoom: prev.zoom + 1 }))}
                        className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        +
                    </button>
                    <button 
                        onClick={() => setMapState(prev => ({ ...prev, zoom: prev.zoom - 1 }))}
                        className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        −
                    </button>
                </div>
            </MapContainer>

            {/* Custom Basemap Control Box */}
            <div className="absolute top-6 right-6 z-[1000] w-64 flex flex-col gap-2">
                {/* Main Accordion Box */}
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
                    {/* Basemap Header */}
                    <button 
                        onClick={() => setExpandedMenu(expandedMenu === 'basemap' ? null : 'basemap')}
                        className="w-full bg-[#10B981] p-4 flex items-center justify-between text-white group"
                    >
                        <div className="flex items-center gap-3">
                            <Icons.Layers />
                            <span className="font-bold tracking-wide uppercase text-sm">Basemap</span>
                        </div>
                        <div className="transition-transform duration-300">
                            {expandedMenu === 'basemap' ? <Icons.Minus /> : <Icons.Plus />}
                        </div>
                    </button>

                    {/* Basemap Content */}
                    <div className={`bg-[#ECFDF5] transition-all duration-300 origin-top overflow-hidden ${expandedMenu === 'basemap' ? 'max-h-60 p-4' : 'max-h-0'}`}>
                        <div className="flex flex-col gap-3">
                            {['kabupaten', 'kecamatan', 'desa'].map((layer) => (
                                <div 
                                    key={layer} 
                                    onClick={() => toggleLayer(layer)}
                                    className="flex items-center gap-3 cursor-pointer group hover:bg-white/50 p-1 rounded-md transition-colors"
                                >
                                    <div 
                                        className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
                                            layerVisibility[layer] ? 'bg-[#047857] border-[#047857] text-white' : 'bg-white border-gray-300 group-hover:border-[#10B981]'
                                        }`}
                                    >
                                        {layerVisibility[layer] && <Icons.Check />}
                                    </div>
                                    <span className="text-sm font-bold text-[#334155] capitalize select-none">{layer}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>



        </div>
    );
};

export default MapComponent;
