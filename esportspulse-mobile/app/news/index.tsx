import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { apiService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

interface News {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  author: string;
  date: string;
  category: string;
}

export default function NewsScreen() {
  const { theme } = useTheme();
  const [news, setNews] = React.useState<News[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  React.useEffect(() => {
    fetchNews();
  }, [selectedCategory]);

  const fetchNews = async () => {
    try {
      // VLRGG API'de news endpoint yok, dummy veri kullanılıyor
      setNews([
        {
          id: '1',
          title: 'Valorant Dünya Şampiyonası Başladı',
          summary: 'Dünyanın en iyi takımları şampiyonluk için mücadele ediyor.',
          content: '',
          imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420',
          author: 'Admin',
          date: '2024-06-17',
          category: 'tournaments',
        },
        {
          id: '2',
          title: 'Yeni Transferler Açıklandı',
          summary: 'Birçok yıldız oyuncu yeni takımlarına transfer oldu.',
          content: '',
          imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
          author: 'Editör',
          date: '2024-06-16',
          category: 'transfers',
        },
      ]);
    } catch (error) {
      console.error('Haber verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderNewsItem = ({ item }: { item: News }) => (
    <Link href={`/news/${item.id}`} asChild>
      <TouchableOpacity style={[styles.newsCard, { backgroundColor: theme.colors.surface }]}>
        <Image source={{ uri: item.imageUrl }} style={styles.newsImage} />
        <View style={styles.newsContent}>
          <View style={styles.newsHeader}>
            <Text style={[styles.category, { color: theme.colors.primary }]}>{item.category}</Text>
            <Text style={[styles.date, { color: theme.colors.textSecondary }]}>{item.date}</Text>
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text>
          <Text style={[styles.summary, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {item.summary}
          </Text>
          <View style={styles.footer}>
            <Text style={[styles.author, { color: theme.colors.textSecondary }]}>
              {item.author}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
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
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  if (!news.length) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Haber verisi alınamadı. Lütfen bağlantınızı ve API sunucunuzu kontrol edin.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={styles.categoriesContainer}>
        {renderCategoryButton('all', 'Tümü')}
        {renderCategoryButton('tournaments', 'Turnuvalar')}
        {renderCategoryButton('teams', 'Takımlar')}
        {renderCategoryButton('players', 'Oyuncular')}
        {renderCategoryButton('transfers', 'Transferler')}
      </View>
      <FlatList
        data={news}
        renderItem={renderNewsItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
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
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  newsCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  newsImage: {
    width: '100%',
    height: 200,
  },
  newsContent: {
    padding: 16,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    fontWeight: '500',
  },
  date: {
    fontSize: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  author: {
    fontSize: 14,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
}); 