import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../utils/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { User, Edit2, Save, Calendar, Phone, Mail, Loader, ArrowRight, Sparkles, Shield, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Alert from '../components/Alert';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
    const { currentUser, updateUserProfile } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info', message: string } | null>(null);

    useEffect(() => {
        const loadUserData = async () => {
            if (currentUser) {
                setEmail(currentUser.email || '');
                setName(currentUser.displayName || '');
                try {
                    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setPhone(data.phone || '');
                        setDob(data.dob || '');
                        if (data.name) setName(data.name);
                    }
                } catch (error) {
                    setAlert({ type: 'error', message: 'Failed to load profile data' });
                }
            }
            setLoading(false);
        };
        loadUserData();
    }, [currentUser]);

    const handleSave = async () => {
        if (!currentUser) {
            setAlert({ type: 'error', message: 'You must be logged in' });
            return;
        }
        if (!name.trim()) {
            setAlert({ type: 'error', message: 'Name cannot be empty' });
            return;
        }
        setSaving(true);
        setAlert(null);
        try {
            await updateUserProfile(name.trim());
            await setDoc(doc(db, 'users', currentUser.uid), {
                name: name.trim(), email, phone: phone.trim() || null, dob: dob || null, updatedAt: serverTimestamp()
            }, { merge: true });
            setAlert({ type: 'success', message: 'Profile updated successfully!' });
            setTimeout(() => setAlert(null), 5000);
        } catch (error: any) {
            setAlert({ type: 'error', message: error.message || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
                <div className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-12 rounded-3xl border border-white/20 shadow-2xl">
                    <Shield className="w-16 h-16 mx-auto mb-6 text-purple-500" />
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Access Required</h2>
                    <a href="/#/login" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-xl">Go to Login</a>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Subtle Background Pattern - Hidden on Mobile */}
            <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-20 hidden md:block">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/20" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
                <AnimatePresence>{alert && <Alert type={alert.type} message={alert.message} show={!!alert} onClose={() => setAlert(null)} />}</AnimatePresence>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-full shadow-xl border border-white/20 mb-6">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Profile Settings</span>
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white">My <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Profile</span></h1>
                </motion.div>

                {/* Profile Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden mb-8">
                    {/* Header Section with Gradient */}
                    <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 px-8 py-8">
                        <div className="flex flex-col md:flex-row items-center md:items-center gap-6">
                            {/* Avatar */}
                            <div className="relative">
                                {currentUser.photoURL ? (
                                    <img src={currentUser.photoURL} className="w-32 h-32 rounded-3xl border-4 border-white shadow-2xl" alt="Profile" />
                                ) : (
                                    <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white">
                                        <User size={48} className="text-white" />
                                    </div>
                                )}
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                </div>
                            </div>

                            {/* Name & Info */}
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-4xl font-black text-white mb-3">{name || 'User'}</h2>
                                {currentUser.metadata.creationTime && (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                                        <Calendar className="w-4 h-4 text-white" />
                                        <span className="text-sm font-medium text-white">
                                            Member since {new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="px-8 pb-8 pt-8">
                        {/* Form */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"><Edit2 size={16} className="text-purple-600" /> Full Name *</label>
                                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-800 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white font-medium transition" placeholder="Enter your name" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"><Mail size={16} className="text-blue-600" /> Email</label>
                                <input type="email" value={email} readOnly className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 cursor-not-allowed font-medium" />
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><Shield size={12} /> Email cannot be changed</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"><Phone size={16} className="text-green-600" /> Phone</label>
                                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 1234567890" className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-800 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white font-medium transition" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"><Calendar size={16} className="text-orange-600" /> Date of Birth</label>
                                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-800 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white font-medium transition" />
                            </div>

                            <button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transition disabled:opacity-50">
                                {saving ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : <><Save size={20} /> Save Profile</>}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Dashboard CTA */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="relative bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 opacity-20"><div style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '20px 20px' }} className="absolute inset-0" /></div>
                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4 text-center md:text-left">
                            <div className="text-5xl">📊</div>
                            <div>
                                <h3 className="text-2xl font-black text-white mb-1">View Performance</h3>
                                <p className="text-white/90">Check your stats on the dashboard</p>
                            </div>
                        </div>
                        <Link to="/dashboard" className="w-full md:w-auto px-8 py-4 bg-white text-blue-600 rounded-xl font-bold shadow-xl hover:shadow-2xl transition flex items-center justify-center gap-2">Go to Dashboard <ArrowRight /></Link>
                    </div>
                </motion.div>
            </div >
        </div >
    );
};

export default Profile;