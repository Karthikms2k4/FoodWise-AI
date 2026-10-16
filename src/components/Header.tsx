import React from 'react';
import { Bell, Cloud, LogIn, Moon, Sun } from 'lucide-react';
import { UserProfile } from '../types/food';

interface HeaderProps {
  user: UserProfile;
  firebaseAuthUser: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  } | null;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onSignInWithGoogle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  firebaseAuthUser,
  isDarkMode,
  onToggleTheme,
  unreadCount,
  onOpenNotifications,
  onOpenProfile,
  onSignInWithGoogle,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#faf8ff]/95 dark:bg-[#0b0f19]/95 backdrop-blur-md px-4 py-3 border-b border-[#e2e8f0]/60 dark:border-slate-800 flex items-center justify-between transition-colors">
      {/* Brand logo & screen title */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-[#006b2c] flex items-center justify-center text-white shadow-sm font-extrabold text-sm tracking-tighter shrink-0">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A9.49 9.49 0 0 0 12 21a10 10 0 0 0 10-10c0-1.85-.5-3.58-1.37-5.07A11.75 11.75 0 0 0 17 8zM12 19c-3.87 0-7-3.13-7-7 0-.75.12-1.47.34-2.15C7.43 9.44 10.3 9.07 13.5 9.8c-2.4 2.8-2.6 6.3-1.5 9.2z" />
          </svg>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#006b2c] dark:text-[#22c55e] leading-none flex items-center gap-1.5">
            <span>FoodWise AI</span>
            {firebaseAuthUser ? (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/80 px-1.5 py-0.2 rounded-full">
                <Cloud className="w-2.5 h-2.5" />
                SYNC
              </span>
            ) : null}
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#131b2e] dark:text-white leading-tight">
            Dashboard
          </h1>
        </div>
      </div>

      {/* Right side controls: Theme Toggle, Sign In, Notifications, User Avatar */}
      <div className="flex items-center gap-2">
        {/* Quick Theme Toggle (Light / Dark) */}
        <button
          onClick={onToggleTheme}
          aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-[#161f30] border border-[#e2e8f0] dark:border-slate-800 text-[#131b2e] dark:text-amber-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Quick Google Sign-In button if not authenticated */}
        {!firebaseAuthUser && (
          <button
            onClick={onSignInWithGoogle}
            className="hidden sm:flex items-center gap-1 text-[11px] font-bold bg-[#dcfce7] dark:bg-emerald-950/70 text-[#006b2c] dark:text-emerald-300 hover:bg-[#bbf7d0] dark:hover:bg-emerald-900 px-2.5 py-1.5 rounded-full transition-all shadow-2xs"
            title="Sign in with Google Firebase Auth"
          >
            <LogIn className="w-3 h-3" />
            <span>Sign In</span>
          </button>
        )}

        {/* Notifications trigger */}
        <button
          onClick={onOpenNotifications}
          aria-label={`Notifications, ${unreadCount} unread`}
          className="relative w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-[#161f30] border border-[#e2e8f0] dark:border-slate-800 text-[#131b2e] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
        >
          <Bell className="w-5 h-5 text-[#131b2e] dark:text-slate-200" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-[#da3437] text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm ring-2 ring-white dark:ring-[#0b0f19]">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User avatar button */}
        <button
          onClick={onOpenProfile}
          aria-label="Open profile settings"
          className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm ring-2 ring-[#006b2c]/30 hover:ring-[#006b2c] transition-all active:scale-95 shrink-0"
        >
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {firebaseAuthUser && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0b0f19]" />
          )}
        </button>
      </div>
    </header>
  );
};
