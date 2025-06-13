import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../styles/colors';
import { vlrApi, Tournament, Match } from '../services/vlrApi';

type TournamentDetailsRouteProp = RouteProp<RootStackParamList, 'TournamentDetails'>;

export const TournamentDetailsScreen = () => {
  const route = useRoute<TournamentDetailsRouteProp>();
  const { tournamentId } = route.params;
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const data = await vlrApi.getTournamentDetails(tournamentId);
        setTournament(data.tournament);
        setMatches(data.matches);
      } finally {
        setLoading(false);
      }
    };
    fetchTournament();
  }, [tournamentId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (!tournament) {
    return <Text style={styles.emptyText}>Turnuva bulunamadı.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.tournamentName}>{tournament.name}</Text>
      <Text style={styles.tournamentInfo}>Başlangıç: {tournament.startDate}</Text>
      <Text style={styles.tournamentInfo}>Bitiş: {tournament.endDate}</Text>
      <Text style={styles.sectionTitle}>Maçlar</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.matchCard}>
            <Text style={styles.matchText}>{item.team1} vs {item.team2}</Text>
            <Text style={styles.matchText}>{item.status}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Maç bulunamadı.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.background, flex: 1, padding: 16 },
  emptyText: { color: COLORS.textSecondary, marginTop: 32, textAlign: 'center' },
  loadingContainer: { alignItems: 'center', backgroundColor: COLORS.background, flex: 1, justifyContent: 'center' },
  matchCard: { backgroundColor: COLORS.card, borderRadius: 8, marginVertical: 6, padding: 12 },
  matchText: { color: COLORS.textPrimary, fontSize: 14 },
  sectionTitle: { color: COLORS.accent, fontSize: 16, fontWeight: 'bold', marginVertical: 12 },
  tournamentInfo: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 4 },
  tournamentName: { color: COLORS.textPrimary, fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
}); 