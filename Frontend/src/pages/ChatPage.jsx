import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

export default function ChatPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const donation = location.state?.donation;
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const chatId = location.state?.chatId;

    useEffect(() => {

        if (!chatId) return;

        fetchMessages();

    }, [chatId]);

    const fetchMessages = async () => {
        try {

            const token = localStorage.getItem("token");

            const res = await fetch(
                `http://localhost:5000/api/chats/${chatId}/messages`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await res.json();

            setMessages(data);

        } catch (error) {
            console.error(error);
        }
    };

    const sendMessage = async () => {

        if (!text.trim()) return;

        try {

            const token = localStorage.getItem("token");

            const res = await fetch(
                `http://localhost:5000/api/chats/${chatId}/messages`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        text
                    })
                }
            );

            const data = await res.json();

            setMessages((prev) => [...prev, data]);

            setText("");

        } catch (error) {
            console.error(error);
        }
    };

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

                <div className="space-y-3">

                    {messages.map((msg) => (

                        <div
                            key={msg._id}
                            className="bg-white p-3 rounded-lg shadow-sm"
                        >
                            <div className="font-semibold text-sm text-emerald-700">
                                {msg.sender.username}
                            </div>

                            <div className="text-sm text-gray-700">
                                {msg.text}
                            </div>
                        </div>

                    ))}

                </div>
            </div>

            {/* Message input */}
            <div className="flex items-center gap-2 border-t bg-white px-4 py-3 flex-none">
                <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <button
                    onClick={sendMessage}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                >
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
    );
}
