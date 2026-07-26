import { createContext } from "react";

export type NotificationType =
  | "success"
  | "error"
  | "info";

export type Notification = {
  id: number;
  message: string;
  type: NotificationType;
};

export type NotificationContextType = {
  notifications: Notification[];

  showNotification: (
    message: string,
    type?: NotificationType,
    duration?: number,
  ) => void;

  removeNotification: (id: number) => void;
};

export const NotificationContext =
  createContext<NotificationContextType | undefined>(
    undefined,
  );