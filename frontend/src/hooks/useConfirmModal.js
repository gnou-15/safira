import { useState, useCallback } from 'react';

export default function useConfirmModal() {
  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Delete',
    useCountdown: false,
    onConfirm: null
  });

  const requestConfirm = useCallback(({ title, message, confirmText = 'Delete', useCountdown = false, onConfirm }) => {
    setConfirmModalState({
      isOpen: true,
      title,
      message,
      confirmText,
      useCountdown,
      onConfirm
    });
  }, []);

  const closeConfirmModal = useCallback(() => {
    setConfirmModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    confirmModalState,
    requestConfirm,
    closeConfirmModal
  };
}
