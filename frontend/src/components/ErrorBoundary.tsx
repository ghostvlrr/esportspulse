import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
  return (
        <Container maxWidth="sm">
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
            minHeight="80vh"
      textAlign="center"
    >
            <ErrorOutlineIcon
              sx={{
                fontSize: 100,
                color: 'error.main',
                mb: 2,
              }}
            />
            <Typography variant="h4" component="h1" gutterBottom>
              Bir Hata Oluştu
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
              Üzgünüz, bir şeyler yanlış gitti. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
      </Typography>
      <Button
        variant="contained"
        color="primary"
              onClick={() => window.location.reload()}
        sx={{ mt: 2 }}
      >
              Sayfayı Yenile
      </Button>
    </Box>
        </Container>
      );
}

    return this.props.children;
  }
}

export default ErrorBoundary; 