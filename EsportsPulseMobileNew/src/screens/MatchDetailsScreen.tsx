import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { scheduleMatchNotification } from '../services/notificationService';
import { COLORS } from '../styles/colors';
import { vlrApi, MatchDetails } from '../services/vlrApi';

type MatchDetailsRouteProp = RouteProp<{
  MatchDetails: { matchId: string };
}, 'MatchDetails'>;

export const MatchDetailsScreen = () => {
  const route = useRoute<MatchDetailsRouteProp>();
  const navigation = useNavigation();
  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchDetails();
  }, [route.params.matchId]);

  const fetchMatchDetails = async () => {
    try {
      const details = await vlrApi.getMatchDetails(route.params.matchId);
      setMatchDetails(details);
    } finally {
      setLoading(false);
    }
  };

  const handleSetNotification = async () => {
    if (matchDetails) {
      const matchTime = new Date(matchDetails.startTime ?? '');
      await scheduleMatchNotification(
        matchDetails.id,
        `${matchDetails.team1} vs ${matchDetails.team2}`,
        'Maç başlamak üzere!',
        matchTime
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (!matchDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Maç detayları bulunamadı</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.tournamentName}>{matchDetails.tournament}</Text>
        <View style={styles.teamsContainer}>
          <Text style={styles.teamName}>{matchDetails.team1}</Text>
          <Text style={styles.score}>
            {matchDetails.status === 'upcoming'
              ? 'vs'
              : `${matchDetails.score1} - ${matchDetails.score2}`}
          </Text>
          <Text style={styles.teamName}>{matchDetails.team2}</Text>
        </View>
        {matchDetails.status === 'upcoming' && (
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={handleSetNotification}
          >
            <Text style={styles.notificationButtonText}>
              Maç Başlangıcında Bildirim Al
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {matchDetails.maps.length > 0 && (
        <View style={styles.mapsContainer}>
          <Text style={styles.sectionTitle}>Haritalar</Text>
          {matchDetails.maps.map((map, index) => (
            <View key={index} style={styles.mapItem}>
              <Text style={styles.mapName}>{map.name}</Text>
              <Text style={styles.mapScore}>
                {map.score1} - {map.score2}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.playersContainer}>
        <Text style={styles.sectionTitle}>Oyuncular</Text>
        <View style={styles.playersGrid}>
          <View style={styles.teamColumn}>
            <Text style={styles.teamHeader}>{matchDetails.team1}</Text>
            {matchDetails.players.team1.map((player, index) => (
              <View key={index} style={styles.playerCard}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerAgent}>{player.agent}</Text>
                <Text style={styles.playerStats}>
                  K/D/A: {player.kills}/{player.deaths}/{player.assists}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.teamColumn}>
            <Text style={styles.teamHeader}>{matchDetails.team2}</Text>
            {matchDetails.players.team2.map((player, index) => (
              <View key={index} style={styles.playerCard}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerAgent}>{player.agent}</Text>
                <Text style={styles.playerStats}>
                  K/D/A: {player.kills}/{player.deaths}/{player.assists}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.background, flex: 1 },
  errorContainer: { alignItems: 'center', backgroundColor: COLORS.background, flex: 1, justifyContent: 'center' },
  errorText: { color: COLORS.textSecondary, fontSize: 16 },
  header: { backgroundColor: COLORS.card, padding: 16 },
  loadingContainer: { alignItems: 'center', backgroundColor: COLORS.background, flex: 1, justifyContent: 'center' },
  mapItem: { alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, padding: 12 },
  mapName: { color: COLORS.textPrimary, fontSize: 16 },
  mapScore: { color: COLORS.accent, fontSize: 16, fontWeight: 'bold' },
  notificationButton: { alignItems: 'center', backgroundColor: COLORS.accent, borderRadius: 8, padding: 12 },
  notificationButtonText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: 'bold' },
  playersContainer: { padding: 16 },
  playersGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  teamColumn: { flex: 1, marginHorizontal: 8 },
  teamHeader: { color: COLORS.textPrimary, fontSize: 16, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  teamName: { color: COLORS.textPrimary, flex: 1, fontSize: 18 },
  teamsContainer: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  tournamentName: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 8 },
  playerAgent: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
  playerCard: { backgroundColor: COLORS.card, borderRadius: 8, marginBottom: 8, padding: 12 },
  playerName: { color: COLORS.textPrimary, fontSize: 14, fontWeight: 'bold' },
  playerStats: { color: COLORS.accent, fontSize: 12, marginTop: 4 },
  score: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' },
}); 