import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { getUpcomingMatches, getLiveMatches, getCompletedMatches } from '@/services/vlrApi';
import { teamLogos } from '../../assets/logos';

const DEFAULT_TEAM_LOGO = require('../../assets/logos/default.png');

function normalizeTeamName(name: string) {
  return name?.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const FILTERS = [
  { key: 'upcoming', label: 'Yaklaşan', fetch: getUpcomingMatches },
  { key: 'live', label: 'Canlı', fetch: getLiveMatches },
  { key: 'completed', label: 'Tamamlanan', fetch: getCompletedMatches },
];

export default function MatchesScreen() {
  const { theme } = useTheme();
  const [matches, setMatches] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedFilter, setSelectedFilter] = React.useState('upcoming');
  const router = useRouter();

  React.useEffect(() => {
    fetchMatches();
  }, [selectedFilter]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const filterObj = FILTERS.find(f => f.key === selectedFilter);
      const data = filterObj ? await filterObj.fetch() : [];
      setMatches(data);
    } catch (error) {
      console.error('Maç verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTeamLogo = (teamName: string) => {
    if (!teamName) return teamLogos['default'];
    const key = normalizeTeamName(teamName);
    return teamLogos[key] || teamLogos['default'];
  };

  const renderMatchItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity 
        style={[styles.matchCard, { backgroundColor: theme.colors.background, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 }]}
        onPress={() => router.push(`/match/${item.id}`)}
        activeOpacity={0.85}
      >
        <View style={styles.matchHeader}>
          <Text style={[styles.tournamentName, { color: theme.colors.text, opacity: 0.7 }]}>{item.event || '-'}</Text>
          <Text style={[styles.matchTime, { color: theme.colors.text, opacity: 0.7 }]}>{item.datetime ? new Date(item.datetime).toLocaleString('tr-TR') : '-'}</Text>
        </View>
        <View style={styles.teamsContainer}>
          <View style={styles.teamInfo}>
            <Image 
              source={getTeamLogo(item.teams?.[0]?.name)}
              style={styles.teamLogo}
              defaultSource={teamLogos['default']}
            />
            <Text style={[styles.teamName, { color: theme.colors.text }]} numberOfLines={1}>{item.teams?.[0]?.name || '-'}</Text>
          </View>
          <View style={styles.matchInfo}>
            <Text style={[styles.score, { color: theme.colors.primary }]}>{item.scores ? `${item.scores[0]} - ${item.scores[1]}` : '-'}</Text>
            <Text style={[styles.matchStatus, { color: theme.colors.text, opacity: 0.7 }]}>{item.status || '-'}</Text>
          </View>
          <View style={styles.teamInfo}>
            <Image 
              source={getTeamLogo(item.teams?.[1]?.name)}
              style={styles.teamLogo}
              defaultSource={teamLogos['default']}
            />
            <Text style={[styles.teamName, { color: theme.colors.text }]} numberOfLines={1}>{item.teams?.[1]?.name || '-'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterButton = (filter: string, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && { backgroundColor: theme.colors.primary, borderWidth: 0 },
      ]}
      onPress={() => setSelectedFilter(filter)}
      activeOpacity={0.85}
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          style={{ marginBottom: 8 }}
        >
          {FILTERS.map(f => renderFilterButton(f.key, f.label))}
        </ScrollView>
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 32 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
        style={{ marginBottom: 8 }}
      >
        {FILTERS.map(f => renderFilterButton(f.key, f.label))}
      </ScrollView>
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
          keyExtractor={(item, idx) => String(item.id || idx)}
          contentContainerStyle={[styles.listContainer, { backgroundColor: theme.colors.background }]}
          style={{ backgroundColor: theme.colors.background }}
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
  filterScroll: {
    paddingHorizontal: 8,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
  },
  filterButton: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 0, 0, 0.08)',
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.12)',
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  matchCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    marginHorizontal: 8,
    backgroundColor: '#181818',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
    marginTop: 8,
  },
  teamInfo: {
    flex: 1,
    alignItems: 'center',
  },
  teamLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
    backgroundColor: '#222',
    borderWidth: 1.5,
    borderColor: '#333',
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  matchInfo: {
    alignItems: 'center',
    marginHorizontal: 18,
    minWidth: 60,
  },
  score: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  matchStatus: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.7,
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
    marginTop: 64,
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.7,
  },
}); 