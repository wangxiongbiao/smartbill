import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface CurrencyConfig {
    code: string;
    symbol: string;
    label: string;
    flag: string;
}

export const CURRENCY_REGIONS = [
    {
        name: '亞洲',
        currencies: [
            { code: 'CNY', symbol: '¥', label: '中國', flag: '🇨🇳' },
            { code: 'JPY', symbol: '¥', label: '日本', flag: '🇯🇵' },
            { code: 'HKD', symbol: '$', label: '中國香港', flag: '🇭🇰' },
            { code: 'TWD', symbol: '$', label: '中國台灣', flag: '🇹🇼' }, // Using Taiwan flag emoji
            { code: 'KRW', symbol: '₩', label: '韓國', flag: '🇰🇷' },
        ]
    },
    {
        name: '東南亞',
        currencies: [
            { code: 'SGD', symbol: '$', label: '新加坡', flag: '🇸🇬' },
            { code: 'MYR', symbol: 'RM', label: '馬來西亞', flag: '🇲🇾' },
            { code: 'THB', symbol: '฿', label: '泰國', flag: '🇹🇭' },
            { code: 'PHP', symbol: '₱', label: '菲律賓', flag: '🇵🇭' },
            { code: 'VND', symbol: '₫', label: '越南', flag: '🇻🇳' },
            { code: 'IDR', symbol: 'Rp', label: '印尼', flag: '🇮🇩' },
        ]
    },
    {
        name: '北美洲',
        currencies: [
            { code: 'USD', symbol: '$', label: '美國', flag: '🇺🇸' },
        ]
    },
    {
        name: '歐洲',
        currencies: [
            { code: 'EUR', symbol: '€', label: '歐盟', flag: '🇪🇺' },
            { code: 'GBP', symbol: '£', label: '英國', flag: '🇬🇧' },
        ]
    },
    {
        name: '大洋洲',
        currencies: [
            { code: 'AUD', symbol: '$', label: '澳大利亞', flag: '🇦🇺' },
            { code: 'NZD', symbol: '$', label: '新西蘭', flag: '🇳🇿' },
        ]
    }
];

export const getCurrencyDetails = (code: string): CurrencyConfig => {
    for (const region of CURRENCY_REGIONS) {
        const found = region.currencies.find(c => c.code === code);
        if (found) return found;
    }
    return { code, symbol: '', label: '', flag: '🌍' }; // Default fallback
};

interface CurrencySelectorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedCurrency = getCurrencyDetails(value);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 bg-slate-50 border h-[48px] rounded-2xl flex items-center justify-between transition-all font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white cursor-pointer
                    ${isOpen ? 'border-blue-500 ring-4 ring-blue-500/10 bg-white shadow-sm' : 'border-slate-200 hover:border-blue-400 hover:shadow-sm'}`}
            >
                <div className="flex items-center gap-3">
                    <span className="text-xl leading-none drop-shadow-sm">{selectedCurrency.flag}</span>
                    <span className="text-slate-800 font-bold flex items-center">{selectedCurrency.code} <span className="text-slate-400 font-normal ml-2 border-l border-slate-200 pl-2">{selectedCurrency.symbol}</span></span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180 text-blue-500' : 'text-slate-400'}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full sm:w-auto sm:min-w-[340px] left-0 sm:left-auto right-0 origin-top-right mt-2 bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-3xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] max-h-[420px] overflow-y-auto py-3 custom-scrollbar animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 ring-1 ring-slate-900/5">
                    {CURRENCY_REGIONS.map((region, idx) => (
                        <div key={region.name} className={idx > 0 ? 'mt-4' : ''}>
                            {/* Section Header */}
                            <div className="px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                {region.name}
                            </div>

                            {/* Items */}
                            <div className="px-2 space-y-0.5 mt-1">
                                {region.currencies.map(currency => {
                                    const isSelected = currency.code === value;
                                    return (
                                        <button
                                            key={currency.code}
                                            type="button"
                                            onClick={() => {
                                                onChange(currency.code);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all text-left cursor-pointer group relative overflow-hidden
                                                ${isSelected
                                                    ? 'bg-blue-50/80 text-blue-700'
                                                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                                }`}
                                        >
                                            {/* Flag */}
                                            <span className="text-2xl leading-none mr-3 shrink-0 drop-shadow-sm transition-transform group-hover:scale-105">{currency.flag}</span>

                                            {/* Text */}
                                            <div className="flex-1 flex flex-col justify-center min-w-0">
                                                <div className="flex items-center justify-between w-full gap-2">
                                                    <span className={`font-bold text-[15px] ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                                                        {currency.code}
                                                    </span>

                                                </div>
                                                <span className={`text-[12px] truncate max-w-full mt-0.5 ${isSelected ? 'text-blue-600/70' : 'text-slate-400'}`}>
                                                    {currency.label}
                                                </span>
                                            </div>
                                            <span className={`text-[14px] font-medium min-w-[20px] text-right ${isSelected ? 'text-blue-600/80' : 'text-slate-400 group-hover:text-slate-500'}`}>
                                                {currency.symbol}
                                            </span>
                                            {/* Checkmark */}
                                            {isSelected && (
                                                <div className="ml-3 shrink-0 text-blue-600 bg-white rounded-full p-1 shadow-sm border border-blue-100">
                                                    <Check className="w-3 h-3" strokeWidth={3} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
