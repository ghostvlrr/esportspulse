import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { notificationService, Notification } from '@/services/notifications';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = notificationService.addListener((updatedNotifications) => {
      setNotifications(updatedNotifications);
    });

    notificationService.initialize().finally(() => {
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
  };

  const handleDeleteNotification = async (notificationId: string) => {
    await notificationService.deleteNotification(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
  };

  const handleClearAll = async () => {
    await notificationService.clearAllNotifications();
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <View style={[styles.notificationCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.notificationHeader}>
        <View style={styles.notificationType}>
          <Ionicons
            name={
              item.type === 'match'
                ? 'trophy'
                : item.type === 'news'
                ? 'newspaper'
                : item.type === 'event'
                ? 'calendar'
                : 'notifications'
            }
            size={20}
            color={theme.colors.primary}
          />
          <Text style={[styles.notificationTypeText, { color: theme.colors.primary }]}>
            {item.type === 'match'
              ? 'Maç'
              : item.type === 'news'
              ? 'Haber'
              : item.type === 'event'
              ? 'Etkinlik'
              : 'Sistem'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleDeleteNotification(item.id)}>
          <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.notificationContent}
        onPress={() => handleMarkAsRead(item.id)}
        disabled={item.read}
      >
        <Text style={[styles.notificationTitle, { color: theme.colors.text }]}>{item.title}</Text>
        <Text style={[styles.notificationMessage, { color: theme.colors.textSecondary }]}>
          {item.message}
        </Text>
        <Text style={[styles.notificationDate, { color: theme.colors.textSecondary }]}>
          {item.createdAt}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  if (notifications.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            Bildirim bulunmuyor
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
            Yeni bildirimler burada görünecek
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Bildirimler</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleMarkAllAsRead}
            disabled={notifications.every((n) => n.read)}
          >
            <Ionicons
              name="checkmark-done"
              size={24}
              color={
                notifications.every((n) => n.read)
                  ? theme.colors.textSecondary
                  : theme.colors.primary
              }
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleClearAll}>
            <Ionicons name="trash" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
  },
  notificationCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  notificationType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notificationContent: {
    padding: 12,
    paddingTop: 0,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 8,
  },
  notificationDate: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
}); 