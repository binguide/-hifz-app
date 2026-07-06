import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {User, UserRole} from '../types';
import {getUserByPhone, addUser} from '../db/database';
import {generateId, normalizeDigits} from '../utils/helpers';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<boolean>;
  register: (name: string, phone: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true,

  login: async (phone: string, password: string) => {
    const normalizedPhone = normalizeDigits(phone.trim());
    const normalizedPassword = normalizeDigits(password.trim());
    const user = await getUserByPhone(normalizedPhone);
    if (!user) return false;
    if (user.password_hash !== normalizedPassword) return false;
    await AsyncStorage.setItem('userId', user.id);
    set({user, isLoggedIn: true});
    return true;
  },

  register: async (name: string, phone: string, password: string, role: UserRole) => {
    const normalizedPhone = normalizeDigits(phone.trim());
    const normalizedPassword = normalizeDigits(password.trim());
    const existing = await getUserByPhone(normalizedPhone);
    if (existing) return false;
    const id = generateId();
    const user = {id, name, phone: normalizedPhone, role, password_hash: normalizedPassword};
    await addUser(user);
    await AsyncStorage.setItem('userId', id);
    set({user: user as User, isLoggedIn: true});
    return true;
  },

  logout: async () => {
    await AsyncStorage.removeItem('userId');
    set({user: null, isLoggedIn: false});
  },

  loadSession: async () => {
    set({isLoading: true});
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const {getUser} = await import('../db/database');
        const user = await getUser(userId);
        if (user) {
          set({user, isLoggedIn: true});
        }
      }
    } catch (e) {
      // ignore
    }
    set({isLoading: false});
  },

  setUser: (user: User) => set({user, isLoggedIn: true}),
}));
