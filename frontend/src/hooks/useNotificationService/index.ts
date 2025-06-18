import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updatePreferences, NotificationPreferences } from '../../store/slices/notificationSlice';
import { notificationService } from '../../services/notificationService';

export const useNotificationService = () => {
  const dispatch = useDispatch();

  const updateNotificationPreferences = useCallback(async (preferences: NotificationPreferences) => {
    try {
      const response = await notificationService.updatePreferences(preferences);
      dispatch(updatePreferences(preferences));
      return response;
    } catch (error) {
      console.error('Bildirim tercihleri güncellenirken hata:', error);
      throw error;
    }
  }, [dispatch]);

  return {
    updateNotificationPreferences
  };
}; 