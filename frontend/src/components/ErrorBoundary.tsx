import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Box, Typography, Button } from '@mui/material';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="400px"
      p={3}
      textAlign="center"
    >
      <Typography variant="h5" color="error" gutterBottom>
        Bir şeyler yanlış gitti!
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {error.message}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={resetErrorBoundary}
        sx={{ mt: 2 }}
      >
        Tekrar Dene
      </Button>
    </Box>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary; 