import { useEffect, useState } from "react";
import { FaFacebook, FaInstagram, FaTimes } from "react-icons/fa";

// ดึงตัวแปร Env สไตล์เดียวกับหน้า ProfilePage ป้องกัน Path รูปพังตอนขึ้นระบบจริง
const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function UserProfileModal({ user, onClose }) {
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        if (!user?._id) return;

        fetch(`${backend}/api/user/${user._id}/public`)
            .then((res) => res.json())
            .then((data) => {
                console.log("PUBLIC PROFILE:", data);
                setProfileData(data);
            })
            .catch(console.error);
    }, [user]);

    if (!user) return null;

    const trustScore = profileData?.stats?.trustScore || 0;

    const trustLevel =
        trustScore >= 70
            ? {
                label: "🥇 Top Donor",
                bg: "bg-green-50",
                border: "border-green-200",
                text: "text-green-600",
            }
            : trustScore >= 40
                ? {
                    label: "🥈 Reliable Donor",
                    bg: "bg-yellow-50",
                    border: "border-yellow-200",
                    text: "text-yellow-600",
                }
                : {
                    label: "🥉 New Donor",
                    bg: "bg-pink-50",
                    border: "border-pink-200",
                    text: "text-pink-600",
                };


    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white border border-white/60 rounded-3xl p-6 md:p-8 shadow-2xl shadow-emerald-900/5 ring-1 ring-black/5 w-full max-w-md transform transition-all duration-300 scale-100"
            >

                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 hover:bg-gray-100/60 active:scale-90 p-2 rounded-full transition-all duration-200"
                    title="Close"
                >
                    <FaTimes size={16} />
                </button>

                <div className="flex flex-col items-center text-center">

                    <div className="relative w-36 h-36 group">

                        <div className="relative w-full h-full rounded-full overflow-hidden ring-4 ring-white shadow-xl">
                            {profileData?.avatar ? (
                                <img
                                    src={profileData.avatar.startsWith("/") ? `${backend}${profileData.avatar}` : profileData.avatar}
                                    alt="avatar"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div
                                style={{ display: profileData?.avatar ? 'none' : 'flex' }}
                                className="w-full h-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl"
                            >
                                ผู้ใช้
                            </div>
                        </div>
                    </div>

                    <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-800">
                        {profileData?.username || user?.username || "Unknown User"}
                    </h2>

                    {profileData?.about && (
                        <p className="mt-3 text-sm leading-relaxed text-gray-500 max-w-[250px] italic">
                            “{profileData.about}”
                        </p>
                    )}

                    <div className="w-full border-t border-gray-100 my-5" />

                    <div className="flex items-center justify-center gap-4 py-1">
                        {profileData?.social?.facebook && (
                            <a
                                href={profileData.social.facebook}
                                target="_blank"
                                rel="noreferrer"
                                className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 hover:scale-110 transition"
                            >
                                <FaFacebook size={18} />
                            </a>
                        )}

                        {profileData?.social?.instagram && (
                            <a
                                href={profileData.social.instagram}
                                target="_blank"
                                rel="noreferrer"
                                className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 hover:scale-110 transition"
                            >
                                <FaInstagram size={18} />
                            </a>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 w-full mt-6">
                        <div className="bg-emerald-50/60 border border-emerald-100/50 rounded-2xl p-3.5 transition-all hover:bg-emerald-50 text-center">
                            <p className="text-2xl font-bold tracking-tight text-emerald-600">
                                {profileData?.stats?.donationsShared || 0}
                            </p>
                            <p className="text-xs font-medium text-gray-500 mt-0.5">🍱 Donations Shared</p>
                        </div>

                        <div className="bg-blue-50/60 border border-blue-100/50 rounded-2xl p-3.5 transition-all hover:bg-blue-50 text-center">
                            <p className="text-2xl font-bold tracking-tight text-blue-600">
                                {profileData?.stats?.completedDonations || 0}
                            </p>
                            <p className="text-xs font-medium text-gray-500 mt-0.5">🎉 Completed</p>
                        </div>

                        <div className="bg-amber-50/60 border border-amber-100/50 rounded-2xl p-3.5 transition-all hover:bg-amber-50 text-center">
                            <p className="text-2xl font-bold tracking-tight text-amber-600">
                                {profileData?.stats?.peopleHelped || 0}
                            </p>
                            <p className="text-xs font-medium text-gray-500 mt-0.5">❤️ People Helped</p>
                        </div>

                        <div
                            className={`${trustLevel.bg} border ${trustLevel.border} rounded-2xl p-3.5 transition-all text-center`}
                        >
                            <p className={`text-2xl font-bold tracking-tight ${trustLevel.text}`}>
                                {trustScore}%
                            </p>

                            <p className="text-xs font-medium text-gray-500 mt-0.5">
                                ⭐ Trust Score
                            </p>

                            <p className={`text-[11px] font-semibold mt-1 ${trustLevel.text}`}>
                                {trustLevel.label}
                            </p>
                        </div>
                    </div>

                    <div className="w-full mt-6 pt-4 border-t border-gray-100 flex items-center justify-center text-xs font-medium text-gray-400 gap-1">
                        <span>📅 Member since:</span>
                        <span className="text-gray-600">
                            {profileData?.createdAt
                                ? new Date(profileData.createdAt).toLocaleDateString("en-US", {
                                    month: "long",
                                    year: "numeric",
                                })
                                : "Recently"}
                        </span>
                    </div>

                </div>
            </div>
        </div>
    );
}