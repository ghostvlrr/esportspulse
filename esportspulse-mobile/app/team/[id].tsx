import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '@/constants/theme';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Team {
  id: string;
  name: string;
  logo: string;
  players: any[];
}

export default function TeamDetailsScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeam();
  }, [id]);

  const fetchTeam = async () => {
    try {
      setError(null);
      const response = await axios.get(`https://vlrggapi.vercel.app/team/${id}`);
      setTeam(response.data.data || null);
    } catch (error) {
      setError('Takım detayları alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <View style={[styles.container, { backgroundColor: theme.colors.background }]}><Text style={{ color: theme.colors.text }}>Yükleniyor...</Text></View>;
  }
  if (error || !team) {
    return <View style={[styles.container, { backgroundColor: theme.colors.background }]}><Text style={{ color: theme.colors.error }}>{error || 'Takım bulunamadı.'}</Text></View>;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Text style={[styles.teamName, { color: theme.colors.text }]}>{team.name}</Text>
      {/* Oyuncular ve diğer detaylar buraya eklenebilir */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  teamName: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
}); 