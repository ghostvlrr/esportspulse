import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, TextField, MenuItem, CircularProgress } from '@mui/material';
import EventCard from '../components/EventCard';
import { api } from '../services/api';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [regionFilter, setRegionFilter] = useState('all');

    const regions = [
        { value: 'all', label: 'Tüm Bölgeler' },
        { value: 'americas', label: 'Amerikalar' },
        { value: 'emea', label: 'EMEA' },
        { value: 'pacific', label: 'Pasifik' },
        { value: 'china', label: 'Çin' }
    ];

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get('/events');
                setEvents(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Turnuvalar yüklenirken hata:', error);
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRegion = regionFilter === 'all' || event.region.toLowerCase() === regionFilter.toLowerCase();
        return matchesSearch && matchesRegion;
    });

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Turnuvalar
            </Typography>

            <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
                <TextField
                    label="Turnuva Ara"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ flexGrow: 1 }}
                />
                <TextField
                    select
                    label="Bölge Filtresi"
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    sx={{ minWidth: 200 }}
                >
                    {regions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>

            <Grid container spacing={3}>
                {filteredEvents.map((event) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={event.id}>
                        <EventCard event={event} />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Events; 