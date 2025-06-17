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
import { teamLogos } from '../../assets/logos';

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
  const theme = useTheme();
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

  const getTeamLogo = (teamName: string) => {
    if (!teamName) return teamLogos['default'];
    const key = teamName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return teamLogos[key] || teamLogos['default'];
  };

  const renderMatchItem = ({ item }: { item: Match }) => {
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
              defaultSource={teamLogos['default']}
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
              defaultSource={teamLogos['default']}
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
        <View style={styles.filterContainer}>
          {renderFilterButton('all', 'Tümü')}
          {renderFilterButton('live', 'Canlı')}
          {renderFilterButton('upcoming', 'Yaklaşan')}
          {renderFilterButton('completed', 'Tamamlanan')}
        </View>
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 32 }} />
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
      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="trophy-outline" size={64} color={theme.colors.primary} style={{ marginBottom: 16 }} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Maç verisi bulunamadı</Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.text, opacity: 0.7 }]}>Bu kategoride şu anda maç yok.</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatchItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 48,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
}); 