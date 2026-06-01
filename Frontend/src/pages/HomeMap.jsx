import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useDonations } from "../context/DonationContext";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function HomeMap() {

    const { donations } = useDonations();

    const redIcon = new L.Icon({
        iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
        shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    console.log(donations);

    return (
        <div className="h-[650px] rounded-3xl overflow-hidden">
            <MapContainer
                center={[13.118, 100.920]}
                zoom={16}
                scrollWheelZoom={true}
                zoomControl={true}
                dragging={true}
                className="h-full w-full"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {donations
                    .filter((d) => d.status === "available")
                    .map((donation) => (
                        <Marker
                            key={donation._id}
                            icon={redIcon}
                            position={[
                                donation.latitude,
                                donation.longitude
                            ]}
                        >
                            <Popup>
                                <div className="space-y-2">
                                    <h3 className="font-bold text-lg">
                                        {donation.title}
                                    </h3>

                                    <p>
                                        📍 {donation.pickupLocation}
                                    </p>

                                    <p>
                                        📦  Quantity: {donation.quantity}
                                    </p>

                                    <p>
                                        🏷️ {donation.category}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
            </MapContainer>
        </div>
    );
}