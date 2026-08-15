import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/client";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await api.get("/messages/unread-count");
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [user]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnread: fetchUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
