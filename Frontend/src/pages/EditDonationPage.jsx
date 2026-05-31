import { useParams, useNavigate } from "react-router-dom";
import { useDonations } from "../context/DonationContext";
import { useState, useEffect } from "react";
import Cropper from "react-easy-crop";
import toast from "react-hot-toast";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useMapEvents } from "react-leaflet";

// 🔥 แก้บั๊กหมุด Leaflet
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

const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function DonationLocationMarker({ donationLat, donationLng, setDonationLat, setDonationLng }) {
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

export default function EditDonationPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { donations, setDonations } = useDonations();

    const donation = donations?.find((d) => String(d._id || d.id) === String(id));

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        foodType: "",
        quantity: "",
        productionDate: "",
        expDate: "",
        pickupLocation: "",
        pickupTime: "",
        pickupEndTime: "",
        category: "",
    });

    const [previewImages, setPreviewImages] = useState([]);
    const [finalImage, setFinalImage] = useState(null);
    const [finalImagePreview, setFinalImagePreview] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [showMap, setShowMap] = useState(false);
    
    const [donationLat, setDonationLat] = useState(13.1205);
    const [donationLng, setDonationLng] = useState(100.9188);
    
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (donation) {
            setFormData({
                title: donation.title || "",
                description: donation.description || "",
                foodType: donation.foodType || "",
                quantity: donation.quantity || "",
                productionDate: donation.productionDate ? donation.productionDate.split('T')[0] : "",
                expDate: donation.expDate ? donation.expDate.split('T')[0] : "",
                pickupLocation: donation.pickupLocation || "",
                pickupTime: donation.pickupTime || "",
                pickupEndTime: donation.pickupEndTime || "",
                category: donation.category || "Food Sharing",
            });
            setDonationLat(donation.latitude || 13.1205);
            setDonationLng(donation.longitude || 100.9188);
        }
    }, [donation]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPreviewImages([URL.createObjectURL(file)]);
        setShowPreview(true);
    };

    // 🛠️ ดึงฟังก์ชันสร้าง Image แบบพรีเมียมจากหน้า Create มาใช้ลดโอกาสเกิด Race Condition
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
                resolve({ file, previewUrl: URL.createObjectURL(blob) });
            }, "image/jpeg");
        });
    };

    const handleSave = async (e) => {
        e.preventDefault(); // กันฟอร์มรีโหลดหน้าเว็บบนเบราว์เซอร์บางรุ่น
        try {
            setSubmitting(true);
            const token = localStorage.getItem("authToken");
            const form = new FormData();

            Object.keys(formData).forEach((key) => form.append(key, formData[key]));
            form.append("latitude", donationLat);
            form.append("longitude", donationLng);

            if (finalImage) {
                form.append("image", finalImage);
            }

            const res = await fetch(`${backend}/api/donations/${id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: form,
            });

            if (!res.ok) throw new Error("Update failed");
            const updatedData = await res.json();

            setDonations(prev => prev.map(d => String(d._id || d.id) === String(id) ? updatedData : d));
            toast.success("Updated successfully! ✨");
            navigate("/mydonations");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update donation");
        } finally {
            setSubmitting(false);
        }
    };

    if (!donation) return <div className="p-20 text-center font-bold text-slate-400">Loading Donation...</div>;

    // ลำดับการเลือกแสดงผลภาพพรีวิว
    const currentImage = finalImage
        ? finalImagePreview
        : (previewImages[0] || (donation.image?.startsWith("/") ? `${backend}${donation.image}` : donation.image));

    return (
        <div className="min-h-screen bg-[#f8fafb] font-sans text-slate-900 pb-20">
            {/* Dynamic Background Blobs */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-[120px]" />
                <div className="absolute bottom-[5%] right-[-5%] w-[35%] h-[35%] bg-lime-100/50 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-5xl mx-auto px-4 pt-10">
                {/* Top Navigation */}
                <button
                    onClick={() => navigate(-1)}
                    className="group mb-8 flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-bold"
                >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200 group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-all">
                        ←
                    </div>
                    Back to List
                </button>

                {/* Header Section */}
                <div className="grid lg:grid-cols-12 gap-8 mb-10">
                    <div className="lg:col-span-7">
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
                            Edit <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Donation</span>
                        </h1>
                        <p className="text-slate-500 text-lg max-w-xl">
                            Keep your donation information accurate to help others find it easily.
                        </p>
                    </div>

                    <div className="lg:col-span-5 flex flex-col justify-end items-start lg:items-end">
                        <div className={`px-4 py-2 rounded-2xl text-sm font-black uppercase tracking-widest shadow-sm ${donation.status === "available" ? "bg-emerald-500 text-white" : "bg-orange-500 text-white"
                            }`}>
                            Status: {donation.status}
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-12 gap-8">

                    {/* Left Column: Media & Category */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* Image Card */}
                        <div className="bg-white rounded-[2.5rem] p-4 shadow-xl shadow-slate-200/50 border border-white">
                            <div className="relative group aspect-square rounded-[2rem] overflow-hidden bg-slate-100 border border-slate-100">
                                <img src={currentImage} alt="donation" className="w-full h-full object-cover transform transition-transform duration-500 ease-out hover:scale-105" />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 rounded-[2rem] transition-all duration-200 backdrop-blur-[2px] pointer-events-none" />
                                
                                {!finalImage && !previewImages[0] ? (
                                    <label htmlFor="image-upload" className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-emerald-700 px-6 py-3 rounded-2xl text-sm font-bold shadow-xl cursor-pointer hover:bg-emerald-600 hover:text-white transition-all active:scale-95">
                                        Change Photo
                                    </label>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setFinalImage(null);
                                            setFinalImagePreview(null);
                                            setPreviewImages([]);
                                            document.getElementById("image-upload").value = "";
                                        }}
                                        className="absolute bottom-4 right-4 bg-white/95 text-rose-600 px-5 py-3 rounded-2xl text-xs font-bold shadow-lg hover:bg-rose-500 hover:text-white transition-all duration-200 z-30"
                                    >
                                        Remove New Image
                                    </button>
                                )}
                                <input type="file" id="image-upload" className="hidden" onChange={handleImageChange} key={previewImages.length} />
                            </div>
                        </div>

                        {/* Category Card */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-white">
                            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                                <span className="w-2 h-6 bg-emerald-500 rounded-full" />
                                Category
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { name: "Food Sharing", color: "emerald", desc: "Share surplus food with people in need" },
                                    { name: "Animal Food", color: "amber", desc: "Donate food for stray animals" },
                                    { name: "Organic Waste", color: "lime", desc: "Share food waste for composting" }
                                ].map((cat) => (
                                    <button
                                        key={cat.name}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, category: cat.name })}
                                        className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group/btn ${formData.category === cat.name
                                                ? cat.color === "emerald"
                                                    ? "border-emerald-500 bg-emerald-50/50 text-emerald-900 shadow-md shadow-emerald-500/10 -translate-y-0.5 ring-1 ring-emerald-500"
                                                    : cat.color === "amber"
                                                        ? "border-amber-500 bg-amber-50/50 text-amber-900 shadow-md shadow-amber-500/10 -translate-y-0.5 ring-1 ring-amber-500"
                                                        : "border-lime-500 bg-lime-50/50 text-lime-900 shadow-md shadow-lime-500/10 -translate-y-0.5 ring-1 ring-lime-500"
                                                : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-slate-100/70"
                                            }`}
                                    >
                                        <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br opacity-10 rounded-bl-full -mr-2 -mt-2 transition-all duration-300 group-hover/btn:scale-110 ${cat.color === 'emerald' ? 'from-emerald-400 to-teal-500' :
                                                cat.color === 'amber' ? 'from-amber-400 to-orange-500' : 'from-lime-400 to-green-500'
                                            }`} />

                                        <h4 className="font-bold text-base tracking-tight mb-0.5 relative z-10">{cat.name}</h4>
                                        <p className="text-xs text-slate-400 leading-relaxed relative z-10 font-medium">{cat.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Form Fields */}
                    <form onSubmit={handleSave} className="lg:col-span-7 space-y-8">
                        {/* Info Section */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-white">
                            <h3 className="text-lg font-black mb-8 flex items-center gap-2">
                                <span className="w-2 h-6 bg-emerald-500 rounded-full" />
                                Donation Details
                            </h3>

                            <div className="space-y-6">
                                <div className="group">
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Title</label>
                                    <input
                                        type="text" name="title" value={formData.title} onChange={handleChange} required
                                        className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium"
                                    />
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Description</label>
                                    <textarea
                                        name="description" value={formData.description} onChange={handleChange} rows="4" required
                                        className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium resize-none"
                                    />
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Food Type</label>
                                        <select name="foodType" value={formData.foodType} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold appearance-none cursor-pointer">
                                            <option value="Cooked Food">Cooked Food</option>
                                            <option value="Bakery">Bakery</option>
                                            <option value="Fruits">Fruits</option>
                                            <option value="Vegetables">Vegetables</option>
                                            <option value="Dry Food">Dry Food</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Quantity</label>
                                        <input type="text" name="quantity" value={formData.quantity} onChange={handleChange} required className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium" />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Production Date</label>
                                        <input type="date" name="productionDate" value={formData.productionDate} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Exp Date</label>
                                        <input type="date" name="expDate" value={formData.expDate} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-rose-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Logistics Section */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-white">
                            <h3 className="text-lg font-black mb-8 flex items-center gap-2">
                                <span className="w-2 h-6 bg-emerald-500 rounded-full" />
                                Pickup Information
                            </h3>

                            <div className="space-y-6">
                                <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                                    <label className="block text-xs font-black uppercase tracking-widest text-emerald-700 mb-3 ml-1">Pickup Location</label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input
                                            type="text" name="pickupLocation" value={formData.pickupLocation} onChange={handleChange} required
                                            className="flex-1 bg-white border-2 border-emerald-100 rounded-2xl px-5 py-3 outline-none focus:border-emerald-500 font-medium"
                                        />
                                        <button type="button" onClick={() => setShowMap(true)} className="px-6 py-3 bg-white text-emerald-700 font-bold rounded-2xl border-2 border-emerald-200 hover:bg-emerald-500 hover:text-white transition-all active:scale-95 whitespace-nowrap shadow-sm">
                                            📍 View Map
                                        </button>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Start Time</label>
                                        <input type="time" name="pickupTime" value={formData.pickupTime} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">End Time</label>
                                        <input type="time" name="pickupEndTime" value={formData.pickupEndTime} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="flex-1 bg-white border-2 border-slate-100 text-slate-400 font-black py-5 rounded-[2rem] hover:bg-slate-50 hover:text-slate-600 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-[2] bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1 transition-all active:scale-95 disabled:bg-slate-300"
                            >
                                {submitting ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Map Modal */}
            {showMap && (
                <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 flex items-center justify-between border-b border-slate-50">
                            <h2 className="text-2xl font-black">Adjust <span className="text-emerald-600">Location</span></h2>
                            <button type="button" onClick={() => setShowMap(false)} className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold hover:bg-rose-50 hover:text-rose-500 transition-colors">✕</button>
                        </div>
                        <div className="h-[450px] relative">
                            <MapContainer center={[donationLat, donationLng]} zoom={17} style={{ height: "100%", width: "100%" }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <DonationLocationMarker donationLat={donationLat} donationLng={donationLng} setDonationLat={setDonationLat} setDonationLng={setDonationLng} />
                            </MapContainer>
                        </div>
                        <div className="p-8 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm font-bold text-slate-400 italic">📍 Click on map to update the pickup spot</p>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button type="button" onClick={() => setShowMap(false)} className="flex-1 sm:flex-none px-8 py-3 bg-white border border-slate-200 rounded-2xl font-bold">Cancel</button>
                                <button type="button" onClick={() => { setShowMap(false); toast.success("Location updated"); }} className="flex-1 sm:flex-none px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20">Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Cropper Modal */}
            {showPreview && previewImages[0] && (
                <div className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] p-8 max-w-lg w-full shadow-2xl overflow-hidden">
                        <h2 className="text-2xl font-black mb-6">Crop Image</h2>
                        <div className="relative w-full h-80 bg-slate-100 rounded-[2rem] overflow-hidden">
                            <Cropper
                                image={previewImages[0]} crop={crop} zoom={zoom} aspect={1}
                                onCropChange={setCrop} onZoomChange={setZoom}
                                onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
                                objectFit="cover"
                            />
                        </div>
                        <div className="mt-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-black text-slate-400">ZOOM</span>
                                <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-emerald-500" />
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setShowPreview(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-400 hover:bg-slate-200 transition-all">Cancel</button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (!croppedAreaPixels) return;
                                        const result = await getCroppedImg(previewImages[0], croppedAreaPixels);
                                        setFinalImage(result.file);
                                        setFinalImagePreview(result.previewUrl);
                                        setShowPreview(false);
                                    }}
                                    className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
                                >
                                    Apply Crop
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}