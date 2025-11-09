import React, { useState } from "react";

export default function CreateDonationPage() {
  const [selectedCategory, setSelectedCategory] = useState("Food Sharing");
  const [form, setForm] = useState({
    title: "",
    description: "",
    foodType: "",
    quantity: "",
    prodDate: "",
    expDate: "",
    address: "",
    timeStart: "",
    timeEnd: "",
    images: [],
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    {
      name: "Food Sharing",
      desc: "Share surplus food with people in need",
    },
    {
      name: "Animal Food",
      desc: "Donate food for stray animals",
    },
    {
      name: "Organic Waste",
      desc: "Share food waste for composting",
    },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setForm({ ...form, images: Array.from(e.target.files) });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("category", selectedCategory);
      Object.entries(form).forEach(([k, v]) => {
        if (k !== "images") fd.append(k, v ?? "");
      });
      (form.images || []).forEach((file) => fd.append("images", file));

      const res = await fetch("/api/donations", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Failed to create donation");

      alert("Donation created successfully!");
      window.location.href = "/my-donations";
    } catch (err) {
      alert("❌ Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 py-10 px-4 flex justify-center">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="bg-emerald-100 text-center rounded-2xl py-6">
          <h1 className="text-3xl font-bold text-gray-900">Create Donation</h1>
          <p className="text-gray-700 mt-1">
            Share your food with the community
          </p>
        </div>

        {/* Category Selection */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Select Category
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Choose the type of donation you want to create
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`border rounded-2xl p-4 text-left transition ${
                  selectedCategory === cat.name
                    ? "border-2 border-emerald-600 bg-emerald-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <h3
                  className={`font-semibold text-lg ${
                    selectedCategory === cat.name
                      ? "text-emerald-700"
                      : "text-gray-800"
                  }`}
                >
                  {cat.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{cat.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Donation Details */}
        <form
          onSubmit={onSubmit}
          className="bg-white rounded-2xl shadow-md p-6 space-y-6"
        >
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Donation Details
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Provide information about your donation
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., Fresh Bread and Pastries"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Provide details about the food, its condition, and any special notes"
                  rows="3"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Food Type
                  </label>
                  <select
                    name="foodType"
                    value={form.foodType}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                  >
                    <option value="">Select food type</option>
                    <option value="Cooked Food">Cooked Food</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Dry Food">Dry Food</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    placeholder="e.g., 20 pieces, 5kg"
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Production Date
                  </label>
                  <input
                    type="date"
                    name="prodDate"
                    value={form.prodDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    name="expDate"
                    value={form.expDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Images
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500 hover:border-emerald-300 transition">
                  <input
                    type="file"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    Click to upload or drag and drop <br />
                    <span className="text-xs text-gray-400">
                      PNG, JPG up to 10MB
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Pickup Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Pickup Information
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Where and when can recipients collect the donation
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter pickup location"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                />
                <p className="text-xs text-gray-400 mt-1">
                  In a real implementation, this would use GPS/Maps to select
                  location
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Time Start
                  </label>
                  <input
                    type="time"
                    name="timeStart"
                    value={form.timeStart}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Time End
                  </label>
                  <input
                    type="time"
                    name="timeEnd"
                    value={form.timeEnd}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => (window.location.href = "/")}
              className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2 rounded-xl text-white font-semibold ${
                submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {submitting ? "Submitting..." : "Create Donation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
