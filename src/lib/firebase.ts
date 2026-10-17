import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  getDocs,
} from 'firebase/firestore';
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || undefined,
};
import { FoodItem, UserProfile, AppNotification } from '../types/food';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId ? getFirestore(app, firebaseConfig.firestoreDatabaseId) : getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Standard Firestore Error Handling conforming to FirestoreErrorInfo specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial connection test
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Authentication helpers
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-in failed:', error);
    throw error;
  }
}

export async function logoutUser() {
  await signOut(auth);
}

// User Profile Firestore Operations
export function subscribeToUserProfile(userId: string, onUpdate: (profile: UserProfile | null) => void) {
  const userDocPath = `users/${userId}`;
  const userRef = doc(db, 'users', userId);

  return onSnapshot(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as UserProfile);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, userDocPath);
    }
  );
}

export async function saveUserProfile(userId: string, profile: UserProfile) {
  const path = `users/${userId}`;
  try {
    await setDoc(doc(db, 'users', userId), {
      ...profile,
      userId,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Food Items Subcollection Operations
export function subscribeToFoodItems(userId: string, onUpdate: (items: FoodItem[]) => void) {
  const collectionPath = `users/${userId}/foodItems`;
  const itemsRef = collection(db, 'users', userId, 'foodItems');

  return onSnapshot(
    itemsRef,
    (snapshot) => {
      const items: FoodItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as FoodItem);
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  );
}

export async function addFoodItem(userId: string, item: FoodItem) {
  const docPath = `users/${userId}/foodItems/${item.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'foodItems', item.id), {
      ...item,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export async function updateFoodItem(userId: string, itemId: string, updates: Partial<FoodItem>) {
  const docPath = `users/${userId}/foodItems/${itemId}`;
  try {
    await updateDoc(doc(db, 'users', userId, 'foodItems', itemId), {
      ...updates,
      userId,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function deleteFoodItem(userId: string, itemId: string) {
  const docPath = `users/${userId}/foodItems/${itemId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'foodItems', itemId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// Notifications Subcollection Operations
export function subscribeToNotifications(userId: string, onUpdate: (notifs: AppNotification[]) => void) {
  const collectionPath = `users/${userId}/notifications`;
  const notifsRef = collection(db, 'users', userId, 'notifications');

  return onSnapshot(
    notifsRef,
    (snapshot) => {
      const notifs: AppNotification[] = [];
      snapshot.forEach((docSnap) => {
        notifs.push(docSnap.data() as AppNotification);
      });
      onUpdate(notifs);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  );
}

export async function saveNotification(userId: string, notif: AppNotification) {
  const docPath = `users/${userId}/notifications/${notif.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'notifications', notif.id), {
      ...notif,
      userId,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export async function updateNotification(userId: string, notifId: string, updates: Partial<AppNotification>) {
  const docPath = `users/${userId}/notifications/${notifId}`;
  try {
    await updateDoc(doc(db, 'users', userId, 'notifications', notifId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function deleteNotification(userId: string, notifId: string) {
  const docPath = `users/${userId}/notifications/${notifId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'notifications', notifId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// Seed initial pantry if user account is newly created
export async function seedInitialPantryIfEmpty(
  userId: string,
  initialUser: UserProfile,
  initialItems: FoodItem[],
  initialNotifs: AppNotification[]
) {
  const itemsRef = collection(db, 'users', userId, 'foodItems');
  try {
    const existingSnap = await getDocs(query(itemsRef));
    if (existingSnap.empty) {
      // Save profile
      await saveUserProfile(userId, initialUser);

      // Seed food items
      for (const item of initialItems) {
        await addFoodItem(userId, item);
      }

      // Seed notifications
      for (const notif of initialNotifs) {
        await saveNotification(userId, notif);
      }
    }
  } catch (error) {
    console.error('Seeding error:', error);
  }
}
