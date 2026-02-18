export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: NotificationType;
}

export interface ToastContextType {
  showToast: (title: string, type: NotificationType, description?: string) => void;
}