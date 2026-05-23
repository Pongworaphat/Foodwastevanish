import React, { useState } from "react";
import Cropper from "react-easy-crop";
import toast from "react-hot-toast";

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

  const [previewImages, setPreviewImages] = useState([]);
  const [showPreview, setShowPreview] = useState(false);


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
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setForm({ ...form, images: files });

    const previews = files.map((file) => URL.createObjectURL(file));

    setPreviewImages(previews);
    setShowPreview(true);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!finalImage && !previewImages[0]) {
      alert("กรุณาใส่รูปก่อน");
      return;
    }

    try {


      setSubmitting(true);

      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("quantity", form.quantity);

      formData.append("category", selectedCategory);

      formData.append("pickupLocation", form.address);

      formData.append("pickupTime", form.timeStart);

      formData.append("expDate", form.expDate);

      if (form.images[0]) {
        formData.append("image", form.images[0]);
      }

      const token = localStorage.getItem("authToken");
      console.log(token);

      const res = await fetch(
        "http://localhost:5000/api/donations",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Create failed");
      }

      toast.success("Donation created successfully 🎉");

      window.location.href = "/browse";


    } catch (err) {


      console.error(err);

      toast.error("Create donation failed");


    } finally {


      setSubmitting(false);


    }
  };



  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [finalImage, setFinalImage] = useState(null);
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
        resolve(URL.createObjectURL(blob));
      }, "image/jpeg");
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-800 py-12 px-4 flex justify-center">
      <div className="w-full max-w-4xl space-y-8">

        {/* Header Section */}
        <div className="text-center sm:text-left border-b border-gray-200/60 pb-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            Create <span className="text-emerald-600 font-medium">Donation</span>
          </h1>
          <p className="mt-2 text-base text-slate-500">
            Share your food with the community
          </p>
        </div>

        {/* Category Selection */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold tracking-tight text-slate-950">
              Select Category
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Choose the type of donation you want to create
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`border text-left p-5 rounded-2xl transition-all duration-300 relative overflow-hidden ${selectedCategory === cat.name
                  ? cat.name === "Food Sharing"
                    ? "border-emerald-500 bg-emerald-50/40 text-emerald-900 ring-2 ring-emerald-500/20"
                    : cat.name === "Animal Food"
                      ? "border-amber-500 bg-amber-50/40 text-amber-900 ring-2 ring-amber-500/20"
                      : "border-lime-600 bg-lime-50/40 text-lime-900 ring-2 ring-lime-600/20"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
              >
                <h3 className="font-bold text-base tracking-tight mb-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">{cat.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Donation Main Details Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-8"
        >
          <div>
            <div className="mb-6 border-b border-slate-50 pb-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-950">
                Donation Details
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Provide information about your donation
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., Fresh Bread and Pastries"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Provide details about the food, its condition, and any special notes"
                  rows="4"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Food Type
                  </label>
                  <div className="relative">
                    <select
                      name="foodType"
                      value={form.foodType}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 bg-slate-50/50 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 appearance-none"
                    >
                      <option value="">Select food type</option>
                      <option value="Cooked Food">Cooked Food</option>
                      <option value="Bakery">Bakery</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Vegetables">Vegetables</option>
                      <option value="Dry Food">Dry Food</option>
                    </select>
                    <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-xs text-slate-400">▼</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    placeholder="e.g., 20 pieces, 5kg"
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Production Date
                  </label>
                  <input
                    type="date"
                    name="prodDate"
                    value={form.prodDate}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 bg-slate-50/50 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    name="expDate"
                    value={form.expDate}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 bg-slate-50/50 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              {/* Upload Section */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Upload Images
                </label>
                <div className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl p-8 text-center text-slate-500 transition-all hover:border-emerald-500/60 hover:bg-white group">
                  <input
                    type="file"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                    key={previewImages.length}
                  />

                  {!finalImage && !previewImages[0] && (
                    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center">
                      <div className="text-4xl mb-3 bg-white shadow-sm border border-slate-100 p-3 rounded-full transition group-hover:scale-110">📸</div>
                      <span className="text-sm font-semibold text-slate-800">Click to upload or drag and drop</span>
                      <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</span>
                    </label>
                  )}

                  {(finalImage || previewImages[0]) && (
                    <div className="flex justify-center">
                      <div className="relative group w-72">
                        <img
                          src={finalImage || previewImages[0]}
                          alt="preview"
                          className="w-full h-64 object-cover rounded-2xl border border-slate-200 shadow-md transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 rounded-2xl transition-all duration-200" />
                        <div className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-lg shadow">
                          Uploaded
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFinalImage(null);
                            setPreviewImages([]);
                            setForm((prev) => ({ ...prev, images: [] }));
                            document.getElementById("image-upload").value = "";
                          }}
                          className="absolute bottom-3 right-3 bg-white text-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md hover:bg-rose-600 hover:text-white transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pickup Information Section */}
          <div>
            <div className="mb-6 border-b border-slate-50 pb-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-950">
                Pickup Information
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Where and when can recipients collect the donation
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Pickup Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter pickup location"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
                <p className="text-xs text-slate-400 mt-1.5 italic">
                  In a real implementation, this would use GPS/Maps to select location
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Pickup Time Start
                  </label>
                  <input
                    type="time"
                    name="timeStart"
                    value={form.timeStart}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 bg-slate-50/50 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Pickup Time End
                  </label>
                  <input
                    type="time"
                    name="timeEnd"
                    value={form.timeEnd}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 bg-slate-50/50 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => (window.location.href = "/")}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 active:scale-98 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition active:scale-98 ${submitting
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-emerald-600 shadow-emerald-600/10 hover:bg-emerald-700"
                }`}
            >
              {submitting ? "Submitting..." : "Create Donation"}
            </button>
          </div>
        </form>

        {/* Cropper Modal Backdrop Overlay */}
        {showPreview && previewImages[0] && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <h2 className="text-lg font-bold text-slate-950 mb-1">
                ปรับรูปภาพ
              </h2>

              <div className="relative w-full h-64 bg-slate-950 rounded-2xl overflow-hidden shadow-inner">
                <Cropper
                  image={previewImages[0]}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, croppedAreaPixels) => {
                    setCroppedAreaPixels(croppedAreaPixels);
                  }}
                  objectFit="cover"
                />
              </div>

              {/* Slider Controller */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs text-slate-400">🔎</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              <button
                onClick={async () => {
                  if (!croppedAreaPixels) return;

                  const cropped = await getCroppedImg(
                    previewImages[0],
                    croppedAreaPixels
                  );

                  setFinalImage(cropped);

                  setForm((prev) => ({
                    ...prev,
                    images: prev.images,
                  }));

                  setShowPreview(false);
                }}
                className="mt-6 w-full bg-slate-900 text-white text-sm font-semibold py-3 rounded-xl shadow-lg hover:bg-slate-800 transition active:scale-98"
              >
                confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}