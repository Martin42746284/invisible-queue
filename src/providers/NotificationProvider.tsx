import { ReactNode } from "react";
import { useRealtimeQueueListener } from "@/hooks/useRealtimeQueueListener";

const NotificationListenerComponent = ({ children }: { children: ReactNode }) => {
  useRealtimeQueueListener();
  return <>{children}</>;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  return <NotificationListenerComponent>{children}</NotificationListenerComponent>;
};
