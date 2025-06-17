import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '@/constants/theme';
import { useEffect, useState, useCallback } from 'react';
import { getLiveMatches, getUpcomingMatches, getNews } from '@/services/vlrApi';

interface Match {
  id: string;
  team1: string;
  team2: string;
  score1?: number;
  score2?: number;
  status: string;
  time: string;
}

interface News {
  title: string;
  description: string;
  date: string;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const [live, upcoming, newsData] = await Promise.all([
        getLiveMatches(),
        getUpcomingMatches(),
        getNews(),
      ]);
      setLiveMatches(live);
      setUpcomingMatches(upcoming);
      setNews(newsData);
    } catch (error) {
      setError('Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const renderMatch = (match: Match, idx: number) => (
    <View key={`${match.id}-${idx}`} style={[styles.matchCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.matchHeader}>
        <Text style={[styles.matchStatus, { color: theme.colors.text }]}>{match.status}</Text>
        <Text style={[styles.matchTime, { color: theme.colors.text }]}>{match.time}</Text>
      </View>
      <View style={styles.matchTeams}>
        <Text style={[styles.teamName, { color: theme.colors.text }]}>{match.team1}</Text>
        {match.score1 !== undefined && (
          <Text style={[styles.score, { color: theme.colors.text }]}>{match.score1}</Text>
        )}
        <Text style={[styles.vs, { color: theme.colors.text }]}>vs</Text>
        {match.score2 !== undefined && (
          <Text style={[styles.score, { color: theme.colors.text }]}>{match.score2}</Text>
        )}
        <Text style={[styles.teamName, { color: theme.colors.text }]}>{match.team2}</Text>
      </View>
    </View>
  );

  const renderNews = (item: News, idx: number) => (
    <View key={`${item.title}-${idx}`} style={[styles.newsCard, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.newsTitle, { color: theme.colors.text }]}>{item.title}</Text>
      <Text style={[styles.newsDescription, { color: theme.colors.text }]}>{item.description}</Text>
      <Text style={[styles.newsDate, { color: theme.colors.text }]}>{item.date}</Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Canlı Maçlar</Text>
        {liveMatches.length > 0 ? (
          liveMatches.map((item, idx) => renderMatch(item, idx))
        ) : (
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            Şu anda canlı maç bulunmuyor.
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Yaklaşan Maçlar</Text>
        {upcomingMatches.length > 0 ? (
          upcomingMatches.slice(0, 3).map((item, idx) => renderMatch(item, idx))
        ) : (
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            Yaklaşan maç bulunmuyor.
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Son Haberler</Text>
        {news.length > 0 ? (
          news.slice(0, 3).map((item, idx) => renderNews(item, idx))
        ) : (
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            Haber bulunmuyor.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  matchCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  matchStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  matchTime: {
    fontSize: 14,
  },
  matchTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  vs: {
    marginHorizontal: 8,
    fontSize: 14,
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  newsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  newsDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  newsDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    marginHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
}); 