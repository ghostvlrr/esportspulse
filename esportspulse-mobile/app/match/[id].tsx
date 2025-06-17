import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { getMatchDetails } from '@/services/vlrApi';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { teamLogos } from '../../assets/logos';

const DEFAULT_TEAM_LOGO = require('../../assets/logos/default.png');

function normalizeTeamName(name: string) {
  return name?.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export default function MatchDetailScreen() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams();
  const [match, setMatch] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    fetchMatch();
  }, [id]);

  const fetchMatch = async () => {
    setLoading(true);
    try {
      const data = await getMatchDetails(id as string);
      setMatch(data);
    } catch (error) {
      console.error('Maç detayı yüklenirken hata:', error);
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

  if (!match) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.colors.primary} style={{ marginBottom: 16 }} />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>Maç bulunamadı</Text>
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
          <View style={styles.teamBox}>
            <Image source={getTeamLogo(match.teams?.[0]?.name)} style={styles.teamLogo} />
            <Text style={[styles.teamName, { color: theme.colors.text }]}>{match.teams?.[0]?.name}</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={[styles.score, { color: theme.colors.primary }]}>{match.scores ? `${match.scores[0]} - ${match.scores[1]}` : '-'}</Text>
            <Text style={[styles.status, { color: theme.colors.text, opacity: 0.7 }]}>{match.status}</Text>
          </View>
          <View style={styles.teamBox}>
            <Image source={getTeamLogo(match.teams?.[1]?.name)} style={styles.teamLogo} />
            <Text style={[styles.teamName, { color: theme.colors.text }]}>{match.teams?.[1]?.name}</Text>
          </View>
        </View>
        <Text style={[styles.tournament, { color: theme.colors.text, opacity: 0.7 }]}>{match.event}</Text>
        <Text style={[styles.date, { color: theme.colors.text, opacity: 0.7 }]}>{match.datetime ? new Date(match.datetime).toLocaleString('tr-TR') : ''}</Text>
        {/* Haritalar ve istatistikler */}
        {match.maps && match.maps.length > 0 && (
          <View style={styles.mapsSection}>
            <Text style={[styles.mapsTitle, { color: theme.colors.text }]}>Haritalar</Text>
            {match.maps.map((map: any, idx: number) => (
              <View key={idx} style={styles.mapCard}>
                <Text style={[styles.mapName, { color: theme.colors.primary }]}>{map.name}</Text>
                <Text style={[styles.mapScore, { color: theme.colors.text }]}>{map.score}</Text>
              </View>
            ))}
          </View>
        )}
        {/* Oyuncu istatistikleri vs. eklenebilir */}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 16,
  },
  teamBox: {
    alignItems: 'center',
    flex: 1,
  },
  teamLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
    backgroundColor: '#222',
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scoreBox: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  score: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 14,
    marginTop: 2,
  },
  tournament: {
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  date: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  mapsSection: {
    width: '100%',
    marginTop: 16,
  },
  mapsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mapCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#222',
    marginBottom: 8,
  },
  mapName: {
    fontSize: 16,
    fontWeight: '600',
  },
  mapScore: {
    fontSize: 16,
    fontWeight: '500',
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