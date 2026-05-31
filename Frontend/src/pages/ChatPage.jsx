import { useLocation, useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, MapPin, Package, CheckCircle2 } from "lucide-react";
import ChatBubble from "../components/chat/ChatBubble";
import ChatInput from "../components/chat/ChatInput";
import { useDonations } from "../context/DonationContext";
import toast from "react-hot-toast";
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

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

export default function ChatPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const { donations, completeDonation } = useDonations();
    const initialDonation = location.state?.donation;
    const donationId = initialDonation?._id || initialDonation?.id;

    const donation = donations?.find(d => (d._id === donationId || d.id === donationId)) || initialDonation;

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    const isOwner = (donation?.donor?._id || donation?.donor) === currentUser._id;
    const isReceiver = (donation?.receiver?._id || donation?.receiver) === currentUser._id;

    const chatUser = isOwner
        ? donation?.receiver || { username: "Waiting for receiver...", avatar: "https://ui-avatars.com/api/?name=Waiting" }
        : donation?.donor || { username: "Unknown donor", avatar: "https://ui-avatars.com/api/?name=User" };

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const prevMessagesLength = useRef(messages.length);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const shouldAutoScrollRef = useRef(true);

    const formatTime = (time) => {
        if (!time) return "-";
        const [hour, minute] = time.split(":");
        return new Date(2000, 0, 1, Number(hour), Number(minute)).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const categoryStyle =
        donation?.category === "Food Sharing"
            ? "bg-white border-emerald-200"
            : donation?.category === "Animal Food"
                ? "bg-orange-50 border-orange-200"
                : donation?.category === "Organic Waste"
                    ? "bg-lime-50 border-lime-200"
                    : "bg-white border-slate-200";

    useEffect(() => {
        if (!donationId) return;

        const q = query(
            collection(db, "chats"),
            where("donationId", "==", donationId),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedMessages = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    sender: data.senderId === currentUser._id ? "me" : "other",
                };
            });

            setMessages(loadedMessages);

            const unseenMessages = loadedMessages.filter(
                (msg) =>
                    msg.senderId !== currentUser._id &&
                    msg.status !== "Seen"
            );

            unseenMessages.forEach(async (msg) => {
                await updateDoc(
                    doc(db, "chats", msg.id),
                    { status: "Seen" }
                );
            });
        });

        return () => unsubscribe();
    }, [donationId, currentUser._id]);

    useEffect(() => {
        const hasNewMessage = messages.length > prevMessagesLength.current;
        if (hasNewMessage && shouldAutoScrollRef.current) {
            messagesEndRef.current?.scrollIntoView({ block: "end" });
        }
        prevMessagesLength.current = messages.length;
    }, [messages]);

    useEffect(() => {
        window.scrollTo(0, 0);
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    if (!donation) {
        return (
            <div className="flex items-center justify-center h-screen text-slate-400 bg-gray-50 font-medium">
                No chat selected
            </div>
        );
    }

    const sendMessage = async () => {
        if (donation.status === "completed" || isSending) return;
        if (!text.trim() && selectedImages.length === 0) return;

        setIsSending(true);
        const textToSend = text.trim();
        const imagesToUpload = [...selectedImages];

        try {
            if (editingMessage) {
                const messageRef = doc(db, "chats", editingMessage.id);
                await updateDoc(messageRef, {
                    text: textToSend,
                    edited: true
                });
                setEditingMessage(null);
                setText("");
                if (textareaRef.current) textareaRef.current.style.height = "24px";
                setIsSending(false);
                return;
            }

            setText("");
            setSelectedImages([]);
            imagePreviews.forEach((url) => URL.revokeObjectURL(url));
            setImagePreviews([]);
            const replyDataForFirebase = replyingTo ? { id: replyingTo.id, text: replyingTo.text || "", senderId: replyingTo.senderId } : null;
            setReplyingTo(null);

            if (fileInputRef.current) fileInputRef.current.value = "";
            if (textareaRef.current) textareaRef.current.style.height = "24px";

            let uploadedImages = [];
            if (imagesToUpload.length > 0) {
                for (const image of imagesToUpload) {
                    const formData = new FormData();
                    formData.append("file", image);
                    formData.append("upload_preset", "chat_preset");

                    const response = await fetch("https://api.cloudinary.com/v1_1/dt7exvbad/image/upload", {
                        method: "POST",
                        body: formData
                    });

                    const data = await response.json();
                    if (data.secure_url) uploadedImages.push(data.secure_url);
                }
            }

            await addDoc(collection(db, "chats"), {
                donationId: donationId,
                senderId: currentUser._id,
                text: textToSend,
                images: uploadedImages,
                replyTo: replyDataForFirebase,
                status: "Sent",
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                createdAt: serverTimestamp(),
            });

        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("เกิดข้อผิดพลาดในการส่งข้อความ ❌");
        } finally {
            setIsSending(false);
        }
    };

    const unsendMessage = async (id) => {
        try { await deleteDoc(doc(db, "chats", id)); } catch (error) { console.error(error); }
    };

    const handleInput = (e) => {
        setText(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
        }
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setSelectedImages((prev) => [...prev, ...files]);
        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setImagePreviews((prev) => [...prev, ...newPreviews]);
    };

    const handleCancelAll = () => {
        setEditingMessage(null);
        setReplyingTo(null);
        setText("");
        if (textareaRef.current) textareaRef.current.style.height = "24px";
    };

    const removeImage = (index) => {
        if (imagePreviews[index]) URL.revokeObjectURL(imagePreviews[index]);
        setSelectedImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="h-[calc(100vh-90px)] w-full overflow-hidden bg-slate-50/50 font-sans antialiased">
            <div className="w-full h-full flex flex-col overflow-hidden">

                {/* ─── PREMIUM HEADER ─── */}
                <div className="border-b border-slate-200/50 bg-white/95 backdrop-blur-lg px-8 py-4 flex items-center justify-between shrink-0 shadow-[0_1px_4px_rgba(0,0,0,0.03)] z-10">
                    <div className="flex items-center gap-5 min-w-0">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100/70 active:scale-95 transition-all text-slate-600 shadow-sm"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div className="relative shrink-0">
                            <img
                                src={chatUser?.avatar?.startsWith("/") ? `http://localhost:5000${chatUser.avatar}` : chatUser?.avatar || "https://ui-avatars.com/api/?name=User"}
                                alt="avatar"
                                className="w-12 h-12 rounded-full object-cover ring-4 ring-emerald-500/10 shadow-sm"
                            />
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></span>
                        </div>

                        <div className="min-w-0">
                            <div>
                                <h2 className="font-extrabold text-[18px] text-slate-900 tracking-tight">
                                    {chatUser?.username}
                                </h2>
                            </div>
                            <div className="flex items-center flex-wrap gap-2.5 mt-1.5">
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100/70 px-2.5 py-1 rounded-full max-w-[200px] truncate border border-slate-200/50">
                                    <MapPin size={13} className="text-slate-400 shrink-0" /> {donation.pickupLocation || "No location"}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100/70 px-2.5 py-1 rounded-full border border-slate-200/50">
                                    <Package size={13} className="text-slate-400 shrink-0" /> {donation.quantity || "0"}
                                </span>
                                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide border ${donation.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200/70" : "bg-blue-50 text-blue-700 border-blue-200/70"
                                    }`}>
                                    {donation.status === "completed" ? "Completed" : "Pending Pickup"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── MAIN ZONE (25% / 75% SPLIT) ─── */}
                <div className="flex flex-1 overflow-hidden min-h-0 bg-slate-50/20">

                    {/* SIDEBAR (ซ้าย 25%) */}
                    <div className="flex-[0_0_25%] border-r border-slate-200/50 bg-white p-6 flex flex-col shrink-0 overflow-y-auto hidden lg:flex shadow-[2px_0_12px_rgba(0,0,0,0.015)]">
                        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                            <h3 className="font-extrabold text-[12px] uppercase tracking-wider text-slate-400">
                                Pickup Information
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <div className={`relative overflow-hidden border rounded-xl p-4 ${categoryStyle}`}>

                                <div
                                    className={`absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-70 ${donation?.category === "Food Sharing"
                                        ? "bg-emerald-100"
                                        : donation?.category === "Animal Food"
                                            ? "bg-orange-100"
                                            : "bg-lime-100"
                                        }`}
                                />

                                <div className="relative z-10">
                                    <h2 className="font-bold text-lg text-slate-800">
                                        {donation?.title}
                                    </h2>

                                    <p className="text-sm text-slate-500 mt-1">
                                        {donation?.description}
                                    </p>
                                </div>

                            </div>

                            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-4">
                                    Pickup Info
                                </p>
                                <div className="space-y-3.5 text-sm">
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span className="font-medium">📦 Quantity</span>
                                        <span className="font-bold text-slate-800 text-base">
                                            {donation?.quantity}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span className="font-medium">🗓️ Exp</span>
                                        <span className="font-bold text-slate-800">
                                            {formatDate(donation?.expDate)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span className="font-medium">⏰ Pickup</span>
                                        <span className="font-bold text-slate-800">
                                            {formatTime(donation?.pickupTime)} - {formatTime(donation?.pickupEndTime)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                                    Pickup Location
                                </p>
                                <p className="font-semibold text-sm text-slate-700 mt-3 leading-relaxed">
                                    📍 {donation?.pickupLocation}
                                </p>
                            </div>

                            <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-4">
                                    Pickup Map
                                </p>
                                <div
                                    className="h-[250px] rounded-xl overflow-hidden"
                                    onWheel={(e) => e.stopPropagation()}
                                >
                                    {donation?.latitude && donation?.longitude ? (
                                        <MapContainer
                                            center={[donation.latitude, donation.longitude]}
                                            zoom={16}
                                            scrollWheelZoom={true}
                                            dragging={true}
                                            className="h-full w-full"
                                        >
                                            <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                            <Marker position={[donation.latitude, donation.longitude]}><Popup>{donation.pickupLocation}</Popup></Marker>
                                        </MapContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-slate-400 font-medium text-sm bg-slate-50">No map data</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CHAT AREA (ขวา 75%) */}
                    <div className="flex-[0_0_75%] flex flex-col min-h-0 bg-slate-50/10 relative">

                        {/* MESSAGES LIST */}
                        <div
                            ref={messagesContainerRef}
                            onClick={() => setActiveMenuId(null)}
                            onScroll={() => {
                                const container = messagesContainerRef.current;
                                if (!container) return;
                                shouldAutoScrollRef.current = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
                            }}
                            className="flex-1 overflow-y-auto px-10 py-8 space-y-5 bg-gradient-to-b from-white/30 to-white min-h-0"
                        >
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
                                    <div className="w-16 h-16 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">💬</div>
                                    <p className="text-sm font-semibold tracking-tight text-slate-500">No messages yet. Send a wave to start!</p>
                                </div>
                            )}
                            {messages.map((msg, index) => {
                                if (msg.sender === "system") {
                                    return (
                                        <div key={msg.id || index} className="flex justify-center my-3">
                                            <span className="bg-slate-100 text-slate-500 text-[11px] font-semibold px-3 py-1 rounded-full border border-slate-200/40 shadow-inner">
                                                {msg.text}
                                            </span>
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

                        {/* BOTTOM ACTIONS ZONE */}
                        <div className="shrink-0 bg-white border-t border-slate-200/60 shadow-[0_-4px_16px_rgba(0,0,0,0.015)] z-10 w-full">

                            {/* STATUS PANEL */}
                            <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-100">
                                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                                    <div className="flex items-center gap-3.5">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${donation.status === "completed" ? "bg-emerald-50 text-emerald-500 border-emerald-100" : "bg-blue-50 text-blue-500 border-blue-100"}`}>
                                            <CheckCircle2 size={19} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-extrabold text-slate-800">Donation Status Process</p>
                                            <p className="text-[11px] text-slate-400 font-semibold">Please verify once handover is fully completed.</p>
                                        </div>
                                    </div>
                                    <button
                                        disabled={donation.status === "completed" || (isOwner && donation.ownerConfirmed) || (isReceiver && donation.receiverConfirmed) || isSending}
                                        onClick={() => {
                                            if (isOwner) completeDonation(donation._id || donation.id, "owner");
                                            if (isReceiver) completeDonation(donation._id || donation.id, "receiver");
                                            toast.success("Donation updated ✅");
                                            setTimeout(() => {
                                                if (isOwner) navigate("/mydonations");
                                                else navigate("/received");
                                            }, 800);
                                        }}
                                        className={`px-5 py-2.5 rounded-lg font-extrabold text-xs tracking-wide transition-all shadow-sm active:scale-[0.98] ${donation.status === "completed"
                                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200/70"
                                            : donation.ownerConfirmed || donation.receiverConfirmed
                                                ? "bg-yellow-100 text-yellow-700 border border-yellow-200 animate-pulse"
                                                : "bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                                            }`}
                                    >
                                        {donation.status === "completed"
                                            ? "Completed ✅"
                                            : isOwner && donation.ownerConfirmed
                                                ? "Waiting Receiver"
                                                : isReceiver && donation.receiverConfirmed
                                                    ? "Waiting Owner"
                                                    : isOwner
                                                        ? "Mark Completed"
                                                        : "Confirm Received"}
                                    </button>
                                </div>
                            </div>

                            {/* REPLY / EDIT INDICATOR BANNER */}
                            {
                                (editingMessage || replyingTo) && (
                                    <div className="mx-8 my-2 px-4 py-3 rounded-lg border border-slate-200/80 bg-slate-50 flex items-center justify-between shadow-inner">
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                                                {editingMessage ? "Editing active message" : "Replying to message"}
                                            </span>
                                            <span className="text-xs text-slate-600 truncate max-w-[500px] font-semibold mt-0.5">
                                                {editingMessage ? editingMessage.text : (replyingTo.text || "📷 Photo")}
                                            </span>
                                        </div>
                                        <button onClick={handleCancelAll} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-200/80 hover:bg-slate-200 text-slate-500 text-[11px] transition">✕</button>
                                    </div>
                                )
                            }

                            {/* CHAT INPUT CONTAINER */}
                            <div className="px-6 py-4 bg-white">
                                <ChatInput
                                    text={text}
                                    setText={setText}
                                    imagePreviews={imagePreviews}
                                    removeImage={removeImage}
                                    sendMessage={sendMessage}
                                    textareaRef={textareaRef}
                                    fileInputRef={fileInputRef}
                                    handleInput={handleInput}
                                    handleImageSelect={handleImageSelect}
                                    editingMessage={editingMessage}
                                    disabled={donation?.status === "completed" || isSending}
                                />
                            </div>
                        </div>

                    </div>
                </div>

                {/* IMAGE PREVIEW MODAL */}
                {
                    previewImage && (
                        <div
                            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all"
                            onClick={() => setPreviewImage(null)}
                        >
                            <img
                                src={previewImage}
                                onClick={(e) => e.stopPropagation()}
                                alt="preview"
                                className="max-w-[90%] max-h-[90%] rounded-xl shadow-2xl border-4 border-white"
                            />
                        </div>
                    )
                }

            </div>
        </div>
    );
}