import { MoreHorizontal, Reply, Pencil, Undo2, } from "lucide-react";

import { useState } from "react";

const ChatBubble = ({ msg, isOwnMessage, setPreviewImage, activeMenuId, setActiveMenuId, setReplyingTo, setEditingMessage, setText, unsendMessage, }) => {
    const hasImages = msg.images && msg.images.length > 0;

    return (
        <div
            className={`flex mb-3 ${isOwnMessage ? "justify-end" : "justify-start"
                }`}
        >
            <div className="max-w-[75%] flex flex-col relative group">


                {activeMenuId !== msg.id && (
                    <div
                        className={`
                            absolute top-1/2 -translate-y-1/2
                            ${isOwnMessage ? "-left-20" : "-right-20"}
                            transition
                            flex items-center gap-1
                        `}
                    >

                        {/* MENU */}
                        <div className="relative group/more">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();

                                    setActiveMenuId(
                                        activeMenuId === msg.id
                                            ? null
                                            : msg.id
                                    );
                                }}
                                className="w-8 h-8 rounded-full bg-white shadow-sm hover:bg-gray-100 flex items-center justify-center"
                            >
                                <MoreHorizontal size={18} />
                            </button>

                            <div
                                className="
                                absolute top-full mt-2 left-1/2 -translate-x-1/2
                                px-3 py-1.5 rounded-xl
                                bg-[#1f1f1f] text-white text-xs
                                opacity-0 group-hover/more:opacity-100
                                transition pointer-events-none
                                whitespace-nowrap"
                            >
                                More
                            </div>
                        </div>

                        {/* REPLY */}
                        <div className="relative group/reply">

                            <button
                                onClick={() => setReplyingTo(msg)}
                                className="w-8 h-8 rounded-full bg-white shadow-sm hover:bg-gray-100 flex items-center justify-center"
                            >
                                <Reply size={16} />
                            </button>

                            <div
                                className="
                                    absolute top-full mt-2 left-1/2 -translate-x-1/2
                                    px-3 py-1.5 rounded-xl
                                    bg-[#1f1f1f] text-white text-xs
                                    opacity-0 group-hover/reply:opacity-100
                                    transition pointer-events-none
                                    whitespace-nowrap"
                            >
                                Reply
                            </div>

                        </div>

                    </div>
                )}

                {activeMenuId === msg.id && (
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className={`
                            absolute top-1/2 -translate-y-1/2
                            ${isOwnMessage ? "-left-48" : "-right-48"}
                            w-44
                            rounded-3xl
                            bg-[#1f1f1f]
                            text-white
                            shadow-2xl
                            overflow-hidden
                            border border-white/10
                            backdrop-blur-xl
                            z-20
                        `}
                    >

                        <button
                            onClick={() => {
                                setEditingMessage(msg);
                                setText(msg.text);
                                setActiveMenuId(null);
                            }}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition text-sm"
                        >
                            Edit
                            <Pencil size={16} />
                        </button>

                        <button
                            onClick={() => {
                                unsendMessage(msg.id);
                                setActiveMenuId(null);
                            }}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-red-500/10 transition text-sm text-red-400"
                        >
                            Unsend
                            <Undo2 size={16} />
                        </button>

                    </div>
                )}

                {/* TEXT */}
                {(msg.text || msg.replyTo) && (
                    <div
                        className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm break-words whitespace-pre-wrap mb-1
                                ${isOwnMessage
                                ? "bg-emerald-500 text-white rounded-br-md"
                                : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                            }
                        `}
                    >

                        {msg.replyTo && (
                            <div
                                className={`
                                mb-2 px-3 py-2 rounded-xl border-l-4 text-xs
                                    ${isOwnMessage
                                        ? "bg-white/20 border-white/40 text-white"
                                        : "bg-gray-100 border-gray-300 text-gray-700"
                                    }
                                `}
                            >
                                <p className="font-semibold mb-1">
                                    Reply
                                </p>

                                <p className="line-clamp-2 break-words">
                                    {msg.replyTo.text || "Photo"}
                                </p>
                            </div>
                        )}

                        {msg.text}

                    </div>
                )}

                {/* IMAGES */}
                {hasImages && (
                    <div
                        className={`overflow-hidden rounded-3xl grid gap-[2px] bg-transparent
                            ${msg.images.length === 1
                                ? "grid-cols-1"
                                : "grid-cols-2"
                            }
                        `}
                    >
                        {msg.images.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt="sent"
                                onClick={() => setPreviewImage(image)}
                                className="w-full h-[180px] object-cover cursor-pointer hover:opacity-95 transition"
                            />
                        ))}
                    </div>
                )}

                {/* TIME */}
                <div
                    className={`
                        text-[10px]
                        text-gray-400
                        mt-1
                        px-1
                        ${isOwnMessage ? "text-right" : "text-left"
                        }
                    `}
                >
                    {msg.edited && "Edited • "} {msg.time}
                </div>
            </div>
        </div>
    );
};

export default ChatBubble;

