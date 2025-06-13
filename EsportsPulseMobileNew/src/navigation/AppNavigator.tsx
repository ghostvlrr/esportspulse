import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { MatchDetailsScreen } from '../screens/MatchDetailsScreen';
import TeamDetailsScreen from '../screens/TeamDetailsScreen';
import PlayerDetailsScreen from '../screens/PlayerDetailsScreen';
import TournamentDetailsScreen from '../screens/TournamentDetailsScreen';
import { COLORS } from '../styles/colors';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LiveMatchesScreen from '../screens/LiveMatchesScreen';
import UpcomingMatchesScreen from '../screens/UpcomingMatchesScreen';
import CompletedMatchesScreen from '../screens/CompletedMatchesScreen';

export type RootStackParamList = {
  Home: undefined;
  MatchDetails: { matchId: string };
  TeamDetails: { teamId: string };
  PlayerDetails: { playerId: string };
  TournamentDetails: { tournamentId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Canlı" component={LiveMatchesScreen} />
      <Tab.Screen name="Yaklaşan" component={UpcomingMatchesScreen} />
      <Tab.Screen name="Tamamlanan" component={CompletedMatchesScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.background,
          },
          headerTintColor: COLORS.textPrimary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen name="Home" component={MainTabs} options={{ title: 'Maçlar' }} />
        <Stack.Screen
          name="MatchDetails"
          component={MatchDetailsScreen}
          options={{
            title: 'Maç Detayı',
          }}
        />
        <Stack.Screen name="TeamDetails" component={TeamDetailsScreen} options={{ title: 'Takım Detayı' }} />
        <Stack.Screen name="PlayerDetails" component={PlayerDetailsScreen} options={{ title: 'Oyuncu Detayı' }} />
        <Stack.Screen name="TournamentDetails" component={TournamentDetailsScreen} options={{ title: 'Turnuva Detayı' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 