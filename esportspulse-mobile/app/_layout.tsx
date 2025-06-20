import { Tabs } from 'expo-router';
import { useColorScheme, View } from 'react-native';
import { darkTheme, lightTheme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const TABS = [
  { name: 'Ana Sayfa', icon: 'home' as const, route: 'index' },
  { name: 'Maçlar', icon: 'trophy' as const, route: 'matches/index' },
  { name: 'Takımlar', icon: 'people' as const, route: 'teams/index' },
  { name: 'Haberler', icon: 'newspaper' as const, route: 'news/index' },
  { name: 'Favoriler', icon: 'heart' as const, route: 'favorites/index' },
  { name: 'Bildirimler', icon: 'notifications' as const, route: 'notifications/index' },
  { name: 'Profil', icon: 'person' as const, route: 'profile/index' },
];

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.tabBarInactive,
          tabBarStyle: {
            backgroundColor: theme.colors.background,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            elevation: 10,
            zIndex: 10,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 35,
          },
          headerStyle: {
            backgroundColor: theme.colors.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontSize: theme.typography.h2.fontSize,
            fontWeight: 'bold',
            color: theme.colors.text,
          },
          tabBarLabelStyle: {
            fontSize: theme.typography.small.fontSize,
            fontWeight: '600',
          },
        }}>
        {TABS.map((tab) => (
          <Tabs.Screen
            key={tab.route}
            name={tab.route}
            options={{
              title: tab.name,
              tabBarIcon: ({ color, size }) => <Ionicons name={tab.icon} size={size} color={color} />,
            }}
          />
        ))}
      </Tabs>
    </View>
  );
}
