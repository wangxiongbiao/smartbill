
import React, { useState, useRef, useEffect } from 'react';
import { Invoice, Language } from '../types';
import { translations } from '../i18n';
import { chatWithDeepSeek } from '../services/deepseekService';
import { getRootFontSize, toRem } from '@/lib/css-units';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

interface AIChatProps {
    currentInvoice: Invoice;
    onUpdateInvoice: (updates: Partial<Invoice>) => void;
    lang: Language;
    onClose?: () => void;
}

const AIChat: React.FC<AIChatProps> = ({ currentInvoice, onUpdateInvoice, lang, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: translations[lang]?.aiWelcome || translations['en'].aiWelcome,
            timestamp: Date.now()
        }
    ]);

    // Update welcome message when language changes
    useEffect(() => {
        const welcomeMsg = translations[lang]?.aiWelcome || translations['en'].aiWelcome;
        if (messages.length > 0 && messages[0].id === 'welcome') {
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[0] = {
                    ...newMessages[0],
                    content: welcomeMsg
                };
                return newMessages;
            });
        }
    }, [lang]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const t = translations[lang] || translations['en'];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const resizeComposer = (textarea: HTMLTextAreaElement) => {
        textarea.style.height = 'auto';
        textarea.style.height = toRem(Math.min(textarea.scrollHeight, 100), getRootFontSize());
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);



        try {
            // Prepare history for AI
            // Convert internal Message to API expected format
            const history = messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await chatWithDeepSeek(input, history, currentInvoice);

            const aiMsg: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: response.reply,
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, aiMsg]);

            // Apply updates if any
            if (response.invoice_updates) {
                onUpdateInvoice(response.invoice_updates);
            }

        } catch (error) {
            console.error("Chat error:", error);
            const errorMsg: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: t.aiError || translations['en'].aiError,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 h-full">
            {/* Compact Header */}
            <div className="bg-[linear-gradient(90deg,#2563eb_0%,#60a5fa_100%)] px-4 py-3 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                        <i className="fas fa-sparkles text-yellow-300 text-xs"></i>
                    </div>
                    <div>
                        <h3 className="font-semibold text-[0.875rem]">{t.aiHeaderTitle}</h3>
                        <p className="text-[0.75rem] text-white/60">{t.aiHeaderSub}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="text-[0.5625rem] text-white/60">{t.aiStatusOnline}</span>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all text-white/90 hover:text-white"
                        >
                            <i className="fas fa-times text-xs"></i>
                        </button>
                    )}
                </div>
            </div>

            {/* Compact Messages Area - 自动填充剩余空间 */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
                {messages.slice(-3).map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[90%] rounded-lg p-2 text-xs shadow-sm whitespace-pre-line ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start w-full">
                        <div className="bg-white border border-slate-100 rounded-lg rounded-bl-none p-2 shadow-sm flex items-center gap-1 h-7 w-12 justify-center">
                            <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Single-line Input */}
            <div className="p-2 bg-white border-t border-slate-100 shrink-0">
                <div className="flex items-end gap-2 bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
                    <textarea
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            resizeComposer(e.target);
                        }}
                        onKeyDown={handleKeyPress}
                        placeholder={t.aiPlaceholderInput}
                        rows={1}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 text-slate-700 placeholder:text-slate-400 resize-none max-h-[6.25rem] scrollbar-hide"
                        style={{ minHeight: '2.25rem' }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className={`w-8 h-8 mb-0.5 rounded-md flex items-center justify-center transition-all shrink-0 ${input.trim()
                            ? 'bg-blue-600 text-white shadow-[0_0.75rem_1.5rem_-1.125rem_rgba(37,99,235,0.52)] hover:bg-blue-700 active:scale-95'
                            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        <i className="fas fa-paper-plane text-xs"></i>
                    </button>
                </div>
                {/* <p className="text-[0.5625rem] text-slate-400 text-center mt-1">Powered by DeepSeek V3</p> */}
            </div>
        </div>
    );
};

export default AIChat;
