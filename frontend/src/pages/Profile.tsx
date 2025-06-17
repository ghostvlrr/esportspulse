import React from 'react';
import { Container, Typography, Box, Paper, Avatar } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Profil
      </Typography>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
            <Avatar
          src={user?.photoURL || undefined}
          alt={user?.displayName || 'Kullanıcı'}
              sx={{ width: 100, height: 100 }}
            />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            {user?.displayName || 'Misafir Kullanıcı'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
            {user?.email || 'Giriş yapılmamış'}
              </Typography>
            </Box>
        </Paper>
    </Container>
  );
};

export default Profile; 