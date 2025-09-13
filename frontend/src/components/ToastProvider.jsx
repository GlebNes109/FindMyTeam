// ToastProvider.jsx
import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

    const showToast = (type, message) => {
        setToast({ open: true, type, message });
    };

    const handleClose = () => {
        setToast(prev => ({ ...prev, open: false }));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Snackbar
                open={toast.open}
                autoHideDuration={3000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                sx={{
                    width: { xs: '100%', sm: 'auto' },
                    maxWidth: 600,
                }}
            >
                <Alert onClose={handleClose} severity={toast.type} sx={{ width: '100%' }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </ToastContext.Provider>
    );
};
