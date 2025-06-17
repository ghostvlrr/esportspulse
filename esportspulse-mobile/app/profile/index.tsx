import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface Favorite {
  id: string;
  type: 'team' | 'match' | 'news';
  title: string;
  image?: string;
  game?: string;
  date?: string;
  status?: string;
}

export default function ProfileScreen() {
  const theme = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const [userResponse, favoritesResponse] = await Promise.all([
        api.get('/user/profile'),
        api.get('/favorites')
      ]);
      setUser(userResponse.data);
      setFavorites(favoritesResponse.data);
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    onRefresh();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      // Kullanıcıyı login sayfasına yönlendir
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
    }
  };

  const renderFavorites = () => {
    const filteredFavorites = favorites.filter(fav => {
      if (activeTab === 0) return true;
      if (activeTab === 1) return fav.type === 'team';
      if (activeTab === 2) return fav.type === 'match';
      if (activeTab === 3) return fav.type === 'news';
      return false;
    });

    if (filteredFavorites.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Henüz favori eklenmemiş
          </Text>
        </View>
      );
    }

    return filteredFavorites.map((item) => (
      <TouchableOpacity key={item.id} style={styles.favoriteItem}>
        {item.image && (
          <Image
            source={{ uri: item.image }}
            style={styles.favoriteImage}
            defaultSource={require('@/assets/images/default-image.png')}
          />
        )}
        <View style={styles.favoriteContent}>
          <Text style={[styles.favoriteTitle, { color: theme.colors.text }]}>
            {item.title}
          </Text>
          {item.game && (
            <Text style={[styles.favoriteGame, { color: theme.colors.primary }]}>
              {item.game}
            </Text>
          )}
          {item.date && (
            <Text style={[styles.favoriteDate, { color: theme.colors.textSecondary }]}>
              {new Date(item.date).toLocaleDateString('tr-TR')}
            </Text>
          )}
          {item.status && (
            <Text style={[styles.favoriteStatus, { color: theme.colors.primary }]}>
              {item.status}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    ));
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.profileHeader}>
        <Image
          source={user.avatar ? { uri: user.avatar } : require('@/assets/images/default-avatar.png')}
          style={styles.avatar}
        />
        <Text style={[styles.username, { color: theme.colors.text }]}>
          {user.username}
        </Text>
        <Text style={[styles.email, { color: theme.colors.textSecondary }]}>
          {user.email}
        </Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 0 && styles.activeTab]}
          onPress={() => setActiveTab(0)}
        >
          <Text style={[styles.tabText, { color: theme.colors.text }]}>Tümü</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 1 && styles.activeTab]}
          onPress={() => setActiveTab(1)}
        >
          <Text style={[styles.tabText, { color: theme.colors.text }]}>Takımlar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 2 && styles.activeTab]}
          onPress={() => setActiveTab(2)}
        >
          <Text style={[styles.tabText, { color: theme.colors.text }]}>Maçlar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 3 && styles.activeTab]}
          onPress={() => setActiveTab(3)}
        >
          <Text style={[styles.tabText, { color: theme.colors.text }]}>Haberler</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.favoritesContainer}>
        {renderFavorites()}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color={theme.colors.text} />
        <Text style={[styles.logoutText, { color: theme.colors.text }]}>Çıkış Yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF0000',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  favoritesContainer: {
    padding: 16,
  },
  favoriteItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  favoriteImage: {
    width: 80,
    height: 80,
  },
  favoriteContent: {
    flex: 1,
    padding: 12,
  },
  favoriteTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  favoriteGame: {
    fontSize: 14,
    marginBottom: 4,
  },
  favoriteDate: {
    fontSize: 12,
  },
  favoriteStatus: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 