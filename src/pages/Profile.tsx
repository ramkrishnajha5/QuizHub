import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, updateUserProfileDoc, UserProfileData } from '../services/authService';
import { User, Save, Phone, Calendar, Mail } from 'lucide-react';

const Profile: React.FC = () => {
    const { currentUser } = useAuth();
    const [profile, setProfile] = useState<UserProfileData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', phone: '', dob: '' });
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (currentUser) {
            loadProfile(currentUser.uid);
        }
    }, [currentUser]);

    const loadProfile = async (uid: string) => {
        const data = await getUserProfile(uid);
        if (data) {
            setProfile(data);
            setFormData({
                name: data.name || '',
                phone: data.phone || '',
                dob: data.dob || ''
            });
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        
        try {
            await updateUserProfileDoc(currentUser.uid, {
                name: formData.name,
                phone: formData.phone,
                dob: formData.dob
            });
            setMessage('Profile updated successfully!');
            setIsEditing(false);
            loadProfile(currentUser.uid);
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error(error);
            setMessage('Error updating profile.');
        }
    };

    if (loading) return <div className="p-8 text-center dark:text-white">Loading profile...</div>;
    if (!currentUser) return <div className="p-8 text-center dark:text-white">Please log in.</div>;

    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-8 dark:text-white">
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">My Profile</h1>
            
            <div className="bg-white dark:bg-darkcard rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-primary/10 p-6 flex items-center space-x-6">
                    {currentUser.photoURL ? (
                        <img src={currentUser.photoURL} className="w-24 h-24 rounded-full border-4 border-white dark:border-darkcard shadow-md" alt="Profile" />
                    ) : (
                        <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-4xl font-bold shadow-md border-4 border-white dark:border-darkcard">
                            {formData.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{formData.name}</h2>
                        <p className="text-gray-600 dark:text-gray-300 flex items-center mt-1"><Mail size={14} className="mr-1"/> {currentUser.email}</p>
                    </div>
                </div>

                <div className="p-8">
                    {message && (
                        <div className="mb-6 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-sm font-medium">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSave}>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><User size={18} /></div>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        className="pl-10 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700/50"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Phone size={18} /></div>
                                    <input
                                        type="tel"
                                        disabled={!isEditing}
                                        placeholder="+1 234 567 8900"
                                        className="pl-10 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700/50"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Calendar size={18} /></div>
                                    <input
                                        type="date"
                                        disabled={!isEditing}
                                        className="pl-10 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700/50"
                                        value={formData.dob}
                                        onChange={(e) => setFormData({...formData, dob: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            {isEditing ? (
                                <>
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            setIsEditing(false);
                                            if (profile) setFormData({name: profile.name, phone: profile.phone || '', dob: profile.dob || ''});
                                        }}
                                        className="mr-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 shadow-sm"
                                    >
                                        <Save size={18} className="mr-2" /> Save Changes
                                    </button>
                                </>
                            ) : (
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm transition"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
