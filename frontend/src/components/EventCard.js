import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';

const EventCard = ({ event }) => {
    console.log('EventCard event:', event);
    const logoPath = event.logo ? `/events/processed/${event.logo}` : '/events/default-tournament-logo.png';
    console.log('EventCard logo yolu:', logoPath);

    return (
        <Card sx={{ 
            maxWidth: 345, 
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
        }}>
            <CardMedia
                component="img"
                height="200"
                image={logoPath}
                alt={event.name}
                sx={{
                    objectFit: 'contain',
                    padding: '1rem',
                    backgroundColor: 'rgba(23, 23, 23, 0.3)',
                    borderBottom: '1px solid rgba(255, 0, 0, 0.1)',
                }}
                onError={(e) => {
                    console.log('Logo yüklenirken hata:', e);
                    e.target.onerror = null;
                    e.target.src = '/events/default-tournament-logo.png';
                }}
            />
            <CardContent sx={{ 
                flexGrow: 1,
                '&:last-child': {
                    pb: 2
                }
            }}>
                <Typography 
                    gutterBottom 
                    variant="h6" 
                    component="div" 
                    noWrap
                    sx={{
                        color: '#FFFFFF',
                        textShadow: '0px 0px 8px rgba(0, 245, 255, 0.3)',
                    }}
                >
                    {event.name}
                </Typography>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderTop: '1px solid rgba(0, 245, 255, 0.1)',
                    pt: 1
                }}>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                        }}
                    >
                        {event.date}
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: 'rgba(0, 245, 255, 0.7)',
                            textShadow: '0px 0px 8px rgba(0, 245, 255, 0.2)',
                        }}
                    >
                        {event.region}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default EventCard; 