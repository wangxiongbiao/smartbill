'use client';

import React, { useEffect, useRef, useState } from 'react';

interface EditableDateValueProps {
  value: string;
  className?: string;
  inputClassName?: string;
  editable?: boolean;
  onChange?: (value: string) => void;
}

export default function EditableDateValue({ value, className = '', inputClassName = '', editable = false, onChange }: EditableDateValueProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!editing) setDraft(value || '');
  }, [value, editing]);

  useEffect(() => {
    if (!editing || !inputRef.current) return;
    inputRef.current.focus();
    try {
      inputRef.current.showPicker?.();
    } catch {}
  }, [editing]);

  const commit = (next = draft) => {
    setEditing(false);
    if (next !== value) onChange?.(next);
  };

  if (!editable) return <span className={className}>{value}</span>;

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="date"
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          commit(e.target.value);
        }}
        onBlur={() => commit()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setDraft(value || '');
            setEditing(false);
          }
        }}
        className={`${inputClassName || className} bg-white/95 border border-blue-300 rounded-md px-2 py-1 outline-none ring-2 ring-blue-100`.trim()}
      />
    );
  }

  return <span className={`${className} cursor-pointer hover:bg-blue-50/70 rounded-md transition-colors px-1 -mx-1`.trim()} onClick={() => setEditing(true)}>{value}</span>;
}
