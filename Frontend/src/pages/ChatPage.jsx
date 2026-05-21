import { useLocation, useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Pencil } from "lucide-react";
import ChatBubble from "../components/chat/ChatBubble";
import ChatInput from "../components/chat/ChatInput";

export default function ChatPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const donation = location.state?.donation;
    const { donations, completeDonation } = useDonations();
    const [messages, setMessages] = useState([
        {
            sender: "system",
            text: "Start chatting about this donation.",
        },
    ]);

    const [text, setText] = useState("");
    const [selectedImages, setSelectedImages] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    if (!donation) {
        return (
            <div className="flex items-center justify-center h-screen">
                No chat selected
            </div>
        );
    }

    const { addNotification } = useDonations();
    const sendMessage = () => {
        if (!text.trim() && selectedImages.length === 0) return;
        addNotification(
            "💬 New message received",
            "message"
        );

        if (editingMessage) {
            editMessage(editingMessage.id, text);

            setEditingMessage(null);
            setText("");

            return;
        }

        setMessages((prev) => [
            ...prev,
            {
                id: Date.now(),
                sender: "me",
                text,
                images: selectedImages,
                replyTo: replyingTo,
                status: "Seen",
                time: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            },
        ]);

        setText("");
        setSelectedImages([]);
        setReplyingTo(null);

        textareaRef.current.style.height = "24px";
    };

    const unsendMessage = (id) => {
        setMessages((prev) =>
            prev.filter((msg) => msg.id !== id)
        );
    };

    const editMessage = (id, newText) => {
        setMessages((prev) =>
            prev.map((msg) =>
                msg.id === id
                    ? {
                        ...msg,
                        text: newText,
                        edited: true,
                    }
                    : msg
            )
        );
    };

    const handleInput = (e) => {
        setText(e.target.value);

        textareaRef.current.style.height = "auto";

        textareaRef.current.style.height =
            Math.min(textareaRef.current.scrollHeight, 120) + "px";
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);

        if (!files.length) return;

        const imageUrls = files.map((file) =>
            URL.createObjectURL(file)
        );

        setSelectedImages((prev) => [
            ...prev,
            ...imageUrls,
        ]);
    };

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const shouldAutoScrollRef = useRef(true);

    const prevMessagesLength = useRef(messages.length);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);

    useEffect(() => {
        const hasNewMessage =
            messages.length > prevMessagesLength.current;

        if (hasNewMessage && shouldAutoScrollRef.current) {
            messagesEndRef.current?.scrollIntoView({
                block: "end",
            });
        }

        prevMessagesLength.current = messages.length;
    }, [messages]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (

        <div className="h-screen bg-emerald-50 flex justify-center p-4 overflow-hidden">

            <div className="w-full max-w-5xl bg-white rounded-2xl shadow overflow-hidden flex flex-col h-[calc(100vh-140px)]">

                {/* Header */}
                <div className="border-b p-4 flex items-center justify-between">

                    <div className="flex items-center gap-3">

                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-700 text-xl"
                        >
                            <ArrowLeft size={20} />
                        </button>

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

                    <button
                        onClick={() => completeDonation(donation.id)}
                        className="
                                px-4 h-10 rounded-xl
                                bg-emerald-500 hover:bg-emerald-600
                                text-white text-sm font-medium
                                transition shadow-sm
                            "
                    >
                        Mark Completed
                    </button>

                </div>

                {/* Messages */}
                <div className="px-4 py-2 bg-white">

                    <div className="flex items-center justify-between text-sm">

                        <div>
                            <span className="font-medium text-gray-800">
                                {donation.title}
                            </span>

                            <span className="text-gray-400 mx-2">
                                •
                            </span>

                            <span className="text-emerald-600 font-medium">
                                Active
                            </span>
                        </div>

                        <p className="text-xs text-gray-500 font-medium">
                            Arrange pickup
                        </p>

                    </div>

                </div>

                <div
                    ref={messagesContainerRef}
                    onClick={() => setActiveMenuId(null)}
                    onScroll={() => {
                        const container = messagesContainerRef.current;

                        if (!container) return;

                        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

                        shouldAutoScrollRef.current = isNearBottom;
                    }}
                    className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 min-h-0"
                >

                    {messages.map((msg, index) => {

                        if (msg.sender === "system") {
                            return (
                                <div
                                    key={index}
                                    className="text-center text-xs text-gray-400 py-2"
                                >
                                    {msg.text}
                                </div>
                            );
                        }

                        return (
                            <ChatBubble
                                key={msg.id || index}
                                msg={msg}
                                isOwnMessage={msg.sender === "me"}
                                setPreviewImage={setPreviewImage}
                                activeMenuId={activeMenuId}
                                setActiveMenuId={setActiveMenuId}
                                setReplyingTo={setReplyingTo}
                                setEditingMessage={setEditingMessage}
                                setText={setText}
                                unsendMessage={unsendMessage}
                            />
                        );
                    })}

                    <div ref={messagesEndRef} />

                </div>

                {editingMessage && (
                    <div className="px-4 py-2 border-t bg-white flex items-center justify-between">

                        <div className="flex items-center gap-2">
                            <Pencil size={15} className="text-gray-500" />

                            <p className="text-sm text-gray-700">
                                Editing message
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                setEditingMessage(null);
                                setText("");
                            }}
                            className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
                        >
                            ✕
                        </button>

                    </div>
                )}

                {replyingTo && (
                    <div className="px-4 pt-3 border-t bg-white">
                        <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-start justify-between">
                            <div>
                                <p className="text-xs text-emerald-600 font-semibold mb-1">
                                    Replying to
                                </p>

                                <p className="text-sm text-gray-700 line-clamp-2">
                                    {replyingTo.text || "Photo"}
                                </p>
                            </div>

                            <button
                                onClick={() => setReplyingTo(null)}
                                className="text-gray-400 hover:text-black text-sm"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {/* Input */}
                <ChatInput
                    text={text}
                    setText={setText}
                    selectedImages={selectedImages}
                    setSelectedImages={setSelectedImages}
                    sendMessage={sendMessage}
                    textareaRef={textareaRef}
                    fileInputRef={fileInputRef}
                    handleInput={handleInput}
                    handleImageSelect={handleImageSelect}
                    unsendMessage={unsendMessage}
                    editingMessage={editingMessage}
                />


                {/* Image Preview Modal */}
                {previewImage && (
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setPreviewImage(null)}
                    >

                        <img
                            src={previewImage}
                            onClick={(e) => e.stopPropagation()}
                            alt="preview"
                            className="max-w-[90%] max-h-[90%] rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200"
                        />

                    </div>
                )}
            </div>
        </div >
    );
}