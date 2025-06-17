import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'match':
        return 'trophy';
      case 'news':
        return 'newspaper';
      case 'event':
        return 'calendar';
      default:
        return 'notifications';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'match':
        return 'Maç';
      case 'news':
        return 'Haber';
      case 'event':
        return 'Etkinlik';
      default:
        return 'Sistem';
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <View 
      style={[
        styles.notificationCard, 
        { 
          backgroundColor: theme.colors.background,
          borderLeftWidth: item.read ? 0 : 4,
          borderLeftColor: item.read ? 'transparent' : theme.colors.primary,
        }
      ]}
    >
      <View style={styles.notificationHeader}>
        <View style={[styles.notificationType, { backgroundColor: theme.colors.primary + '20' }]}>
          <Ionicons
            name={getTypeIcon(item.type)}
            size={16}
            color={theme.colors.primary}
          />
          <Text style={[styles.notificationTypeText, { color: theme.colors.primary }]}>
            {getTypeLabel(item.type)}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => handleDeleteNotification(item.id)}
          style={[styles.deleteButton, { backgroundColor: theme.colors.primary + '20' }]}
        >
          <Ionicons name="close" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.notificationContent}
        onPress={() => handleMarkAsRead(item.id)}
        disabled={item.read}
        activeOpacity={0.7}
      >
        <Text 
          style={[
            styles.notificationTitle, 
            { 
              color: theme.colors.text,
              opacity: item.read ? 0.7 : 1,
              fontWeight: item.read ? 'normal' : 'bold',
            }
          ]}
        >
          {item.title}
        </Text>
        <Text 
          style={[
            styles.notificationMessage, 
            { 
              color: theme.colors.text,
              opacity: item.read ? 0.7 : 0.9,
            }
          ]}
        >
          {item.message}
        </Text>
        <Text 
          style={[
            styles.notificationDate, 
            { 
              color: theme.colors.text,
              opacity: 0.6,
            }
          ]}
        >
          {item.createdAt}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 48 }} />
      </SafeAreaView>
    );
  }

  if (notifications.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off" size={64} color={theme.colors.primary} style={{ marginBottom: 16 }} />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            Bildirim bulunmuyor
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.text, opacity: 0.7 }]}>
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
            style={[styles.headerButton, { backgroundColor: theme.colors.primary + '20' }]}
            onPress={handleMarkAllAsRead}
            disabled={notifications.every((n) => n.read)}
          >
            <Ionicons
              name="checkmark-done"
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: theme.colors.primary + '20' }]} 
            onPress={handleClearAll}
          >
            <Ionicons name="trash" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 10,
    borderRadius: 12,
  },
  listContainer: {
    padding: 16,
  },
  notificationCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  notificationTypeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 12,
  },
  notificationContent: {
    padding: 16,
    paddingTop: 0,
  },
  notificationTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  notificationDate: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: 'center',
  },
}); 