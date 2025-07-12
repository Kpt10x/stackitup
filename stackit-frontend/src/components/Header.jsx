import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      markAsRead();
    }
  };

  const timeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  };


  return (
    <header className="bg-gray-800 text-white p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">StackIt</Link>
        <div className="flex items-center space-x-4">
          <Link to="/" className="hover:text-gray-300">Home</Link>
          <Link to="/ask" className="hover:text-gray-300">Ask Question</Link>

          {isAuthenticated ? (
            <>
              <div className="relative">
                <button onClick={handleBellClick} className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20 text-gray-800">
                    <div className="py-2">
                      <div className="px-4 py-2 font-bold border-b">Notifications</div>
                      {notifications.length > 0 ? (
                        notifications.map((notif, index) => (
                           <Link
                            key={index}
                            to={notif.link}
                            onClick={() => setShowNotifications(false)}
                            className="block px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            <p className="font-semibold">{notif.content}</p>
                            <p className="text-xs text-gray-500">{timeSince(notif.createdAt)}</p>
                          </Link>
                        ))
                      ) : (
                        <p className="px-4 py-2 text-sm">No new notifications.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <span className="font-semibold">Welcome, {user?.username}</span>
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Login
              </Link>
              <Link to="/register" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
