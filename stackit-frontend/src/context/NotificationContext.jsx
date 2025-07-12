import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext';
import axios from 'axios';

const NotificationContext = createContext();

export const useNotifications = () => {
    return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const { user } = useContext(AuthContext);

    // Effect to establish and clean up socket connection
    useEffect(() => {
        if (user) {
            // Establish connection
            const newSocket = io(axios.defaults.baseURL);
            setSocket(newSocket);

            // Add user to socket server
            newSocket.emit('addUser', user._id);

            // Listen for incoming notifications
            newSocket.on('getNotification', (data) => {
                setNotifications((prev) => [data, ...prev]);
            });

            // Fetch initial notifications
            const fetchNotifications = async () => {
                try {
                    const { data } = await axios.get('/api/notifications', {
                        headers: { Authorization: `Bearer ${user.token}` },
                    });
                    setNotifications(data);
                } catch (error) {
                    console.error('Failed to fetch notifications:', error);
                }
            };
            fetchNotifications();

            // Cleanup on component unmount or user change
            return () => {
                newSocket.disconnect();
            };
        } else {
            // If no user, ensure socket is disconnected
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [user]);

    const markAsRead = async () => {
        try {
            await axios.post('/api/notifications/read', {}, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            // Update UI to reflect read status
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark notifications as read:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};
