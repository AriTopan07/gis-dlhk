import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, Polygon, Polyline, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import wellknown from 'wellknown';
import Modal from '@/Components/Modal';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// ── Icons ──────────────────────────────────────────────────
const Icons = {
    Star: ({ filled }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    ),
    Camera: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
        </svg>
    ),
    X: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
    ),
    Send: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
        </svg>
    ),
    MapPin: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
        </svg>
    ),
    Target: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="M2 12h2" /><path d="M20 12h2" />
        </svg>
    ),
    Refresh: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" />
        </svg>
    ),
    Layers: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.8a2 2 0 0 0 0 3.6l8.57 4.62a2 2 0 0 0 1.66 0L21.4 10.4a2 2 0 0 0 0-3.6z" />
            <path d="m2 17 8.57 4.63a2 2 0 0 0 1.66 0L20.82 17" /><path d="m2 12 8.57 4.63a2 2 0 0 0 1.66 0L20.82 12" />
        </svg>
    ),
    Check: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
        </svg>
    ),
    Minus: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
        </svg>
    ),
    Plus: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
        </svg>
    ),
    MessageSquare: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    ),
};

// ── Map Utilities ──────────────────────────────────────────
const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
};

const cleanCoords = (coords) => {
    if (typeof coords[0] === 'number') return [coords[0], coords[1]];
    return coords.map(cleanCoords);
};

const processData = (data, nameProp) => {
    const cleanData = Array.isArray(data[0]) ? data.flat() : data;
    return {
        type: "FeatureCollection",
        features: cleanData.map(item => {
            try {
                const wkt = item.lokasi.replace(/(POLYGON|MULTIPOLYGON)\s+Z/i, '$1');
                let geo = wellknown.parse(wkt);
                if (!geo || !geo.coordinates || geo.coordinates.length === 0) {
                    const coordsStr = item.lokasi.match(/\(\(\(.*\)\)\)/);
                    if (coordsStr) {
                        const points = coordsStr[0].replace(/[()]/g, '').split(',');
                        const parsedCoords = points.map(p => {
                            const parts = p.trim().split(' ');
                            return [parseFloat(parts[0]), parseFloat(parts[1])];
                        });
                        geo = { type: "Polygon", coordinates: [parsedCoords] };
                    }
                }
                if (geo && geo.coordinates) geo.coordinates = cleanCoords(geo.coordinates);
                return {
                    type: "Feature",
                    geometry: geo,
                    properties: { name: item[nameProp] || "Sidoarjo" }
                };
            } catch (e) {
                return null;
            }
        }).filter(f => f && f.geometry)
    };
};

// ── Star Rating Component ──────────────────────────────────
const StarRating = ({ value, onChange, size = 'lg' }) => {
    const [hover, setHover] = useState(0);
    const sizeClass = size === 'lg' ? 'w-10 h-10' : 'w-6 h-6';

    return (
        <div className="flex gap-1 items-center">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className={`${sizeClass} transition-all duration-200 ${star <= (hover || value)
                            ? 'text-amber-400 scale-110'
                            : 'text-slate-300 hover:text-amber-200'
                        }`}
                >
                    <Icons.Star filled={star <= (hover || value)} />
                </button>
            ))}
        </div>
    );
};

