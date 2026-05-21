import { useParams, useNavigate } from "react-router-dom";
import { useDonations } from "../context/DonationContext";
import { useState, useEffect } from "react";
import Cropper from "react-easy-crop";



export default function EditDonationPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { donations, setDonations } = useDonations();

    const donation = donations.find(
        (d) => String(d.id) === String(id)
    );

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        foodType: "",
        quantity: "",
        productionDate: "",
        expDate: "",
        address: "",
        timeStart: "",
        timeEnd: "",
    });


    const [previewImages, setPreviewImages] = useState([]);
    const [finalImage, setFinalImage] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image();

            image.addEventListener("load", () =>
                resolve(image)
            );

            image.addEventListener("error", (error) =>
                reject(error)
            );

            image.setAttribute(
                "crossOrigin",
                "anonymous"
            );

            image.src = url;
        });

    const getCroppedImg = async (
        imageSrc,
        croppedAreaPixels
    ) => {

        const image = await createImage(imageSrc);

        const canvas =
            document.createElement("canvas");

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

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        if (!files.length) return;

        const previews = files.map((file) =>
            URL.createObjectURL(file)
        );

        setPreviewImages(previews);

        setShowPreview(true);
    };

    useEffect(() => {
        if (donation) {
            setFormData({
                title: donation.title || "",
                description: donation.description || "",
                foodType: donation.foodType || "",
                quantity: donation.quantity || "",
                productionDate: donation.productionDate || donation.prodDate || "",
                expDate: donation.expDate || "",
                address: donation.address || "",
                timeStart: donation.timeStart || "",
                timeEnd: donation.timeEnd || "",
                category: donation.category || "",
            });
        }
    }, [donation]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSave = () => {

        const updatedDonations = donations.map((d) => {

            if (String(d.id) === String(id)) {

                return {
                    ...d,
                    ...formData,

                    image:
                        finalImage ||
                        previewImages[0] ||
                        d.image,

                    images: [
                        finalImage ||
                        previewImages[0] ||
                        d.image,
                    ],
                };
            }

            return d;
        });

        setDonations(updatedDonations);

        localStorage.setItem(
            "donations",
            JSON.stringify(updatedDonations)
        );

        navigate("/mydonations");
    };

    if (!donation) {
        return (
            <div className="p-10 text-center">
                Donation not found
            </div>
        );
    }

    return (
        <div className="min-h-screen  bg-emerald-50 p-10">
            {/* back button */}
            <button
                onClick={() => navigate("/mydonations")}
                className="mb-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:shadow-md hover:bg-gray-50 transition"
            >
                ← Back to My Donations
            </button>
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 p-6">
                <img
                    src={
                        finalImage ||
                        previewImages[0] ||
                        donation.images?.[0] ||
                        donation.image
                    }
                    alt="donation"
                    className="w-full h-52 object-cover rounded-2xl mb-6"
                />
                <div className="bg-gradient-to-r from-gray-50 to-emerald-50 rounded-2xl p-4 flex items-center gap-3 mb-6 border border-gray-100">

                    <img
                        src={donation.donorAvatar || "/src/assets/avatars/default-avatar.jpg"}
                        alt={donation.donorName}
                        className="w-12 h-12 rounded-full object-cover"
                    />

                    <div>
                        <h3 className="font-semibold text-lg">
                            {donation.donorName || "You"}
                        </h3>

                        <p className="text-sm text-gray-500">
                            Update your food donation information
                        </p>
                    </div>

                </div>

                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Edit Donation
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Update and manage your food donation
                    </p>
                </div>

                <div
                    className={` mb-6 inline-block rounded-full px-4 py-1 text-sm font-medium ${donation.status === "available"
                        ? "bg-emerald-100 text-emerald-700"
                        : donation.status === "claimed"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                >
                    {donation.status}
                </div>

                <div className="border-2 border-dashed border-emerald-200 bg-emerald-50/30 rounded-xl p-6 text-center text-gray-500 hover:border-emerald-300 transition hover:scale-[1.02]">
                    <input
                        type="file"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                        key={previewImages.length}
                    />

                    {!finalImage && !previewImages[0] && (
                        <>
                            <div className="text-4xl mb-3">📷</div>

                            <label htmlFor="image-upload" className="cursor-pointer">
                                Click to upload or drag and drop <br />
                                <span className="text-xs text-gray-400">
                                    PNG, JPG up to 10MB
                                </span>
                            </label>
                        </>
                    )}

                    {(finalImage || previewImages[0]) && (
                        <div className="mt-4 flex justify-center">

                            <div className="relative group w-72 animate-fadeIn">

                                <img
                                    src={finalImage || previewImages[0]}
                                    className="w-full h-72 object-cover rounded-2xl border border-gray-200 shadow-lg hover:shadow-2xl group-hover:shadow-xl transition-all duration-300"
                                />

                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-2xl transition-all duration-300" />

                                <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full shadow">
                                    Uploaded
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setFinalImage(null);
                                        setPreviewImages([]);

                                        document.getElementById("image-upload").value = "";
                                    }}
                                    className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-red-500 hover:text-white transition-all shadow-md"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    )}

                </div>
                <div className="mb-6">

                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Select Category
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[{
                            name: "Food Sharing",
                            color: "border-emerald-500 bg-emerald-50 text-emerald-700",
                            desc: "Share food with people",
                        },
                        {
                            name: "Animal Food",
                            color: "border-orange-500 bg-orange-50 text-orange-700",
                            desc: "Donate food for animals",
                        },
                        {
                            name: "Organic Waste",
                            color: "border-lime-600 bg-lime-50 text-lime-700",
                            desc: "Food waste for compost",
                        },].map((category) =>
                        (<button key={category.name}
                            type="button"
                            onClick={() => setFormData({
                                ...formData, category: category.name,
                            })}
                            className={` rounded-2xl border p-4 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-1 
                            ${formData.category === category.name ? `${category.color} 
                            shadow-md scale-[1.02]` : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"} `} >

                            <div className="flex items-center justify-between">

                                <h3 className="font-semibold text-sm">
                                    {category.name}
                                </h3>

                            </div>
                            <p className="text-xs opacity-70 mt-2 leading-relaxed">
                                {category.desc}
                            </p>
                        </button>
                        )
                        )
                        }
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-gray-50 rounded-2xl p-5 space-y-4 border border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                            Food Information
                        </h2>

                        <label className="mb-1.5 block text-sm font-medium text-gray-600">
                            Donation Title
                        </label>

                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Title"
                            className="w-full border bg-gray-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-200"
                        />

                        <label className="mb-1.5 block text-sm font-medium text-gray-600">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Description"
                            className="w-full border bg-gray-50 rounded-xl resize-none px-4 py-3 h-32 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-200"
                        />

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-600">
                                Food Type
                            </label>

                            <select
                                name="foodType"
                                value={formData.foodType}
                                onChange={handleChange}
                                className="w-full border bg-gray-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            >
                                <option value="">Select food type</option>
                                <option value="Cooked Food">Cooked Food</option>
                                <option value="Bakery">Bakery</option>
                                <option value="Fruits">Fruits</option>
                                <option value="Vegetables">Vegetables</option>
                                <option value="Dry Food">Dry Food</option>
                            </select>
                        </div>

                        <label className="mb-1.5 block text-sm font-medium text-gray-600">
                            Quantity
                        </label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            placeholder="Quantity"
                            className="w-full border bg-gray-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-200"
                        />

                        <div className="grid sm:grid-cols-2 gap-4">

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-600">
                                    Production Date
                                </label>

                                <input
                                    type="date"
                                    name="productionDate"
                                    value={formData.productionDate}
                                    onChange={handleChange}
                                    className="w-full border bg-gray-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-600">
                                    Expiration Date
                                </label>

                                <input
                                    type="date"
                                    name="expDate"
                                    value={formData.expDate}
                                    onChange={handleChange}
                                    className="w-full border bg-gray-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                />
                            </div>

                        </div>

                    </div>
                    <div className="bg-gray-50 rounded-2xl p-5 space-y-4 border border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                            Pickup Information
                        </h2>
                        <label className="mb-1.5 block text-sm font-medium text-gray-600">
                            Pickup Address
                        </label>

                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Pickup Address"
                            className="w-full border bg-gray-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-200"
                        />

                        <div className="grid sm:grid-cols-2 gap-4">

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-600">
                                    Pickup Time Start
                                </label>

                                <input
                                    type="time"
                                    name="timeStart"
                                    value={formData.timeStart}
                                    onChange={handleChange}
                                    className="w-full border bg-gray-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-600">
                                    Pickup Time End
                                </label>

                                <input
                                    type="time"
                                    name="timeEnd"
                                    value={formData.timeEnd}
                                    onChange={handleChange}
                                    className="w-full border bg-gray-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                />
                            </div>

                        </div>

                    </div>

                    <div className="flex gap-3">

                        <button
                            onClick={() => navigate(-1)}
                            className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl py-3 transition font-medium"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleSave}
                            className="flex-1 bg-emerald-600 text-white font-medium rounded-xl py-3 hover:bg-emerald-700 hover:scale-[1.02] hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-md" >
                            Save Changes
                        </button>

                    </div>

                </div>

            </div>
            {showPreview && previewImages[0] && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full">

                        <h2 className="text-lg font-semibold mb-4">
                            Crop Image
                        </h2>

                        <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">

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

                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) =>
                                setZoom(Number(e.target.value))
                            }
                            className="w-full mt-4"
                        />

                        <button
                            onClick={async () => {

                                if (!croppedAreaPixels) return;

                                const cropped =
                                    await getCroppedImg(
                                        previewImages[0],
                                        croppedAreaPixels
                                    );

                                setFinalImage(cropped);

                                setShowPreview(false);
                            }}
                            className="mt-4 w-full bg-emerald-600 text-white py-2 rounded-xl hover:bg-emerald-700"
                        >
                            Confirm
                        </button>

                    </div>

                </div>
            )}
        </div>

    );
}