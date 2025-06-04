import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';

const MatchCard = ({ match }) => {
    return (
        <Card sx={{ 
            maxWidth: 345, 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease',
            background: 'linear-gradient(145deg, #2D1B69 0%, #1A1B2E 100%)',
            border: '1px solid rgba(0, 245, 255, 0.1)',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0px 8px 24px rgba(0, 245, 255, 0.2)',
                border: '1px solid rgba(0, 245, 255, 0.3)',
            }
        }}>
            <CardContent>
                {/* Turnuva Logosu */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mb: 2,
                    '& .MuiAvatar-root': {
                        border: '2px solid rgba(0, 245, 255, 0.2)',
                        boxShadow: '0px 4px 12px rgba(0, 245, 255, 0.1)',
                    }
                }}>
                    <Avatar
                        src={`/events/${match.tournament_logo}`}
                        alt={match.tournament_name}
                        sx={{ width: 60, height: 60 }}
                        variant="rounded"
                    />
                </Box>

                {/* Takımlar */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 2,
                    '& .MuiTypography-h6': {
                        textShadow: '0px 0px 8px rgba(0, 245, 255, 0.5)',
                    }
                }}>
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <Typography variant="subtitle1" noWrap sx={{ color: '#FFFFFF' }}>
                            {match.team1}
                        </Typography>
                        <Typography variant="h6" color="primary">
                            {match.score1 || '-'}
                        </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ 
                        mx: 2,
                        color: 'rgba(0, 245, 255, 0.7)',
                        textShadow: '0px 0px 8px rgba(0, 245, 255, 0.3)',
                    }}>VS</Typography>
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <Typography variant="subtitle1" noWrap sx={{ color: '#FFFFFF' }}>
                            {match.team2}
                        </Typography>
                        <Typography variant="h6" color="primary">
                            {match.score2 || '-'}
                        </Typography>
                    </Box>
                </Box>

                {/* Turnuva Adı ve Durum */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderTop: '1px solid rgba(0, 245, 255, 0.1)',
                    pt: 1
                }}>
                    <Typography variant="body2" color="text.secondary" noWrap>
                        {match.tournament_name}
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{
                            color: match.time_until_match === 'LIVE' ? '#FF00F5' : 'rgba(255, 255, 255, 0.7)',
                            textShadow: match.time_until_match === 'LIVE' ? '0px 0px 8px rgba(255, 0, 245, 0.5)' : 'none',
                        }}
                    >
                        {match.time_until_match || match.time_completed || 'Tarih belirtilmedi'}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default MatchCard; 