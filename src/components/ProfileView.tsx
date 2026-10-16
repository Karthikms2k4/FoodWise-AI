import React from 'react';
import { Leaf, RotateCcw, Cloud, LogIn, LogOut, CheckCircle2, Moon, Sun, Monitor, Shield } from 'lucide-react';
import { UserProfile } from '../types/food';

interface ProfileViewProps {
  user: UserProfile;
  firebaseAuthUser: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  } | null;
  isDarkMode: boolean;
  onToggleTheme: (darkMode: boolean) => void;
  onResetData: () => void;
  onSignInWithGoogle: () => void;
  onSignOut: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  firebaseAuthUser,
  isDarkMode,
  onToggleTheme,
  onResetData,
  onSignInWithGoogle,
  onSignOut,
}) => {
  return (
    <div className="space-y-4 pb-24">
      {/* Profile Card */}
      <div className="bg-white dark:bg-[#131b2e] rounded-3xl p-5 border border-[#e2e8f0] dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500/30 ring-4 ring-emerald-50 dark:ring-emerald-950/40 shrink-0">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-[#131b2e] dark:text-white leading-snug">
              {user.name}
            </h2>
            <span className="text-[10px] font-bold bg-[#dcfce7] dark:bg-emerald-950 text-[#006b2c] dark:text-emerald-300 px-2 py-0.5 rounded-full">
              {firebaseAuthUser ? 'CLOUD SYNCED' : 'PRO'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-[#006b2c] dark:text-emerald-400 font-bold">
            <Leaf className="w-3.5 h-3.5 fill-current" />
            <span>Eco Score: {user.ecoScore} / 100</span>
          </div>
        </div>
      </div>

      {/* Dark Mode Theme Option Card */}
      <div className="bg-white dark:bg-[#131b2e] rounded-3xl p-5 border border-[#e2e8f0] dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-amber-300 flex items-center justify-center transition-colors">
              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-500" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#131b2e] dark:text-white">
                Appearance & Dark Mode
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Calibrated slate obsidian & emerald contrast
              </p>
            </div>
          </div>
        </div>

        {/* Theme Segmented Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-[#0b0f19] rounded-2xl">
          <button
            onClick={() => onToggleTheme(false)}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              !isDarkMode
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Light Mode</span>
          </button>

          <button
            onClick={() => onToggleTheme(true)}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              isDarkMode
                ? 'bg-[#1e293b] text-emerald-300 shadow-sm ring-1 ring-emerald-500/30'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Moon className="w-4 h-4 text-emerald-400" />
            <span>Dark Mode</span>
          </button>
        </div>
      </div>

      {/* Firebase Cloud Sync Status Card */}
      <div className="bg-white dark:bg-[#131b2e] rounded-3xl p-5 border border-[#e2e8f0] dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950 text-[#006b2c] dark:text-emerald-400 flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#131b2e] dark:text-white">
                Firebase Cloud Database & Auth
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {firebaseAuthUser
                  ? 'Real-time synchronization with Firestore'
                  : 'Sign in to persist pantry across devices'}
              </p>
            </div>
          </div>
        </div>

        {firebaseAuthUser ? (
          <div className="bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-900 dark:text-emerald-200 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Signed in: <strong>{firebaseAuthUser.displayName || firebaseAuthUser.email}</strong></span>
              </span>
            </div>
            <div className="text-[10px] font-mono text-emerald-800 dark:text-emerald-300 break-all bg-white/70 dark:bg-slate-900/60 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900">
              UID: {firebaseAuthUser.uid} • Firestore DB: Active
            </div>
            <button
              onClick={onSignOut}
              className="w-full py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out from Firebase</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <button
              onClick={onSignInWithGoogle}
              className="w-full py-3 bg-[#006b2c] hover:bg-[#005320] active:scale-[0.98] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign In with Google (Firebase Auth)</span>
            </button>
          </div>
        )}
      </div>

      {/* Sustainability Impact Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-[#131b2e] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
            Prevented CO2
          </div>
          <div className="text-2xl font-extrabold text-[#006b2c] dark:text-emerald-400">
            {user.co2PreventedKg} kg
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Equivalent to 18 car miles
          </div>
        </div>

        <div className="bg-white dark:bg-[#131b2e] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
            Money Saved
          </div>
          <div className="text-2xl font-extrabold text-[#855300] dark:text-amber-400">
            ${user.totalSavedDollars.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            ~₹3,560 this month
          </div>
        </div>
      </div>

      {/* Household & Dietary Settings */}
      <div className="bg-white dark:bg-[#131b2e] rounded-3xl p-4 border border-slate-200 dark:border-slate-800 space-y-3 transition-colors">
        <h4 className="text-xs font-bold text-[#131b2e] dark:text-slate-200 uppercase tracking-wider">
          Pantry Configuration
        </h4>
        <div className="flex items-center justify-between py-1 text-xs border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-600 dark:text-slate-400">Dietary Profile</span>
          <span className="font-bold text-[#006b2c] dark:text-emerald-400">{user.dietaryPreference}</span>
        </div>
        <div className="flex items-center justify-between py-1 text-xs border-b border-slate-100 dark:border-slate-800">
          <span className="text-slate-600 dark:text-slate-400">Household Size</span>
          <span className="font-bold text-[#131b2e] dark:text-white">{user.householdSize} people</span>
        </div>
        <div className="flex items-center justify-between py-1 text-xs">
          <span className="text-slate-600 dark:text-slate-400">Auto Expiry Warnings</span>
          <span className="font-bold text-[#006b2c] dark:text-emerald-400">Enabled (Daily 8:00 AM)</span>
        </div>
      </div>

      {/* Reset Data Button */}
      <div className="pt-2">
        <button
          onClick={onResetData}
          className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900 flex items-center justify-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Pantry & Metrics</span>
        </button>
      </div>
    </div>
  );
};
