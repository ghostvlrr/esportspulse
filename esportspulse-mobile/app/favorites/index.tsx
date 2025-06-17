import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { apiService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Favorite {
  id: string;
  type: 'team' | 'player' | 'match' | 'tournament';
  name: string;
  imageUrl: string;
  description?: string;
  status?: string;
  date?: string;
}

export default function FavoritesScreen() {
  const { theme } = useTheme();
  const [favorites, setFavorites] = React.useState<Favorite[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedFilter, setSelectedFilter] = React.useState('all');

  React.useEffect(() => {
    fetchFavorites();
  }, [selectedFilter]);

  const fetchFavorites = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setFavorites([]);
        return;
      }

      const response = await apiService.get<Favorite[]>(`/favorites?type=${selectedFilter}`);
      if (!response.error) {
        setFavorites(response.data);
      }
    } catch (error) {
      console.error('Favori verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id: string) => {
    try {
      const response = await apiService.delete<{ success: boolean }>(`/favorites/${id}`);
      if (!response.error && response.data.success) {
        setFavorites(favorites.filter((fav) => fav.id !== id));
      }
    } catch (error) {
      console.error('Favori silinirken hata:', error);
    }
  };

  const renderFavoriteItem = ({ item }: { item: Favorite }) => (
    <View style={[styles.favoriteCard, { backgroundColor: theme.colors.surface }]}>
      <Image source={{ uri: item.imageUrl }} style={styles.favoriteImage} />
      <View style={styles.favoriteContent}>
        <View style={styles.favoriteHeader}>
          <Text style={[styles.favoriteType, { color: theme.colors.primary }]}>
            {item.type === 'team' ? 'Takım' : item.type === 'player' ? 'Oyuncu' : item.type === 'match' ? 'Maç' : 'Turnuva'}
          </Text>
          <TouchableOpacity onPress={() => removeFavorite(item.id)}>
            <Ionicons name="heart" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.favoriteName, { color: theme.colors.text }]}>{item.name}</Text>
        {item.description && (
          <Text style={[styles.favoriteDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        {item.status && (
          <Text style={[styles.favoriteStatus, { color: theme.colors.textSecondary }]}>
            {item.status}
          </Text>
        )}
        {item.date && (
          <Text style={[styles.favoriteDate, { color: theme.colors.textSecondary }]}>
            {item.date}
          </Text>
        )}
      </View>
    </View>
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

  if (favorites.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            Henüz favori eklenmemiş
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
            Favori eklemek için ilgili sayfaları ziyaret edin
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'Tümü')}
        {renderFilterButton('team', 'Takımlar')}
        {renderFilterButton('player', 'Oyuncular')}
        {renderFilterButton('match', 'Maçlar')}
        {renderFilterButton('tournament', 'Turnuvalar')}
      </View>

      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
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
  favoriteCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  favoriteImage: {
    width: 100,
    height: 100,
  },
  favoriteContent: {
    flex: 1,
    padding: 12,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  favoriteType: {
    fontSize: 12,
    fontWeight: '500',
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  favoriteDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  favoriteStatus: {
    fontSize: 12,
    marginBottom: 2,
  },
  favoriteDate: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
}); 