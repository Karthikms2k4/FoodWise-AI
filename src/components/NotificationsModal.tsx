import React from 'react';
import { X, Bell, CheckCheck, Trash2 } from 'lucide-react';
import { AppNotification } from '../types/food';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onClearNotification: (id: string) => void;
  onSelectAction: (itemId?: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearNotification,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#131b2e] text-[#131b2e] dark:text-[#f1f5f9] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[85vh] flex flex-col border border-slate-100 dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#131b2e] dark:text-white">Pantry Alerts</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {notifications.filter((n) => !n.read).length} unread updates
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.read) && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-[#006b2c] dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List of Alerts */}
        <div className="py-3 flex-1 overflow-y-auto space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              All clear! No pending food expiration warnings.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  notif.read
                    ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 opacity-75'
                    : notif.type === 'alert'
                    ? 'bg-red-50/70 dark:bg-red-950/40 border-red-200 dark:border-red-900/60'
                    : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {notif.type === 'alert' ? (
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    )}
                    <h4 className="text-xs font-bold text-[#131b2e] dark:text-white">
                      {notif.title}
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                    {notif.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {notif.message}
                </p>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-800">
                  <button
                    onClick={() => {
                      onSelectAction(notif.itemId);
                      onClose();
                    }}
                    className="text-xs font-bold text-[#006b2c] dark:text-emerald-400 hover:underline"
                  >
                    Take Action →
                  </button>
                  <button
                    onClick={() => onClearNotification(notif.id)}
                    className="text-slate-400 hover:text-red-500 text-xs p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
