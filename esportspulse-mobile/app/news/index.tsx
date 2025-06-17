import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, SafeAreaView, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { getNews } from '@/services/vlrApi';

const CARD_WIDTH = Dimensions.get('window').width - 32;

export default function NewsScreen() {
  const { theme } = useTheme();
  const [news, setNews] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  React.useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const data = await getNews();
      setNews(data);
    } catch (error) {
      console.error('Haber verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Kategorileri API'den gelen haberlerden türet
  const categories = React.useMemo(() => {
    const cats = Array.from(new Set(news.map((n) => n.category).filter(Boolean)));
    return ['all', ...cats];
  }, [news]);

  const filteredNews = selectedCategory === 'all'
    ? news
    : news.filter((item) => item.category === selectedCategory);

  const renderNewsItem = ({ item }: { item: any }) => (
    <Link href={`/news/${item.id}`} asChild>
      <TouchableOpacity 
        style={[styles.newsCard, { backgroundColor: theme.colors.background }]}
        activeOpacity={0.9}
      >
        {item.image && (
          <Image 
            source={{ uri: item.image }} 
            style={styles.newsImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.newsContent}>
          <View style={styles.newsHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: theme.colors.primary + '20' }]}> 
              <Text style={[styles.category, { color: theme.colors.primary }]}>{item.category || 'Genel'}</Text>
            </View>
            <Text style={[styles.date, { color: theme.colors.text, opacity: 0.7 }]}>{item.date ? new Date(item.date).toLocaleDateString('tr-TR') : ''}</Text>
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>{item.title}</Text>
          <Text style={[styles.summary, { color: theme.colors.text, opacity: 0.8 }]} numberOfLines={2}>
            {item.summary || item.description || ''}
          </Text>
          <View style={styles.footer}>
            <View style={styles.authorContainer}>
              <Ionicons name="person-outline" size={16} color={theme.colors.text} style={{ marginRight: 4 }} />
              <Text style={[styles.author, { color: theme.colors.text, opacity: 0.7 }]}> {item.author || ''} </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );

  const renderCategoryButton = (category: string, label: string) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === category && { backgroundColor: theme.colors.primary },
      ]}
      onPress={() => setSelectedCategory(category)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.categoryButtonText,
          { color: selectedCategory === category ? '#FFFFFF' : theme.colors.text },
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

  if (!filteredNews.length) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
        <View style={styles.emptyContainer}>
          <Ionicons name="newspaper-outline" size={64} color={theme.colors.primary} style={{ marginBottom: 16 }} />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>Haber bulunamadı</Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.text, opacity: 0.7 }]}>Lütfen daha sonra tekrar deneyin</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((cat, idx) => (
          <React.Fragment key={cat || idx}>
            {renderCategoryButton(cat, cat === 'all' ? 'Tümü' : cat)}
          </React.Fragment>
        ))}
      </ScrollView>
      <FlatList
        data={filteredNews}
        renderItem={renderNewsItem}
        keyExtractor={(item, idx) => String(item.id || idx)}
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
  categoriesContainer: {
    padding: 16,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    marginRight: 8,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  newsCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  newsImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#222',
  },
  newsContent: {
    padding: 16,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  date: {
    fontSize: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 26,
  },
  summary: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  author: {
    fontSize: 13,
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