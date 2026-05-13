import { useLocation, useNavigate } from "react-router-dom";
import React, { useState } from "react";

export default function ChatPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const donation = location.state?.donation;

    const [messages, setMessages] = useState([
        {
            sender: "system",
            text: "Start chatting about this donation.",
        },
    ]);

    const [text, setText] = useState("");

    if (!donation) {
        return (
            <div className="flex items-center justify-center h-screen">
                No chat selected
            </div>
        );
    }

    const sendMessage = () => {
        if (!text.trim()) return;

        setMessages((prev) => [
            ...prev,
            {
                sender: "me",
                text,
            },
        ]);

        setText("");
    };

    return (
        <div className="min-h-screen bg-emerald-50 flex justify-center p-6">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow overflow-hidden flex flex-col h-[85vh]">

                {/* Header */}
                <div className="border-b p-4 flex items-center gap-3">
                    <img
                        src={donation.donorAvatar}
                        alt="avatar"
                        className="w-12 h-12 rounded-full object-cover"
                    />

                    <div>
                        <h2 className="font-bold text-lg">
                            {donation.donorName}
                        </h2>

                        <p className="text-sm text-gray-500">
                            {donation.title}
                        </p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">

                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${msg.sender === "me"
                                    ? "ml-auto bg-emerald-600 text-white"
                                    : "bg-white border"
                                }`}
                        >
                            {msg.text}
                        </div>
                    ))}

                </div>

                {/* Input */}
                <div className="border-t p-4 flex gap-2">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type message..."
                        className="flex-1 border rounded-xl px-4 py-2 outline-none"
                    />

                    <button
                        onClick={sendMessage}
                        className="bg-emerald-600 text-white px-5 rounded-xl"
                    >
                        Send
                    </button>
                </div>

                {/* Bottom */}
                <div className="border-t p-3 bg-gray-50 flex justify-between text-sm">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-600"
                    >
                        ← Back
                    </button>

                    <button className="text-emerald-600 font-medium">
                        Mark Complete
                    </button>
                </div>
            </div>
        </div>
    );
}