/**
 * Admin Auth Context
 * Completely separate from user AuthContext
 * Handles admin authentication, role verification, and session management
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import { getAdminByUid, updateAdminLastLogin, AdminUser } from '../utils/adminFirestore';

interface AdminAuthContextType {
  adminUser: User | null;
  adminData: AdminUser | null;
  adminRole: 'superadmin' | 'moderator' | null;
  isAdminLoading: boolean;
  isAdminAuthenticated: boolean;
  adminLogout: () => Promise<void>;
  refreshAdminData: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [adminData, setAdminData] = useState<AdminUser | null>(null);
  const [adminRole, setAdminRole] = useState<'superadmin' | 'moderator' | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const verifyAdmin = useCallback(async (user: User): Promise<boolean> => {
    try {
      const admin = await getAdminByUid(user.uid);
      if (admin && (admin.role === 'superadmin' || admin.role === 'moderator')) {
        setAdminUser(user);
        setAdminData(admin);
        setAdminRole(admin.role);
        setIsAdminAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Admin verification failed:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    // Check if admin was previously authenticated (stored in sessionStorage)
    const wasAdminSession = sessionStorage.getItem('adminSession') === 'true';

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && wasAdminSession) {
        const isAdmin = await verifyAdmin(user);
        if (!isAdmin) {
          // User is not an admin, clear session
          sessionStorage.removeItem('adminSession');
          setAdminUser(null);
          setAdminData(null);
          setAdminRole(null);
          setIsAdminAuthenticated(false);
        }
      } else {
        setAdminUser(null);
        setAdminData(null);
        setAdminRole(null);
        setIsAdminAuthenticated(false);
      }
      setIsAdminLoading(false);
    });

    return () => unsubscribe();
  }, [verifyAdmin]);

  const adminLogout = async () => {
    sessionStorage.removeItem('adminSession');
    setAdminUser(null);
    setAdminData(null);
    setAdminRole(null);
    setIsAdminAuthenticated(false);
    await signOut(auth);
  };

  const refreshAdminData = async () => {
    if (adminUser) {
      await verifyAdmin(adminUser);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        adminData,
        adminRole,
        isAdminLoading,
        isAdminAuthenticated,
        adminLogout,
        refreshAdminData,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export default AdminAuthContext;
