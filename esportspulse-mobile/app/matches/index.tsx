import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
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
  tournament: string;
  homeTeamLogo: string;
  awayTeamLogo: string;
}

export default function MatchesScreen() {
  const { theme } = useTheme();
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedFilter, setSelectedFilter] = React.useState('all');

  React.useEffect(() => {
    fetchMatches();
  }, [selectedFilter]);

  const fetchMatches = async () => {
    try {
      const response = await apiService.get<any>('/match/list');
      if (!response.error) {
        const mappedMatches = (response.data.data || []).map((item: any) => ({
          id: String(item.id),
          homeTeam: item.team1,
          awayTeam: item.team2,
          date: item.time,
          status: item.status,
          tournament: item.event,
          homeTeamLogo: item.team1_logo,
          awayTeamLogo: item.team2_logo,
          score: item.score || '',
        }));
        setMatches(mappedMatches);
      }
    } catch (error) {
      console.error('Maç verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMatchItem = ({ item }: { item: Match }) => (
    <Link href={`/match/${item.id}`} asChild>
      <TouchableOpacity style={[styles.matchCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.matchHeader}>
          <Text style={[styles.tournamentName, { color: theme.colors.textSecondary }]}>
            {item.tournament}
          </Text>
          <Text style={[styles.matchDate, { color: theme.colors.textSecondary }]}>{item.date}</Text>
        </View>

        <View style={styles.teamsContainer}>
          <View style={styles.teamInfo}>
            <Image source={{ uri: item.homeTeamLogo }} style={styles.teamLogo} />
            <Text style={[styles.teamName, { color: theme.colors.text }]}>{item.homeTeam}</Text>
          </View>

          <View style={styles.scoreContainer}>
            <Text style={[styles.score, { color: theme.colors.text }]}>{item.score}</Text>
            <Text style={[styles.status, { color: theme.colors.primary }]}>{item.status}</Text>
          </View>

          <View style={styles.teamInfo}>
            <Image source={{ uri: item.awayTeamLogo }} style={styles.teamLogo} />
            <Text style={[styles.teamName, { color: theme.colors.text }]}>{item.awayTeam}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );

  const renderFilterButton = (filter: string, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && { backgroundColor: theme.colors.primary },
      ]}
      onPress={() => setSelectedFilter(filter)}
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
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  if (!matches.length) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Maç verisi alınamadı. Lütfen bağlantınızı ve API sunucunuzu kontrol edin.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'Tümü')}
        {renderFilterButton('live', 'Canlı')}
        {renderFilterButton('upcoming', 'Yaklaşan')}
        {renderFilterButton('completed', 'Tamamlanan')}
      </View>
      <FlatList
        data={matches}
        renderItem={renderMatchItem}
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
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  matchCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tournamentName: {
    fontSize: 14,
    fontWeight: '500',
  },
  matchDate: {
    fontSize: 14,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamInfo: {
    flex: 1,
    alignItems: 'center',
  },
  teamLogo: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
}); 