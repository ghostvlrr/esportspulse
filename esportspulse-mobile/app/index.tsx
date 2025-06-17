import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { getUpcomingMatches, getNews } from '@/services/vlrApi';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

export default function HomeScreen() {
  const { theme } = useTheme();
  const [matches, setMatches] = React.useState<any[]>([]);
  const [news, setNews] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [matchesResponse, newsResponse] = await Promise.all([
        getUpcomingMatches(),
        getNews()
      ]);
      setMatches(matchesResponse);
      setNews(newsResponse);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 48 }} />
      </SafeAreaView>
    );
  }

  if (!matches.length && !news.length) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.colors.primary} style={{ marginBottom: 16 }} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Veri alınamadı</Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.text, opacity: 0.7 }]}>Lütfen bağlantınızı ve API sunucunuzu kontrol edin.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>🎮 Esports Pulse</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Yaklaşan Maçlar</Text>
            <Link href="/matches/index" asChild>
              <TouchableOpacity>
                <Text style={[styles.seeAll, { color: theme.colors.primary }]}>Tümünü Gör</Text>
              </TouchableOpacity>
            </Link>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {matches.map((match, idx) => (
              <TouchableOpacity
                key={match.id || idx}
                style={[styles.matchCard, { backgroundColor: theme.colors.background, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 }]}
                activeOpacity={0.85}
              >
                <Text style={[styles.matchTeams, { color: theme.colors.text }]}>{match.teams?.[0]?.name || '-'} <Text style={{ color: theme.colors.primary }}>vs</Text> {match.teams?.[1]?.name || '-'}</Text>
                <Text style={[styles.matchDate, { color: theme.colors.text, opacity: 0.7 }]}>{match.datetime ? new Date(match.datetime).toLocaleString('tr-TR') : '-'}</Text>
                <Text style={[styles.matchStatus, { color: theme.colors.primary }]}>{match.status || '-'}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Son Haberler</Text>
            <Link href="/news/index" asChild>
              <TouchableOpacity>
                <Text style={[styles.seeAll, { color: theme.colors.primary }]}>Tümünü Gör</Text>
              </TouchableOpacity>
            </Link>
          </View>
          {news.map((item, idx) => (
            <TouchableOpacity
              key={item.id || idx}
              style={[styles.newsCard, { backgroundColor: theme.colors.background, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 }]}
              activeOpacity={0.85}
            >
              {item.image && (
                <Image source={{ uri: item.image }} style={styles.newsImage} />
              )}
              <View style={styles.newsContent}>
                <Text style={[styles.newsTitle, { color: theme.colors.text }]}>{item.title}</Text>
                <Text style={[styles.newsSummary, { color: theme.colors.text, opacity: 0.8 }]}>{item.description || item.summary || ''}</Text>
                <Text style={[styles.newsDate, { color: theme.colors.text, opacity: 0.7 }]}>{item.date ? new Date(item.date).toLocaleDateString('tr-TR') : ''}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  notificationButton: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  horizontalScroll: {
    paddingHorizontal: 12,
    gap: 12,
    minHeight: 180,
    alignItems: 'center',
  },
  matchCard: {
    padding: 20,
    borderRadius: 20,
    marginRight: 16,
    width: 220,
    backgroundColor: '#181818',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  matchTeams: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  matchDate: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  matchStatus: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  newsCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#181818',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  newsImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  newsContent: {
    padding: 18,
  },
  newsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  newsSummary: {
    fontSize: 15,
    marginBottom: 8,
  },
  newsDate: {
    fontSize: 13,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 64,
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.7,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
}); 