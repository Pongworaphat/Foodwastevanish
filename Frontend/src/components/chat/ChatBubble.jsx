import React from "react";
import { MoreHorizontal, Reply, Pencil, Undo2 } from "lucide-react";

const ChatBubble = ({
    msg,
    isOwnMessage,
    setPreviewImage,
    activeMenuId,
    setActiveMenuId,
    setReplyingTo,
    setEditingMessage,
    setText,
    unsendMessage,
}) => {
    const hasImages = msg.images && Array.isArray(msg.images) && msg.images.length > 0;

    return (
        <div className={`flex mb-3 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] flex flex-col relative group ${isOwnMessage ? "items-end" : "items-start"}`}>
                <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all flex items-center z-30 ${isOwnMessage ? "-left-10" : "-right-10"
                    }`}>
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === msg.id ? null : msg.id);
                            }}
                            id="premium3dot"
                            className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md border border-white shadow-md hover:scale-105 hover:bg-white transition-all flex items-center justify-center"
                        >
                            <MoreHorizontal size={14} />
                        </button>

                        {activeMenuId === msg.id && (
                            <div className={`absolute top-full mt-2 z-50 w-36 rounded-2xl border border-white/60 bg-white/85 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] p-2 text-sm animate-in fade-in zoom-in-95 duration-150 ${isOwnMessage ? "right-0" : "left-0"
                                }`}>
                                <button
                                    onClick={() => {
                                        setReplyingTo(msg);
                                        setActiveMenuId(null);
                                    }}
                                    className="w-full px-3 py-2.5 rounded-xl text-left hover:bg-emerald-50 flex items-center gap-2 text-slate-700 hover:text-emerald-700 transition-all font-medium"
                                >
                                    <Reply size={14} /> Reply
                                </button>
                                {isOwnMessage && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setEditingMessage(msg);
                                                setText(msg.text);
                                                setActiveMenuId(null);
                                            }}
                                            className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                                        >
                                            <Pencil size={14} /> Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                unsendMessage(msg.id);
                                                setActiveMenuId(null);
                                            }}
                                            className="w-full px-3 py-2.5 rounded-xl text-left hover:bg-red-50 flex items-center gap-2 text-red-500 transition-all font-medium"
                                        >
                                            <Undo2 size={14} /> Unsend
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ส่วนแสดงข้อความ Reply */}
                {msg.replyTo && (
                    <div className="bg-slate-100 rounded-t-2xl px-3 py-2 text-xs text-gray-500 mb-[-4px] border-l-2 border-emerald-500 max-w-full truncate opacity-90">
                        <span className="font-bold text-emerald-600 block text-[10px]">Replied to:</span>
                        {msg.replyTo.text || "📷 Photo"}
                    </div>
                )}

                {/* ส่วนแสดงเนื้อหาแชทหลัก */}
                {msg.text && (
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-6 break-words max-w-full shadow-sm ${isOwnMessage
                        ? "bg-emerald-500 text-white rounded-br-sm"
                        : "bg-[#f4f4f5] text-gray-800 rounded-bl-sm"
                        }`}>
                        {msg.text}
                    </div>
                )}

                {/* ส่วนแสดงรูปภาพแชท */}
                {hasImages && (
                    <div className={`mt-1 overflow-hidden rounded-2xl border bg-gray-100 ${msg.images.length > 1 ? "grid grid-cols-2 gap-1 w-[240px]" : "w-[200px]"
                        }`}>
                        {msg.images.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                onError={(e) => {
                                    e.target.src = "https://placehold.co/600x400?text=Image+Not+Found";
                                }}
                                alt="sent chat"
                                onClick={() => setPreviewImage(image)}
                                className="w-full h-[150px] object-cover cursor-pointer hover:opacity-90 transition"
                            />
                        ))}
                    </div>
                )}

                {/* TIME & STATUS */}
                <div className={`text-[10px] text-gray-400 mt-1 px-1 ${isOwnMessage ? "text-right" : "text-left"}`}>
                    {msg.edited && "Edited • "}
                    {msg.time}
                    {isOwnMessage && <span className="ml-1">• {msg.status}</span>}
                </div>
            </div>
        </div>
    );
};

export default ChatBubble;