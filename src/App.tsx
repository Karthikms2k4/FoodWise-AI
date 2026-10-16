/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Package,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Plus,
  Scan,
  Camera,
  Leaf,
  CheckCircle,
  Cloud,
  Sparkles,
  Wand2,
  Dumbbell,
} from 'lucide-react';
import { Header } from './components/Header';
import { MetricCard } from './components/MetricCard';
import { RecipeSpotlight } from './components/RecipeSpotlight';
import { ExpiringList } from './components/ExpiringList';
import { MilestoneCard } from './components/MilestoneCard';
import { BottomNav, NavTab } from './components/BottomNav';
import { AddFoodModal } from './components/AddFoodModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { AIFoodScannerModal } from './components/AIFoodScannerModal';
import { NotificationsModal } from './components/NotificationsModal';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { AIRecipeAgentModal } from './components/AIRecipeAgentModal';
import { PantryView } from './components/PantryView';
import { RecipesView } from './components/RecipesView';
import { ProfileView } from './components/ProfileView';

import {
  INITIAL_USER,
  INITIAL_FOOD_ITEMS,
  SPOTLIGHT_RECIPE,
  MORE_RECIPES,
  INITIAL_NOTIFICATIONS,
} from './data/mockData';
import { FoodItem, Recipe, AppNotification, UserProfile } from './types/food';

