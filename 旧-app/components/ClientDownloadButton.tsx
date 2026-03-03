
'use client';

import React from 'react';
import { Invoice } from '../types';

interface ClientDownloadButtonProps {
    invoice: Invoice;
    fileName: string;
    text: string;
}

const ClientDownloadButton: React.FC<ClientDownloadButtonProps> = ({ invoice, fileName, text }) => {
    const handleDownload = () => {
        window.print();
    };

    return (
        <button
            onClick={handleDownload}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all flex items-center gap-2 active:scale-95"
        >
            <i className="fas fa-download"></i>
            {text}
        </button>
    );
};

export default ClientDownloadButton;
