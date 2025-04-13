import React, { useState } from 'react';
import { Bell, Trash2, Check, Circle, ArrowLeft, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

const Notification = () => {
  // Sample notification data - replace with your actual data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Assignment Due Reminder",
      message: "Your Mathematics assignment is due tomorrow at 11:59 PM",
      timestamp: new Date(2024, 9, 26, 14, 30),
      read: false,
      type: "urgent",
      course: "Mathematics"
    },
    {
      id: 2,
      title: "Course Material Updated",
      message: "New lecture notes have been uploaded for Physics Chapter 7",
      timestamp: new Date(2024, 9, 25, 9, 15),
      read: true,
      type: "info",
      course: "Physics"
    },
    {
      id: 3,
      title: "Schedule Change",
      message: "Computer Science class on Friday has been rescheduled to 2:00 PM",
      timestamp: new Date(2024, 9, 24, 16, 45),
      read: false,
      type: "important",
      course: "Computer Science"
    }
  ]);

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showActions, setShowActions] = useState(null);

  const filterNotifications = (filter) => {
    setSelectedFilter(filter);
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
    setShowActions(null);
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
    setShowActions(null);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const getFilteredNotifications = () => {
    switch (selectedFilter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'read':
        return notifications.filter(n => n.read);
      default:
        return notifications;
    }
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'important':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
              <h1 className="text-2xl font-semibold text-gray-800">Notifications</h1>
            </div>
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Mark all as read
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => filterNotifications('all')}
            className={`px-4 py-2 rounded-full ${
              selectedFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => filterNotifications('unread')}
            className={`px-4 py-2 rounded-full ${
              selectedFilter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => filterNotifications('read')}
            className={`px-4 py-2 rounded-full ${
              selectedFilter === 'read'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Read
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {getFilteredNotifications().map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow p-4 transition duration-200 ${
                !notification.read ? 'border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {!notification.read ? (
                    <Circle className="h-2 w-2 mt-2 text-blue-600 fill-current" />
                  ) : (
                    <div className="h-2 w-2 mt-2" />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">
                        {notification.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeStyles(notification.type)}`}>
                        {notification.type}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{notification.course}</span>
                      <span>•</span>
                      <span>{format(notification.timestamp, 'MMM d, h:mm a')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setShowActions(notification.id === showActions ? null : notification.id)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <MoreVertical className="h-5 w-5 text-gray-500" />
                  </button>
                  
                  {showActions === notification.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                        >
                          <Check className="h-4 w-4 mr-3" />
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                      >
                        <Trash2 className="h-4 w-4 mr-3" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {getFilteredNotifications().length === 0 && (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No notifications</h3>
              <p className="mt-2 text-gray-500">We'll notify you when something arrives.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;