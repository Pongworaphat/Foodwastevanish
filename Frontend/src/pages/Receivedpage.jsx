import React, { useEffect, useState } from "react";

export default function ReceivedPage() {
  const [tab, setTab] = useState("Pending");
  const [receivedList, setReceivedList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchReceived() {
      setLoading(true);
      try {
        const res = await fetch("/api/received");

        const contentType = res.headers.get("content-type") || "";
        if (res.ok && contentType.includes("application/json")) {
          const data = await res.json();
          if (mounted) setReceivedList(Array.isArray(data) ? data : []);
        } else if (res.ok && !contentType.includes("application/json")) {

          console.warn("Received non-json response for /api/received");
          if (mounted) setReceivedList([]);
        } else {
          
          const text = await res.text().catch(() => "");
          console.warn("API returned error for /api/received:", res.status, text);
          if (mounted) setReceivedList([]);
        }
      } catch (err) {
        
        console.error("Fetch /api/received failed:", err);
        if (mounted) setReceivedList([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchReceived();
    return () => {
      mounted = false;
    };
  }, []);

  const counts = {
    Pending: receivedList.filter((item) => item.status === "Pending").length,
    Completed: receivedList.filter((item) => item.status === "Completed").length,
  };

  const filtered = receivedList.filter((item) => item.status === tab);

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

        {/* List area */}
        {loading ? (
          <p className="text-center text-gray-500 mt-10">Loading...</p>
        ) : filtered.length === 0 ? (
          // แสดงข้อความ custom ตามแท็บ แทนข้อความ error หรือ raw HTML
          <p className="text-center text-gray-500 mt-10">
            {tab === "Pending" ? "No pending donations" : "No completed donations yet"}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            {filtered.map((item) => (
              <div
                key={item._id || item.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
              >
                <div className="relative h-44 w-full">
                  <img
                    src={item.images?.[0] || item.image || "/placeholder.jpg"}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 rounded-md bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
                    {item.category || "Food Sharing"}
                  </span>
                  <span className="absolute right-3 top-3 rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    {item.status || "Pending"}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900">{item.title || "Untitled"}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description || "-"}</p>

                  <div className="mt-3 text-sm text-gray-700 space-y-1">
                    <div>📦 {item.quantity || "-"}</div>
                    <div>📍 {item.address || "-"}</div>
                    <div>🗓️ Exp: {item.expDate || "-"}</div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button className="px-4 py-2 rounded-xl border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
