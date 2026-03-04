import React from 'react';

interface EditableTextProps {
    value: string;
    onChange: (val: string) => void;
    className?: string;
    type?: 'text' | 'number' | 'date' | 'textarea';
    placeholder?: string;
    multiline?: boolean;
}

const EditableText: React.FC<EditableTextProps> = ({
    value,
    onChange,
    className = "",
    type = 'text',
    placeholder,
    multiline
}) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const Component = multiline ? 'textarea' : 'input';
    const inputType = type === 'textarea' ? undefined : type;

    React.useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    if (!isEditing) {
        return (
            <div
                onClick={() => setIsEditing(true)}
                className={`cursor-pointer hover:bg-blue-50/50 rounded-sm transition-all p-0.5 -m-0.5 min-h-[1.5em] flex items-center ${className}`}
            >
                {value || (placeholder && <span className="text-slate-300 italic">{placeholder}</span>) || ' '}
            </div>
        );
    }

    return (
        <Component
            ref={inputRef as any}
            type={inputType}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !multiline) {
                    setIsEditing(false);
                }
            }}
            placeholder={placeholder}
            className={`bg-transparent border-none focus:ring-2 focus:ring-blue-500/20 rounded-sm outline-none p-0.5 -m-0.5 w-full ${className} ${multiline ? 'resize-none' : ''}`}
            rows={multiline ? 2 : undefined}
        />
    );
};

export default EditableText;
