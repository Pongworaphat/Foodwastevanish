import { useParams, useNavigate } from "react-router-dom";
import { useDonations } from "../context/DonationContext";
import { useState, useEffect } from "react";

export default function EditDonationPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { donations, setDonations } = useDonations();

    const donation = donations.find((d) => d.id === id);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        quantity: "",
        address: "",
    });

    useEffect(() => {
        if (donation) {
            setFormData({
                title: donation.title || "",
                description: donation.description || "",
                quantity: donation.quantity || "",
                address: donation.address || "",
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
        const updated = donations.map((d) =>
            d.id === id
                ? {
                    ...d,
                    ...formData,
                }
                : d
        );

        setDonations(updated);

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
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <img
                    src={donation.images?.[0] || donation.image}
                    alt="donation"
                    className="w-full h-52 object-cover rounded-2xl mb-6"
                />

                <h1 className="text-3xl font-bold mb-2">
                    Edit Donation
                </h1>

                <p className="text-sm text-gray-500 mt-2 mb-4">
                    Current donation image
                </p>

                <div
                    className={`mb-6 inline-block rounded-full px-4 py-1 text-sm font-medium ${donation.status === "available"
                        ? "bg-emerald-100 text-emerald-700"
                        : donation.status === "claimed"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                >
                    {donation.status}
                </div>

                <div className="mb-8 border-2 border-dashed  border-gray-300 rounded-2xl p-6 text-center hover:border-emerald-400 transition cursor-pointer bg-gray-50">
                    <p className="text-sm text-gray-500">
                        <p className="text-3xl mb-2">📷</p>
                        Click to upload new image
                    </p>

                    <input
                        type="file"
                        className="hidden"
                    />
                </div>

                <div className="space-y-6">

                    <div>
                        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 mt-4">
                            Food Information
                        </h2>

                        <label className="mb-2 block text-sm font-medium text-gray-600">
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

                        <label className="mb-2 block text-sm font-medium text-gray-600">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Description"
                            className="w-full border bg-gray-50 rounded-xl resize-none px-4 py-3 h-32 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-200"
                        />

                        <label className="mb-2 block text-sm font-medium text-gray-600">
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

                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                            Pickup Information
                        </h2>
                        <label className="mb-2 block text-sm font-medium text-gray-600">
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
                    </div>
                    <div className="flex gap-3">

                        <button
                            onClick={() => navigate(-1)}
                            className="flex-1 border border-gray-300 text-gray-700 rounded-xl py-3 hover:bg-gray-100 transition font-medium"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSave}
                            className="flex-1 bg-emerald-600 text-white font-medium rounded-xl py-3 hover:bg-emerald-700 transition shadow-sm hover:shadow-md"
                        >
                            Save Changes
                        </button>

                    </div>

                </div>
            </div>
        </div>
    );
}