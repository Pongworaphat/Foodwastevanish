import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ChatPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const donation = location.state?.donation;

    if (!donation) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-gray-600">
                <p>No chat selected.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-3 px-4 py-2 rounded-lg bg-emerald-600 text-white"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-emerald-50 flex flex-col items-center pt-6 md:pt-10">
            {/* ปุ่ม Back ด้านนอก */}
            <div className="w-full max-w-3xl flex items-center mb-3 px-3">
                <button
                    onClick={() => navigate(-1)}
                    className="text-gray-700 hover:text-gray-900 text-sm flex items-center gap-1"
                >
                    ← <span>Back</span>
                </button>
            </div>

            {/* กล่องหลักของ Chat */}
            <div
                className="
          flex flex-col bg-white rounded-none md:rounded-2xl shadow md:border border-gray-200 
          w-full md:max-w-3xl h-screen md:h-[85vh] overflow-hidden
        "
            >
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b bg-white flex-none">
                    <img
                        src={donation.donorAvatar}
                        alt={donation.donorName}
                        className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                        <div className="font-semibold text-gray-900 flex items-center gap-1">
                            {donation.donorName}
                            {donation.verified && (
                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                    Verified
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                            Chatting about: {donation.title}
                        </div>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                        pending
                    </span>
                </div>

                {/* พื้นที่แชท (ไม่มีข้อความจำลองแล้ว) */}
                <div className="flex-1 overflow-y-auto px-4 py-6 bg-gray-50">
                    <div className="text-sm text-gray-500 text-center">
                        Start chatting with the donor here...
                    </div>
                </div>

                {/* Message input */}
                <div className="flex items-center gap-2 border-t bg-white px-4 py-3 flex-none">
                    <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
                        ➤
                    </button>
                </div>

                {/* Donation info */}
                <div className="flex items-center gap-3 border-t bg-gray-50 px-4 py-3 flex-none">
                    <img
                        src={donation.image}
                        alt={donation.title}
                        className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div className="truncate">
                        <div className="font-medium text-gray-900">{donation.title}</div>
                        <div className="text-xs text-gray-500 truncate">
                            {donation.address}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
