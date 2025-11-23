import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Clock, BarChart2, ChevronRight, Calendar } from 'lucide-react';

interface QuizSummary {
  id: string;
  categoryName: string;
  difficulty: string;
  score: number;
  percent: number;
  finishedAt: number;
  detailedAttemptId: string;
}

const RecentQuizzes: React.FC = () => {
  const { currentUser } = useAuth();
  const [summaries, setSummaries] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchSummaries = async () => {
      try {
        const q = query(
          collection(db, `users/${currentUser.uid}/quizSummaries`),
          orderBy('finishedAt', 'desc'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizSummary));
        setSummaries(data);
      } catch (err) {
        console.error("Error fetching summaries", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, [currentUser]);

  if (loading) return <div className="p-8 text-center dark:text-white">Loading history...</div>;
  if (!currentUser) return <div className="p-8 text-center dark:text-white">Please login to view history.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Attempt History</h1>
      
      {summaries.length === 0 ? (
        <div className="bg-white dark:bg-darkcard p-8 rounded-xl shadow-sm text-center border border-gray-200 dark:border-gray-700">
           <p className="text-gray-500 dark:text-gray-400 text-lg">No quizzes taken yet.</p>
           <Link to="/setup" className="inline-block mt-4 text-primary font-bold hover:underline">Start a Quiz</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {summaries.map(summary => (
            <div key={summary.id} className="bg-white dark:bg-darkcard p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition flex flex-col md:flex-row items-center justify-between">
              <div className="flex-1 mb-4 md:mb-0">
                 <div className="flex items-center mb-1">
                   <span className="font-bold text-lg text-gray-900 dark:text-white mr-3">{summary.categoryName}</span>
                   <span className="px-2 py-0.5 rounded text-xs uppercase font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">{summary.difficulty}</span>
                 </div>
                 <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                    <span className="flex items-center"><Calendar size={14} className="mr-1" /> {new Date(summary.finishedAt).toLocaleDateString()}</span>
                    <span className="flex items-center"><Clock size={14} className="mr-1" /> {new Date(summary.finishedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                 </div>
              </div>

              <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                   <div className="flex items-center justify-end font-bold text-xl text-gray-900 dark:text-white">
                     {summary.percent.toFixed(0)}%
                   </div>
                   <div className="text-xs text-gray-500 dark:text-gray-400">Score: {summary.score}/25</div>
                </div>
                
                {summary.detailedAttemptId ? (
                   <Link 
                     to={`/history/${summary.detailedAttemptId}`}
                     className="p-2 bg-gray-50 dark:bg-gray-700 rounded-full text-primary dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600 transition"
                   >
                     <ChevronRight size={20} />
                   </Link>
                ) : (
                  <span className="text-xs text-gray-400 italic">Details expired</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentQuizzes;
