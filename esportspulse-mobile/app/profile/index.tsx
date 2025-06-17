import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [user, setUser] = React.useState({
    username: 'Kullanıcı',
    email: 'kullanici@example.com',
    favoriteTeams: [],
    favoritePlayers: [],
    notifications: {
      matchStart: true,
      scoreChange: true,
      matchEnd: true,
      news: true,
    },
  });

  useEffect(() => {
    // Burada kullanıcı verilerini yükleyebilirsiniz
  }, []);

  const handleLogout = () => {
    // Çıkış işlemleri burada yapılacak
    router.replace('/');
  };

  const toggleNotification = (type: keyof typeof user.notifications) => {
    setUser(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.avatarContainer, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="person" size={48} color={theme.colors.primary} />
        </View>
        <Text style={[styles.username, { color: theme.colors.text }]}>{user.username}</Text>
        <Text style={[styles.email, { color: theme.colors.textSecondary }]}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Favorilerim</Text>
        
        <View style={styles.favoritesContainer}>
          <TouchableOpacity 
            style={[styles.favoriteItem, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push('/favorites')}
          >
            <Ionicons name="heart" size={24} color={theme.colors.primary} />
            <Text style={[styles.favoriteText, { color: theme.colors.text }]}>Favori Takımlar</Text>
            <Text style={[styles.favoriteCount, { color: theme.colors.textSecondary }]}>
              {user.favoriteTeams.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.favoriteItem, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push('/favorites')}
          >
            <Ionicons name="person" size={24} color={theme.colors.primary} />
            <Text style={[styles.favoriteText, { color: theme.colors.text }]}>Favori Oyuncular</Text>
            <Text style={[styles.favoriteCount, { color: theme.colors.textSecondary }]}>
              {user.favoritePlayers.length}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Bildirim Ayarları</Text>
        
        <View style={[styles.preferenceItem, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.preferenceText}>
            <Text style={[styles.preferenceTitle, { color: theme.colors.text }]}>
              Maç Başlangıç Bildirimleri
            </Text>
            <Text style={[styles.preferenceDescription, { color: theme.colors.textSecondary }]}>
              Maç başlangıç bildirimleri
            </Text>
          </View>
          <TouchableOpacity onPress={() => toggleNotification('matchStart')}>
            <Ionicons
              name={user.notifications.matchStart ? 'notifications' : 'notifications-off'}
              size={24}
              color={user.notifications.matchStart ? theme.colors.primary : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.preferenceItem, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.preferenceText}>
            <Text style={[styles.preferenceTitle, { color: theme.colors.text }]}>
              Skor Değişikliği Bildirimleri
            </Text>
            <Text style={[styles.preferenceDescription, { color: theme.colors.textSecondary }]}>
              Canlı maç skor değişiklikleri
            </Text>
          </View>
          <TouchableOpacity onPress={() => toggleNotification('scoreChange')}>
            <Ionicons
              name={user.notifications.scoreChange ? 'notifications' : 'notifications-off'}
              size={24}
              color={user.notifications.scoreChange ? theme.colors.primary : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.preferenceItem, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.preferenceText}>
            <Text style={[styles.preferenceTitle, { color: theme.colors.text }]}>
              Maç Sonu Bildirimleri
            </Text>
            <Text style={[styles.preferenceDescription, { color: theme.colors.textSecondary }]}>
              Maç sonuç bildirimleri
            </Text>
          </View>
          <TouchableOpacity onPress={() => toggleNotification('matchEnd')}>
            <Ionicons
              name={user.notifications.matchEnd ? 'notifications' : 'notifications-off'}
              size={24}
              color={user.notifications.matchEnd ? theme.colors.primary : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.preferenceItem, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.preferenceText}>
            <Text style={[styles.preferenceTitle, { color: theme.colors.text }]}>
              Haber Bildirimleri
            </Text>
            <Text style={[styles.preferenceDescription, { color: theme.colors.textSecondary }]}>
              Önemli haberler ve güncellemeler
            </Text>
          </View>
          <TouchableOpacity onPress={() => toggleNotification('news')}>
            <Ionicons
              name={user.notifications.news ? 'notifications' : 'notifications-off'}
              size={24}
              color={user.notifications.news ? theme.colors.primary : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out" size={24} color="white" />
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 32,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  favoritesContainer: {
    gap: 16,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  favoriteText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  favoriteCount: {
    fontSize: 16,
    fontWeight: '500',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  preferenceText: {
    flex: 1,
    marginRight: 16,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 