import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { apiService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
  status: string;
  date: string;
}

interface News {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  date: string;
}

export default function HomeScreen() {
  const { theme } = useTheme();
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [news, setNews] = React.useState<News[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [matchesResponse, newsResponse] = await Promise.all([
        apiService.get<Match[]>('/matches/upcoming'),
        apiService.get<News[]>('/news/latest')
      ]);

      if (!matchesResponse.error) {
        setMatches(matchesResponse.data);
      }
      if (!newsResponse.error) {
        setNews(newsResponse.data);
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Hoş Geldiniz</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Yaklaşan Maçlar</Text>
          <Link href="/matches" asChild>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: theme.colors.primary }]}>Tümünü Gör</Text>
            </TouchableOpacity>
          </Link>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.matchesContainer}>
          {matches.map((match) => (
            <TouchableOpacity
              key={match.id}
              style={[styles.matchCard, { backgroundColor: theme.colors.surface }]}
            >
              <Text style={[styles.matchTeams, { color: theme.colors.text }]}>
                {match.homeTeam} vs {match.awayTeam}
              </Text>
              <Text style={[styles.matchDate, { color: theme.colors.textSecondary }]}>
                {match.date}
              </Text>
              <Text style={[styles.matchStatus, { color: theme.colors.primary }]}>
                {match.status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Son Haberler</Text>
          <Link href="/news" asChild>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: theme.colors.primary }]}>Tümünü Gör</Text>
            </TouchableOpacity>
          </Link>
        </View>
        {news.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.newsCard, { backgroundColor: theme.colors.surface }]}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.newsImage} />
            <View style={styles.newsContent}>
              <Text style={[styles.newsTitle, { color: theme.colors.text }]}>{item.title}</Text>
              <Text style={[styles.newsSummary, { color: theme.colors.textSecondary }]}>
                {item.summary}
              </Text>
              <Text style={[styles.newsDate, { color: theme.colors.textSecondary }]}>
                {item.date}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
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
  matchesContainer: {
    paddingHorizontal: 16,
  },
  matchCard: {
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 200,
  },
  matchTeams: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  matchDate: {
    fontSize: 14,
    marginBottom: 4,
  },
  matchStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  newsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  newsImage: {
    width: '100%',
    height: 200,
  },
  newsContent: {
    padding: 16,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  newsSummary: {
    fontSize: 14,
    marginBottom: 8,
  },
  newsDate: {
    fontSize: 12,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
}); 