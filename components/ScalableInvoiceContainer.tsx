"use client";

import React, { useEffect, useState, useRef } from 'react';

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
    const [scale, setScale] = useState(1);
    const [containerHeight, setContainerHeight] = useState('auto');
    const baseWidthInRem = baseWidth / 16;

    useEffect(() => {
        const getRootFontSize = () => {
            const rootFontSize = Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize);
            return Number.isFinite(rootFontSize) ? rootFontSize : 16;
        };

        const handleResize = () => {
            if (!containerRef.current) return;

            const rootFontSize = getRootFontSize();
            const parentWidth = containerRef.current.parentElement?.clientWidth || window.innerWidth;
            const availableWidth = Math.min(parentWidth, window.innerWidth - rootFontSize * 2);
            const baseWidthInPx = baseWidthInRem * rootFontSize;

            // Only scale down, never up above 1
            const newScale = Math.min(availableWidth / baseWidthInPx, 1);

            setScale(newScale);

            // Adjust height because transform: scale doesn't affect flow layout height
            // We need to reserve exactly enough space for the scaled content
            if (containerRef.current.firstElementChild) {
                const childHeight = containerRef.current.firstElementChild.scrollHeight;
                setContainerHeight(`${childHeight * newScale}px`);
            }
        };

        // Initial calculation
        handleResize();

        // Use ResizeObserver for more robust size tracking than window 'resize'
        const resizeObserver = new ResizeObserver(handleResize);
        if (containerRef.current?.parentElement) {
            resizeObserver.observe(containerRef.current.parentElement);
        }

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            resizeObserver.disconnect();
        };
    }, [baseWidth, children]);

    return (
        <div
            ref={containerRef}
            className={`relative origin-top-left transition-all duration-200 ${className}`}
            style={{
                width: '100%',
                height: containerHeight,
                display: 'flex',
                justifyContent: 'center', // Center content if scaled down or strictly rely on transform origin
            }}
        >
            <div style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top center', // Scale from top center to keep it centered
                width: `${baseWidthInRem}rem`, // Keep preview width aligned with the root font-size scale
                flexShrink: 0 // Prevent flexbox from squishing it
            }}>
                {children}
            </div>
        </div>
    );
};

export default ScalableInvoiceContainer;
