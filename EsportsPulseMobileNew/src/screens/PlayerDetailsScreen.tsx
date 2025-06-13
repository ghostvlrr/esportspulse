import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../styles/colors';
import { vlrApi, Player, Team } from '../services/vlrApi';

type PlayerDetailsRouteProp = RouteProp<RootStackParamList, 'PlayerDetails'>;

export const PlayerDetailsScreen = () => {
  const route = useRoute<PlayerDetailsRouteProp>();
  const { playerId } = route.params;
  const [player, setPlayer] = useState<Player | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const playerData = await vlrApi.getPlayerDetails(playerId);
        setPlayer(playerData);
        if (playerData.team) {
          const teamData = await vlrApi.getTeamDetails(playerData.team);
          setTeam(teamData);
        } else {
          setTeam(null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [playerId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (!player) {
    return <Text style={styles.emptyText}>Oyuncu bulunamadı.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.playerName}>{player.name}</Text>
      <Text style={styles.playerInfo}>Ad: {player.name}</Text>
      <Text style={styles.playerInfo}>Ülke: {player.country}</Text>
      <Text style={styles.playerInfo}>Takım: {team ? team.name : 'Yok'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.background, flex: 1, padding: 16 },
  emptyText: { color: COLORS.textSecondary, marginTop: 32, textAlign: 'center' },
  loadingContainer: { alignItems: 'center', backgroundColor: COLORS.background, flex: 1, justifyContent: 'center' },
  playerInfo: { c