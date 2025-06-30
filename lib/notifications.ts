import { supabase } from './supabase';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'reminder';
  category: 'health' | 'medication' | 'appointment' | 'system' | 'insight';
  is_read: boolean;
  action_url?: string;
  action_label?: string;
  expires_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export class NotificationService {
  // Create a new notification
  static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: Notification['type'] = 'info',
    category: Notification['category'] = 'system',
    options?: {
      actionUrl?: string;
      actionLabel?: string;
      expiresAt?: Date;
      metadata?: Record<string, any>;
    }
  ): Promise<Notification> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          category,
          action_url: options?.actionUrl,
          action_label: options?.actionLabel,
          expires_at: options?.expiresAt?.toISOString(),
          metadata: options?.metadata
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create notification error:', error);
      throw new Error('Failed to create notification');
    }
  }

  // Get user notifications
  static async getUserNotifications(
    userId: string,
    options?: {
      limit?: number;
      unreadOnly?: boolean;
      category?: Notification['category'];
    }
  ): Promise<Notification[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.unreadOnly) {
        query = query.eq('is_read', false);
      }

      if (options?.category) {
        query = query.eq('category', options.category);
      }

      // Filter out expired notifications
      query = query.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Get notifications error:', error);
      return [];
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Mark notification as read error:', error);
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
    }
  }

  // Delete notification
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Delete notification error:', error);
    }
  }

  // Health-specific notification creators
  static async createMedicationReminder(
    userId: string,
    medicationName: string,
    dosage: string,
    scheduledTime: Date
  ): Promise<void> {
    await this.createNotification(
      userId,
      'Medication Reminder',
      `Time to take your ${medicationName} (${dosage})`,
      'reminder',
      'medication',
      {
        actionUrl: '/medications',
        actionLabel: 'View Medications',
        metadata: { medicationName, dosage, scheduledTime: scheduledTime.toISOString() }
      }
    );
  }

  static async createAppointmentReminder(
    userId: string,
    doctorName: string,
    appointmentDate: Date
  ): Promise<void> {
    await this.createNotification(
      userId,
      'Appointment Reminder',
      `You have an appointment with ${doctorName} tomorrow`,
      'reminder',
      'appointment',
      {
        actionUrl: '/appointments',
        actionLabel: 'View Appointments',
        metadata: { doctorName, appointmentDate: appointmentDate.toISOString() }
      }
    );
  }

  static async createHealthInsightNotification(
    userId: string,
    insightTitle: string,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<void> {
    const typeMap = {
      low: 'info' as const,
      medium: 'info' as const,
      high: 'warning' as const,
      critical: 'error' as const
    };

    await this.createNotification(
      userId,
      'New Health Insight',
      `${insightTitle} - Check your insights for details`,
      typeMap[severity],
      'insight',
      {
        actionUrl: '/insights',
        actionLabel: 'View Insights',
        metadata: { insightTitle, severity }
      }
    );
  }

  static async createScanAnalysisComplete(
    userId: string,
    scanType: string,
    scanTitle: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      'Scan Analysis Complete',
      `Your ${scanType} scan "${scanTitle}" has been analyzed`,
      'success',
      'health',
      {
        actionUrl: '/scans',
        actionLabel: 'View Results',
        metadata: { scanType, scanTitle }
      }
    );
  }

  // Real-time notification subscription
  static subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void
  ): () => void {
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}