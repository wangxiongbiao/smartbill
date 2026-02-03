import React from 'react';
import { ViewType, Language } from '../types';
import { translations } from '../i18n';

interface BreadcrumbsProps {
    activeView: ViewType;
    lang: Language;
    onNavigate?: (view: ViewType) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ activeView, lang, onNavigate }) => {
    const t = translations[lang];

    const getPath = () => {
        switch (activeView) {
            case 'home':
                return [{ label: t.home, view: 'home' }];
            case 'records':
                return [{ label: t.records, view: 'records' }];
            case 'editor':
                // Assuming editor starts from home or records context, but typically it's a "Create/Edit" action
                // We can show "Start Creating Invoice" (home) -> "Editor" or just "Records" -> "New Invoice"
                // Let's keep it simple: "Home > New Invoice"
                return [
                    { label: t.home, view: 'home' },
                    { label: t.newInvoice || 'Editor', view: 'editor' }
                ];
            case 'profile':
                return [{ label: t.profile, view: 'profile' }];
            case 'templates':
                return [{ label: t.templates, view: 'templates' }];
            case 'template-detail':
                return [
                    { label: t.templates, view: 'templates' },
                    { label: t.templateDetail || 'Detail', view: 'template-detail' }
                ];
            case 'about':
                return [{ label: t.aboutUs, view: 'about' }];
            case 'help':
                return [{ label: t.helpCenter, view: 'help' }];
            case 'login':
                return [{ label: t.login, view: 'login' }];
            default:
                // Handle any unknown views gracefully
                return [{ label: 'SmartBill', view: 'home' }];
        }
    };

    const path = getPath();

    if (path.length === 0) return null;

    return (
        <nav className="flex items-center text-sm font-medium text-slate-500 mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
                {/* We can optionally show a home icon at the root ALWAYS */}
                <li>
                    <button
                        onClick={() => onNavigate?.('home')}
                        className="hover:text-blue-600 transition-colors flex items-center"
                    >
                        <i className="fas fa-home text-slate-400 hover:text-blue-600"></i>
                    </button>
                </li>

                {path.map((item, index) => {
                    // If the first item is home, we might duplicate it if we also have the home icon.
                    // But let's check: if view is home, and index is 0, we can skip text label if we want, or keep it.
                    // The path usually starts with the current root section.
                    // If I click 'Records', path is just 'Records'.
                    // So: Home Icon > Records.

                    // If path[0].view is 'home', then we have Home Icon > Home (Text). That's a bit redundant.
                    // Let's adjust getPath to NOT include 'home' if it's the root, or handle it here.

                    if (item.view === 'home' && index === 0) return null;

                    return (
                        <React.Fragment key={index}>
                            <li>
                                <i className="fas fa-chevron-right text-[10px] text-slate-300 mx-1"></i>
                            </li>
                            <li>
                                <button
                                    onClick={() => item.view && onNavigate?.(item.view as ViewType)}
                                    disabled={index === path.length - 1}
                                    className={`transition-colors flex items-center gap-1 ${index === path.length - 1
                                            ? 'text-slate-800 font-bold cursor-default'
                                            : 'hover:text-blue-600'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            </li>
                        </React.Fragment>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
