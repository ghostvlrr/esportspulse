import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '@/constants/theme';
import { useEffect, useState, useCallback } from 'react';
import { getNews } from '@/services/vlrApi';

interface News {
  id: string;
  title: string;
  description: string;
  date: string;
}

export default function NewsScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    try {
      setError(null);
      const data = await getNews();
      setNews(data);
    } catch (error) {
      setError('Haberler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNews();
  }, []);

  useEffect(() => {
    fetchNews();
  }, []);

  const renderNews = ({ item, index }: { item: News; index: number }) => (
    <View key={`${item.id}-${index}`} style={[styles.newsCard, { backgroundColor: theme.colors.card }]}>
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
    <FlatList
      data={news}
      renderItem={renderNews}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      contentContainerStyle={styles.listContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
          Haber bulunamadı.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
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