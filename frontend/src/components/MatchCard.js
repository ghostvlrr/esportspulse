import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';

function formatTimeUntilTr(timeStr) {
    if (!timeStr) return '';
    return timeStr
        .replace(/from now/i, '')
        .replace(/(\d+)d/g, '$1 gün')
        .replace(/(\d+)h/g, '$1 saat')
        .replace(/(\d+)m/g, '$1 dakika')
        .trim();
}

const MatchCard = ({ match }) => {
    return (
        <Card sx={{ 
            maxWidth: 345, 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            background: 'linear-gradient(145deg, rgba(23, 23, 23, 0.9) 0%, rgba(10, 10, 10, 0.95) 100%)',
            border: '1px solid rgba(255, 0, 0, 0.15)',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(45deg, rgba(255, 0, 0, 0.05), transparent)',
                opacity: 0,
                transition: 'opacity 0.3s ease',
            },
            '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: '0 12px 30px rgba(255, 0, 0, 0.25)',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                '&::before': {
                    opacity: 1,
                },
            }
        }}>
            <CardContent>
                {/* Turnuva Logosu */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mb: 2,
                    '& .MuiAvatar-root': {
                        border: '2px solid rgba(255, 0, 0, 0.2)',
                        boxShadow: '0 8px 20px rgba(255, 0, 0, 0.15)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'scale(1.1)',
                            border: '2px solid rgba(255, 0, 0, 0.4)',
                            boxShadow: '0 12px 25px rgba(255, 0, 0, 0.25)',
                        }
                    }
                }}>
                    <Avatar
                        src={`/events/${match.tournament_logo}`}
                        alt={match.tournament_name}
                        sx={{ 
                            width: 60, 
                            height: 60,
                            background: 'rgba(23, 23, 23, 0.8)',
                            backdropFilter: 'blur(5px)',
                        }}
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
                        textShadow: '0 0 15px rgba(255, 0, 0, 0.5)',
                        transition: 'all 0.3s ease',
                    }
                }}>
                    <Box sx={{ 
                        textAlign: 'center', 
                        flex: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'scale(1.05)',
                        }
                    }}>
                        <Typography variant="subtitle1" noWrap sx={{ 
                            color: '#FFFFFF',
                            fontWeight: 600,
                            letterSpacing: '0.5px',
                        }}>
                            {match.team1}
                        </Typography>
                        <Typography variant="h6" sx={{ 
                            color: '#FF0000',
                            fontWeight: 700,
                            textShadow: '0 0 15px rgba(255, 0, 0, 0.5)',
                        }}>
                            {match.score1 || '-'}
                        </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ 
                        mx: 2,
                        color: 'rgba(255, 0, 0, 0.7)',
                        textShadow: '0 0 15px rgba(255, 0, 0, 0.3)',
                        fontWeight: 700,
                        letterSpacing: '1px',
                    }}>VS</Typography>
                    <Box sx={{ 
                        textAlign: 'center', 
                        flex: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'scale(1.05)',
                        }
                    }}>
                        <Typography variant="subtitle1" noWrap sx={{ 
                            color: '#FFFFFF',
                            fontWeight: 600,
                            letterSpacing: '0.5px',
                        }}>
                            {match.team2}
                        </Typography>
                        <Typography variant="h6" sx={{ 
                            color: '#FF0000',
                            fontWeight: 700,
                            textShadow: '0 0 15px rgba(255, 0, 0, 0.5)',
                        }}>
                            {match.score2 || '-'}
                        </Typography>
                    </Box>
                </Box>

                {/* Turnuva Adı ve Durum */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderTop: '1px solid rgba(255, 0, 0, 0.1)',
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
                        {match.time_until_match && match.time_until_match !== 'LIVE'
                            ? formatTimeUntilTr(match.time_until_match)
                            : match.time_until_match === 'LIVE'
                                ? 'Canlı'
                                : match.time_completed || 'Tarih belirtilmedi'}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default MatchCard; 