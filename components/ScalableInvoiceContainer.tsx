"use client";

import React, { useLayoutEffect, useState, useRef } from 'react';
import { getRootFontSize, toRem } from '@/lib/css-units';

interface ScalableInvoiceContainerProps {
    children: React.ReactNode;
    baseWidth?: number; // The width at which the content is designed in CSS pixels.
    className?: string;
}

const ScalableInvoiceContainer: React.FC<ScalableInvoiceContainerProps> = ({
    children,
    baseWidth = 794,
    className = ''
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [containerHeight, setContainerHeight] = useState('auto');
    const baseWidthInRem = baseWidth / 16;

    useLayoutEffect(() => {
        const handleResize = () => {
            if (!containerRef.current || !contentRef.current) return;

            const rootFontSize = getRootFontSize();
            const parentWidth = containerRef.current.parentElement?.clientWidth || window.innerWidth;
            const availableWidth = Math.min(parentWidth, window.innerWidth - rootFontSize * 2);
            const baseWidthInPx = baseWidthInRem * rootFontSize;

            // Only scale down, never up above 1
            const newScale = Math.min(availableWidth / baseWidthInPx, 1);
            setScale((prev) => (Math.abs(prev - newScale) > 0.001 ? newScale : prev));

            const childHeight = contentRef.current.scrollHeight;
            const nextHeight = toRem(childHeight * newScale, rootFontSize);
            setContainerHeight((prev) => (prev !== nextHeight ? nextHeight : prev));
        };

        handleResize();

        const resizeObserver = new ResizeObserver(handleResize);
        if (containerRef.current?.parentElement) {
            resizeObserver.observe(containerRef.current.parentElement);
        }
        if (contentRef.current) {
            resizeObserver.observe(contentRef.current);
        }

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            resizeObserver.disconnect();
        };
    }, [baseWidthInRem]);

    return (
        <div
            ref={containerRef}
            className={`relative origin-top-left ${className}`}
            style={{
                width: '100%',
                height: containerHeight,
                display: 'flex',
                justifyContent: 'center', // Center content if scaled down or strictly rely on transform origin
            }}
        >
            <div
                ref={contentRef}
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center', // Scale from top center to keep it centered
                    width: `${baseWidthInRem}rem`, // Keep preview width aligned with the root font-size scale
                    flexShrink: 0 // Prevent flexbox from squishing it
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default ScalableInvoiceContainer;
