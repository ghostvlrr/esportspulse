import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { getTeamDetails } from '@/services/vlrApi';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { teamLogos } from '../../assets/logos';

const DEFAULT_TEAM_LOGO = require('../../assets/logos/default.png');

function normalizeTeamName(name: string) {
  return name?.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export default function TeamDetailScreen() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams();
  const [team, setTeam] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    fetchTeam();
  }, [id]);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const data = await getTeamDetails(id as string);
      setTeam(data);
    } catch (error) {
      console.error('Takım detayı yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTeamLogo = (teamName: string) => {
    if (!teamName) return teamLogos['default'];
    const key = normalizeTeamName(teamName);
    return teamLogos[key] || teamLogos['default'];
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 48 }} />
      </SafeAreaView>
    );
  }

  if (!team) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.colors.primary} style={{ marginBottom: 16 }} />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>Takım bulunamadı</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.header}>
          <Image source={getTeamLogo(team.name)} style={styles.teamLogo} />
          <Text style={[styles.teamName, { color: theme.colors.text }]}>{team.name}</Text>
          <Text style={[styles.teamRegion, { color: theme.colors.text, opacity: 0.7 }]}>{team.region}</Text>
          <Text style={[styles.teamRanking, { color: theme.colors.primary }]}>#{team.ranking}</Text>
        </View>
        <View style={styles.statsBox}>
          <Text style={[styles.statsLabel, { color: theme.colors.text, opacity: 0.7 }]}>Galibiyet: <Text style={{ color: theme.colors.text }}>{team.wins ?? '-'}</Text></Text>
          <Text style={[styles.statsLabel, { color: theme.colors.text, opacity: 0.7 }]}>Mağlubiyet: <Text style={{ color: theme.colors.text }}>{team.losses ?? '-'}</Text></Text>
        </View>
        {team.players && team.players.length > 0 && (
          <View style={styles.playersSection}>
            <Text style={[styles.playersTitle, { color: theme.colors.text }]}>Oyuncular</Text>
            {team.players.map((player: any, idx: number) => (
              <View key={idx} style={styles.playerCard}>
                <Ionicons name="person" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.playerName, { color: theme.colors.text }]}>{player.name}</Text>
                <Text style={[styles.playerRole, { color: theme.colors.text, opacity: 0.7 }]}>{player.role}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  teamLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    backgroundColor: '#222',
  },
  teamName: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  teamRegion: {
    fontSize: 15,
    marginBottom: 2,
    textAlign: 'center',
  },
  teamRanking: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  statsBox: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statsLabel: {
    fontSize: 15,
  },
  playersSection: {
    width: '100%',
    marginTop: 16,
  },
  playersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#222',
    marginBottom: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  playerRole: {
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
}); 