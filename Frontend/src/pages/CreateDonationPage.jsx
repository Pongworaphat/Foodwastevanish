import React, { useState, useEffect } from "react";
import Cropper from "react-easy-crop";
import toast from "react-hot-toast";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useMapEvents } from "react-leaflet";
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

function DonationLocationMarker({
  donationLat,
  donationLng,
  setDonationLat,
  setDonationLng,
}) {
  useMapEvents({
    click(e) {
      setDonationLat(e.latlng.lat);
      setDonationLng(e.latlng.lng);
    },
  });

  return donationLat && donationLng ? (
    <Marker position={[donationLat, donationLng]}>
      <Popup>Pickup Location</Popup>
    </Marker>
  ) : null;
}

export default function CreateDonationPage() {
  const [selectedCategory, setSelectedCategory] = useState("Food Sharing");
  const [form, setForm] = useState({
    title: "",
    description: "",
    foodType: "",
    quantity: "",
    productionDate: "",
    expDate: "",
    pickupTime: "",
    pickupEndTime: "",
    images: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [previewImages, setPreviewImages] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileLocation, setProfileLocation] = useState("");

  const [donationLocation, setDonationLocation] = useState("");
  const [donationLat, setDonationLat] = useState(null);
  const [donationLng, setDonationLng] = useState(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [finalImage, setFinalImage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch("http://localhost:5000/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (res.ok) {
          setProfileData(data.user);
          const location = data.user.locationNote || "Pickup location not set";
          setProfileLocation("");
          setDonationLocation("");
          setDonationLat(data.user.latitude);
          setDonationLng(data.user.longitude);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const categories = [
    {
      name: "Food Sharing",
      desc: "Share surplus food with people in need",
      color: "emerald",
    },
    {
      name: "Animal Food",
      desc: "Donate food for stray animals",
      color: "amber",
    },
    {
      name: "Organic Waste",
      desc: "Share food waste for composting",
      color: "lime",
    },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || e.dataTransfer.files);
    if (!files.length) return;

    setForm({ ...form, images: files });
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
    setShowPreview(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    if (finalImage) {
      formData.append("image", finalImage);
    } else if (form.images[0]) {
      formData.append("image", form.images[0]);
    }

    try {
      setSubmitting(true);
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("quantity", form.quantity);
      formData.append("category", selectedCategory);
      formData.append("foodType", form.foodType);
      formData.append("pickupLocation", donationLocation);
      formData.append("latitude", donationLat);
      formData.append("longitude", donationLng);
      formData.append("productionDate", form.productionDate);
      formData.append("expDate", form.expDate);
      formData.append("pickupTime", form.pickupTime);
      formData.append("pickupEndTime", form.pickupEndTime);

      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:5000/api/donations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Create failed");

      toast.success("Donation created successfully 🎉");
      window.location.href = "/browse";
    } catch (err) {
      console.error(err);
      toast.error("Create donation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, croppedAreaPixels) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const file = new File([blob], "cropped.jpg", { type: "image/jpeg" });
        resolve(file);
      }, "image/jpeg");
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans text-slate-800 py-12 px-4 flex justify-center">
      <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header Section */}
        <div className="text-center sm:text-left pb-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl drop-shadow-sm">
            Create{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
              Donation
            </span>
          </h1>
          <p className="mt-3 text-base text-slate-500 max-w-2xl">
            Help reduce food waste and share your surplus with the community. Every contribution makes a difference.
          </p>
        </div>

        {/* Category Selection */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/60 p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Select Category</h2>
              <p className="text-sm text-slate-500 mt-1">Choose the type of donation you want to create</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`group border text-left p-6 rounded-2xl transition-all duration-300 relative overflow-hidden ${selectedCategory === cat.name
                  ? cat.color === "emerald"
                    ? "border-emerald-500 bg-emerald-50/50 text-emerald-900 shadow-md shadow-emerald-500/10 -translate-y-1 ring-1 ring-emerald-500"
                    : cat.color === "amber"
                      ? "border-amber-500 bg-amber-50/50 text-amber-900 shadow-md shadow-amber-500/10 -translate-y-1 ring-1 ring-amber-500"
                      : "border-lime-500 bg-lime-50/50 text-lime-900 shadow-md shadow-lime-500/10 -translate-y-1 ring-1 ring-lime-500"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm hover:-translate-y-0.5"
                  }`}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-10 rounded-bl-full -mr-4 -mt-4 transition-all duration-300 group-hover:scale-110 ${cat.color === 'emerald' ? 'from-emerald-400 to-teal-500' :
                  cat.color === 'amber' ? 'from-amber-400 to-orange-500' : 'from-lime-400 to-green-500'
                  }`} />
                <h3 className="font-bold text-lg tracking-tight mb-2 relative z-10">{cat.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed relative z-10">{cat.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Donation Main Details Form */}
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/60 p-6 sm:p-8 space-y-10">

          {/* Section 1: Details */}
          <div>
            <div className="mb-6 pb-2 border-b border-slate-100 flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Donation Details</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 ml-1">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., Fresh Bread and Pastries"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 bg-white shadow-sm outline-none transition duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 hover:border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 ml-1">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Provide details about the food, its condition, and any special notes"
                  rows="4"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 bg-white shadow-sm outline-none transition duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 hover:border-slate-300 resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 ml-1">Food Type</label>
                  <div className="relative">
                    <select
                      name="foodType"
                      value={form.foodType}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800 bg-white shadow-sm outline-none transition duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 hover:border-slate-300 appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Select food type</option>

                      <optgroup label="Human Food">
                        <option value="Cooked Food">Cooked Food</option>
                        <option value="Bakery">Bakery</option>
                        <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                        <option value="Meat & Seafood">Meat & Seafood</option>
                        <option value="Dairy & Eggs">Dairy & Eggs</option>
                        <option value="Beverages">Beverages</option>
                        <option value="Snacks & Grains">Snacks & Grains</option>
                      </optgroup>

                      <optgroup label="Animal Food">
                        <option value="Dry Pet Food">Dry Pet Food</option>
                        <option value="Wet Pet Food">Wet Pet Food</option>
                        <option value="Fish Feed">Fish Feed</option>
                        <option value="Pet Treats">Pet Treats</option>
                      </optgroup>

                      <optgroup label="Organic Waste & Scraps">
                        <option value="Kitchen Scraps">Kitchen Scraps</option>
                        <option value="Coffee Grounds">Coffee Grounds</option>
                        <option value="Used Cooking Oil">Used Cooking Oil</option>
                        <option value="Compost Material">Compost Material</option>
                      </optgroup>

                      <optgroup label="Other">
                        <option value="Other">Other</option>
                      </optgroup>
                    </select>
                    <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-xs text-slate-400">▼</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 ml-1">
                    Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    placeholder="e.g., 20 pieces, 5kg"
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 bg-white shadow-sm outline-none transition duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 hover:border-slate-300"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 ml-1">Production Date</label>
                  <input
                    type="date"
                    name="productionDate"
                    value={form.productionDate}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800 bg-white shadow-sm outline-none transition duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 hover:border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 ml-1">Expiration Date</label>
                  <input
                    type="date"
                    name="expDate"
                    value={form.expDate}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-rose-500 font-bold bg-white shadow-sm outline-none transition duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 hover:border-slate-300"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 ml-1">Upload Images</label>
                <div
                  className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 group ${isDragging ? "border-emerald-500 bg-emerald-50/80 shadow-inner" : "border-slate-300 bg-slate-50/50 hover:border-emerald-400 hover:bg-slate-50"
                    }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleImageChange({ target: { files: e.dataTransfer.files } });
                    }
                  }}
                >
                  <input
                    type="file"
                    multiple
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    id="image-upload"
                    key={previewImages.length}
                    title=" "
                  />

                  {!finalImage && !previewImages[0] && (
                    <div className="flex flex-col items-center justify-center pointer-events-none">
                      <div className="w-16 h-16 mb-4 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:border-emerald-100">
                        <span className="text-3xl">📸</span>
                      </div>
                      <span className="text-sm font-bold text-slate-700">Click to upload or drag and drop</span>
                      <span className="text-xs text-slate-500 mt-1.5">Supports high-res PNG, JPG</span>
                    </div>
                  )}

                  {(finalImage || previewImages[0]) && (
                    <div className="flex justify-center relative z-20 pointer-events-auto">
                      <div className="relative group/img w-72 rounded-2xl border border-slate-200 shadow-md overflow-hidden">
                        <img
                          src={finalImage ? URL.createObjectURL(finalImage) : previewImages[0]}
                          alt="preview"
                          className="w-full h-64 object-cover transform transition-transform duration-500 ease-out hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 rounded-2xl transition-all duration-200 backdrop-blur-[2px] pointer-events-none" />
                        <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm pointer-events-none">Ready to upload</div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setFinalImage(null);
                            setPreviewImages([]);
                            setForm((prev) => ({ ...prev, images: [] }));
                            document.getElementById("image-upload").value = "";
                          }}
                          className="absolute bottom-4 right-4 bg-white/95 text-rose-600 px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-rose-500 hover:text-white transition-all duration-200 opacity-0 group-hover/img:opacity-100 transform translate-y-2 group-hover/img:translate-y-0 z-30"
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Pickup Information */}
          <div className="pt-2">
            <div className="mb-6 pb-2 border-b border-slate-100 flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Pickup Information</h2>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 p-6 shadow-sm">
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2 ml-1">
                  Selected Pickup Point<span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={donationLocation}
                      onChange={(e) => setDonationLocation(e.target.value)}
                      placeholder="Enter pickup location (e.g., Canteen, Building A)"
                      required
                      className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 bg-white shadow-sm outline-none transition duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 hover:border-slate-300"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMap(true)}
                    className="inline-flex items-center justify-center gap-2 text-emerald-700 text-sm font-bold hover:text-emerald-800 bg-white px-5 py-3.5 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all active:scale-95 whitespace-nowrap"
                  >
                    📍 View on Map
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 ml-1">Pickup Time Start</label>
                  <input
                    type="time"
                    name="pickupTime"
                    value={form.pickupTime}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800 bg-white shadow-sm outline-none transition duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 hover:border-slate-300"
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 ml-1">Pickup Time End</label>
                  <input
                    type="time"
                    name="pickupEndTime"
                    value={form.pickupEndTime}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800 bg-white shadow-sm outline-none transition duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 hover:border-slate-300"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-8 border-t border-slate-100">
            <button
              type="button"
              onClick={() => (window.location.href = "/")}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all active:scale-95 ${submitting
                ? "bg-slate-400 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/30 hover:shadow-emerald-500/50"
                }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Create Donation"
              )}
            </button>
          </div>
        </form>

        {/* Cropper Modal Backdrop Overlay */}
        {showPreview && previewImages[0] && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-7 max-w-md w-full border border-slate-100 shadow-2xl scale-100">
              <h2 className="text-xl font-bold text-slate-900 mb-5">Crop Image</h2>
              <div className="relative w-full h-72 bg-slate-950 rounded-2xl overflow-hidden shadow-inner ring-1 ring-slate-900/5">
                <Cropper
                  image={previewImages[0]}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
                  objectFit="cover"
                />
              </div>

              {/* Slider Controller */}
              <div className="mt-6 flex items-center gap-4 px-2">
                <span className="text-slate-400 font-bold text-xl">-</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <span className="text-slate-400 font-bold text-xl">+</span>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => {
                    setShowPreview(false);
                    setPreviewImages([]);
                    setForm((prev) => ({ ...prev, images: [] }));
                  }}
                  className="w-1/3 bg-slate-100 text-slate-600 text-sm font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!croppedAreaPixels) return;
                    const cropped = await getCroppedImg(previewImages[0], croppedAreaPixels);
                    setFinalImage(cropped);
                    setShowPreview(false);
                  }}
                  className="w-2/3 bg-emerald-600 text-white text-sm font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition-colors active:scale-95"
                >
                  Confirm Crop
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Map Modal */}
        {showMap && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl">
              <div className="flex items-center justify-between mb-5 px-1">
                <h3 className="font-bold text-xl text-slate-900">Pickup Location Map</h3>
                <button
                  onClick={() => setShowMap(false)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                <MapContainer
                  center={[profileData?.latitude || 13.1205, profileData?.longitude || 100.9188]}
                  zoom={16}
                  style={{ height: "450px", width: "100%", zIndex: 0 }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <DonationLocationMarker
                    donationLat={donationLat}
                    donationLng={donationLng}
                    setDonationLat={setDonationLat}
                    setDonationLng={setDonationLng}
                  />
                </MapContainer>

                <div className="mt-4 flex justify-end gap-3 p-2">
                  <button onClick={() => setShowMap(false)} className="px-5 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowMap(false);
                      toast.success("Location updated");
                    }}
                    className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-emerald-700 transition-colors"
                  >
                    Save Location
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