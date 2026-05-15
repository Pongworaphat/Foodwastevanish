import React, { useState } from "react";
import { useDonations } from "../context/DonationContext";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";


export default function BrowsePage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All Donations");
  const [search, setSearch] = useState("");

  const [selectedDonation, setSelectedDonation] = useState(null);

  const location = useLocation();

  const { donations, claimDonation } = useDonations();

  const filteredDonations = donations.filter((donation) => {
    const matchCategory =
      activeCategory === "All Donations" ||
      donation.category === activeCategory;

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
    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const categories = [
    "All Donations",
    "Food Sharing",
    "Animal Food",
    "Organic Waste",
  ];

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
                ? donations.length
                : donations.filter((d) => d.category === cat).length}
              )
            </button>
          ))}
        </div>

        {/* Donation Grid */}
        {filteredDonations.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">

            <div className="mb-4 text-6xl">
              🍱
            </div>

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
              const id = donation.id;
              const img =
                donation.images?.[0] || donation.image
              donation.image ||
                "/placeholder.jpg";

              return (
                <div
                  key={id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm  transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-48 w-full">
                    <img
                      src={img}
                      alt={donation.title}
                      className="h-full w-full object-cover"
                    />

                    <span className="absolute right-3 top-3 rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      {donation.status || "available"}
                    </span>

                    <span className="absolute left-3 top-3 rounded-md bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
                      {donation.category}
                    </span>
                  </div>

                  {/* card */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {donation.title}
                    </h3>

                    <div className="mt-3 flex items-center gap-3">

                      <img
                        src={
                          donation.donorAvatar ||
                          "https://ui-avatars.com/api/?name=User"
                        }
                        alt={donation.donorName}
                        className="h-10 w-10 rounded-full object-cover"
                      />

                      <div>
                        <div className="font-medium text-gray-800">
                          {donation.donorName || "Anonymous"}
                        </div>

                        <div className="text-xs text-gray-500">
                          ⭐ {donation.rating ?? "-"}
                        </div>
                      </div>

                    </div>

                    <div className="mt-3 space-y-2 text-sm text-gray-600">
                      <p>📍 {donation.address || "-"}</p>
                      <p>📦 {donation.quantity || "-"}</p>
                      <p>🗓️ Exp: {formatDateTH(donation.expDate)}</p>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setSelectedDonation(donation)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL */}
        {selectedDonation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-lg w-[380px] md:w-[440px] max-h-[90vh] overflow-y-auto relative">
              <img
                src={
                  selectedDonation.images?.[0] ||
                  selectedDonation.image ||
                  "/placeholder.jpg"
                }
                alt={selectedDonation.title}
                className="w-full h-48 object-cover rounded-t-2xl"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                {selectedDonation.available && (
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
                        selectedDonation.donorAvatar ||
                        "https://ui-avatars.com/api/?name=User"
                      }
                      alt={selectedDonation.donorName}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-800">{selectedDonation.donorName}</div>
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
                  Donation Details
                </h3>

                <div className="rounded-2xl bg-gray-50 p-4 space-y-3 text-sm text-gray-600 mb-4">

                  <div>
                    📍 {selectedDonation.address}
                  </div>

                  <div>
                    📦 {selectedDonation.quantity}
                  </div>

                  <div>
                    🗓️ Exp: {formatDateTH(selectedDonation.expDate)}
                  </div>

                  <div>
                    📅 Prod: {formatDateTH(selectedDonation.productionDate)}
                  </div>

                  <div>
                    ⏰ Pickup: {selectedDonation.timeStart || "-"}
                  </div>

                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setSelectedDonation(null)}
                    className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      claimDonation(selectedDonation.id, "user123");

                      navigate("/chat", {
                        state: {
                          donation: selectedDonation,
                          chatId: selectedDonation.id
                        }
                      });

                      setSelectedDonation(null);
                    }}
                    className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Claim Donation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}