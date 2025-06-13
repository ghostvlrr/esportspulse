import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../styles/colors';
import { vlrApi, Team, Match } from '../services/vlrApi';

type TeamDetailsRouteProp = RouteProp<RootStackParamList, 'TeamDetails'>;

export const TeamDetailsScreen = () => {
  const route = useRoute<TeamDetailsRouteProp>();
  const { teamId } = route.params;
  const [team, setTeam] = useState<Team | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const teamData = await vlrApi.getTeamDetails(teamId);
        setTeam(teamData);
        const teamMatches = await vlrApi.getTeamMatches(teamId);
        setMatches(teamMatches);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [teamId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (!team) {
    return <Text style={styles.emptyText}>Takım bulunamadı.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.teamName}>{team.name}</Text>
      <Text style={styles.teamInfo}>Ülke: {team.country}</Text>
      <Text style={styles.sectionTitle}>Maçlar</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.matchCard}>
            <Text style={styles.matchText}>{item.team1} vs {item.team2}</Text>
            <Text style={styles.matchText}>{item.tournament}</Text>
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
  teamInfo: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 4 },
  teamName: { color: COLORS.textPrimary, fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
}); 