import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator, Dimensions } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { teamLogos } from '../../assets/logos';
import { getTeams } from '@/services/vlrApi';

const DEFAULT_TEAM_LOGO = require('../../assets/logos/default.png');

function normalizeTeamName(name: string) {
  return name
    ?.toLowerCase()
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ç/g, 'c')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ğ/g, 'g')
    .replace(/[^a-z0-9]/g, '');
}

const numColumns = 2;
const CARD_WIDTH = (Dimensions.get('window').width - 48) / numColumns;

export default function TeamsScreen() {
  const { theme } = useTheme();
  const [teams, setTeams] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const router = useRouter();

  React.useEffect(() => {
    fetchTeamsData();
  }, []);

  const fetchTeamsData = async () => {
    setLoading(true);
    try {
      const data = await getTeams();
      if (!data || !Array.isArray(data) || data.length === 0) {
        // Dummy veri fallback
        setTeams([
          { id: '1', name: 'Dummy Team', region: 'EU', ranking: 1, wins: 10, losses: 2, players: [] },
          { id: '2', name: 'Test Team', region: 'NA', ranking: 2, wins: 8, losses: 4, players: [] },
        ]);
      } else {
        setTeams(data);
      }
    } catch (error) {
      setTeams([
        { id: '1', name: 'Dummy Team', region: 'EU', ranking: 1, wins: 10, losses: 2, players: [] },
        { id: '2', name: 'Test Team', region: 'NA', ranking: 2, wins: 8, losses: 4, players: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter((team) =>
    team.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTeamLogo = (teamName: string) => {
    if (!teamName) return teamLogos['default'];
    const key = normalizeTeamName(teamName);
    if (!teamLogos[key]) {
      // console.log('Logo bulunamadı:', teamName, '->', key);
    }
    return teamLogos[key] || teamLogos['default'];
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 48 }} />
      </SafeAreaView>
    );
  }

  if (!filteredTeams.length) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color={theme.colors.primary} style={{ marginBottom: 16 }} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Takım bulunamadı</Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.text, opacity: 0.7 }]}>Aramanı değiştir veya daha sonra tekrar dene.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderTeamItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity 
        style={[styles.teamCard, { backgroundColor: theme.colors.background, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4, width: CARD_WIDTH }]}
        onPress={() => router.push(`/team/${item.id}`)}
        activeOpacity={0.85}
      >
        <Image 
          source={getTeamLogo(item.name)}
          style={styles.teamLogo}
          defaultSource={teamLogos['default']}
        />
        <Text style={[styles.teamName, { color: theme.colors.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.teamRegion, { color: theme.colors.text, opacity: 0.7 }]}>{item.region || ''}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.colors.text, opacity: 0.7 }]}>Sıralama</Text>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>#{item.ranking || '-'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.colors.text, opacity: 0.7 }]}>G</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{item.wins ?? '-'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.colors.text, opacity: 0.7 }]}>M</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{item.losses ?? '-'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={22} color={theme.colors.text} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Takım ara..."
          placeholderTextColor={theme.colors.text}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredTeams}
        renderItem={renderTeamItem}
        keyExtractor={(item, idx) => String(item.id || idx)}
        numColumns={numColumns}
        contentContainerStyle={[styles.listContainer, { backgroundColor: theme.colors.background }]}
        style={{ backgroundColor: theme.colors.background }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  teamCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    marginHorizontal: 8,
    backgroundColor: '#181818',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  teamLogo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 10,
    backgroundColor: '#222',
    borderWidth: 1.5,
    borderColor: '#333',
  },
  teamName: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  teamRegion: {
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 2,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
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