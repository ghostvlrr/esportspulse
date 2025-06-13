import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

interface Event {
  id: string;
  name: string;
  logo: string;
  date: string;
  region: string;
}

const normalize = (str: string) =>
  str
    .toLowerCase()
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ç/g, 'c')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ğ/g, 'g')
    .replace(/[^a-z0-9]/g, '');

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  background: 'linear-gradient(145deg, #171717 0%, #0A0A0A 100%)',
  border: '1px solid rgba(255, 0, 0, 0.15)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0px 8px 24px rgba(255, 0, 0, 0.2)',
    border: '1px solid rgba(255, 0, 0, 0.3)',
  }
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: 200,
  objectFit: 'contain',
  padding: '1rem',
  backgroundColor: 'rgba(23, 23, 23, 0.3)',
  borderBottom: '1px solid rgba(255, 0, 0, 0.1)',
})) as typeof CardMedia;

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('Etkinlikler yüklenirken bir hata oluştu');
        }
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        color: 'primary.main',
        textAlign: 'center',
        mb: 4,
        fontWeight: 600,
        textShadow: '0 0 10px rgba(255, 0, 0, 0.3)'
      }}>
        Turnuvalar
      </Typography>
      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <StyledCard>
              <StyledCardMedia
                component="img"
                image={`/events/processed/${normalize(event.name)}.png`}
                alt={event.name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/events/default-tournament-logo.png';
                }}
              />
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom sx={{ 
                  color: 'text.primary',
                  fontWeight: 600
                }}>
                  {event.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.date} • {event.region}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Events; 