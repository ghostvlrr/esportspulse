import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { apiService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { ENDPOINTS } from '@/constants/ApiConfig';
import { getMatches, getLiveMatches, getUpcomingMatches, getCompletedMatches } from '../../services/api';
import { Match } from '../../types/match';
import { formatDate } from '../../utils/dateUtils';

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
  matchPage: string;
  timeUntil: string;
}

const DEFAULT_TEAM_LOGO = require('../../assets/logos/default.png');

export default function MatchesScreen() {
  const { theme } = useTheme();
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedFilter, setSelectedFilter] = React.useState('all');
  const router = useRouter();

  React.useEffect(() => {
    fetchMatches();
  }, [selectedFilter]);

  const fetchMatches = async () => {
    try {
      let endpoint = ENDPOINTS.upcoming;
      if (selectedFilter === 'live') endpoint = ENDPOINTS.live;
      else if (selectedFilter === 'completed') endpoint = ENDPOINTS.completed;
      const response = await apiService.get<any>(endpoint);
      if (!response.error) {
        const segments = response.data?.data?.segments || [];
        const mappedMatches = segments.map((item: any, idx: number) => ({
          id: String(idx),
          homeTeam: item.team1,
          awayTeam: item.team2,
          date: item.unix_timestamp,
          status: item.match_series,
          tournament: item.match_event,
          homeTeamLogo: item.flag1 ? `https://owcdn.net/img/${item.flag1}.png` : DEFAULT_TEAM_LOGO,
          awayTeamLogo: item.flag2 ? `https://owcdn.net/img/${item.flag2}.png` : DEFAULT_TEAM_LOGO,
          score: `${item.score1 || '0'} - ${item.score2 || '0'}`,
          matchPage: item.match_page,
          timeUntil: item.time_until_match,
        }));
        setMatches(mappedMatches);
      }
    } catch (error) {
      console.error('Maç verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMatchItem = ({ item }: { item: Match }) => {
    const getTeamLogo = (teamName: string) => {
      const logoName = teamName.toLowerCase().replace(/[^a-z0-9]/g, '');
      try {
        return require(`../../assets/logos/${logoName}.png`);
      } catch {
        return DEFAULT_TEAM_LOGO;
      }
    };

    return (
      <TouchableOpacity 
        style={[styles.matchCard, { backgroundColor: theme.colors.card }]}
        onPress={() => router.push(`/match/${item.id}`)}
      >
        <View style={styles.matchHeader}>
          <Text style={[styles.tournamentName, { color: theme.colors.text }]}>
            {item.tournament}
          </Text>
          <Text style={[styles.matchTime, { color: theme.colors.text }]}>
            {formatDate(item.date)}
          </Text>
        </View>

        <View style={styles.teamsContainer}>
          <View style={styles.teamInfo}>
            <Image 
              source={getTeamLogo(item.homeTeam)}
              style={styles.teamLogo}
              defaultSource={DEFAULT_TEAM_LOGO}
            />
            <Text style={[styles.teamName, { color: theme.colors.text }]} numberOfLines={1}>
              {item.homeTeam}
            </Text>
          </View>

          <View style={styles.matchInfo}>
            <Text style={[styles.vsText, { color: theme.colors.text }]}>VS</Text>
            <Text style={[styles.matchStatus, { color: theme.colors.text }]}>
              {item.status}
            </Text>
          </View>

          <View style={styles.teamInfo}>
            <Image 
              source={getTeamLogo(item.awayTeam)}
              style={styles.teamLogo}
              defaultSource={DEFAULT_TEAM_LOGO}
            />
            <Text style={[styles.teamName, { color: theme.colors.text }]} numberOfLines={1}>
              {item.awayTeam}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
  matchTime: {
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
  matchInfo: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  vsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  matchStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
}); 