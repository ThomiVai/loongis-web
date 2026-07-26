import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  NotificationContext,
  type Notification,
  type NotificationType,
} from "./NotificationContext";

type NotificationProviderProps = {
  children: ReactNode;
};

export function NotificationProvider({
  children,
}: NotificationProviderProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const notificationIdReference = useRef(0);

  const timeoutReferences = useRef<
    Map<number, number>
  >(new Map());

  const removeNotification = useCallback(
    (id: number) => {
      setNotifications((currentNotifications) =>
        currentNotifications.filter(
          (notification) =>
            notification.id !== id,
        ),
      );

      const timeoutId =
        timeoutReferences.current.get(id);

      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
        timeoutReferences.current.delete(id);
      }
    },
    [],
  );

  const showNotification = useCallback(
    (
      message: string,
      type: NotificationType = "success",
      duration = 2600,
    ) => {
      notificationIdReference.current += 1;

      const id =
        notificationIdReference.current;

      const notification: Notification = {
        id,
        message,
        type,
      };

      setNotifications(
        (currentNotifications) => [
          ...currentNotifications,
          notification,
        ],
      );

      const timeoutId = window.setTimeout(
        () => {
          removeNotification(id);
        },
        duration,
      );

      timeoutReferences.current.set(
        id,
        timeoutId,
      );
    },
    [removeNotification],
  );

  useEffect(() => {
    const currentTimeouts =
      timeoutReferences.current;

    return () => {
      currentTimeouts.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });

      currentTimeouts.clear();
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}