import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { apiService } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { ENDPOINTS } from '@/constants/ApiConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Team } from '../../types/team';

interface Team {
  id: string;
  name: string;
  logo: string;
  region: string;
  ranking: number;
  wins: number;
  losses: number;
}

const DEFAULT_TEAM_LOGO = require('../../assets/logos/default.png');

export default function TeamsScreen() {
  const { theme } = useTheme();
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const router = useRouter();

  React.useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await apiService.get<any>(ENDPOINTS.teams);
      if (!response.error) {
        setTeams(response.data.data || response.data);
      }
    } catch (error) {
      console.error('Takım verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTeamItem = ({ item }: { item: Team }) => {
    const getTeamLogo = (teamName: string) => {
      const logoName = teamName.toLowerCase().replace(/[^a-z0-9]/g, '');
      try {
        return require(`../../assets/logos/${logoName}.png`);
      } catch {
        return DEFAULT_TEAM_LOGO;
      }
    };

    return (
      <TouchableOpacity 
        style={[styles.teamCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => router.push(`/team/${item.id}`)}
      >
        <Image 
          source={getTeamLogo(item.name)}
          style={styles.teamLogo}
          defaultSource={DEFAULT_TEAM_LOGO}
        />
        <View style={styles.teamInfo}>
          <Text style={[styles.teamName, { color: theme.colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.teamRegion, { color: theme.colors.textSecondary }]}>
            {item.region}
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Sıralama</Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>#{item.ranking}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>G</Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{item.wins}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>M</Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{item.losses}</Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Takım ara..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredTeams}
        renderItem={renderTeamItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  teamLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  teamInfo: {
    flex: 1,
    marginLeft: 16,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  teamRegion: {
    fontSize: 14,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
}); 