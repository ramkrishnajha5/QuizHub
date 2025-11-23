import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';

interface DetailedAttempt {
  categoryName: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  correct: number;
  wrong: number;
  unattempted: number;
  durationSeconds: number;
  finishedAt: number;
  questions: {
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
  userAnswers: {
    selectedOption: string | null;
    isCorrect: boolean;
    timeSpentSeconds: number;
  }[];
}

const ViewQuiz: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const [attempt, setAttempt] = useState<DetailedAttempt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !id) return;

    const fetchAttempt = async () => {
      try {
        const docRef = doc(db, `users/${currentUser.uid}/quizAttempts`, id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setAttempt(snap.data() as DetailedAttempt);
        }
      } catch (err) {
        console.error("Error fetching detail", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttempt();
  }, [currentUser, id]);

  if (loading) return <div className="p-8 text-center dark:text-white">Loading details...</div>;
  if (!attempt) return <div className="p-8 text-center dark:text-white">Attempt details not found or expired.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/history" className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-primary mb-6">
        <ArrowLeft size={16} className="mr-1" /> Back to History
      </Link>

      <div className="bg-white dark:bg-darkcard rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{attempt.categoryName}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 capitalize">{attempt.difficulty} Difficulty • {new Date(attempt.finishedAt).toLocaleDateString()}</p>
          </div>
          <div className="mt-4 md:mt-0 text-center">
            <div className="text-4xl font-extrabold text-primary">{((attempt.score / attempt.totalQuestions) * 100).toFixed(0)}%</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Score: {attempt.score}/{attempt.totalQuestions}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-xl font-bold text-green-700 dark:text-green-400">{attempt.correct}</div>
            <div className="text-xs text-green-600 dark:text-green-300">Correct</div>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-xl font-bold text-red-700 dark:text-red-400">{attempt.wrong}</div>
            <div className="text-xs text-red-600 dark:text-red-300">Wrong</div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-xl font-bold text-gray-700 dark:text-gray-300">{attempt.unattempted}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Skipped</div>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-xl font-bold text-blue-700 dark:text-blue-400">{(attempt.durationSeconds / 60).toFixed(1)}m</div>
            <div className="text-xs text-blue-600 dark:text-blue-300">Duration</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Question Breakdown</h2>
        {attempt.questions.map((q, i) => {
          const userAnswer = attempt.userAnswers[i];
          const isCorrect = userAnswer.isCorrect;
          
          return (
            <div key={i} className={`bg-white dark:bg-darkcard p-6 rounded-xl border-l-4 shadow-sm ${isCorrect ? 'border-green-500' : 'border-red-500'}`}>
              <div className="flex justify-between mb-3">
                 <span className="font-bold text-gray-400 dark:text-gray-500">Question {i + 1}</span>
                 <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center"><Clock size={12} className="mr-1"/> {userAnswer.timeSpentSeconds}s</span>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4" dangerouslySetInnerHTML={{ __html: q.question }} />
              
              <div className="space-y-2">
                 {q.options.map((opt, idx) => {
                   const isSelected = userAnswer.selectedOption === opt;
                   const isActualCorrect = opt === q.correctAnswer;
                   
                   let style = "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300";
                   if (isActualCorrect) style = "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-900 text-green-800 dark:text-green-300 font-bold";
                   else if (isSelected && !isActualCorrect) style = "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-900 text-red-800 dark:text-red-300";

                   return (
                     <div key={idx} className={`p-3 rounded-lg border flex justify-between items-center ${style}`}>
                       <span dangerouslySetInnerHTML={{ __html: opt }} />
                       {isActualCorrect && <CheckCircle size={18} className="text-green-600 dark:text-green-400" />}
                       {isSelected && !isActualCorrect && <XCircle size={18} className="text-red-600 dark:text-red-400" />}
                     </div>
                   )
                 })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default ViewQuiz;
