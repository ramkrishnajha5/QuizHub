/**
 * Admin Settings Page
 * Admin profile, app config, add new admin (superadmin only)
 */

import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { getAppConfig, updateAppConfig, AppConfig, addAdmin } from '../utils/adminFirestore';
import { logAdminAction } from '../utils/adminLogger';
import { auth, db } from '@/utils/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Settings, User, Shield, Globe, Save, Loader, Plus, CheckCircle, AlertTriangle, Lock, Key } from 'lucide-react';
import CustomModal from '../../components/CustomModal';
import { useCustomModal } from '../../hooks/useCustomModal';

const AdminSettings: React.FC = () => {
  const { adminUser, adminRole, adminData } = useAdminAuth();
  const { modalState, showAlert, closeModal } = useCustomModal();
  const [config, setConfig] = useState<AppConfig>({ maintenanceMode: false, maxQuizQuestions: 25, allowGoogleSignIn: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Add admin
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [adminMsg, setAdminMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const c = await getAppConfig();
        setConfig(c);
      } catch (error) {
        console.error('Error loading config:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await updateAppConfig(config);
      await logAdminAction({
        action: 'CONFIG_UPDATED',
        performedBy: adminUser?.uid || '',
        performedByEmail: adminUser?.email || '',
        details: `App config updated: maintenance=${config.maintenanceMode}, maxQs=${config.maxQuizQuestions}, googleSignIn=${config.allowGoogleSignIn}`,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      showAlert({ title: 'Error', message: 'Failed to save settings', confirmStyle: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setPasswordMsg('Please fill in both fields');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg('New password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    setPasswordMsg('');

    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error('Not authenticated');

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setPasswordMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        setPasswordMsg('Current password is incorrect');
      } else {
        setPasswordMsg('Failed to change password: ' + (error.message || ''));
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      setAdminMsg('Please enter an email');
      return;
    }

    setAddingAdmin(true);
    setAdminMsg('');

    try {
      // Step 1: Check if this email already exists in `admins`
      const adminsRef = collection(db, 'admins');
      const qAdmin = query(adminsRef, where('email', '==', newAdminEmail.trim()));
      const existing = await getDocs(qAdmin);

      if (!existing.empty) {
        setAdminMsg('This email is already an admin.');
        setAddingAdmin(false);
        return;
      }

      // Step 2: Check if this email exists in `users` collection
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', newAdminEmail.trim()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setAdminMsg('No user found with this email. They must have an existing account first.');
        setAddingAdmin(false);
        return;
      }

      const userDoc = snapshot.docs[0];
      const uid = userDoc.id;

      await addAdmin(uid, newAdminEmail.trim(), 'moderator');
      await logAdminAction({
        action: 'ADMIN_ADDED',
        performedBy: adminUser?.uid || '',
        performedByEmail: adminUser?.email || '',
        targetUid: uid,
        targetEmail: newAdminEmail.trim(),
        details: `New moderator added: ${newAdminEmail.trim()}`,
      });

      setAdminMsg(`✅ ${newAdminEmail.trim()} added as moderator!`);
      setNewAdminEmail('');
    } catch (error) {
      console.error('Error adding admin:', error);
      setAdminMsg('Failed to add admin');
    } finally {
      setAddingAdmin(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div className="flex justify-center py-20"><Loader className="animate-spin text-purple-500" size={40} /></div>
      </AdminLayout>
    );
  }

  return (
    <>
    <AdminLayout title="Settings">
      <div className="max-w-3xl space-y-8">
        {/* Admin Profile */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-6 md:p-8">
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <User size={22} className="text-purple-500" /> Admin Profile
          </h3>
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Email</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{adminData?.email || adminUser?.email || '—'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Role</p>
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                adminRole === 'superadmin'
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                  : 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white'
              }`}>
                {adminRole === 'superadmin' ? 'Super Admin' : 'Moderator'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Change Password */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-6 md:p-8">
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Lock size={22} className="text-orange-500" /> Change Password
          </h3>
          <div className="space-y-4">
            <input type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" />
            <input type="password" placeholder="New password (min 6 characters)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" />
            {passwordMsg && (
              <p className={`text-sm font-medium ${passwordMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{passwordMsg}</p>
            )}
            <button onClick={handleChangePassword} disabled={changingPassword}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 transition">
              {changingPassword ? <Loader className="animate-spin" size={16} /> : <Key size={16} />}
              Change Password
            </button>
          </div>
        </motion.div>

        {/* App Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-6 md:p-8">
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Globe size={22} className="text-blue-500" /> App Configuration
          </h3>
          <div className="space-y-5">
            {/* Maintenance Mode */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">Maintenance Mode</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Main app shows maintenance page when enabled</p>
              </div>
              <button
                onClick={() => setConfig({ ...config, maintenanceMode: !config.maintenanceMode })}
                className={`w-14 h-8 rounded-full transition-colors ${config.maintenanceMode ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'} relative`}
              >
                <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${config.maintenanceMode ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Max Questions */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="font-bold text-gray-900 dark:text-white text-sm mb-2">Max Quiz Questions</p>
              <input
                type="number"
                value={config.maxQuizQuestions}
                onChange={(e) => setConfig({ ...config, maxQuizQuestions: Number(e.target.value) })}
                min={5}
                max={100}
                className="w-32 p-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
              />
            </div>

            {/* Google Sign-in */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">Allow Google Sign-in</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Enable/disable Google OAuth for users</p>
              </div>
              <button
                onClick={() => setConfig({ ...config, allowGoogleSignIn: !config.allowGoogleSignIn })}
                className={`w-14 h-8 rounded-full transition-colors ${config.allowGoogleSignIn ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'} relative`}
              >
                <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${config.allowGoogleSignIn ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <button onClick={handleSaveConfig} disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-xl disabled:opacity-50 transition">
              {saving ? <Loader className="animate-spin" size={16} /> : saved ? <CheckCircle size={16} /> : <Save size={16} />}
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
          </div>
        </motion.div>

        {/* Add Admin (Superadmin Only) */}
        {adminRole === 'superadmin' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-6 md:p-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Shield size={22} className="text-yellow-500" /> Add New Admin
              <span className="text-xs font-bold bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full">Superadmin Only</span>
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Enter the email of an existing QuizHub user to grant them moderator access.
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mb-4 font-bold">
              Note: The person must have already signed up on QuizHub before they can be granted admin access.
            </p>
            <div className="flex gap-3">
              <input type="email" placeholder="user@example.com" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)}
                className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" />
              <button onClick={handleAddAdmin} disabled={addingAdmin}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 transition">
                {addingAdmin ? <Loader className="animate-spin" size={16} /> : <Plus size={16} />}
                Add
              </button>
            </div>
            {adminMsg && (
              <p className={`mt-3 text-sm font-medium ${adminMsg.includes('✅') ? 'text-green-600' : 'text-red-500'}`}>{adminMsg}</p>
            )}
          </motion.div>
        )}
      </div>
    </AdminLayout>
    <CustomModal {...modalState} onClose={closeModal} />
    </>
  );
};

export default AdminSettings;