export default function Dashboard({ canReview }) {
    const { auth } = usePage().props;

    // ── Map States ─────────────────────────────────────────
    const [kabupatenData, setKabupatenData] = useState(null);
    const [kecamatanData, setKecamatanData] = useState(null);
    const [desaData, setDesaData] = useState(null);
    const [maskPositions, setMaskPositions] = useState(null);
    const [markersData, setMarkersData] = useState([]);
    const [activeMarkerId, setActiveMarkerId] = useState(null);
    const [locationDetails, setLocationDetails] = useState({});
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [showDetails, setShowDetails] = useState({});
    const [userLocation, setUserLocation] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [hasFitted, setHasFitted] = useState(false);
    const mapRef = useRef();

    const [layerVisibility, setLayerVisibility] = useState({
        kabupaten: true,
        kecamatan: false,
        desa: false
    });
    const [expandedMenu, setExpandedMenu] = useState('basemap');
    const [mapState, setMapState] = useState({
        center: [-7.4726, 112.6675],
        zoom: 11
    });

    // ── Review Modal States ─────────────────────────────────
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedLokasi, setSelectedLokasi] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        lokasi_id: '',
        rating: 0,
        komentar: '',
        foto: null,
    });

    // ── Map Data Loading ────────────────────────────────────
    const loadAllData = useCallback(() => {
        fetch('/data/sidoarjo.json')
            .then(res => res.json())
            .then(data => {
                const collection = processData(data, 'kecamatan');
                setKabupatenData(collection);
            }).catch(err => console.error("Error loading kabupaten:", err));

        fetch('/data/sidoarjo-kecamatan.json')
            .then(res => res.json())
            .then(data => setKecamatanData(processData(data, 'kecamatan')))
            .catch(err => console.error("Error loading kecamatan:", err));

        fetch('/data/sidoarjo-desa.json')
            .then(res => res.json())
            .then(data => setDesaData(processData(data, 'desa')))
            .catch(err => console.error("Error loading desa:", err));

        fetch('/api/lokasi-markers')
            .then(res => res.json())
            .then(data => setMarkersData(data))
            .catch(err => console.error("Error loading markers:", err));
    }, []);

    useEffect(() => { loadAllData(); }, [loadAllData]);

    useEffect(() => {
        if (kabupatenData) {
            const rings = [];
            kabupatenData.features.forEach(feature => {
                const geo = feature.geometry;
                if (geo.type === 'Polygon') {
                    rings.push(geo.coordinates[0].map(c => [c[1], c[0]]));
                } else if (geo.type === 'MultiPolygon') {
                    geo.coordinates.forEach(poly => {
                        rings.push(poly[0].map(c => [c[1], c[0]]));
                    });
                }
            });
            const world = [[90, -360], [90, 360], [-90, 360], [-90, -360]];
            setMaskPositions([world, ...rings]);
        }
    }, [kabupatenData]);

    useEffect(() => {
        if (kabupatenData && kabupatenData.features.length > 0 && !hasFitted && mapRef.current) {
            const layer = L.geoJSON(kabupatenData);
            const bounds = layer.getBounds();
            if (bounds.isValid()) {
                mapRef.current.fitBounds(bounds, { padding: [30, 30] });
                mapRef.current.setMaxBounds(bounds);
                setHasFitted(true);
            } else {
                mapRef.current.setView([-7.4726, 112.6675], 11);
                setHasFitted(true);
            }
        }
    }, [kabupatenData, hasFitted]);

    const locateUser = () => {
        if (!navigator.geolocation) return;
        setIsTracking(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation([latitude, longitude]);
                if (mapRef.current) {
                    mapRef.current.flyTo([latitude, longitude], 15, { animate: true, duration: 1.5 });
                }
                setIsTracking(false);
            },
            () => setIsTracking(false),
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    useEffect(() => { locateUser(); }, []);

    const fetchLocationDetail = async (id) => {
        if (locationDetails[id]) return;
        setIsLoadingDetail(true);
        try {
            const res = await fetch(`/api/lokasi/${id}/detail`);
            const detail = await res.json();
            setLocationDetails(prev => ({ ...prev, [id]: detail }));
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
        if (!locationDetails[id]) fetchLocationDetail(id);
    };

    const geojsonStyle = (type, feature) => {
        const styles = {
            kabupaten: { color: "#2563eb", weight: 3, fillOpacity: 0, dashArray: '8, 8' },
            kecamatan: { color: "#166534", weight: 1, fillColor: "rgba(255, 255, 255, 0.2)", fillOpacity: 0.05 },
            desa: { color: "#475569", weight: 1, dashArray: '5, 5', fillOpacity: 0 }
        };
        return styles[type] || styles.kecamatan;
    };

    const onEachFeature = (feature, layer) => {
        layer.on({
            click: (e) => {
                e.target.bindPopup(`<strong>${feature.properties.name}</strong><br/>Kabupaten Sidoarjo`).openPopup();
            }
        });
    };

    const toggleLayer = (layer) => setLayerVisibility(prev => ({ ...prev, [layer]: !prev[layer] }));

    const handleLocalReset = () => {
        setHasFitted(false);
        setLayerVisibility({ kabupaten: true, kecamatan: false, desa: false });
        setMapState({ center: [-7.4726, 112.6675], zoom: 11 });
        loadAllData();
    };

    // ── Review Modal Handlers ──────────────────────────────
    const openReviewModal = (marker) => {
        // Close all map popups first
        if (mapRef.current) {
            mapRef.current.closePopup();
        }
        setSelectedLokasi(marker);
        setData('lokasi_id', marker.id);
        setShowReviewModal(true);
    };

    const closeReviewModal = () => {
        setShowReviewModal(false);
        setSelectedLokasi(null);
        setFotoPreview(null);
        reset();
    };

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setData('foto', file);
        const reader = new FileReader();
        reader.onload = (ev) => setFotoPreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const removeFoto = () => {
        setData('foto', null);
        setFotoPreview(null);
    };

    const submitReview = (e) => {
        e.preventDefault();
        post(route('ulasan.store'), {
            forceFormData: true,
            onSuccess: () => {
                closeReviewModal();
            },
        });
    };

    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

    // ── Top 10 Rated ───────────────────────────────────────
    const topRated = [...markersData]
        .filter(m => m.ulasan_total > 0)
        .sort((a, b) => b.ulasan_avg - a.ulasan_avg || b.ulasan_total - a.ulasan_total)
        .slice(0, 10);

    const [showTopRated, setShowTopRated] = useState(true);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold leading-tight text-black">Dashboard</h2>
                    <p className="text-sm text-slate-500 hidden sm:block">Peta Interaktif DLHK Kabupaten Sidoarjo</p>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-4">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Map Container */}
                    <div className="relative rounded-[1.5rem] overflow-hidden border border-slate-200 shadow-xl bg-[#334155]" style={{ height: 'calc(100vh - 180px)' }}>
                        <MapContainer
                            center={mapState.center}
                            zoom={mapState.zoom}
                            className="h-full w-full outline-none bg-[#334155]"
                            zoomControl={false}
                            dragging={true}
                            doubleClickZoom={false}
                            scrollWheelZoom={true}
                            touchZoom={true}
                            maxBoundsViscosity={1.0}
                            minZoom={10}
                            ref={mapRef}
                        >
                            <ChangeView center={mapState.center} zoom={mapState.zoom} />
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            />

                            {maskPositions && (
                                <Polygon
                                    positions={maskPositions}
                                    pathOptions={{
                                        stroke: false,
                                        fillColor: '#334155',
                                        fillOpacity: 1,
                                        fillRule: 'evenodd'
                                    }}
                                />
                            )}

                            {kabupatenData && layerVisibility.kabupaten && (
                                <GeoJSON
                                    key={`kab-${kabupatenData.features.length}-${layerVisibility.kabupaten}`}
                                    data={kabupatenData}
                                    style={geojsonStyle('kabupaten')}
                                />
                            )}

                            {kecamatanData && layerVisibility.kecamatan && (
                                <GeoJSON
                                    key={`kec-${kecamatanData.features.length}-${layerVisibility.kecamatan}`}
                                    data={kecamatanData}
                                    style={(feature) => geojsonStyle('kecamatan', feature)}
                                    onEachFeature={onEachFeature}
                                />
                            )}

                            {desaData && layerVisibility.desa && (
                                <GeoJSON
                                    key={`desa-${desaData.features.length}-${layerVisibility.desa}`}
                                    data={desaData}
                                    style={geojsonStyle('desa')}
                                />
                            )}

                            {/* Markers with Review Button in Popup */}
                            <MarkerClusterGroup chunkedLoading spiderfyOnMaxZoom showCoverageOnHover={false}>
                                {markersData.map((marker, idx) => {
                                    const color = colors[idx % colors.length];
                                    const customIcon = L.divIcon({
                                        className: 'custom-div-icon',
                                        html: `<div style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2">
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
                                            eventHandlers={{ click: () => setActiveMarkerId(marker.id) }}
                                        >
                                            <Popup minWidth={300} maxWidth={400} onClose={() => setActiveMarkerId(null)}>
                                                <div className="font-sans p-2">
                                                    <div className="flex items-center gap-2 mb-3 border-b pb-2 border-slate-100">
                                                        <div className="w-2 h-8 rounded-full" style={{ backgroundColor: color }}></div>
                                                        <div className="flex flex-col">
                                                            <h3 className="font-bold text-slate-800 text-base m-0">Detail Lokasi</h3>
                                                        </div>
                                                        {marker.kategori && (
                                                            <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${marker.kategori === 'taman' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                                                {marker.kategori}
                                                            </span>
                                                        )}
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
                                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                                </svg>
                                                            ))}
                                                        </div>
                                                        <span className="text-sm font-bold text-amber-600">{marker.ulasan_avg || 0}</span>
                                                        <span className="text-[11px] text-slate-400">({marker.ulasan_total || 0} ulasan)</span>
                                                    </div>

                                                    <div className="text-sm bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                                                        <div className="p-2 border-t border-slate-100 flex justify-center bg-white">
                                                            <button
                                                                onClick={(e) => toggleDetails(e, marker.id)}
                                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold rounded-lg transition-colors w-full"
                                                            >
                                                                {showDetails[marker.id] ? (
                                                                    <><span>Sembunyikan Detail</span><Icons.Minus /></>
                                                                ) : (
                                                                    <><span>Lihat Detail Pengawas & Petugas</span><Icons.Plus /></>
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
                                                                    <div className="max-h-[250px] overflow-y-auto p-3 space-y-4 border-t border-slate-100">
                                                                        {(() => {
                                                                            const detail = locationDetails[marker.id];
                                                                            const shifts = [
                                                                                { label: 'Pagi', data: detail?.pengawas_pagi, color: 'text-emerald-700 bg-emerald-100' },
                                                                                { label: 'Siang', data: detail?.pengawas_siang, color: 'text-blue-700 bg-blue-100' },
                                                                                { label: 'Malam', data: detail?.pengawas_malam, color: 'text-indigo-700 bg-indigo-100' }
                                                                            ].filter(s => s.data);

                                                                            if (shifts.length === 0) {
                                                                                return <div className="text-slate-400 italic text-xs py-2">Belum ada pengawas ditugaskan.</div>;
                                                                            }

                                                                            return shifts.map((shift, idx) => (
                                                                                <div key={shift.label} className={idx > 0 ? "pt-4 border-t border-slate-200/60" : ""}>
                                                                                    <div className="flex items-center gap-2 mb-1">
                                                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${shift.color}`}>
                                                                                            Shift {shift.label}
                                                                                        </span>
                                                                                    </div>
                                                                                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-0.5">Pengawas (Mandor)</span>
                                                                                    <div className="font-bold text-slate-800 text-[13px] mb-2">{shift.data.nama}</div>

                                                                                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Daftar Petugas</span>
                                                                                    {shift.data.petugas?.length > 0 ? (
                                                                                        <ul className="space-y-1">
                                                                                            {shift.data.petugas.map(p => (
                                                                                                <li key={p.id} className="flex items-start gap-2">
                                                                                                    <span className="text-[#10B981] mt-0.5 text-xs">•</span>
                                                                                                    <span className="text-slate-700 text-[12px] font-medium">{p.nama}</span>
                                                                                                </li>
                                                                                            ))}
                                                                                        </ul>
                                                                                    ) : (
                                                                                        <span className="text-slate-400 italic text-[11px]">Belum ada petugas</span>
                                                                                    )}
                                                                                </div>
                                                                            ));
                                                                        })()}
                                                                    </div>
                                                                ) : null}
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Review Button */}
                                                    {canReview && (
                                                        <div className="mt-3 pt-2 border-t border-slate-100">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    e.preventDefault();
                                                                    openReviewModal(marker);
                                                                }}
                                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-md shadow-emerald-100 hover:shadow-lg hover:shadow-emerald-200"
                                                            >
                                                                <Icons.MessageSquare />
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

                            {/* Active Polyline Route */}
                            {markersData.map((marker, idx) => {
                                if (activeMarkerId === marker.id && marker.type === 'line' && marker.path && marker.path.length > 0) {
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

                            {/* User Live Location */}
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

                            {/* Zoom Controls */}
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
                                    title="Reset Map"
                                    className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center font-bold text-gray-700 hover:bg-gray-50 transition-colors mb-2"
                                >
                                    <Icons.Refresh />
                                </button>
                                <button
                                    onClick={() => setMapState(prev => ({ ...prev, zoom: prev.zoom + 1 }))}
                                    className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >+</button>
                                <button
                                    onClick={() => setMapState(prev => ({ ...prev, zoom: prev.zoom - 1 }))}
                                    className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >−</button>
                            </div>
                        </MapContainer>

                        {/* Basemap Control */}
                        <div className="absolute top-6 right-6 z-[1000] w-64 flex flex-col gap-2">
                            <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
                                <button
                                    onClick={() => setExpandedMenu(expandedMenu === 'basemap' ? null : 'basemap')}
                                    className="w-full bg-[#10B981] p-4 flex items-center justify-between text-white"
                                >
                                    <div className="flex items-center gap-3">
                                        <Icons.Layers />
                                        <span className="font-bold tracking-wide uppercase text-sm">Basemap</span>
                                    </div>
                                    <div className="transition-transform duration-300">
                                        {expandedMenu === 'basemap' ? <Icons.Minus /> : <Icons.Plus />}
                                    </div>
                                </button>
                                <div className={`bg-[#ECFDF5] transition-all duration-300 origin-top overflow-hidden ${expandedMenu === 'basemap' ? 'max-h-60 p-4' : 'max-h-0'}`}>
                                    <div className="flex flex-col gap-3">
                                        {['kabupaten', 'kecamatan', 'desa'].map((layer) => (
                                            <div
                                                key={layer}
                                                onClick={() => toggleLayer(layer)}
                                                className="flex items-center gap-3 cursor-pointer group hover:bg-white/50 p-1 rounded-md transition-colors"
                                            >
                                                <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${layerVisibility[layer] ? 'bg-[#047857] border-[#047857] text-white' : 'bg-white border-gray-300 group-hover:border-[#10B981]'
                                                    }`}>
                                                    {layerVisibility[layer] && <Icons.Check />}
                                                </div>
                                                <span className="text-sm font-bold text-[#334155] capitalize select-none">{layer}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Review Badge */}
                        {canReview && (
                            <div className="absolute top-6 left-6 z-[1000]">
                                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-emerald-100 px-5 py-3 flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Mode Ulasan</p>
                                        <p className="text-[10px] text-slate-400">Klik marker untuk memberi ulasan</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Top 10 Rating Sidebar */}
                        <div className="absolute bottom-6 left-6 z-[1000] w-72">
                            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                                {/* Header */}
                                <button
                                    onClick={() => setShowTopRated(p => !p)}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white"
                                >
                                    <div className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                        </svg>
                                        <span className="text-sm font-black uppercase tracking-wider">Top 10 Rating</span>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform duration-300 ${showTopRated ? 'rotate-180' : ''}`}>
                                        <path d="m18 15-6-6-6 6"/>
                                    </svg>
                                </button>

                                {/* List */}
                                <div className={`transition-all duration-300 overflow-hidden ${showTopRated ? 'max-h-80' : 'max-h-0'}`}>
                                    <div className="overflow-y-auto max-h-80 divide-y divide-slate-50">
                                        {topRated.length === 0 ? (
                                            <p className="text-xs text-slate-400 text-center py-6">Belum ada data ulasan</p>
                                        ) : topRated.map((item, idx) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/60 transition-colors cursor-pointer"
                                                onClick={() => {
                                                    if (item.latitude && item.longitude) {
                                                        setMapState({ center: [parseFloat(item.latitude), parseFloat(item.longitude)], zoom: 16 });
                                                    }
                                                }}
                                            >
                                                {/* Rank badge */}
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                                                    idx === 0 ? 'bg-amber-400 text-white' :
                                                    idx === 1 ? 'bg-slate-300 text-slate-700' :
                                                    idx === 2 ? 'bg-orange-300 text-white' :
                                                    'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {idx + 1}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-800 truncate leading-tight">{item.lokasi}</p>
                                                    <p className="text-[10px] text-slate-400">{item.ulasan_total} ulasan</p>
                                                </div>

                                                {/* Rating */}
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B">
                                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                                    </svg>
                                                    <span className="text-xs font-black text-amber-500">{item.ulasan_avg}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Review Modal ──────────────────────────────────────── */}
            <Modal show={showReviewModal} maxWidth="lg" onClose={closeReviewModal}>
                <form onSubmit={submitReview} className="relative">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white">Berikan Ulasan</h3>
                                {selectedLokasi && (
                                    <div className="flex items-center gap-1.5 mt-1 text-emerald-100 text-sm">
                                        <Icons.MapPin />
                                        <span>{selectedLokasi.lokasi}</span>
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={closeReviewModal}
                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors"
                            >
                                <Icons.X />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5 space-y-5">
                        {/* Rating */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Rating</label>
                            <div className="flex items-center gap-4">
                                <StarRating value={data.rating} onChange={(val) => setData('rating', val)} />
                                {data.rating > 0 && (
                                    <span className="text-sm font-bold text-amber-500">
                                        {['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Baik', 'Sangat Baik'][data.rating]}
                                    </span>
                                )}
                            </div>
                            {errors.rating && <p className="text-xs text-red-500 mt-1">{errors.rating}</p>}
                        </div>

                        {/* Komentar */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Komentar</label>
                            <textarea
                                value={data.komentar}
                                onChange={(e) => setData('komentar', e.target.value)}
                                placeholder="Tuliskan ulasan Anda tentang kondisi kebersihan lokasi ini..."
                                rows={4}
                                className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder-slate-400 focus:border-emerald-400 focus:ring-emerald-400 resize-none transition-colors"
                            />
                            {errors.komentar && <p className="text-xs text-red-500 mt-1">{errors.komentar}</p>}
                        </div>

                        {/* Foto Upload */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Foto <span className="text-slate-400 font-normal">(opsional)</span>
                            </label>

                            {fotoPreview ? (
                                <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                                    <img
                                        src={fotoPreview}
                                        alt="Preview"
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={removeFoto}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors"
                                        >
                                            <Icons.X />
                                            <span>Hapus Foto</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all duration-200 group">
                                    <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-emerald-500 transition-colors">
                                        <Icons.Camera />
                                        <span className="text-sm font-medium">Klik untuk upload foto</span>
                                        <span className="text-xs text-slate-300">JPG, JPEG, PNG, WebP</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/jpg,image/jpeg,image/png,image/webp"
                                        onChange={handleFotoChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                            {errors.foto && <p className="text-xs text-red-500 mt-1">{errors.foto}</p>}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeReviewModal}
                            className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing || data.rating === 0}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-slate-300 disabled:to-slate-300 text-white text-sm font-bold rounded-xl transition-all duration-200 shadow-md shadow-emerald-100 disabled:shadow-none"
                        >
                            <Icons.Send />
                            <span>{processing ? 'Mengirim...' : 'Kirim Ulasan'}</span>
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
