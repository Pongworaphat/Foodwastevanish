import React, { useState } from "react";
import { useDonations } from "../context/DonationContext";
import { useNavigate } from "react-router-dom";
import UserProfileModal from "../components/UserProfileModal";

export default function ReceivedPage() {
  const [tab, setTab] = useState("Pending");
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const { donations } = useDonations();

  const receivedList = donations.filter((d) => {
    const receiverId = d.receiver?._id || d.receiver;
    return receiverId === currentUser?._id;
  });

  const pendingDonations = receivedList.filter(
    (d) => d.status !== "completed"
  );

  const completedDonations = receivedList.filter(
    (d) => d.status === "completed"
  );

  const counts = {
    Pending: receivedList.filter((d) => d.status === "claimed").length,
    Completed: receivedList.filter((d) => d.status === "completed").length,
  };

  const loading = false;
  const navigate = useNavigate();

  const filtered = receivedList.filter((d) =>
    tab === "Pending"
      ? d.status === "claimed"
      : d.status === "completed"
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

  const fallbackImage = "https://placehold.co/600x400/10b981/ffffff?text=Foodwaste+Vanish";

  return (
    <div className="min-h-screen bg-emerald-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">
            Received Donations
          </h1>
          <p className="text-gray-600">Track donations you've claimed</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Received</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{receivedList.length}</p>
            </div>
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
              <img src="/src/assets/imgfoodwaste/heart.png" alt="like" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Pending Pickup</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{pendingDonations.length}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <img src="/src/assets/imgfoodwaste/clock.png" alt="time" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Completed</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{completedDonations.length}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <img src="/src/assets/imgfoodwaste/checked.png" alt="checked" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-3 overflow-x-auto rounded-full bg-gray-100 p-1">
          {["Pending", "Completed"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 min-w-[160px] text-center text-sm font-medium py-2 rounded-full transition ${tab === t ? "bg-white shadow-sm text-gray-900" : "text-gray-600"
                }`}
            >
              {t} ({counts[t]})
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-6xl">🌱</div>
            <h2 className="mb-2 text-2xl font-bold text-gray-800">No received donations</h2>
            <p className="mb-6 text-gray-500">Donations you claim will appear here</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            {filtered.map((item) => (
              <div
                key={item._id || item.id}
                className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition 
                  ${item.status === "completed"
                    ? "opacity-70"
                    : "hover:shadow-md"
                  }`}
              >
                {/* IMAGE + BADGES */}
                <div className="relative h-44 w-full">
                  <img
                    src={
                      item.image
                        ? item.image?.startsWith("/")
                          ? `http://localhost:5000${item.image}`
                          : item.image
                        : fallbackImage
                    }
                    alt={item.title}
                    className="h-full w-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
                  />
                  <span
                    className={`absolute right-3 top-3 rounded-md px-2 py-1 text-xs font-medium 
                      ${item.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : item.receiverConfirmed
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                  >
                    {item.status === "completed"
                      ? "Completed"
                      : item.receiverConfirmed
                        ? "Waiting Donor"
                        : "Awaiting Pickup"}
                  </span>
                </div>

                {/* CONTENT */}
                <div
                  className={`relative overflow-hidden p-5 ${getCategoryCardStyle(
                    item.category
                  )}`}
                >
                  <div
                    className={`absolute -top-20 -right-20 w-44 h-44 rounded-full ${getCategoryCircleStyle(
                      item.category
                    )}`}
                  />
                  <div className="relative z-10">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.title || "Untitled"}
                    </h3>
                    <div className="flex items-center gap-2 mt-3">
                      <img
                        src={
                          item.donor?.avatar
                            ? item.donor.avatar.startsWith("/")
                              ? `http://localhost:5000${item.donor.avatar}`
                              : item.donor.avatar
                            : "https://ui-avatars.com/api/?name=User"
                        }
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover cursor-pointer hover:scale-105 transition"
                        onClick={() => setSelectedUser(item.donor)}
                      />

                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          <button
                            onClick={() => setSelectedUser(item.donor)}
                            className="text-sm font-medium text-gray-800 hover:text-emerald-600 transition"
                          >
                            {item.donor?.username || "Unknown"}
                          </button>
                        </div>

                        <div className="text-xs text-yellow-500">
                          ⭐ {item.rating ?? "-"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-gray-700 space-y-1">
                      <div>📦 {item.quantity || "-"}</div>
                      <div>📍 {item.pickupLocation || "-"}</div>
                      <div>🗓️ Exp: {formatDateTH(item.expDate)}</div>
                    </div>
                  </div>
                  
                  {/* BUTTONS */}
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => setSelectedDonation(item)}
                      className="w-1/2 px-4 py-2 rounded-xl border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => navigate("/chat", { state: { donation: item } })}
                      className={`w-1/2 py-2 rounded-xl transition ${item.status === "completed"
                        ? "bg-gray-200 text-gray-600"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                    >
                      Open Chat
                    </button>
                  </div>



                  {/* COMPLETED TEXT */}
                  {item.status === "completed" && (
                    <span className="block mt-3 text-green-600 text-sm font-medium">✅ Completed</span>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[430px] overflow-hidden">
            <div className="relative h-56 w-full">
              <img
                src={
                  selectedDonation.image
                    ? selectedDonation.image.startsWith("/")
                      ? `http://localhost:5000${selectedDonation.image}`
                      : selectedDonation.image
                    : fallbackImage
                }
                alt={selectedDonation.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-pink-600 shadow">
                {selectedDonation.category || "Food Sharing"}
              </span>
            </div>

            <div className="p-5">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedDonation.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {selectedDonation.description || "-"}
              </p>

              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-gray-50 p-3">
                <img
                  src={
                    selectedDonation.donor?.avatar
                      ? selectedDonation.donor.avatar.startsWith("/")
                        ? `http://localhost:5000${selectedDonation.donor.avatar}`
                        : selectedDonation.donor.avatar
                      : "https://ui-avatars.com/api/?name=User"
                  }
                  alt="avatar"
                  className="w-12 h-12 rounded-full object-cover cursor-pointer hover:scale-105 transition"
                  onClick={() => setSelectedUser(selectedDonation.donor)}
                />
                <div>
                  <p className="font-semibold text-gray-800">
                    <button
                      onClick={() => setSelectedUser(selectedDonation.donor)}
                      className="font-semibold text-gray-800 hover:text-emerald-600 transition"
                    >
                      {selectedDonation.donor?.username || "Unknown"}
                    </button>
                  </p>
                  <div className="text-sm text-yellow-500">
                    ⭐ {selectedDonation.rating ?? "-"}
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-gray-50 p-4 space-y-3 text-sm text-gray-700">
                <div>📍 {selectedDonation.pickupLocation || "-"}</div>
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

              <div
                className={`mt-4 rounded-2xl p-4 text-sm font-medium border ${selectedDonation.status === "completed"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : selectedDonation.receiverConfirmed
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-amber-50 border-amber-200 text-amber-700"
                  }`}
              >
                {selectedDonation.status === "completed"
                  ? "✅ Donation completed successfully"
                  : selectedDonation.receiverConfirmed
                    ? "🔵 Waiting for donor confirmation"
                    : "⏳ Awaiting pickup confirmation"}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setSelectedDonation(null)}
                  className="flex-1 border border-gray-300 py-3 rounded-2xl text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => navigate("/chat", { state: { donation: selectedDonation } })}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-2xl hover:bg-emerald-700"
                >
                  {selectedDonation.status === "completed" ? "View Chat" : "Open Chat"}
                </button>
              </div>
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