import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../styles/colors';
import { vlrApi, Match } from '../services/vlrApi';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen = () => {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const fetchMatches = async () => {
    try {
      const [live, upcoming] = await Promise.all([
        vlrApi.getLiveMatches(),
        vlrApi.getUpcomingMatches(),
      ]);
      setLiveMatches(live);
      setUpcomingMatches(upcoming);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  const renderMatchItem = ({ item }: { item: Match }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => navigation.navigate('MatchDetails', { matchId: item.id })}
    >
      <Text style={styles.tournamentName}>{item.tournament}</Text>
      <View style={styles.teamsContainer}>
        <Text style={styles.teamName}>{item.team1}</Text>
        <Text style={styles.score}>
          {item.status === 'upcoming' ? 'vs' : `${item.score1} - ${item.score2}`}
        </Text>
        <Text style={styles.teamName}>{item.team2}</Text>
      </View>
      <Text style={styles.matchStatus}>
        {item.status === 'live' ? 'CANLI' : 'Yaklaşan'}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={[...liveMatches, ...upcomingMatches]}
        renderItem={renderMatchItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Şu anda maç bulunmuyor</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.background, flex: 1 },
  emptyText: { color: COLORS.textSecondary, marginTop: 32, textAlign: 'center' },
  loadingContainer: { alignItems: 'center', backgroundColor: COLORS.background, flex: 1, justifyContent: 'center' },
  matchCard: { backgroundColor: COLORS.card, borderRadius: 8, elevation: 3, margin: 8, padding: 16 },
  matchStatus: { color: COLORS.accent, fontSize: 12, textAlign: 'right' },
  score: { color: COLORS.accent, fontSize: 18, fontWeight: 'bold', marginHorizontal: 16 },
  teamName: { color: COLORS.textPrimary, flex: 1, fontSize: 16 },
  teamsContainer: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  tournamentName: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 8 },
}); 