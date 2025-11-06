'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getUserStudySessions, getUserQuizResults } from '@/lib/firestore';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { HiBookOpen, HiChartBar, HiLightBulb, HiUser } from 'react-icons/hi';
import { FaBrain } from 'react-icons/fa';

export default function DashboardPage() {
  const [recentTopics, setRecentTopics] = useState<any[]>([]);
  const [learningStreak, setLearningStreak] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();

  // Calculate learning streak from study sessions
  const calculateStreak = (sessions: any[]) => {
    if (sessions.length === 0) return 0;
    
    // Get unique dates when user studied (remove duplicates)
    const studyDates = [...new Set(
      sessions.map(session => {
        const date = new Date(session.createdAt.seconds * 1000);
        return date.toDateString(); // Convert to date string for comparison
      })
    )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Sort newest first
    
    let streak = 0;
    const today = new Date();
    
    // Check if user studied today or yesterday (to account for timezone)
    const todayStr = today.toDateString();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    // Start counting from today or yesterday
    let currentDate = new Date();
    if (studyDates[0] === todayStr) {
      // User studied today, start from today
      currentDate = today;
    } else if (studyDates[0] === yesterdayStr) {
      // User studied yesterday, start from yesterday
      currentDate = yesterday;
    } else {
      // User hasn't studied recently, no streak
      return 0;
    }
    
    // Count consecutive days
    for (const studyDate of studyDates) {
      const studyDateObj = new Date(studyDate);
      const currentDateStr = currentDate.toDateString();
      
      if (studyDate === currentDateStr) {
        streak++;
        // Move to previous day
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // Gap found, break the streak
        break;
      }
    }
    
    return streak;
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchRecentTopics = async () => {
      if (user) {
        try {
          console.log('📊 Fetching recent topics for dashboard:', user.uid);
          const [sessions, quizResults] = await Promise.all([
            getUserStudySessions(user.uid),
            getUserQuizResults(user.uid)
          ]);
          
          // Combine and format recent topics
          const topics = sessions.slice(0, 3).map(session => {
            // Find corresponding quiz result for this topic
            const quizResult = quizResults.find(quiz => quiz.topic === session.topic);
            const score = quizResult ? Math.round((quizResult.score / quizResult.totalQuestions) * 100) : null;
            
            return {
              id: session.id,
              title: session.topic,
              date: new Date(session.createdAt.seconds * 1000).toLocaleDateString(),
              score: score
            };
          });
          
          console.log('📚 Recent topics loaded:', topics);
          setRecentTopics(topics);
          
          // Calculate learning streak
          const streak = calculateStreak(sessions);
          console.log('🔥 Learning streak calculated:', streak);
          setLearningStreak(streak);
        } catch (error) {
          console.error('❌ Failed to fetch recent topics:', error);
        } finally {
          setDataLoading(false);
        }
      }
    };

    fetchRecentTopics();
  }, [user, userProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {userProfile?.name || user.email}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Ready to continue your learning journey?</p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link href="/learn" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                  <span className="text-2xl text-white"><HiBookOpen /></span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Quick Learn</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Feed Your Curiosity</p>
                </div>
              </div>
            </Link>

            <Link href="/deep-learn" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                  <span className="text-2xl text-white"><FaBrain /></span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Deep Learn</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Dive Deep into Your Topic</p>
                </div>
              </div>
            </Link>

            <Link href="/progress" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                  <span className="text-2xl text-white"><HiChartBar /></span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">View Progress</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Track your growth</p>
                </div>
              </div>
            </Link>

            <Link href="/profile" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
                  <span className="text-2xl text-white"><HiUser/></span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Profile</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Manage account</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Topics</h2>
              {dataLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                </div>
              ) : recentTopics.length > 0 ? (
                <div className="space-y-4">
                  {recentTopics.map((topic) => (
                    <div key={topic.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{topic.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{topic.date}</p>
                      </div>
                      <div className="text-right">
                        {topic.score !== null ? (
                          <div className={`text-sm font-medium ${
                            topic.score >= 80 ? 'text-green-600 dark:text-green-400' : 
                            topic.score >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {topic.score}%
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            No quiz
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <span className="text-4xl mb-4 block">📚</span>
                  <p>No topics learned yet.</p>
                  <Link href="/learn" className="text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block">
                    Start learning now!
                  </Link>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Learning Stats</h2>
              {dataLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Topics</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{userProfile?.totalTopics || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Quizzes</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{userProfile?.totalQuizzes || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Average Score</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{userProfile?.averageScore || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      🔥 Learning Streak
                    </span>
                    <span className="font-semibold text-orange-600 dark:text-orange-400">
                      {learningStreak} {learningStreak === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                    <Link href="/progress" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">
                      View detailed progress →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}