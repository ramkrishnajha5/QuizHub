import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { Link, useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      navigate('/');
    } catch (err) {
      console.error(err);
      alert("Error creating account");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-darkbg py-12 px-4 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-darkcard p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">Create Account</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="space-y-4">
            <input 
              type="text" 
              required 
              placeholder="Full Name" 
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
            <input 
              type="email" 
              required 
              placeholder="Email address" 
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <input 
              type="password" 
              required 
              placeholder="Password" 
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <button type="submit" className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 shadow-md">Sign up</button>
        </form>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
};

export default Signup;