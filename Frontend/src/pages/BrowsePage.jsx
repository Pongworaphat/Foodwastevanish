import React, { useState } from "react";
import { useDonations } from "../context/DonationContext";
import { useLocation } from "react-router-dom";
import UserProfileModal from "../components/UserProfileModal";
import {
  MapContainer,
  TileLayer,
  Marker
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});


export default function BrowsePage() {
  const [activeCategory, setActiveCategory] = useState("All Donations");
  const [search, setSearch] = useState("");

  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const {
    donations,
    claimDonation,
    addNotification
  } = useDonations();

  const filteredDonations = donations.filter((donation) => {
    const matchCategory =
      activeCategory === "All Donations" ||
      donation.category === activeCategory;
    if (donation.status !== "available") return false;

    const text =
      (donation.title + " " + (donation.description || "")).toLowerCase();

    return (
      donation.status === "available" &&
      matchCategory &&
      text.includes(search.toLowerCase())
    );
  });

  const formatDateTH = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const categories = [
    "All Donations",
    "Food Sharing",
    "Animal Food",
    "Organic Waste",
  ];

  const getCategoryStyle = (category) => {
    switch (category) {
      case "Food Sharing":
        return "bg-emerald-100 text-emerald-700";
      case "Animal Food":
        return "bg-orange-100 text-orange-700";
      case "Organic Waste":
        return "bg-lime-100 text-lime-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoryCardStyle = (category) => {
    switch (category) {
      case "Food Sharing":
        return "bg-emerald-100";
      case "Animal Food":
        return "bg-orange-100";
      case "Organic Waste":
        return "bg-lime-100";
      default:
        return "bg-white";
    }
  };

  const fallbackImage = "https://placehold.co/600x400/10b981/ffffff?text=Foodwaste+Vanish";
  const fallbackAvatar = "https://ui-avatars.com/api/?name=User";

  return (
    <div className="min-h-screen bg-emerald-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-semibold text-gray-900">
            Browse Donations
          </h1>
          <p className="text-gray-600">
            Find available food donations near you
          </p>
        </div>

        {/* Search & Sort */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search donations..."
            className="w-full sm:w-96 rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-800 placeholder-gray-400 outline-none ring-emerald-200 focus:ring-2"
          />

          <button className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
            Most Recent ▼
          </button>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 flex w-full overflow-x-auto rounded-3xl bg-gray-100 p-1 shadow-sm">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-1 rounded-2xl px-4 py-2 text-sm font-semibold transition ${activeCategory === cat
                ? "bg-white shadow-sm text-black"
                : "text-gray-700"
                }`}
            >
              {cat} (
              {cat === "All Donations"
                ? donations.filter((d) => d.status === "available").length
                : donations.filter(
                  (d) =>
                    d.category === cat &&
                    d.status === "available"
                ).length}
              )
            </button>
          ))}
        </div>

        {/* Category Legend */}
        {/* <div className="mb-6 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-400"></div>
            <span className="text-gray-600">Food Sharing</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-orange-300"></div>
            <span className="text-gray-600">Animal Food</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-lime-300"></div>
            <span className="text-gray-600">Organic Waste</span>
          </div>
        </div> */}

        {/* Donation Grid */}
        {filteredDonations.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-6xl">🍱</div>
            <h2 className="mb-2 text-2xl font-bold text-gray-800">
              No donations available
            </h2>
            <p className="mb-6 text-gray-500">
              Check back later for new food donations
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDonations.map((donation) => {
              const id = donation._id;
              const img = donation.image
                ? (donation.image.startsWith("http")
                  ? donation.image
                  : `http://localhost:5000${donation.image.startsWith('/') ? '' : '/'}${donation.image}`)
                : fallbackImage;
              return (
                <div
                  key={id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm  transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-48 w-full">
                    <img
                      key={donation.image}
                      src={img}
                      className="h-full w-full object-cover"
                      onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
                    />
                    <span className="absolute right-3 top-3 rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      {donation.status || "available"}
                    </span>
                  </div>

                  {/* card */}
                  <div
                    className={`relative overflow-hidden p-5 ${getCategoryCardStyle(
                      donation.category
                    )}`}
                  >
                    <div
                      className={`absolute -top-20 -right-20 w-44 h-44 rounded-full ${donation.category === "Food Sharing"
                        ? "bg-emerald-200"
                        : donation.category === "Animal Food"
                          ? "bg-orange-200"
                          : "bg-lime-200"
                        }`}
                    ></div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {donation.title}
                    </h3>

                    <div className="mt-3 flex items-center gap-3">
                      <img
                        src={
                          donation.donor?.avatar
                            ? donation.donor.avatar.startsWith("/")
                              ? `http://localhost:5000${donation.donor.avatar}`
                              : donation.donor.avatar
                            : fallbackAvatar
                        }
                        alt={donation.donor?.username}
                        className="h-10 w-10 rounded-full object-cover cursor-pointer hover:scale-105 transition"
                        onClick={() => setSelectedUser(donation.donor)}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = fallbackAvatar;
                        }}
                      />
                      <div>
                        <button
                          onClick={() => setSelectedUser(donation.donor)}
                          className="font-medium text-gray-800 hover:text-emerald-600 transition"
                        >
                          {donation.donor?.username || "Anonymous"}
                        </button>
                        <div className="text-xs text-gray-500">
                          ⭐ {donation.rating ?? "-"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2 text-sm text-gray-600">
                      <p>📍 {donation.pickupLocation || "-"}</p>
                      <p>📦 {donation.quantity || "-"}</p>
                      <p>🗓️ Exp: {formatDateTH(donation.expDate)}</p>
                    </div>

                    <div className="mt-4 flex gap-2">
                      {/* VIEW */}
                      <button
                        onClick={() => setSelectedDonation(donation)}
                        className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        View
                      </button>

                      {/* OWNER / CLAIM */}
                      {donation.donor?._id === currentUser?._id ? (
                        <div className="flex-1 rounded-xl bg-gray-100 px-4 py-2 text-center text-sm font-medium text-gray-400">
                          Your donation
                        </div>
                      ) : (
                        <button
                          onClick={async () => {
                            await claimDonation(id);
                          }}
                          className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition"
                        >
                          Claim
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL VIEW DONATION */}
        {selectedDonation && (
          <div onClick={() => setSelectedDonation(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-lg w-full max-w-[440px] max-h-[90vh] overflow-y-auto relative">
              <img
                src={
                  selectedDonation.image
                    ? selectedDonation.image.startsWith("/")
                      ? `http://localhost:5000${selectedDonation.image}`
                      : selectedDonation.image
                    : fallbackImage
                }
                alt={selectedDonation.title}
                className="w-full h-48 object-cover rounded-t-2xl"
                onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
              />
              <div className="absolute top-4 right-4 flex gap-2">
                {selectedDonation.status === "available" && (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                    available
                  </span>
                )}
                <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700">
                  {selectedDonation.category}
                </span>
              </div>

              <div className="p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">{selectedDonation.title}</h2>
                <p className="text-sm leading-relaxed text-gray-600 mb-5">{selectedDonation.description}</p>

                <div className="rounded-2xl bg-gray-50 p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        selectedDonation.donor?.avatar
                          ? selectedDonation.donor.avatar.startsWith("/")
                            ? `http://localhost:5000${selectedDonation.donor.avatar}`
                            : selectedDonation.donor.avatar
                          : fallbackAvatar
                      }
                      alt={selectedDonation.donor?.username}
                      className="h-10 w-10 rounded-full object-cover cursor-pointer hover:scale-105 transition"
                      onClick={() => setSelectedUser(selectedDonation.donor)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackAvatar;
                      }}
                    />
                    <div>
                      <button
                        onClick={() => setSelectedUser(selectedDonation.donor)}
                        className="font-medium text-gray-800 hover:text-emerald-600 transition"
                      >
                        {selectedDonation.donor?.username}
                      </button>

                      <div className="text-xs text-gray-500 mt-1">
                        ⭐ {selectedDonation.rating ?? "-"}
                      </div>
                    </div>

                    {selectedDonation.verified && (
                      <div className="ml-auto rounded-md border px-2 py-1 text-xs font-medium text-gray-600">
                        Verified
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="mb-2 text-sm font-semibold text-gray-800">
                  Pickup Location
                </h3>

                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 mb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="mt-1 text-sm font-medium text-slate-800">
                        📍 {selectedDonation.pickupLocation}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Meet the donor at this pickup point
                      </p>
                    </div>

                    <button
                      onClick={() => setShowMap(true)}
                      className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                    >
                      View Map
                    </button>
                  </div>
                </div>

                <h3 className="mb-2 text-sm font-semibold text-gray-800">
                  Donation Details
                </h3>

                <div className="rounded-2xl bg-gray-50 p-4 space-y-3 text-sm text-gray-600 mb-4">
                  <div>📦 {selectedDonation.quantity}</div>
                  <div>📅 Prod: {formatDateTH(selectedDonation.productionDate)}</div>
                  <div>🗓️ Exp: {formatDateTH(selectedDonation.expDate)}</div>
                  <div>
                    ⏰ Pickup:
                    {selectedDonation.pickupTime || "-"}
                    {selectedDonation.pickupEndTime
                      ? ` - ${selectedDonation.pickupEndTime}`
                      : ""}
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedDonation(null)}
                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Close
                  </button>
                  {selectedDonation.donor?._id !== currentUser?._id && (
                    <button
                      onClick={async () => {
                        await claimDonation(id);
                      }}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      Claim Donation
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL MAP RE-DESIGNED TO MATCH MOCKUP */}
        {showMap && (
          <div
            onClick={() => setShowMap(false)}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[1.5rem] p-6 w-full max-w-3xl shadow-2xl scale-100"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Pickup Location Map
                </h2>
                <button
                  onClick={() => setShowMap(false)}
                  className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Map Area */}
              <div className="h-[450px] rounded-xl border border-slate-200 overflow-hidden shadow-sm relative z-0">
                <MapContainer
                  center={[
                    selectedDonation?.latitude || 13.1235,
                    selectedDonation?.longitude || 100.9186
                  ]}
                  zoom={17}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[
                      selectedDonation?.latitude || 13.1235,
                      selectedDonation?.longitude || 100.9186
                    ]}
                  />
                </MapContainer>
              </div>

              {/* Location Data */}
              <div className="mt-5 px-1 flex items-center gap-2 text-slate-700">
                <span className="text-rose-500 text-lg">📍</span>
                <span className="font-medium text-slate-700">
                  {selectedDonation?.pickupLocation || "Unknown Location"}
                </span>
              </div>
            </div>
          </div>
        )}
        <UserProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      </div>
    </div>
  );

}