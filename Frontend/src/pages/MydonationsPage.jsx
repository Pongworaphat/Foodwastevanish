import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MydonationsPage() {
  const [tab, setTab] = useState("Active");
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [myDonations, setMyDonations] = useState([]); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // fetch data from backend
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/my-donations"); 
        if (!res.ok) throw new Error("Failed to fetch donations");
        const data = await res.json();
        if (mounted) setMyDonations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading my donations:", err);
        if (mounted) setMyDonations([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  const counts = {
    Active: myDonations.filter((d) => (d.status || "Active") === "Active").length,
    "In Progress": myDonations.filter((d) => d.status === "In Progress").length,
    Completed: myDonations.filter((d) => d.status === "Completed").length,
  };

  const filtered = myDonations.filter((d) => {
    if (tab === "Active") return (d.status || "Active") === "Active";
    if (tab === "In Progress") return d.status === "In Progress";
    return d.status === "Completed";
  });

  
  const getImage = (d) => {
    if (d.images && d.images.length > 0) return d.images[0];
    if (d.image) return d.image;
    return "/placeholder.jpg";
  };
  const getAvatar = (d) => d.donorAvatar || "/src/assets/avatars/default-avatar.jpg";

  return (
    <div className="min-h-screen bg-emerald-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">My Donations</h1>
          <p className="text-gray-600">Manage your food donations</p>
        </div>

        {/* Summary boxes */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Active Donations</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{counts.Active}</p>
            </div>
            <img src="/src/assets/imgfoodwaste/box.png" alt="box" className="w-10 h-10 object-contain" />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{counts["In Progress"]}</p>
            </div>
            <img src="/src/assets/imgfoodwaste/trend.png" alt="trend" className="w-10 h-10 object-contain" />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Completed</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{counts.Completed}</p>
            </div>
            <img src="/src/assets/imgfoodwaste/checked.png" alt="checked" className="w-10 h-10 object-contain" />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-3 overflow-x-auto rounded-full bg-gray-200 p-1">
          {["Active", "In Progress", "Completed"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 min-w-[160px] text-center text-sm font-medium py-2 rounded-full transition
              ${tab === t ? "bg-white shadow-sm text-gray-900" : "text-gray-600"}`}
            >
              {t} ({counts[t]})
            </button>
          ))}
        </div>

        {/* List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No {tab} donations.</div>
            ) : (
              filtered.map((d) => {
                const id = d._id || d.id;
                return (
                  <div
                    key={id}
                    className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                  >
                    <div className="relative h-48 w-full">
                      <img src={getImage(d)} alt={d.title} className="h-full w-full object-cover" />
                      <div className="absolute left-3 top-3 rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700">
                        {d.category || "Category"}
                      </div>
                      {d.available && (
                        <div className="absolute right-3 top-3 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                          available
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-900">{d.title || "Untitled"}</h3>
                      <div className="mt-3 flex items-center gap-3 text-sm text-gray-700">
                        <img
                          src={getAvatar(d)}
                          alt={d.donorName}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800">{d.donorName || "You"}</div>
                          <div className="mt-0.5 text-xs text-gray-500">⭐ {d.rating ?? "-"}</div>
                        </div>
                        {d.verified && (
                          <div className="ml-2 rounded-md border px-2 py-1 text-xs font-medium text-gray-600">
                            Verified
                          </div>
                        )}
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={() => setSelectedDonation(d)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Popup */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-lg w-[360px] md:w-[400px] max-h-[90vh] overflow-y-auto relative">
            <img
              src={getImage(selectedDonation)}
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
              <p className="text-sm text-gray-600 mb-4">{selectedDonation.description}</p>

              <div className="border rounded-lg p-3 mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={getAvatar(selectedDonation)}
                    alt={selectedDonation.donorName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium text-gray-800">{selectedDonation.donorName}</div>
                    <div className="text-xs text-gray-500">
                      ⭐ {selectedDonation.rating ?? "-"} rating • {selectedDonation.donationsMade ?? 0} donations made
                    </div>
                  </div>
                  {selectedDonation.verified && (
                    <div className="ml-auto rounded-md border px-2 py-1 text-xs font-medium text-gray-600">
                      Verified
                    </div>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-3 space-y-2 text-sm text-gray-600 mb-4">
                <div>Quantity & Type: {selectedDonation.quantity}</div>
                <div>Production Date: {selectedDonation.productionDate}</div>
                <div>Expiration Date: {selectedDonation.expirationDate}</div>
                <div>Pickup Location: {selectedDonation.address}</div>
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
                    navigate("/chat", { state: { donation: selectedDonation } });
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
  );
}
