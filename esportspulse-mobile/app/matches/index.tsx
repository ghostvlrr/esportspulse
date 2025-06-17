import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '@/constants/theme';
import { useEffect, useState, useCallback } from 'react';
import { getLiveMatches, getUpcomingMatches, getCompletedMatches } from '@/services/vlrApi';
import { Ionicons } from '@expo/vector-icons';

interface Match {
  id: string;
  team1: string;
  team2: string;
  score1?: number;
  score2?: number;
  status: string;
  time: string;
}

export default function MatchesScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'completed'>('live');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async () => {
    try {
      setError(null);
      let data: Match[] = [];
      
      switch (activeTab) {
        case 'live':
          data = await getLiveMatches();
          break;
        case 'upcoming':
          data = await getUpcomingMatches();
          break;
        case 'completed':
          data = await getCompletedMatches();
          break;
      }
      
      setMatches(data);
    } catch (error) {
      setError('Maçlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMatches();
  }, [activeTab]);

  useEffect(() => {
    fetchMatches();
  }, [activeTab]);

  const renderMatch = ({ item }: { item: Match }) => (
    <View style={[styles.matchCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.matchHeader}>
        <View style={styles.statusContainer}>
          <Ionicons
            name={activeTab === 'live' ? 'radio' : activeTab === 'upcoming' ? 'time' : 'checkmark-circle'}
            size={16}
            color={activeTab === 'live' ? theme.colors.error : activeTab === 'upcoming' ? theme.colors.warning : theme.colors.success}
          />
          <Text style={[styles.matchStatus, { color: theme.colors.text }]}>{item.status}</Text>
        </View>
        <Text style={[styles.matchTime, { color: theme.colors.text }]}>{item.time}</Text>
      </View>
      <View style={styles.matchTeams}>
        <Text style={[styles.teamName, { color: theme.colors.text }]}>{item.team1}</Text>
        {item.score1 !== undefined && (
          <Text style={[styles.score, { color: theme.colors.primary }]}>{item.score1}</Text>
        )}
        <Text style={[styles.vs, { color: theme.colors.text }]}>vs</Text>
        {item.score2 !== undefined && (
          <Text style={[styles.score, { color: theme.colors.primary }]}>{item.score2}</Text>
        )}
        <Text style={[styles.teamName, { color: theme.colors.text }]}>{item.team2}</Text>
      </View>
    </View>
  );

  const renderTabButton = (tab: 'live' | 'upcoming' | 'completed', label: string, icon: string) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && { backgroundColor: theme.colors.primary },
      ]}
      onPress={() => setActiveTab(tab)}>
      <Ionicons
        name={icon}
        size={16}
        color={activeTab === tab ? '#fff' : theme.colors.text}
        style={styles.tabIcon}
      />
      <Text
        style={[
          styles.tabButtonText,
          { color: activeTab === tab ? '#fff' : theme.colors.text },
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Maçlar yükleniyor...</Text>
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.tabContainer}>
        {renderTabButton('live', 'Canlı', 'radio')}
        {renderTabButton('upcoming', 'Yaklaşan', 'time')}
        {renderTabButton('completed', 'Tamamlanan', 'checkmark-circle')}
      </View>
      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            {activeTab === 'live'
              ? 'Şu anda canlı maç bulunmuyor.'
              : activeTab === 'upcoming'
              ? 'Yaklaşan maç bulunmuyor.'
              : 'Tamamlanan maç bulunmuyor.'}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 4,
  },
  tabIcon: {
    marginRight: 4,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
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
    marginBottom: 12,
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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