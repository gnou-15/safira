import { useRef, useCallback, useEffect } from 'react';

export default function AutoResizeTextarea({ value, onChange, className, style, placeholder }) {
  const textareaRef = useRef(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.setProperty('height', 'auto', 'important');
      const newHeight = Math.max(textarea.scrollHeight + 10, 42);
      textarea.style.setProperty('height', `${newHeight}px`, 'important');
    }
  }, []);

  useEffect(() => {
    adjustHeight();
    // Re-calculate height on window resize or font load
    window.addEventListener('resize', adjustHeight);
    return () => window.removeEventListener('resize', adjustHeight);
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
        boxSizing: 'border-box'
      }}
    />
  );
}
