'use client';

import React, { useEffect, useRef, useState } from 'react';

interface EditableNumberValueProps {
  value: string | number | undefined;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  editable?: boolean;
  emptyClassName?: string;
  onChange?: (value: string) => void;
}

export default function EditableNumberValue({
  value,
  placeholder,
  className = '',
  inputClassName = '',
  editable = false,
  emptyClassName = 'text-slate-300',
  onChange,
}: EditableNumberValueProps) {
  const normalized = value === undefined || value === null ? '' : String(value);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(normalized);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!editing) setDraft(normalized);
  }, [normalized, editing]);

  useEffect(() => {
    if (!editing || !inputRef.current) return;
    inputRef.current.focus();
    inputRef.current.select();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== normalized) onChange?.(draft);
  };

  const cancel = () => {
    setDraft(normalized);
    setEditing(false);
  };

  const handleChange = (next: string) => {
    if (/^-?\d*\.?\d*$/.test(next) || next === '') setDraft(next);
  };

  const displayValue = normalized || placeholder || '';

  if (!editable) return <span className={`${className} ${!normalized ? emptyClassName : ''}`.trim()}>{displayValue}</span>;

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={draft}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') cancel();
        }}
        className={`${inputClassName || className} w-full bg-white/95 border border-blue-300 rounded-md px-2 py-1 outline-none ring-2 ring-blue-100`.trim()}
      />
    );
  }

  return (
    <span className={`${className} ${!normalized ? emptyClassName : ''} cursor-text hover:bg-blue-50/70 rounded-md transition-colors px-1 -mx-1`.trim()} onClick={() => setEditing(true)}>
      {displayValue}
    </span>
  );
}
