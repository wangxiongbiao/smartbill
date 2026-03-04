'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Invoice } from '@/types/invoice';
import { Signature as SignatureIcon } from 'lucide-react';

interface SignatureSectionProps {
    invoice: Invoice;
    onChange: (updates: Partial<Invoice>) => void;
}

const SignatureSection: React.FC<SignatureSectionProps> = ({
    invoice,
    onChange
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = '#1e293b';
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }
        }
    }, [invoice.visibility?.signature]);

    const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }
        return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const { x, y } = getCanvasCoordinates(e, canvas);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const { x, y } = getCanvasCoordinates(e, canvas);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            onChange({ sender: { ...invoice.sender, signature: canvas.toDataURL() } });
        }
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            onChange({ sender: { ...invoice.sender, signature: undefined } });
        }
    };

    return (
        <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xs font-black tracking-widest text-slate-400">電子簽名</h3>
                        <button
                            onClick={() => onChange({ visibility: { ...invoice.visibility, signature: !invoice.visibility?.signature } })}
                            className={`flex items-center justify-center w-9 h-5 rounded-full transition-all relative ${invoice.visibility?.signature ? 'bg-blue-600' : 'bg-slate-300'}`}
                        >
                            <div className={`absolute w-4 h-4 bg-white rounded-full shadow-sm transition-all ${invoice.visibility?.signature ? 'right-0.5' : 'left-0.5'}`} />
                        </button>
                    </div>
                    {invoice.visibility?.signature && (
                        <div className="flex gap-4">
                            <button onClick={clearSignature} className="text-[10px] font-black tracking-widest text-blue-600 hover:text-blue-700 transition-colors">清除簽名</button>
                        </div>
                    )}
                </div>

                {invoice.visibility?.signature && (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl overflow-hidden relative group/sig animate-in slide-in-from-top-2 duration-300">
                        <canvas
                            ref={canvasRef}
                            width={800}
                            height={320}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="w-full h-[160px] cursor-crosshair touch-none bg-white/20"
                        />
                        {!invoice.sender.signature && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-300">
                                <SignatureIcon className="w-8 h-8 mb-2 opacity-20" />
                                <span className="text-xs font-bold tracking-widest">在此区域签名</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SignatureSection;
