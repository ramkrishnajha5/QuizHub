import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import QuizSetup from './pages/QuizSetup';
import QuizRunner from './pages/QuizRunner';
import Results from './pages/Results';
import Profile from './pages/Profile';
import RecentQuizzes from './pages/RecentQuizzes';
import ViewQuiz from './pages/ViewQuiz';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-darkbg text-gray-900 dark:text-white font-sans transition-colors duration-200">
          <Header />
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
            <Route path="/history" element={<RecentQuizzes />} />
            <Route path="/history/:id" element={<ViewQuiz />} />
          </Routes>
          <Footer />
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
