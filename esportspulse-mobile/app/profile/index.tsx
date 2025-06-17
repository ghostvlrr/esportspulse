import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: theme.colors.primary + '10' }]}>
          <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary + '20' }]}>
            <Ionicons name="person" size={48} color={theme.colors.primary} />
          </View>
          <Text style={[styles.username, { color: theme.colors.text }]}>{user.username}</Text>
          <Text style={[styles.email, { color: theme.colors.text, opacity: 0.7 }]}>{user.email}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Favorilerim</Text>
            
            <View style={styles.favoritesContainer}>
              <TouchableOpacity 
                style={[styles.favoriteItem, { backgroundColor: theme.colors.primary + '10' }]}
                onPress={() => router.push('/favorites')}
                activeOpacity={0.7}
              >
                <View style={[styles.favoriteIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Ionicons name="heart" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.favoriteContent}>
                  <Text style={[styles.favoriteText, { color: theme.colors.text }]}>Favori Takımlar</Text>
                  <Text style={[styles.favoriteCount, { color: theme.colors.primary }]}>
                    {user.favoriteTeams.length} takım
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={theme.colors.text} style={{ opacity: 0.5 }} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.favoriteItem, { backgroundColor: theme.colors.primary + '10' }]}
                onPress={() => router.push('/favorites')}
                activeOpacity={0.7}
              >
                <View style={[styles.favoriteIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Ionicons name="person" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.favoriteContent}>
                  <Text style={[styles.favoriteText, { color: theme.colors.text }]}>Favori Oyuncular</Text>
                  <Text style={[styles.favoriteCount, { color: theme.colors.primary }]}>
                    {user.favoritePlayers.length} oyuncu
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={theme.colors.text} style={{ opacity: 0.5 }} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Bildirim Ayarları</Text>
            
            <View style={[styles.preferenceItem, { backgroundColor: theme.colors.primary + '10' }]}>
              <View style={styles.preferenceText}>
                <Text style={[styles.preferenceTitle, { color: theme.colors.text }]}>
                  Maç Başlangıç Bildirimleri
                </Text>
                <Text style={[styles.preferenceDescription, { color: theme.colors.text, opacity: 0.7 }]}>
                  Maç başlangıç bildirimleri
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => toggleNotification('matchStart')}
                style={[styles.toggleButton, { backgroundColor: user.notifications.matchStart ? theme.colors.primary : theme.colors.text + '40' }]}
              >
                <View style={[styles.toggleKnob, { 
                  backgroundColor: 'white',
                  transform: [{ translateX: user.notifications.matchStart ? 20 : 0 }]
                }]} />
              </TouchableOpacity>
            </View>

            <View style={[styles.preferenceItem, { backgroundColor: theme.colors.primary + '10' }]}>
              <View style={styles.preferenceText}>
                <Text style={[styles.preferenceTitle, { color: theme.colors.text }]}>
                  Skor Değişikliği Bildirimleri
                </Text>
                <Text style={[styles.preferenceDescription, { color: theme.colors.text, opacity: 0.7 }]}>
                  Canlı maç skor değişiklikleri
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => toggleNotification('scoreChange')}
                style={[styles.toggleButton, { backgroundColor: user.notifications.scoreChange ? theme.colors.primary : theme.colors.text + '40' }]}
              >
                <View style={[styles.toggleKnob, { 
                  backgroundColor: 'white',
                  transform: [{ translateX: user.notifications.scoreChange ? 20 : 0 }]
                }]} />
              </TouchableOpacity>
            </View>

            <View style={[styles.preferenceItem, { backgroundColor: theme.colors.primary + '10' }]}>
              <View style={styles.preferenceText}>
                <Text style={[styles.preferenceTitle, { color: theme.colors.text }]}>
                  Maç Sonu Bildirimleri
                </Text>
                <Text style={[styles.preferenceDescription, { color: theme.colors.text, opacity: 0.7 }]}>
                  Maç sonuç bildirimleri
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => toggleNotification('matchEnd')}
                style={[styles.toggleButton, { backgroundColor: user.notifications.matchEnd ? theme.colors.primary : theme.colors.text + '40' }]}
              >
                <View style={[styles.toggleKnob, { 
                  backgroundColor: 'white',
                  transform: [{ translateX: user.notifications.matchEnd ? 20 : 0 }]
                }]} />
              </TouchableOpacity>
            </View>

            <View style={[styles.preferenceItem, { backgroundColor: theme.colors.primary + '10' }]}>
              <View style={styles.preferenceText}>
                <Text style={[styles.preferenceTitle, { color: theme.colors.text }]}>
                  Haber Bildirimleri
                </Text>
                <Text style={[styles.preferenceDescription, { color: theme.colors.text, opacity: 0.7 }]}>
                  Önemli haberler ve güncellemeler
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => toggleNotification('news')}
                style={[styles.toggleButton, { backgroundColor: user.notifications.news ? theme.colors.primary : theme.colors.text + '40' }]}
              >
                <View style={[styles.toggleKnob, { 
                  backgroundColor: 'white',
                  transform: [{ translateX: user.notifications.news ? 20 : 0 }]
                }]} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: theme.colors.error + '20' }]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out" size={24} color={theme.colors.error} />
            <Text style={[styles.logoutText, { color: theme.colors.error }]}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
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
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  favoriteIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteContent: {
    flex: 1,
    marginLeft: 16,
  },
  favoriteText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  favoriteCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  toggleButton: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 