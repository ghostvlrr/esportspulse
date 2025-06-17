import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '@/constants/theme';
import type { Match } from '@/constants/types';

interface MatchCardProps {
  match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.card }]}
      onPress={() => router.push(`/match/${match.id}`)}>
      <View style={styles.teamContainer}>
        <Text style={[styles.teamName, { color: theme.colors.text }]}>{match.team1}</Text>
        <Text style={[styles.score, { color: theme.colors.primary }]}>{match.score1}</Text>
      </View>
      <View style={styles.vsContainer}>
        <Text style={[styles.vs, { color: theme.colors.text }]}>VS</Text>
        <Text style={[styles.status, { color: theme.colors.text }]}>
          {match.status === 'live' ? 'CANLI' : match.status === 'upcoming' ? 'YAKLAŞAN' : 'TAMAMLANDI'}
        </Text>
      </View>
      <View style={styles.teamContainer}>
        <Text style={[styles.teamName, { color: theme.colors.text }]}>{match.team2}</Text>
        <Text style={[styles.score, { color: theme.colors.primary }]}>{match.score2}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamContainer: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  vsContainer: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  vs: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  status: {
    fontSize: 12,
    opacity: 0.8,
  },
}); 