import { useState, useEffect, useRef } from 'react';
import '../css/ConfirmModal.css';

export default function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  useCountdown = false,
  onConfirm,
  onCancel
}) {
  const [isCounting, setIsCounting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const timerRef = useRef(null);

  // Reset states on open/close
  useEffect(() => {
    if (!isOpen) {
      setIsCounting(false);
      setTimeLeft(5);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen]);

  // Countdown timer logic
  useEffect(() => {
    if (isCounting) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            if (onConfirm) onConfirm();
            if (onCancel) onCancel();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCounting, onConfirm, onCancel]);

  if (!isOpen) return null;

  const handleStartDelete = () => {
    if (useCountdown) {
      setIsCounting(true);
    } else {
      if (onConfirm) onConfirm();
      if (onCancel) onCancel();
    }
  };

  const handleCancel = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsCounting(false);
    setTimeLeft(5);
    if (onCancel) onCancel();
  };

  return (
    <div className="confirm-modal-overlay" onClick={handleCancel}>
      <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Warning Trash Icon Header */}
        <div className="confirm-modal-icon-wrapper">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </div>

        {/* Modal Text Content */}
        <h3 className="confirm-modal-title">{title}</h3>
        <p className="confirm-modal-message">{message}</p>

        {/* Action Buttons */}
        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-btn-cancel"
            onClick={handleCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`confirm-btn-danger ${isCounting ? 'counting-down' : ''}`}
            onClick={handleStartDelete}
            disabled={isCounting}
          >
            {isCounting && <span className="btn-progress-bar" />}
            <span className="btn-text-content">
              {isCounting ? `Deleting (${timeLeft}s)` : confirmText}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
