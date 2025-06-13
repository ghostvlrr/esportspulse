import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { vlrApi, Match } from '../services/vlrApi';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../styles/colors';

export default function UpcomingMatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      try {
        const data = await vlrApi.getUpcomingMatches();
        setMatches(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.accent} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MatchDetails', { matchId: item.id })}>
            <Text style={styles.title}>{item.team1} vs {item.team2}</Text>
            <Text>{item.tournament}</Text>
            <Text>{item.status}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: 8, margin: 8, padding: 12 },
  container: { flex: 1, padding: 8 },
  title: { color: COLORS.accent, fontSize: 16, fontWeight: 'bold' },
}); 