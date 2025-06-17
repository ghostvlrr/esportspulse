import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/services/api';

interface NotificationPreferences {
  matchStart: boolean;
  scoreChange: boolean;
  matchEnd: boolean;
  news: boolean;
}

export default function NotificationsScreen() {
  const theme = useTheme();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    matchStart: true,
    scoreChange: true,
    matchEnd: true,
    news: true,
  });
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await api.get('/notifications/preferences');
      setPreferences(response.data);
    } catch (error) {
      console.error('Bildirim tercihleri yüklenirken hata:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    onRefresh();
  }, []);

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: boolean) => {
    try {
      const newPreferences = { ...preferences, [key]: value };
      await api.put('/notifications/preferences', newPreferences);
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Bildirim tercihi güncellenirken hata:', error);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Bildirim Ayarları</Text>
        
        <View style={styles.preferenceItem}>
          <View style={styles.preferenceText}>
            <Text style={[styles.preferenceTitle, { color: theme.colors.text }]}>
              Maç Başlangıç Bildirimleri
            </Text>
            <Text style={[styles.preferenceDescription, { color: theme.colors.textSecondary }]}>
              Maç başlangıç bildirimleri
            </Text>
          </View>
          <Switch
            value={preferences.matchStart}
            onValueChange={(value) => handlePreferenceChange('matchStart', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.background}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceText}>
            <Text style={[styles.preferenceTitle, { color: theme.colors.text }]}>
              Skor Değişikliği Bildirimleri
            </Text>
            <Text style={[styles.preferenceDescription, { color: theme.colors.textSecondary }]}>
              Canlı maç skor değişiklikleri
            </Text>
          </View>
          <Switch
            value={preferences.scoreChange}
            onValueChange={(value) => handlePreferenceChange('scoreChange', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.background}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceText}>
            <Text style={[styles.preferenceTitle, { color: theme.colors.text }]}>
              Maç Sonu Bildirimleri
            </Text>
            <Text style={[styles.preferenceDescription, { color: theme.colors.textSecondary }]}>
              Maç sonuç bildirimleri
            </Text>
          </View>
          <Switch
            value={preferences.matchEnd}
            onValueChange={(value) => handlePreferenceChange('matchEnd', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.background}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceText}>
            <Text style={[styles.preferenceTitle, { color: theme.colors.text }]}>
              Haber Bildirimleri
            </Text>
            <Text style={[styles.preferenceDescription, { color: theme.colors.textSecondary }]}>
              Önemli haberler ve güncellemeler
            </Text>
          </View>
          <Switch
            value={preferences.news}
            onValueChange={(value) => handlePreferenceChange('news', value)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.background}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  preferenceText: {
    flex: 1,
    marginRight: 16,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
  },
}); 