import { createContext, useContext, useState, type ReactNode } from 'react';

type PopupType = 'alert' | 'confirm';

interface PopupState {
  isOpen: boolean;
  type: PopupType;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface PopupContextProps {
  showAlert: (message: string, onConfirm?: () => void) => void;
  showConfirm: (message: string, onConfirm: () => void, onCancel?: () => void) => void;
}

const PopupContext = createContext<PopupContextProps | undefined>(undefined);

export const PopupProvider = ({ children }: { children: ReactNode }) => {
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'alert',
    message: ''
  });

  const showAlert = (message: string, onConfirm?: () => void) => {
    setPopup({
      isOpen: true,
      type: 'alert',
      message,
      onConfirm
    });
  };

  const showConfirm = (message: string, onConfirm: () => void, onCancel?: () => void) => {
    setPopup({
      isOpen: true,
      type: 'confirm',
      message,
      onConfirm,
      onCancel
    });
  };

  const handleConfirm = () => {
    if (popup.onConfirm) popup.onConfirm();
    closePopup();
  };

  const handleCancel = () => {
    if (popup.onCancel) popup.onCancel();
    closePopup();
  };

  const closePopup = () => {
    setPopup(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <PopupContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      {popup.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '400px', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: '#1f2937', whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}>
              {popup.message}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              {popup.type === 'confirm' && (
                <button 
                  className="btn btn-outline" 
                  onClick={handleCancel}
                  style={{ minWidth: '100px' }}
                >
                  취소
                </button>
              )}
              <button 
                className="btn btn-primary" 
                onClick={handleConfirm}
                style={{ minWidth: '100px' }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </PopupContext.Provider>
  );
};

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};
