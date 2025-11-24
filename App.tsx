import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { QuizProvider } from './contexts/QuizContext';
import Header from './components/Header';
import Footer from './components/Footer';
import LeaveQuizModal from './components/LeaveQuizModal';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import QuizSetup from './pages/QuizSetup';
import QuizRunner from './pages/QuizRunner';
import Results from './pages/Results';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Study from './pages/Study';
import SavedBooks from './pages/SavedBooks';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <QuizProvider>
        <HashRouter>
          <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-darkbg text-gray-900 dark:text-white font-sans transition-colors duration-200 overflow-x-hidden">
            <Header />
            <LeaveQuizModal />
            <main className="pt-16 flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/setup" element={<QuizSetup />} />
                <Route path="/quiz" element={<QuizRunner />} />
                <Route path="/results" element={<Results />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/study" element={<Study />} />
                <Route path="/saved-books" element={<SavedBooks />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </HashRouter>
      </QuizProvider>
    </AuthProvider>
  );
};

export default App;