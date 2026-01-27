import React, { useState, useEffect, useRef } from 'react';
import { ImageType, Language } from '../types';
import { getUserImageUploads, saveImageUpload, deleteImageUpload } from '../lib/supabase-images';
import { translations } from '../i18n';

interface ImagePickerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    imageType: ImageType;
    onSelect: (imageData: string) => void;
    currentUserId: string;
    lang: Language;
}

const ImagePickerDialog: React.FC<ImagePickerDialogProps> = ({
    isOpen,
    onClose,
    imageType,
    onSelect,
    currentUserId,
    lang
}) => {
    const [historyImages, setHistoryImages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const t = translations[lang] || translations['en'];

    // Load history images
    useEffect(() => {
        if (isOpen && currentUserId) {
            loadHistoryImages();
        }
    }, [isOpen, currentUserId, imageType]);

    const loadHistoryImages = async () => {
        setIsLoading(true);
        try {
            const images = await getUserImageUploads(currentUserId, imageType);
            setHistoryImages(images);
        } catch (error) {
            console.error('Error loading history images:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const imageData = reader.result as string;

                // Save to database
                await saveImageUpload(
                    currentUserId,
                    imageType,
                    imageData,
                    file.name,
                    file.size
                );

                // Select the newly uploaded image
                onSelect(imageData);

                // Reload history
                await loadHistoryImages();

                // Close dialog
                onClose();
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSelectImage = (imageData: string) => {
        onSelect(imageData);
        onClose();
    };

    const handleDeleteImage = async (uploadId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!confirm(t.deleteImageConfirm)) return;

        setDeletingId(uploadId);
        try {
            await deleteImageUpload(uploadId);
            await loadHistoryImages();
        } catch (error) {
            console.error('Error deleting image:', error);
            alert('Failed to delete image');
        } finally {
            setDeletingId(null);
        }
    };

    if (!isOpen) return null;

    const dialogTitle = imageType === 'logo' ? t.imagePickerLogo : t.imagePickerQRCode;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">{dialogTitle}</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Upload Section */}
                    <div className="space-y-3">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="image-picker-upload"
                        />
                        <label
                            htmlFor="image-picker-upload"
                            className={`block w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center rounded-xl font-semibold cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg ${isUploading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {isUploading ? (
                                <span>
                                    <i className="fas fa-spinner fa-spin mr-2"></i>
                                    {t.uploadingImage}
                                </span>
                            ) : (
                                <span>
                                    <i className="fas fa-upload mr-2"></i>
                                    {t.uploadNewImage}
                                </span>
                            )}
                        </label>
                    </div>

                    {/* History Section */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                            {t.selectFromHistory}
                        </h3>

                        {isLoading ? (
                            <div className="text-center py-12 text-slate-400">
                                <i className="fas fa-spinner fa-spin text-3xl mb-2"></i>
                                <p className="text-sm">{t.loadingHistory}</p>
                            </div>
                        ) : historyImages.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <i className="fas fa-image text-4xl mb-3 opacity-30"></i>
                                <p className="text-sm">{t.noHistoryImages}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {historyImages.map((img) => (
                                    <div
                                        key={img.id}
                                        className="relative group cursor-pointer bg-slate-50 rounded-lg overflow-hidden border-2 border-slate-200 hover:border-blue-500 transition-all hover:shadow-lg"
                                        onClick={() => handleSelectImage(img.image_data)}
                                    >
                                        {/* Image */}
                                        <div className="aspect-square relative">
                                            <img
                                                src={img.image_data}
                                                alt={img.file_name || 'Uploaded image'}
                                                className="w-full h-full object-contain p-2"
                                            />

                                            {/* Hover overlay */}
                                            <div className="absolute inset-0 bg-blue-500 bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                                                <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 px-3 py-1 rounded-full text-xs">
                                                    {t.clickToSelect}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Delete button */}
                                        <button
                                            onClick={(e) => handleDeleteImage(img.id, e)}
                                            disabled={deletingId === img.id}
                                            className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 flex items-center justify-center text-xs shadow-md"
                                            title={t.deleteImage}
                                        >
                                            {deletingId === img.id ? (
                                                <i className="fas fa-spinner fa-spin"></i>
                                            ) : (
                                                <i className="fas fa-trash"></i>
                                            )}
                                        </button>

                                        {/* File name (optional) */}
                                        {img.file_name && (
                                            <div className="px-2 py-1 bg-white border-t border-slate-200">
                                                <p className="text-xs text-slate-500 truncate" title={img.file_name}>
                                                    {img.file_name}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                    >
                        {t.copy === 'Copy' ? 'Cancel' : '取消'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImagePickerDialog;
