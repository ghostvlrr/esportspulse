import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          {t('errors.notFound')}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {t('errors.pageNotFound', 'Aradığınız sayfa bulunamadı.')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          {t('common.backToHome', 'Ana Sayfaya Dön')}
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound; 