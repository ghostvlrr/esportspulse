import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { apiService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  location: string;
  organizer: string;
  type: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export default function EventsScreen() {
  const { theme } = useTheme();
  const [events, setEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedFilter, setSelectedFilter] = React.useState('all');

  React.useEffect(() => {
    fetchEvents();
  }, [selectedFilter]);

  const fetchEvents = async () => {
    try {
      const response = await apiService.get<Event[]>(`/events?filter=${selectedFilter}`);
      if (!response.error) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Etkinlik verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderEventItem = ({ item }: { item: Event }) => (
    <Link href={`/event/${item.id}`} asChild>
      <TouchableOpacity style={[styles.eventCard, { backgroundColor: theme.colors.surface }]}>
        <Image source={{ uri: item.imageUrl }} style={styles.eventImage} />
        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text style={[styles.eventType, { color: theme.colors.primary }]}>{item.type}</Text>
            <Text style={[styles.eventStatus, { color: theme.colors.textSecondary }]}>
              {item.status === 'upcoming' ? 'Yaklaşan' : item.status === 'ongoing' ? 'Devam Ediyor' : 'Tamamlandı'}
            </Text>
          </View>
          <Text style={[styles.eventTitle, { color: theme.colors.text }]}>{item.title}</Text>
          <Text style={[styles.eventDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.eventDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                {item.startDate}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                {item.location}
              </Text>
            </View>
          </View>
          <View style={styles.footer}>
            <Text style={[styles.organizer, { color: theme.colors.textSecondary }]}>
              {item.organizer}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );

  const renderFilterButton = (filter: string, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && { backgroundColor: theme.colors.primary },
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          { color: selectedFilter === filter ? '#FFFFFF' : theme.colors.text },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'Tümü')}
        {renderFilterButton('upcoming', 'Yaklaşan')}
        {renderFilterButton('ongoing', 'Devam Eden')}
        {renderFilterButton('completed', 'Tamamlanan')}
      </View>

      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  eventCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 200,
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventType: {
    fontSize: 14,
    fontWeight: '500',
  },
  eventStatus: {
    fontSize: 14,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  eventDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  organizer: {
    fontSize: 14,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
}); 