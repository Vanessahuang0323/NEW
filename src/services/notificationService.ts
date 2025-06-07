import { toast } from '../components/ui/use-toast';

export interface Notification {
  id: string;
  type: 'application' | 'interview' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];

  private constructor() {
    // 初始化通知服務
    this.loadNotifications();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private loadNotifications() {
    // 從 localStorage 加載通知
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      this.notifications = JSON.parse(savedNotifications);
    }
  }

  private saveNotifications() {
    // 保存通知到 localStorage
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  public addNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      read: false,
      createdAt: new Date(),
    };

    this.notifications.unshift(newNotification);
    this.saveNotifications();

    // 顯示 toast 通知
    toast({
      title: notification.title,
      description: notification.message,
    });
  }

  public getNotifications(): Notification[] {
    return this.notifications;
  }

  public markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  public markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.saveNotifications();
  }

  public deleteNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveNotifications();
  }

  public clearAllNotifications() {
    this.notifications = [];
    this.saveNotifications();
  }

  public getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }
}

export const notificationService = NotificationService.getInstance(); 