import {
  auth,
  loginWithGoogle,
  logoutUser,
  subscribeToUserProfile,
  subscribeToFoodItems,
  subscribeToNotifications,
  saveUserProfile,
  addFoodItem,
  updateFoodItem,
  deleteFoodItem,
  updateNotification,
  deleteNotification,
  seedInitialPantryIfEmpty,
} from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export default function App() {
  // Navigation & View state
  const [currentTab, setCurrentTab] = useState<NavTab>('home');

  // Dark Mode Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('foodwise_theme') === 'dark';
  });

  // Apply dark class to document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('foodwise_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('foodwise_theme', 'light');
    }
  }, [isDarkMode]);

  // Firebase Auth state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // Core Data state
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [foodItems, setFoodItems] = useState<FoodItem[]>(INITIAL_FOOD_ITEMS);
  const [recipes, setRecipes] = useState<Recipe[]>(MORE_RECIPES);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(SPOTLIGHT_RECIPE);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Active filter for Pantry view when tapped from metric card
  const [pantryFilter, setPantryFilter] = useState<'all' | 'expiring_soon' | 'expired' | 'optimal'>('all');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRecipeDetailOpen, setIsRecipeDetailOpen] = useState(false);
  const [isAIAgentOpen, setIsAIAgentOpen] = useState(false);
  const [selectedItemForAction, setSelectedItemForAction] = useState<FoodItem | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Auth Listener and Firestore Real-Time Subscriptions
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);

      if (currentUser) {
        const userId = currentUser.uid;
        const initialProfile: UserProfile = {
          userId,
          name: currentUser.displayName || 'Sarah',
          email: currentUser.email || 'sarah.jenkins@example.com',
          avatarUrl: currentUser.photoURL || INITIAL_USER.avatarUrl,
          ecoScore: 94,
          totalSavedDollars: 42.80,
          co2PreventedKg: 4.2,
          wasteReductionRate: 86,
          householdSize: 2,
          dietaryPreference: 'Flexitarian',
        };

        // Seed initial 34 pantry items if new account
        await seedInitialPantryIfEmpty(
          userId,
          initialProfile,
          INITIAL_FOOD_ITEMS.map((item) => ({ ...item, userId })),
          INITIAL_NOTIFICATIONS.map((n) => ({ ...n, userId }))
        );

        // Subscribe to user profile
        const unsubProfile = subscribeToUserProfile(userId, (profile) => {
          if (profile) {
            setUser((prev) => ({
              ...prev,
              ...profile,
              avatarUrl: currentUser.photoURL || profile.avatarUrl || prev.avatarUrl,
            }));
          }
        });

        // Subscribe to food items
        const unsubFood = subscribeToFoodItems(userId, (items) => {
          if (items.length > 0) {
            setFoodItems(items);
          }
        });

        // Subscribe to notifications
        const unsubNotifs = subscribeToNotifications(userId, (notifs) => {
          if (notifs.length > 0) {
            setNotifications(notifs);
          }
        });

        return () => {
          unsubProfile();
          unsubFood();
          unsubNotifs();
        };
      } else {
        setUser(INITIAL_USER);
        setFoodItems(INITIAL_FOOD_ITEMS);
        setNotifications(INITIAL_NOTIFICATIONS);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Google Login Handler
  const handleGoogleSignIn = async () => {
    try {
      const loggedUser = await loginWithGoogle();
      showToast(`Welcome ${loggedUser.displayName || 'back'}! Cloud Firestore synchronized.`);
    } catch (error) {
      console.error('Sign-in error:', error);
      showToast('Sign-in window closed or cancelled.');
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      showToast('Signed out from Firebase.');
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  // Counts calculated from current foodItems state
  const totalItemsCount = foodItems.length;
  const expiringCount = foodItems.filter((i) => i.status === 'expiring_soon').length;
  const expiredCount = foodItems.filter((i) => i.status === 'expired').length;
  const optimalCount = foodItems.filter((i) => i.status === 'optimal').length;

  const expiringItems = foodItems.filter((i) => i.status === 'expiring_soon');
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Food inventory handlers with Firestore persistence
  const handleAddFoodItem = async (newItem: Omit<FoodItem, 'id'>) => {
    const id = `food-${Date.now()}`;
    const fullItem: FoodItem = {
      ...newItem,
      id,
      userId: firebaseUser ? firebaseUser.uid : undefined,
    };

    setFoodItems((prev) => [fullItem, ...prev]);
    showToast(`Added "${newItem.name}" to pantry.`);

    if (firebaseUser) {
      await addFoodItem(firebaseUser.uid, fullItem);
    }
  };

  const handleConsumeItem = async (itemId: string) => {
    const item = foodItems.find((i) => i.id === itemId);
    if (!item) return;

    setFoodItems((prev) => prev.filter((i) => i.id !== itemId));
    const newSaved = user.totalSavedDollars + item.estCost;
    const newCo2 = Number((user.co2PreventedKg + item.co2ImpactKg).toFixed(1));
    const newScore = Math.min(100, user.ecoScore + 1);

    const updatedProfile: UserProfile = {
      ...user,
      totalSavedDollars: newSaved,
      co2PreventedKg: newCo2,
      ecoScore: newScore,
    };
    setUser(updatedProfile);

    showToast(`Consuming "${item.name}"! +$${item.estCost.toFixed(2)} saved.`);
    setSelectedItemForAction(null);

    if (firebaseUser) {
      await deleteFoodItem(firebaseUser.uid, itemId);
      await saveUserProfile(firebaseUser.uid, updatedProfile);
    }
  };

  const handleFreezeItem = async (itemId: string) => {
    const item = foodItems.find((i) => i.id === itemId);
    if (!item) return;

    const newDays = item.daysRemaining + 30;
    const updates = {
      location: 'Freezer' as const,
      daysRemaining: newDays,
      expiryDateText: `${newDays} Days Left`,
      status: 'optimal' as const,
    };

    setFoodItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, ...updates } : i))
    );
    showToast('Moved to Freezer. Shelf life extended by 30 days!');
    setSelectedItemForAction(null);

    if (firebaseUser) {
      await updateFoodItem(firebaseUser.uid, itemId, updates);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const item = foodItems.find((i) => i.id === itemId);
    setFoodItems((prev) => prev.filter((i) => i.id !== itemId));
    showToast(`Removed "${item?.name || 'item'}" from inventory.`);
    setSelectedItemForAction(null);

    if (firebaseUser) {
      await deleteFoodItem(firebaseUser.uid, itemId);
    }
  };

  const handleBatchAddAI = async (newItems: Omit<FoodItem, 'id'>[]) => {
    const created: FoodItem[] = newItems.map((item, idx) => ({
      ...item,
      id: `food-${Date.now()}-${idx}`,
      userId: firebaseUser ? firebaseUser.uid : undefined,
    }));

    setFoodItems((prev) => [...created, ...prev]);
    showToast(`AI Scanner added ${created.length} produce items!`);

    if (firebaseUser) {
      for (const item of created) {
        await addFoodItem(firebaseUser.uid, item);
      }
    }
  };

  const handleCompleteCookingRecipe = async (recipe: Recipe) => {
    // Find matching expiring items to remove
    const itemIdsToRemove = foodItems
      .filter((i) => recipe.matchedIngredients.some((m) => m.toLowerCase().includes(i.name.toLowerCase()) || i.name.toLowerCase().includes(m.toLowerCase())))
      .map((i) => i.id);

    setFoodItems((prev) =>
      prev.filter((i) => !itemIdsToRemove.includes(i.id))
    );

    const updatedProfile: UserProfile = {
      ...user,
      totalSavedDollars: user.totalSavedDollars + 4.2,
      co2PreventedKg: Number((user.co2PreventedKg + 1.4).toFixed(1)),
      ecoScore: Math.min(100, user.ecoScore + 2),
    };
    setUser(updatedProfile);
    showToast(`🎉 ${recipe.title} cooked! Rescued ingredients.`);

    if (firebaseUser) {
      for (const id of itemIdsToRemove) {
        await deleteFoodItem(firebaseUser.uid, id);
      }
      await saveUserProfile(firebaseUser.uid, updatedProfile);
    }
  };

  const handleSaveNewRecipe = (newRecipe: Recipe) => {
    setRecipes((prev) => [newRecipe, ...prev]);
    showToast(`Saved "${newRecipe.title}" (${newRecipe.protein} protein) to recipe catalog.`);
  };

  const handleResetData = async () => {
    setFoodItems(INITIAL_FOOD_ITEMS);
    setUser(INITIAL_USER);
    setNotifications(INITIAL_NOTIFICATIONS);
    showToast('Pantry & eco milestones reset to defaults.');

    if (firebaseUser) {
      await seedInitialPantryIfEmpty(
        firebaseUser.uid,
        INITIAL_USER,
        INITIAL_FOOD_ITEMS.map((item) => ({ ...item, userId: firebaseUser.uid })),
        INITIAL_NOTIFICATIONS.map((n) => ({ ...n, userId: firebaseUser.uid }))
      );
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} bg-[#faf8ff] dark:bg-[#0b0f19] text-[#131b2e] dark:text-[#f1f5f9] transition-colors duration-200`}>
      {/* Mobile Shell Container */}
      <div className={`max-w-md mx-auto min-h-screen flex flex-col relative ${isDarkMode ? 'bg-[#0b0f19] border-slate-800' : 'bg-[#faf8ff] border-[#e2e8f0]/40'} shadow-xl border-x transition-colors`}>
        {/* Sticky Header */}
        <Header
          user={user}
          firebaseAuthUser={
            firebaseUser
              ? {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName,
                  photoURL: firebaseUser.photoURL,
                }
              : null
          }
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          unreadCount={unreadNotificationsCount}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => setCurrentTab('profile')}
          onSignInWithGoogle={handleGoogleSignIn}
        />

        {/* Cloud Sync Status Banner */}
        {firebaseUser && (
          <div className="bg-[#dcfce7] dark:bg-emerald-950/70 border-b border-[#bdcaba]/50 dark:border-emerald-800/40 px-4 py-1.5 flex items-center justify-between text-[11px] text-[#006b2c] dark:text-emerald-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5" />
              <span>Synced with Firebase Firestore</span>
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
              Live Cloud Active
            </span>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 px-4 py-3 space-y-4">
          {/* TAB 1: HOME (Dashboard Screen) */}
          {currentTab === 'home' && (
            <div className="space-y-4 pb-24">
              {/* Welcome & Eco Score Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-[28px] sm:text-[32px] font-extrabold tracking-tight text-[#131b2e] dark:text-white leading-tight">
                    Good morning,<br />
                    <span>{user.name}</span> <span className="inline-block animate-pulse">👋</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-[#3e4a3d] dark:text-slate-400 mt-1 font-medium">
                    Here&apos;s what&apos;s happening in your pantry today.
                  </p>
                </div>

                {/* Eco Score Pill */}
                <button
                  onClick={() => setCurrentTab('profile')}
                  className="bg-[#dcfce7] dark:bg-emerald-950/80 hover:bg-[#bbf7d0] dark:hover:bg-emerald-900 active:scale-95 text-[#006b2c] dark:text-emerald-300 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all shrink-0 mt-1 cursor-pointer"
                  title="View your Eco Score details"
                >
                  <Leaf className="w-3.5 h-3.5 fill-[#006b2c] dark:fill-emerald-400" />
                  <span>Eco Score {user.ecoScore}</span>
                </button>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {/* 1. Add Food */}
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="bg-[#006b2c] hover:bg-[#005320] active:scale-95 text-white px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add Food</span>
                </button>

                {/* 2. Scan Barcode */}
                <button
                  onClick={() => setIsBarcodeOpen(true)}
                  className="bg-white dark:bg-[#131b2e] hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 border border-[#bdcaba] dark:border-slate-700 text-[#131b2e] dark:text-slate-200 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs transition-all shrink-0"
                >
                  <Scan className="w-4 h-4 text-[#006b2c] dark:text-emerald-400" />
                  <span>Scan Barcode</span>
                </button>

                {/* 3. AI Food Scan */}
                <button
                  onClick={() => setIsAIOpen(true)}
                  className="bg-white dark:bg-[#131b2e] hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 border border-[#bdcaba] dark:border-slate-700 text-[#131b2e] dark:text-slate-200 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs transition-all shrink-0"
                >
                  <Camera className="w-4 h-4 text-[#006b2c] dark:text-emerald-400" />
                  <span>AI Food Scan</span>
                </button>
              </div>

              {/* 4 Status Metric Cards (2x2 Grid) */}
              <div className="grid grid-cols-2 gap-3">
                {/* Card 1: Total Items */}
                <MetricCard
                  icon={<Package className="w-5 h-5 text-[#283044] dark:text-slate-300" />}
                  badgeText="All Tracked"
                  badgeStyle="bg-[#eaedff] dark:bg-slate-800 text-[#3e4a3d] dark:text-slate-300"
                  count={totalItemsCount}
                  label="Total Items"
                  iconBg="bg-[#f2f3ff] dark:bg-slate-800/80"
                  onClick={() => {
                    setPantryFilter('all');
                    setCurrentTab('pantry');
                  }}
                />

                {/* Card 2: Expiring Soon */}
                <MetricCard
                  icon={<Clock className="w-5 h-5 text-[#855300] dark:text-amber-400" />}
                  badgeText="1–3 days"
                  badgeStyle="bg-[#ffddb8] dark:bg-amber-950 text-[#855300] dark:text-amber-300"
                  count={expiringCount}
                  countColor="text-[#855300] dark:text-amber-400"
                  label="Expiring Soon"
                  iconBg="bg-[#fef3c7] dark:bg-amber-950/40"
                  onClick={() => {
                    setPantryFilter('expiring_soon');
                    setCurrentTab('pantry');
                  }}
                />

                {/* Card 3: Expired */}
                <MetricCard
                  icon={<AlertTriangle className="w-5 h-5 text-[#ba1a1a] dark:text-red-400" />}
                  badgeText="Needs action"
                  badgeStyle="bg-[#ffdad6] dark:bg-red-950 text-[#ba1a1a] dark:text-red-300"
                  count={expiredCount}
                  countColor="text-[#ba1a1a] dark:text-red-400"
                  label="Expired"
                  iconBg="bg-[#fee2e2] dark:bg-red-950/40"
                  onClick={() => {
                    setPantryFilter('expired');
                    setCurrentTab('pantry');
                  }}
                />

                {/* Card 4: Fresh & Good */}
                <MetricCard
                  icon={<ShieldCheck className="w-5 h-5 text-[#006b2c] dark:text-emerald-400" />}
                  badgeText="Optimal"
                  badgeStyle="bg-[#7ffc97] dark:bg-emerald-950 text-[#005320] dark:text-emerald-300"
                  count={optimalCount}
                  countColor="text-[#006b2c] dark:text-emerald-400"
                  label="Fresh & Good"
                  iconBg="bg-[#dcfce7] dark:bg-emerald-950/40"
                  onClick={() => {
                    setPantryFilter('optimal');
                    setCurrentTab('pantry');
                  }}
                />
              </div>

              {/* AI Recipe Agent Quick Banner */}
              <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-3.5 text-white shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-emerald-200 fill-emerald-200" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold leading-tight flex items-center gap-1.5">
                      <span>AI Zero-Waste Chef Agent</span>
                      <span className="text-[9px] bg-emerald-400 text-emerald-950 font-extrabold px-1.5 rounded">
                        PROTEIN+
                      </span>
                    </h3>
                    <p className="text-[11px] text-emerald-200">
                      Craft high-protein meals from your {expiringItems.length} expiring items
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAIAgentOpen(true)}
                  className="px-3 py-1.5 bg-white text-emerald-900 font-bold rounded-xl text-xs shrink-0 hover:bg-emerald-50 active:scale-95 transition-all shadow-xs"
                >
                  Generate
                </button>
              </div>

              {/* Spotlight: COOK BEFORE IT SPOILS */}
              <RecipeSpotlight
                recipe={selectedRecipe}
                onCook={() => {
                  setSelectedRecipe(SPOTLIGHT_RECIPE);
                  setIsRecipeDetailOpen(true);
                }}
                onViewRecipe={() => {
                  setSelectedRecipe(SPOTLIGHT_RECIPE);
                  setIsRecipeDetailOpen(true);
                }}
                onOpenAIAgent={() => setIsAIAgentOpen(true)}
              />

              {/* Expiring Soon List */}
              <ExpiringList
                items={expiringItems}
                onViewAll={() => {
                  setPantryFilter('expiring_soon');
                  setCurrentTab('pantry');
                }}
                onItemClick={(item) => setSelectedItemForAction(item)}
                onConsumeItem={handleConsumeItem}
              />

              {/* Monthly Milestone Progress Banner */}
              <MilestoneCard
                percentage={user.wasteReductionRate}
                co2Kg={user.co2PreventedKg}
                onClick={() => setCurrentTab('profile')}
              />
            </div>
          )}

          {/* TAB 2: PANTRY VIEW */}
          {currentTab === 'pantry' && (
            <PantryView
              items={foodItems}
              initialFilter={pantryFilter}
              onConsumeItem={handleConsumeItem}
              onFreezeItem={handleFreezeItem}
              onDeleteItem={handleDeleteItem}
              onOpenAddModal={() => setIsAddOpen(true)}
            />
          )}

          {/* TAB 3: RECIPES VIEW */}
          {currentTab === 'recipes' && (
            <RecipesView
              recipes={recipes}
              pantryItems={foodItems}
              onSelectRecipe={(r) => {
                setSelectedRecipe(r);
                setIsRecipeDetailOpen(true);
              }}
              onOpenAIRecipeAgent={() => setIsAIAgentOpen(true)}
            />
          )}

          {/* TAB 4: PROFILE VIEW */}
          {currentTab === 'profile' && (
            <ProfileView
              user={user}
              firebaseAuthUser={
                firebaseUser
                  ? {
                      uid: firebaseUser.uid,
                      email: firebaseUser.email,
                      displayName: firebaseUser.displayName,
                      photoURL: firebaseUser.photoURL,
                    }
                  : null
              }
              isDarkMode={isDarkMode}
              onToggleTheme={(dark) => setIsDarkMode(dark)}
              onResetData={handleResetData}
              onSignInWithGoogle={handleGoogleSignIn}
              onSignOut={handleSignOut}
            />
          )}
        </main>

        {/* Fixed Bottom Navigation */}
        <BottomNav
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenQuickAdd={() => setIsAddOpen(true)}
        />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#131b2e] dark:bg-slate-800 text-white px-4 py-2.5 rounded-full text-xs font-bold shadow-xl border border-slate-700 dark:border-slate-600 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Interactive Modals */}
        <AIRecipeAgentModal
          isOpen={isAIAgentOpen}
          onClose={() => setIsAIAgentOpen(false)}
          pantryItems={foodItems}
          onSelectRecipeToCook={(recipe) => {
            setSelectedRecipe(recipe);
            setIsRecipeDetailOpen(true);
          }}
          onSaveNewRecipe={handleSaveNewRecipe}
        />

        <AddFoodModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onAdd={handleAddFoodItem}
        />

        <BarcodeScannerModal
          isOpen={isBarcodeOpen}
          onClose={() => setIsBarcodeOpen(false)}
          onScannedItem={handleAddFoodItem}
        />

        <AIFoodScannerModal
          isOpen={isAIOpen}
          onClose={() => setIsAIOpen(false)}
          onAddDetectedItems={handleBatchAddAI}
        />

        <NotificationsModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={notifications}
          onMarkAllAsRead={() => {
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            if (firebaseUser) {
              notifications.forEach((n) => {
                updateNotification(firebaseUser.uid, n.id, { read: true });
              });
            }
            showToast('All notifications marked as read.');
          }}
          onClearNotification={async (id) => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            if (firebaseUser) {
              await deleteNotification(firebaseUser.uid, id);
            }
          }}
          onSelectAction={(itemId) => {
            if (itemId) {
              const item = foodItems.find((i) => i.id === itemId);
              if (item) setSelectedItemForAction(item);
            }
          }}
        />

        <RecipeDetailModal
          isOpen={isRecipeDetailOpen}
          onClose={() => setIsRecipeDetailOpen(false)}
          recipe={selectedRecipe}
          onCompleteCooking={handleCompleteCookingRecipe}
        />

        {/* Quick Item Action Drawer */}
        {selectedItemForAction && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-[#131b2e] w-full max-w-md rounded-t-3xl p-5 shadow-2xl space-y-4 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <img
                  src={selectedItemForAction.imageUrl}
                  alt={selectedItemForAction.name}
                  className="w-12 h-12 rounded-xl object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#131b2e] dark:text-white truncate">
                    {selectedItemForAction.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedItemForAction.quantity} • {selectedItemForAction.location}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedItemForAction(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleConsumeItem(selectedItemForAction.id)}
                  className="w-full py-3 bg-[#006b2c] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                >
                  Mark as Consumed / Eaten
                </button>
                <button
                  onClick={() => handleFreezeItem(selectedItemForAction.id)}
                  className="w-full py-3 bg-sky-50 dark:bg-sky-950 text-sky-800 dark:text-sky-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-sky-100 dark:hover:bg-sky-900"
                >
                  Freeze to Extend Shelf Life (+30 Days)
                </button>
                <button
                  onClick={() => {
                    setIsAIAgentOpen(true);
                    setSelectedItemForAction(null);
                  }}
                  className="w-full py-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 dark:hover:bg-emerald-900"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate High-Protein Recipe with AI Agent</span>
                </button>
                <button
                  onClick={() => handleDeleteItem(selectedItemForAction.id)}
                  className="w-full py-2.5 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/50"
                >
                  Discard Item
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
