import "leaflet/dist/leaflet.css";
import { useDonations } from "../context/DonationContext";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, } from "react-leaflet";

function MyLocationButton({
    userLocation,
    setSelectedLocation,
    setSearchedLocation
}) {
    const map = useMap();

    const handleClick = () => {
        if (!userLocation) return;
        setSelectedLocation(userLocation);
        setSearchedLocation(null);
        map.flyTo(
            [userLocation.lat, userLocation.lng],
            16
        );
    };

    return (
        <div className="absolute bottom-6 right-6 z-[1000]">
            <button
                onClick={handleClick}
                className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 text-gray-700 font-medium hover:bg-gray-50 hover:text-emerald-600 hover:scale-105 active:scale-95 transition-all duration-200"
            >
                <span className="text-lg">📍</span> 
                <span>My Location</span>
            </button>
        </div>
    );
}

function FlyToLocation({ location }) {
    const map = useMap();

    useEffect(() => {
        if (!location) return;
        map.flyTo(
            [location.lat, location.lng],
            16
        );
    }, [location]);

    return null;
}

export default function HomeMap() {
    const { donations } = useDonations();
    const navigate = useNavigate();
    
    const SEARCH_RADIUS_KM = 0.5; 

    const [userLocation, setUserLocation] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [searchedLocation, setSearchedLocation] = useState(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setUserLocation(currentLocation);
                setSelectedLocation(currentLocation);
            },
            (error) => {
                console.error(error);
            }
        );
    }, []);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const formatDistance = (lat1, lon1, lat2, lon2) => {
        const distance = calculateDistance(lat1, lon1, lat2, lon2);
        const meters = Math.round(distance * 1000);

        if (meters < 900) {
            return `${meters} m away`;
        }
        return `${distance.toFixed(1)} km away`;
    };

    const redIcon = new L.Icon({
        iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
        shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    return (
        <div className="relative h-[650px] rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            <MapContainer
                center={[
                    userLocation?.lat || 13.118,
                    userLocation?.lng || 100.920
                ]}
                zoom={16}
                scrollWheelZoom={true}
                zoomControl={true}
                dragging={true}
                className="h-full w-full z-0"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FlyToLocation location={userLocation} />

                {selectedLocation && (
                    <>
                        <Marker
                            draggable={true}
                            position={[
                                selectedLocation.lat,
                                selectedLocation.lng
                            ]}
                            eventHandlers={{
                                dragend: (e) => {
                                    const position = e.target.getLatLng();
                                    setSelectedLocation({
                                        lat: position.lat,
                                        lng: position.lng
                                    });
                                }
                            }}
                        >
                            <Popup>
                                <span className="font-medium text-gray-800">📍 Search Location</span>
                            </Popup>
                        </Marker>

                        {searchedLocation && (
                            <Circle
                                center={[
                                    searchedLocation.lat,
                                    searchedLocation.lng
                                ]}
                                radius={500} 
                                pathOptions={{ 
                                    color: '#10b981', 
                                    fillColor: '#10b981', 
                                    fillOpacity: 0.1,
                                    weight: 2
                                }}
                            />
                        )}
                    </>
                )}

                {donations
                    .filter((d) => {
                        if (d.status !== "available") return false;
                        if (!searchedLocation) return true;

                        const distance = calculateDistance(
                            searchedLocation.lat,
                            searchedLocation.lng,
                            Number(d.latitude),
                            Number(d.longitude)
                        );
                        return distance <= SEARCH_RADIUS_KM;
                    })
                    .map((donation) => (
                        <Marker
                            key={donation._id}
                            icon={redIcon}
                            position={[
                                donation.latitude,
                                donation.longitude
                            ]}
                        >
                            <Popup className="custom-popup">
                                <div className="space-y-2 p-1">
                                    <h3 className="font-bold text-base text-gray-800 leading-tight">
                                        {donation.title}
                                    </h3>

                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p className="flex items-start gap-1.5">
                                            <span>📍</span> 
                                            <span className="line-clamp-2">{donation.pickupLocation}</span>
                                        </p>

                                        {selectedLocation && (
                                            <p className="flex items-center gap-1.5 text-emerald-600 font-medium">
                                                <span>🚶</span> 
                                                <span>
                                                    {formatDistance(
                                                        selectedLocation.lat,
                                                        selectedLocation.lng,
                                                        Number(donation.latitude),
                                                        Number(donation.longitude)
                                                    )}
                                                </span>
                                            </p>
                                        )}

                                        <p className="flex items-center gap-1.5 font-medium text-orange-600">
                                            <span>🍱</span> 
                                            <span>{donation.quantity} portions</span>
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/browse?donation=${donation._id}`)}
                                        className="mt-3 w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium rounded-xl py-2.5 text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                
                {/* Search Button Overlay */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000]">
                    <button
                        onClick={() => setSearchedLocation(selectedLocation)}
                        className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-6 py-3.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 text-gray-800 font-semibold tracking-wide hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                        <span className="text-lg">🔍</span>
                        <span>Search This Area</span>
                    </button>
                </div>

                <MyLocationButton
                    userLocation={userLocation}
                    setSelectedLocation={setSelectedLocation}
                    setSearchedLocation={setSearchedLocation}
                />
            </MapContainer>
        </div>
    );
}