import { View, Text, StyleSheet, FlatList, RefreshControl, Image } from 'react-native';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '@/constants/theme';
import { useEffect, useState, useCallback } from 'react';
import { getTeams } from '@/services/vlrApi';

interface Team {
  id: string;
  name: string;
  logo?: string;
}

export default function TeamsScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async () => {
    try {
      setError(null);
      const data = await getTeams();
      setTeams(data);
    } catch (error) {
      setError('Takımlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTeams();
  }, []);

  useEffect(() => {
    fetchTeams();
  }, []);

  const renderTeam = ({ item, index }: { item: Team; index: number }) => (
    <View key={`${item.id}-${index}`} style={[styles.teamCard, { backgroundColor: theme.colors.card }]}>
      {item.logo && (
        <Image
          source={{ uri: item.logo }}
          style={styles.teamLogo}
          defaultSource={require('../../assets/images/team-placeholder.png')}
        />
      )}
      <Text style={[styles.teamName, { color: theme.colors.text }]}>{item.name}</Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Yükleniyor...</Text>
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
    <FlatList
      data={teams}
      renderItem={renderTeam}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      contentContainerStyle={styles.listContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
          Takım bulunamadı.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  teamLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
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