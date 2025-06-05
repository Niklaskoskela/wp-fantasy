import React from 'react';
import { Alert, Snackbar, AlertColor } from '@mui/material';

interface ErrorNotificationProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  onClose: () => void;
  autoHideDuration?: number;
}

export function ErrorNotification({
  open,
  message,
  severity = 'error',
  onClose,
  autoHideDuration = 6000,
}: ErrorNotificationProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        severity={severity}
        onClose={onClose}
        sx={{ width: '100%' }}
        variant='filled'
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
