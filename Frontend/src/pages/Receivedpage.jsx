import React, { useState } from "react";
import { useDonations } from "../context/DonationContext";
import toast from "react-hot-toast";

export default function ReceivedPage() {
  const [tab, setTab] = useState("Pending");

  const { donations, completeDonation } = useDonations();

  const receivedList = donations.filter(
    (d) => d.claimedBy === "user123"
  );

  const counts = {
    Pending: receivedList.filter((d) => d.status === "claimed").length,
    Completed: receivedList.filter((d) => d.status === "completed").length,
  };

  const filtered = receivedList.filter((d) =>
    tab === "Pending"
      ? d.status === "claimed"
      : d.status === "completed"
  );

  const loading = false;

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
              <p className="mt-2 text-3xl font-bold text-gray-900">{counts.Pending}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <img src="/src/assets/imgfoodwaste/clock.png" alt="time" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Completed</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{counts.Completed}</p>
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
              className={`flex-1 min-w-[160px] text-center text-sm font-medium py-2 rounded-full transition ${
                tab === t ? "bg-white shadow-sm text-gray-900" : "text-gray-600"
              }`}
            >
              {t} ({counts[t]})
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <p className="text-center text-gray-500 mt-10">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">
            {tab === "Pending"
              ? "No pending donations"
              : "No completed donations yet"}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            {filtered.map((item) => (
              <div
                key={item._id || item.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
              >
                {/* IMAGE + BADGES */}
                <div className="relative h-44 w-full">
                  <img
                    src={item.images?.[0] || item.image || "/placeholder.jpg"}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />

                  <span className="absolute left-3 top-3 rounded-md bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
                    {item.category || "Food Sharing"}
                  </span>

                  <span
                    className={`absolute right-3 top-3 rounded-md px-2 py-1 text-xs font-medium ${
                      item.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {item.status || "Pending"}
                  </span>
                </div>

                {/* CONTENT */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.title || "Untitled"}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {item.description || "-"}
                  </p>

                  <div className="mt-3 text-sm text-gray-700 space-y-1">
                    <div>📦 {item.quantity || "-"}</div>
                    <div>📍 {item.address || "-"}</div>
                    <div>🗓️ Exp: {item.expDate || "-"}</div>
                  </div>

                  {/* BUTTONS */}
                  <div className="mt-4 flex gap-3">
                    <button className="w-1/2 px-4 py-2 rounded-xl border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
                      View Details
                    </button>

                    {item.status === "claimed" && (
                      <button
                        onClick={() => {
                          completeDonation(item.id);
                          toast.success("Donation completed 🎉");
                        }}
                        className="w-1/2 bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition"
                      >
                        Complete
                      </button>
                    )}
                  </div>

                  {/* COMPLETED TEXT */}
                  {item.status === "completed" && (
                    <span className="block mt-3 text-green-600 text-sm font-medium">
                      ✅ Completed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}