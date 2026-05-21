const ImagePreview = ({
    selectedImages,
    removeImage,
}) => {
    if (selectedImages.length === 0) return null;

    return (
        <div className="flex gap-2 mb-2 flex-wrap">
            {selectedImages.map((image, index) => (
                <div
                    key={index}
                    className="relative overflow-visible"
                >
                    <img
                        src={image}
                        alt="preview"
                        className="
                            w-20
                            h-20
                            object-cover
                            rounded-2xl
                        "
                    />

                    <button
                        onClick={() => removeImage(index)}
                        className="
                            absolute
                            -top-2
                            -right-2
                            w-5
                            h-5
                            rounded-full
                            bg-black/80
                            text-white
                            text-xs
                            flex
                            items-center
                            justify-center
                            z-50
                        "
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ImagePreview;
