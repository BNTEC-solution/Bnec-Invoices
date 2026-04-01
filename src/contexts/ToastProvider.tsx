import { useState, ReactNode, useCallback } from 'react';
import { Toast } from '../components/ui/Toast';
import { ToastContext, ToastVariant } from './ToastContext';

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);

  const showToast = useCallback((message: string, variant: ToastVariant = 'success') => {
    setToast({ message, variant });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast 
          message={toast.message} 
          variant={toast.variant} 
          onClose={hideToast} 
        />
      )}
    </ToastContext.Provider>
  );
}
