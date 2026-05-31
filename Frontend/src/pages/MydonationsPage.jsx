import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDonations } from "../context/DonationContext";
import UserProfileModal from "../components/UserProfileModal";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  MapContainer,
  TileLayer,
  Marker,
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

export default function MydonationsPage() {
  const [tab, setTab] = useState("available");
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [loading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const navigate = useNavigate();
  const { donations, deleteDonation } = useDonations();
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const myDonations = donations.filter(
    (d) => (d.donor?._id === currentUser?._id || d.donor === currentUser?._id)
  );

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

  const counts = {
    available: myDonations.filter((d) => d.status === "available").length,
    claimed: myDonations.filter((d) => d.status === "claimed").length,
    completed: myDonations.filter((d) => d.status === "completed").length,
  };

  const filtered = myDonations.filter((d) => d.status === tab);

  const fallbackImage = "https://placehold.co/600x400/10b981/ffffff?text=Foodwaste+Vanish";
  const fallbackAvatar = "https://ui-avatars.com/api/?name=User";

  const getImage = (d) => {
    if (d.image) {
      return d.image.startsWith("/")
        ? `http://localhost:5000${d.image}`
        : d.image;
    }
    return fallbackImage;
  };

  const getAvatar = (d) => {
    if (!d.donor?.avatar) {
      return fallbackAvatar;
    }
    return d.donor.avatar.startsWith("/")
      ? `http://localhost:5000${d.donor.avatar}`
      : d.donor.avatar;
  };

  const getCategoryStyle = (category) => {
    switch (category) {
      case "Food Sharing": return "bg-emerald-100 text-emerald-700";
      case "Animal Food": return "bg-orange-100 text-orange-700";
      case "Organic Waste": return "bg-lime-100 text-lime-700";
      default: return "bg-gray-100 text-gray-700";
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

  const getCategoryCircleStyle = (category) => {
    switch (category) {
      case "Food Sharing":
        return "bg-emerald-200";
      case "Animal Food":
        return "bg-orange-200";
      case "Organic Waste":
        return "bg-lime-200";
      default:
        return "bg-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* ================= HEADER ================= */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">My Donations</h1>
          <p className="text-gray-600">Manage your food donations</p>
        </div>

        {/* ================= STATS ================= */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Active Donations</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{counts.available}</p>
            </div>
            <img src="/src/assets/imgfoodwaste/box.png" alt="box" className="w-10 h-10 object-contain" />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{counts.claimed}</p>
            </div>
            <img src="/src/assets/imgfoodwaste/trend.png" alt="trend" className="w-10 h-10 object-contain" />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Completed</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{counts.completed}</p>
            </div>
            <img src="/src/assets/imgfoodwaste/checked.png" alt="checked" className="w-10 h-10 object-contain" />
          </div>
        </div>

        {/* ================= TABS ================= */}
        <div className="mb-6 flex gap-3 overflow-x-auto rounded-full bg-gray-200 p-1">
          {["available", "claimed", "completed"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 min-w-[160px] text-center text-sm font-medium py-2 rounded-full transition
              ${tab === t ? "bg-white shadow-sm text-gray-900" : "text-gray-600"}`}
            >
              {t === "available" ? "Active" : t === "claimed" ? "In Progress" : "Completed"} ({counts[t]})
            </button>
          ))}
        </div>

        {/* ================= LIST ================= */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="text-center py-12 text-gray-500 col-span-full">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center col-span-full">
              <div className="mb-4 text-6xl">📦</div>
              <h2 className="mb-2 text-2xl font-bold text-gray-800">No donations yet</h2>
              <p className="mb-6 text-gray-500">Start sharing food with your community</p>
              <button
                onClick={() => navigate("/donate")}
                className="rounded-2xl bg-emerald-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-emerald-700"
              >
                Donate Food
              </button>
            </div>
          ) : (
            filtered.map((d) => {
              const id = d._id || d.id;
              return (
                <div key={id} className={`mb-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${d.status === 'completed' ? 'opacity-85' : ''}`}>
                  {/* ================= IMAGE ================= */}
                  <div className="relative h-48 w-full">
                    <img
                      src={getImage(d)}
                      alt={d.title}
                      className="h-full w-full object-cover"
                      onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
                    />
                    <div className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-medium ${d.status === "available" ? "bg-emerald-100 text-emerald-800" : d.status === "claimed" ? "bg-yellow-100 text-yellow-800" : "bg-gray-200 text-gray-700"}`}>
                      {d.status === "available" ? "Active" : d.status === "claimed" ? "In Progress" : "Completed"}
                    </div>
                  </div>

                  {/* === CONTENT === */}
                    <div
                      className={`relative overflow-hidden p-5 ${getCategoryCardStyle(
                        d.category
                      )}`}>
                      <div
                        className={`absolute -top-20 -right-20 w-44 h-44 rounded-full ${getCategoryCircleStyle(
                          d.category
                        )}`}
                      />
                      <div className="relative z-10">
                      <h3 className="text-lg font-semibold text-gray-900">{d.title || "Untitled"}</h3>
                      <div className="mt-3 flex items-center gap-3 text-sm text-gray-700">
                        <img
                          src={getAvatar(d)}
                          alt={d.donor?.username}
                          className="h-10 w-10 rounded-full object-cover cursor-pointer hover:scale-105 transition"
                          onClick={() => setSelectedUser(d.donor)}
                        />
                        <div className="flex-1">
                          <button
                            onClick={() => setSelectedUser(d.donor)}
                            className="text-sm font-medium text-gray-800 hover:text-emerald-600 transition"
                          >
                            {d.donor?.username || "You"}
                          </button>
                          <div className="mt-0.5 text-xs text-gray-500">⭐ {d.rating ?? "-"}</div>
                        </div>
                        {d.verified && (
                          <div className="ml-2 rounded-md border px-2 py-1 text-xs font-medium text-gray-600">Verified</div>
                        )}
                        </div>
                    </div>

                    <div className="mt-3 text-sm text-gray-600 space-y-1">
                      <div>📍 {d.pickupLocation || "-"}</div>
                      <div>📦 {d.quantity || "-"}</div>
                      <div>🗓️ Exp: {formatDateTH(d.expDate)}</div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => setSelectedDonation(d)}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                      >
                        View Details
                      </button>

                      {/* เด้งเปิดห้องแชทดูประวัติย้อนหลังได้ตลอดเวลาแม้จะส่งเสร็จแล้ว */}
                      {d.status !== "available" && (
                        <button
                          onClick={() => navigate("/chat", { state: { donation: d } })}
                          className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition"
                        >
                          Open Chat
                        </button>
                      )}

                      {d.status !== "completed" && (
                        <>
                          <button
                            onClick={() => navigate(`/edit-donation/${id}`)}
                            className="w-full rounded-xl bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-200 transition"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => {
                              Swal.fire({
                                title: "Delete donation?",
                                text: "This action cannot be undone.",
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#10b981",
                                cancelButtonColor: "#ef4444",
                                confirmButtonText: "Yes, delete it",
                                cancelButtonText: "Cancel",
                              }).then(async (result) => {
                                if (result.isConfirmed) {
                                  try {
                                    const token = localStorage.getItem("authToken");
                                    const res = await fetch(`http://localhost:5000/api/donations/${id}`, {
                                      method: "DELETE",
                                      headers: { Authorization: `Bearer ${token}` },
                                    });
                                    const data = await res.json();
                                    if (!res.ok) throw new Error(data.message || "Delete failed");

                                    deleteDonation(id);
                                    toast.success("Donation deleted 🗑️");
                                  } catch (err) {
                                    console.error(err);
                                    toast.error("Delete failed");
                                  }
                                }
                              });
                            }}
                            className="w-full rounded-xl bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 transition"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                    {d.status === "completed" && (
                      <span className="block mt-3 text-green-600 text-sm font-medium">✅ Completed</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-[440px] max-h-[90vh] overflow-y-auto relative pb-5">
            <img
              src={getImage(selectedDonation)}
              alt={selectedDonation.title}
              className="w-full h-48 object-cover rounded-t-2xl"
              onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <div className={`rounded-full px-3 py-1 text-xs font-medium ${selectedDonation.status === "available" ? "bg-emerald-100 text-emerald-800" : selectedDonation.status === "claimed" ? "bg-yellow-100 text-yellow-800" : "bg-gray-200 text-gray-700"}`}>
                {selectedDonation.status}
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${getCategoryStyle(selectedDonation.category)}`}>
                {selectedDonation.category}
              </span>
            </div>

            <div className="p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{selectedDonation.title}</h2>
              <p className="text-sm text-gray-600 mb-4">{selectedDonation.description}</p>

              <div className="rounded-2xl bg-gray-50 p-4 mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={getAvatar(selectedDonation)}
                    alt={selectedDonation.donor?.username}
                    className="h-10 w-10 rounded-full object-cover cursor-pointer hover:scale-105 transition"
                    onClick={() => setSelectedUser(selectedDonation.donor)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = fallbackAvatar;
                    }}
                  />
                  <div className="flex-1">
                    <button
                      onClick={() => setSelectedUser(selectedDonation.donor)}
                      className="font-medium text-gray-800 hover:text-emerald-600 transition"
                    >
                      {selectedDonation.donor?.username}
                    </button>
                    <div className="text-xs text-gray-500 mt-1">⭐ {selectedDonation.rating ?? "-"}</div>
                  </div>
                  {selectedDonation.verified && (
                    <div className="rounded-md border px-2 py-1 text-xs font-medium text-gray-600">Verified</div>
                  )}
                </div>
              </div>

              <h3 className="mb-2 text-sm font-semibold text-gray-800">
                Pickup Location
              </h3>

              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 mb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-800">
                      📍 {selectedDonation.pickupLocation}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Meet at this pickup point
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setShowMap(true)}
                    className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                  >
                    View Map
                  </button>
                </div>
              </div>
              <h3 className="mb-2 text-sm font-semibold text-gray-800">Donation Details</h3>
              <div className="rounded-2xl bg-gray-50 p-4 space-y-3 text-sm text-gray-600 mb-4">
                <div>📦 {selectedDonation.quantity || "-"}</div>
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

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedDonation(null)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  Close
                </button>

                {selectedDonation.status !== "available" && (
                  <button
                    onClick={() =>
                      navigate("/chat", {
                        state: { donation: selectedDonation },
                      })
                    }
                    className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Continue Chat
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showMap && (
        <div
          onClick={() => setShowMap(false)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[1.5rem] p-6 w-full max-w-3xl shadow-2xl scale-100"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Pickup Location Map
              </h2>

              <button
                onClick={() => setShowMap(false)}
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="h-[450px] rounded-xl border border-slate-200 overflow-hidden shadow-sm relative z-0">
              <MapContainer
                center={[
                  selectedDonation?.latitude || 13.1235,
                  selectedDonation?.longitude || 100.9186,
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
                    selectedDonation?.longitude || 100.9186,
                  ]}
                />
              </MapContainer>
            </div>

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
  );
}