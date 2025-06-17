import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, SafeAreaView, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
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

const CARD_WIDTH = Dimensions.get('window').width - 32;

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'team':
        return 'people-outline';
      case 'player':
        return 'person-outline';
      case 'match':
        return 'game-controller-outline';
      case 'tournament':
        return 'trophy-outline';
      default:
        return 'star-outline';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'team':
        return 'Takım';
      case 'player':
        return 'Oyuncu';
      case 'match':
        return 'Maç';
      case 'tournament':
        return 'Turnuva';
      default:
        return 'Favori';
    }
  };

  const renderFavoriteItem = ({ item }: { item: Favorite }) => (
    <View style={[styles.favoriteCard, { backgroundColor: theme.colors.background }]}>
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.favoriteImage}
        resizeMode="cover"
      />
      <View style={styles.favoriteContent}>
        <View style={styles.favoriteHeader}>
          <View style={[styles.typeBadge, { backgroundColor: theme.colors.primary + '20' }]}>
            <Ionicons name={getTypeIcon(item.type)} size={14} color={theme.colors.primary} style={{ marginRight: 4 }} />
            <Text style={[styles.favoriteType, { color: theme.colors.primary }]}>
              {getTypeLabel(item.type)}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => removeFavorite(item.id)}
            style={[styles.removeButton, { backgroundColor: theme.colors.primary + '20' }]}
          >
            <Ionicons name="heart" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.favoriteName, { color: theme.colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        {item.description && (
          <Text style={[styles.favoriteDescription, { color: theme.colors.text, opacity: 0.8 }]} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.favoriteFooter}>
          {item.status && (
            <View style={[styles.statusBadge, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={[styles.favoriteStatus, { color: theme.colors.primary }]}>
                {item.status}
              </Text>
            </View>
          )}
          {item.date && (
            <Text style={[styles.favoriteDate, { color: theme.colors.text, opacity: 0.7 }]}>
              {item.date}
            </Text>
          )}
        </View>
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
      activeOpacity={0.7}
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
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 48 }} />
      </SafeAreaView>
    );
  }

  if (favorites.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color={theme.colors.primary} style={{ marginBottom: 16 }} />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            Henüz favori eklenmemiş
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.text, opacity: 0.7 }]}>
            Favori eklemek için ilgili sayfaları ziyaret edin
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {renderFilterButton('all', 'Tümü')}
        {renderFilterButton('team', 'Takımlar')}
        {renderFilterButton('player', 'Oyuncular')}
        {renderFilterButton('match', 'Maçlar')}
        {renderFilterButton('tournament', 'Turnuvalar')}
      </ScrollView>

      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContainer, { backgroundColor: theme.colors.background }]}
        style={{ backgroundColor: theme.colors.background }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  favoriteCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  favoriteImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#222',
  },
  favoriteContent: {
    padding: 16,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  favoriteType: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  removeButton: {
    padding: 8,
    borderRadius: 12,
  },
  favoriteName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  favoriteDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  favoriteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  favoriteStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  favoriteDate: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: 'center',
  },
}); 