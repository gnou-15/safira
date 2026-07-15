import { useRef, useCallback, useEffect } from 'react';

export default function AutoResizeTextarea({ value, onChange, className, style, placeholder }) {
  const textareaRef = useRef(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  return (
    <textarea
      ref={textareaRef}
      value={value || ''}
      onChange={(e) => {
        onChange(e);
        adjustHeight();
      }}
      className={className}
      placeholder={placeholder}
      style={{ 
        ...style, 
        resize: 'none', 
        overflowY: 'hidden',
        minHeight: 'auto',
        height: 'auto'
      }}
    />
  );
}
