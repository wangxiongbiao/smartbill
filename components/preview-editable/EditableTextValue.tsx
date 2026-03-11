'use client';

import React, { useEffect, useRef, useState } from 'react';

interface EditableTextValueProps {
  value: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  multiline?: boolean;
  editable?: boolean;
  emptyClassName?: string;
  onChange?: (value: string) => void;
}

export default function EditableTextValue({
  value,
  placeholder,
  className = '',
  inputClassName = '',
  multiline = false,
  editable = false,
  emptyClassName = 'text-slate-300',
  onChange,
}: EditableTextValueProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!editing) setDraft(value || '');
  }, [value, editing]);

  useEffect(() => {
    if (!editing || !inputRef.current) return;
    inputRef.current.focus();
    if ('select' in inputRef.current) inputRef.current.select();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onChange?.(draft);
  };

  const cancel = () => {
    setDraft(value || '');
    setEditing(false);
  };

  const displayValue = value || placeholder || '';
  const displayClassName = `${className} ${!value ? emptyClassName : ''} ${editable ? 'cursor-text hover:bg-blue-50/70 rounded-md transition-colors px-1 -mx-1' : ''}`.trim();
  const editorClassName = `${inputClassName || className} w-full bg-white/95 border border-blue-300 rounded-md px-2 py-1 outline-none ring-2 ring-blue-100`.trim();

  if (!editable) {
    return <span className={`${className} ${!value ? emptyClassName : ''}`.trim()}>{displayValue}</span>;
  }

  if (editing) {
    if (multiline) {
      return (
        <textarea
          ref={(node) => { inputRef.current = node; }}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') commit();
            if (e.key === 'Escape') cancel();
          }}
          rows={Math.max(2, (draft || placeholder || '').split('\n').length)}
          className={editorClassName}
        />
      );
    }

    return (
      <input
        ref={(node) => { inputRef.current = node; }}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') cancel();
        }}
        className={editorClassName}
      />
    );
  }

  return (
    <span className={displayClassName} onClick={() => setEditing(true)}>
      {displayValue}
    </span>
  );
}
