import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../utils/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { User, Edit2, Save, Calendar, Phone, Mail, Loader, ArrowRight } from 'lucide-react';
import Alert from '../components/Alert';

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
                // Set email and name from auth
                setEmail(currentUser.email || '');
                setName(currentUser.displayName || '');

                try {
                    // Load additional data from Firestore
                    const userDocRef = doc(db, 'users', currentUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setPhone(data.phone || '');
                        setDob(data.dob || '');
                        // Override name if it exists in Firestore
                        if (data.name) {
                            setName(data.name);
                        }
                    }
                } catch (error) {
                    console.error('Error loading user data:', error);
                    setAlert({ type: 'error', message: 'Failed to load profile data' });
                }
            }
            setLoading(false);
        };
        loadUserData();
    }, [currentUser]);

    const handleSave = async () => {
        if (!currentUser) {
            setAlert({ type: 'error', message: 'You must be logged in to update your profile' });
            return;
        }

        if (!name.trim()) {
            setAlert({ type: 'error', message: 'Name cannot be empty' });
            return;
        }

        setSaving(true);
        setAlert(null);

        try {
            // Update Firebase Auth displayName
            await updateUserProfile(name.trim());

            // Update Firestore user document
            const userDocRef = doc(db, 'users', currentUser.uid);
            await setDoc(userDocRef, {
                name: name.trim(),
                email: email,
                phone: phone.trim() || null,
                dob: dob || null,
                updatedAt: serverTimestamp()
            }, { merge: true });

            setAlert({ type: 'success', message: 'Profile updated successfully!' });
            setTimeout(() => setAlert(null), 5000);
        } catch (error: any) {
            console.error('Error updating profile:', error);
            setAlert({
                type: 'error',
                message: error.message || 'Failed to update profile. Please try again.'
            });
        } finally {
            setSaving(false);
        }
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center dark:bg-darkbg">
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Please login to view your profile</p>
                    <a href="/#/login" className="text-primary hover:underline">Go to Login</a>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center dark:bg-darkbg">
                <Loader className="animate-spin h-12 w-12 text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 dark:text-white min-h-screen">
            {/* Alert */}
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    show={!!alert}
                    onClose={() => setAlert(null)}
                />
            )}

            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white text-center md:text-left">My Profile</h1>

            <div className="bg-white dark:bg-darkcard rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                {/* Profile Picture */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                    {currentUser.photoURL ? (
                        <img
                            src={currentUser.photoURL}
                            className="w-24 h-24 rounded-full border-2 border-gray-200 dark:border-gray-600"
                            alt="Profile"
                        />
                    ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <User size={40} className="text-white" />
                        </div>
                    )}
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {name || 'User'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">{email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {currentUser.metadata.creationTime && `Member since ${new Date(currentUser.metadata.creationTime).toLocaleDateString()}`}
                        </p>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            <Edit2 size={16} className="mr-2" />
                            Full Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            <Mail size={16} className="mr-2" />
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            readOnly
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            <Phone size={16} className="mr-2" />
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+912212224444"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            <Calendar size={16} className="mr-2" />
                            Date of Birth
                        </label>
                        <input
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                    </div>

                    {/* Save Button */}
                    <div className="pt-4">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg shadow-md"
                        >
                            {saving ? (
                                <>
                                    <Loader className="animate-spin mr-2" size={20} />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={20} className="mr-2" />
                                    Save / Update Profile
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Box with Interactive Dashboard Button */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-900/30 shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
                        <span className="text-4xl md:text-2xl mb-2 md:mb-0">📊</span>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-lg">View Your Performance</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Detailed account statistics and performance history charts are available on the Dashboard</p>
                        </div>
                    </div>
                    <a
                        href="/#/dashboard"
                        className="w-full md:w-auto px-6 py-3 bg-primary hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        Go to Dashboard
                        <ArrowRight size={18} />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Profile;