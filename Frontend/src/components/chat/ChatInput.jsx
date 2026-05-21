import { Image } from "lucide-react";

const ChatInput = ({
    text,
    setText,
    selectedImages,
    setSelectedImages,
    sendMessage,
    textareaRef,
    fileInputRef,
    handleInput,
    handleImageSelect,
    editingMessage,
}) => {

    return (
        <div className="border-t p-4">

            <div className="flex items-end gap-3">

                {/* Upload */}
                <button
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500 shrink-0"
                    onClick={() => fileInputRef.current.click()}
                >
                    <Image size={22} />
                </button>

                <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    className="hidden"
                />

                {/* Input Box */}
                <div className="flex-1 bg-[#f4f4f5] rounded-3xl px-4 py-3 flex flex-col">

                    {/* Preview */}
                    {selectedImages.length > 0 && (
                        <div className="flex gap-2 mb-3 overflow-x-auto">

                            {selectedImages.map((image, index) => (

                                <div
                                    key={index}
                                    className="relative shrink-0"
                                >

                                    <img
                                        src={image}
                                        alt="preview"
                                        className="w-20 h-20 object-cover rounded-2xl"
                                    />

                                    <button
                                        onClick={() =>
                                            setSelectedImages((prev) =>
                                                prev.filter((_, i) => i !== index)
                                            )
                                        }
                                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#f8f8f8]/95 text-gray-800 flex items-center justify-center text-xs hover:bg-black transition z-10"

                                    >
                                        ✕
                                    </button>

                                </div>

                            ))}

                        </div>
                    )}

                    {/* Textarea */}
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={handleInput}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        placeholder="Message..."
                        rows={1}
                        className="w-full bg-transparent outline-none resize-none leading-6 min-h-[24px] max-h-[120px] overflow-auto text-sm text-gray-800 placeholder:text-gray-400"
                    />

                </div>

                {/* Send */}
                <button
                    onClick={sendMessage}
                    className="px-5 h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium shadow-sm transition shrink-0"
                >
                    {editingMessage ? "Save" : "Send"}
                </button>

            </div>

        </div>
    );
};

export default ChatInput;