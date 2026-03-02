'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ImageType } from '@/types/invoice';
import { X, Loader2, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';

interface ImagePickerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    imageType: ImageType;
    onSelect: (imageData: string) => void;
    currentUserId: string;
    showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const ImagePickerDialog: React.FC<ImagePickerDialogProps> = ({
    isOpen,
    onClose,
    imageType,
    onSelect,
    currentUserId,
    showToast
}) => {
    const [historyImages, setHistoryImages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load history images from localStorage (Mock Mode)
    useEffect(() => {
        if (isOpen) {
            loadHistoryImages();
        }
    }, [isOpen, imageType]);

    const loadHistoryImages = () => {
        setIsLoading(true);
        try {
            const key = `smartbill_image_history_${imageType}`;
            const stored = localStorage.getItem(key);
            const images = stored ? JSON.parse(stored) : [];
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

        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const imageData = reader.result as string;

                // Save to localStorage (Mock Mode)
                const key = `smartbill_image_history_${imageType}`;
                const stored = localStorage.getItem(key);
                const images = stored ? JSON.parse(stored) : [];
                const newImage = {
                    id: nanoid(),
                    image_data: imageData,
                    file_name: file.name,
                    file_size: file.size,
                    created_at: new Date().toISOString()
                };
                localStorage.setItem(key, JSON.stringify([newImage, ...images]));

                // Select the newly uploaded image
                onSelect(imageData);

                // Reload history
                loadHistoryImages();

                // Close dialog
                onClose();
            } catch (error) {
                console.error('Error uploading image:', error);
                showToast?.('上传失败', 'error');
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };

        reader.onerror = () => {
            console.error('Error reading file');
            showToast?.('读取文件失败', 'error');
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };

        reader.readAsDataURL(file);
    };

    const handleSelectImage = (imageData: string) => {
        onSelect(imageData);
        onClose();
    };

    const handleDeleteImage = (uploadId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        setDeletingId(uploadId);
        try {
            const key = `smartbill_image_history_${imageType}`;
            const stored = localStorage.getItem(key);
            if (stored) {
                const images = JSON.parse(stored);
                const filtered = images.filter((img: any) => img.id !== uploadId);
                localStorage.setItem(key, JSON.stringify(filtered));
                setHistoryImages(filtered);
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            showToast?.('删除失败', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    if (!isOpen) return null;

    const dialogTitle = imageType === 'logo' ? '选择 LOGO' : '选择二维码';

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800">{dialogTitle}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                    >
                        <X className="w-6 h-6" />
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
                            className={`block w-full py-4 px-6 bg-linear-to-r from-blue-500 to-blue-600 text-white text-center rounded-xl font-semibold cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg ${isUploading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {isUploading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    正在上传...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Upload className="w-5 h-5" />
                                    上传新图片
                                </span>
                            )}
                        </label>
                    </div>

                    {/* History Section */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                            从历史记录选择
                        </h3>

                        {isLoading ? (
                            <div className="text-center py-12 text-slate-300">
                                <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 opacity-20" />
                                <p className="text-sm font-medium">正在加载历史记录...</p>
                            </div>
                        ) : historyImages.length === 0 ? (
                            <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <ImageIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-sm font-medium text-slate-400">暂无历史记录</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {historyImages.map((img) => (
                                    <div
                                        key={img.id}
                                        className="relative group cursor-pointer bg-white rounded-xl overflow-hidden border-2 border-slate-100 hover:border-blue-500 transition-all shadow-sm hover:shadow-md h-40"
                                        onClick={() => handleSelectImage(img.image_data)}
                                    >
                                        <div className="w-full h-full p-4 flex items-center justify-center">
                                            <img
                                                src={img.image_data}
                                                alt={img.file_name || 'Uploaded image'}
                                                className="max-w-full max-h-full object-contain"
                                            />

                                            <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-all flex items-center justify-center">
                                                <span className="text-white font-bold opacity-0 group-hover:opacity-100 transition-all bg-blue-600 px-4 py-2 rounded-full text-xs shadow-lg transform translate-y-2 group-hover:translate-y-0">
                                                    点击选择
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => handleDeleteImage(img.id, e)}
                                            disabled={deletingId === img.id}
                                            className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-red-500 w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-600 flex items-center justify-center shadow-lg border border-red-100"
                                            title="删除图片"
                                        >
                                            {deletingId === img.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>

                                        {img.file_name && (
                                            <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-white/90 backdrop-blur-sm border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-[10px] text-slate-400 truncate text-center px-2">
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
                <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-slate-50/30">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-slate-500 hover:text-slate-800 font-bold transition-colors"
                    >
                        取消
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImagePickerDialog;
