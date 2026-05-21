import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDonations } from "../context/DonationContext";
import toast from "react-hot-toast";
import Swal from "sweetalert2";


export default function MydonationsPage() {

  const [tab, setTab] = useState("available");
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [loading] = useState(false);


  const navigate = useNavigate();

  const { donations, deleteDonation } = useDonations();

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const myDonations = donations.filter(
    (d) => d.userId === currentUser?._id
  );

  const formatDateTH = (date) => {
    if (!date) return "-";

    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  };


  const counts = {
    available: myDonations.filter((d) => d.status === "available").length,
    claimed: myDonations.filter((d) => d.status === "claimed").length,
    completed: myDonations.filter((d) => d.status === "completed").length,
  };

  // filter ตาม tab
  const filtered = myDonations.filter(
    (d) => d.status === tab
  );


  const getImage = (d) => {
    if (d.images && d.images.length > 0) return d.images[0];
    if (d.image) return d.image;
    return "/placeholder.jpg";
  };


  const getAvatar = (d) =>
    d.donorAvatar || "/src/assets/avatars/default-avatar.jpg";

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

  return (
    <div className="min-h-screen bg-emerald-50">
      <div className="mx-auto max-w-7xl px-4 py-8">

        {/* ================= HEADER ================= */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">
            My Donations
          </h1>

          <p className="text-gray-600">
            Manage your food donations
          </p>
        </div>

        {/* ================= STATS ================= */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8">

          {/* Active */}
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Active Donations
              </h3>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {counts.available}
              </p>
            </div>

            <img
              src="/src/assets/imgfoodwaste/box.png"
              alt="box"
              className="w-10 h-10 object-contain"
            />
          </div>

          {/* Claimed */}
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                In Progress
              </h3>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {counts.claimed}
              </p>
            </div>

            <img
              src="/src/assets/imgfoodwaste/trend.png"
              alt="trend"
              className="w-10 h-10 object-contain"
            />
          </div>

          {/* Completed */}
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Completed
              </h3>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {counts.completed}
              </p>
            </div>

            <img
              src="/src/assets/imgfoodwaste/checked.png"
              alt="checked"
              className="w-10 h-10 object-contain"
            />
          </div>

        </div>

        {/* ================= TABS ================= */}
        <div className="mb-6 flex gap-3 overflow-x-auto rounded-full bg-gray-200 p-1">

          {["available", "claimed", "completed"].map((t) => (

            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 min-w-[160px] text-center text-sm font-medium py-2 rounded-full transition
              ${tab === t
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-600"
                }`}
            >

              {t === "available"
                ? "Active"
                : t === "claimed"
                  ? "In Progress"
                  : "Completed"} ({counts[t]})

            </button>

          ))}

        </div>

        {/* ================= LIST ================= */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">

          {loading ? (

            <div className="text-center py-12 text-gray-500">
              Loading...
            </div>

          ) : filtered.length === 0 ? (

            <div className="flex flex-col items-center justify-center py-20 text-center col-span-full">

              <div className="mb-4 text-6xl">
                📦
              </div>

              <h2 className="mb-2 text-2xl font-bold text-gray-800">
                No donations yet
              </h2>

              <p className="mb-6 text-gray-500">
                Start sharing food with your community
              </p>

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

                <div
                  key={id}
                  className="mb-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >

                  {/* ================= IMAGE ================= */}
                  <div className="relative h-48 w-full">

                    <img
                      src={getImage(d)}
                      alt={d.title}
                      className="h-full w-full object-cover"
                    />

                    {/* category */}
                    <div
                      className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium ${getCategoryStyle(
                        d.category
                      )}`}
                    >
                      {d.category || "Category"}
                    </div>

                    {/* status */}
                    <div
                      className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-medium ${d.status === "available"
                        ? "bg-emerald-100 text-emerald-800"
                        : d.status === "claimed"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-200 text-gray-700"
                        }`}
                    >
                      {d.status}
                    </div>

                  </div>

                  {/* ================= CONTENT ================= */}
                  <div className="p-5">

                    {/* title */}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {d.title || "Untitled"}
                    </h3>

                    {/* donor */}
                    <div className="mt-3 flex items-center gap-3 text-sm text-gray-700">

                      <img
                        src={getAvatar(d)}
                        alt={d.donorName}
                        className="h-8 w-8 rounded-full object-cover"
                      />

                      <div className="flex-1">

                        <div className="text-sm font-medium text-gray-800">
                          {d.donorName || "You"}
                        </div>

                        <div className="mt-0.5 text-xs text-gray-500">
                          ⭐ {d.rating ?? "-"}
                        </div>

                      </div>

                      {/* verified */}
                      {d.verified && (
                        <div className="ml-2 rounded-md border px-2 py-1 text-xs font-medium text-gray-600">
                          Verified
                        </div>
                      )}

                    </div>

                    {/* quantity + address */}
                    <div className="mt-3 text-sm text-gray-600 space-y-1">

                      <div>
                        📍 {d.address}
                      </div>

                      <div>
                        📦 {d.quantity}
                      </div>

                      <div>
                        🗓️ Exp: {formatDateTH(d.expDate)}
                      </div>

                      <div>
                        📅 Prod: {formatDateTH(d.productionDate)}
                      </div>

                      <div>
                        ⏰ Pickup: {d.timeStart || "-"}
                      </div>

                    </div>

                    {/* buttons */}
                    <div className="mt-4 flex gap-2">

                      {/* view details */}
                      <button
                        onClick={() => setSelectedDonation(d)}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                      >
                        View Details
                      </button>

                      {/* edit */}
                      <button
                        onClick={() => navigate(`/edit-donation/${id}`)}
                        className="w-full rounded-xl bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-200 transition"
                      >
                        Edit
                      </button>

                      {/* delete */}
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
                            borderRadius: "20px",
                          }).then((result) => {

                            if (result.isConfirmed) {

                              deleteDonation(id);

                              toast.success("Donation deleted 🗑️");

                            }

                          });

                        }}

                        className="w-full rounded-xl bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 transition"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </div>

              );
            })

          )}

        </div>

      </div>

      {/* ================= MODAL ================= */}
      {selectedDonation && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

          <div className="bg-white rounded-2xl shadow-lg w-[380px] md:w-[440px] max-h-[90vh] overflow-y-auto relative pb-5">

            {/* image */}
            <img
              src={getImage(selectedDonation)}
              alt={selectedDonation.title}
              className="w-full h-48 object-cover rounded-t-2xl"
            />

            {/* badges */}
            <div className="absolute top-4 right-4 flex gap-2">

              {/* status */}
              <div
                className={`rounded-full px-3 py-1 text-xs font-medium ${selectedDonation.status === "available"
                  ? "bg-emerald-100 text-emerald-800"
                  : selectedDonation.status === "claimed"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-200 text-gray-700"
                  }`}
              >
                {selectedDonation.status}
              </div>

              {/* category */}
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getCategoryStyle(
                  selectedDonation.category
                )}`}
              >
                {selectedDonation.category}
              </span>

            </div>

            {/* content */}
            <div className="p-5">

              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                {selectedDonation.title}
              </h2>

              <p className="text-sm text-gray-600 mb-4">
                {selectedDonation.description}
              </p>

              {/* donor card */}
              <div className="rounded-2xl bg-gray-50 p-4 mb-4">

                <div className="flex items-center gap-3">

                  <img
                    src={getAvatar(selectedDonation)}
                    alt={selectedDonation.donorName}
                    className="h-10 w-10 rounded-full object-cover"
                  />

                  <div className="flex-1">

                    <div className="font-medium text-gray-800">
                      {selectedDonation.donorName}
                    </div>

                    <div className="text-xs text-gray-500 mt-1">
                      ⭐ {selectedDonation.rating ?? "-"}
                    </div>

                  </div>

                  {/* verified */}
                  {selectedDonation.verified && (
                    <div className="rounded-md border px-2 py-1 text-xs font-medium text-gray-600">
                      Verified
                    </div>
                  )}

                </div>

              </div>

              {/* details */}
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
                  🗓️ Exp: {selectedDonation.expDate || "-"}
                </div>

                <div>
                  📅 Production Date: {selectedDonation.productionDate}
                </div>

                <div>
                  ⏰ Pickup: {selectedDonation.timeStart || "-"}
                </div>

              </div>

              {/* buttons */}
              <div className="flex justify-end gap-3">

                <button
                  onClick={() => setSelectedDonation(null)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    navigate("/chat", {
                      state: {
                        donation: selectedDonation
                      }
                    });
                  }}
                  className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Continue Chat
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}