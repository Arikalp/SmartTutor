'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getUserStudySessions, getUserQuizResults } from '@/lib/firestore';
import Sidebar from '@/components/Sidebar';

export default function ProgressPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [studySessions, setStudySessions] = useState<any[]>([]);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          console.log('📊 Fetching user progress data for:', user.uid);
          const [sessions, results] = await Promise.all([
            getUserStudySessions(user.uid),
            getUserQuizResults(user.uid)
          ]);
          console.log('📚 Study sessions:', sessions);
          console.log('📝 Quiz results:', results);
          setStudySessions(sessions);
          setQuizResults(results);
        } catch (error) {
          console.error('❌ Failed to fetch user data:', error);
        } finally {
          setDataLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user, userProfile]);

  // Group topics by subject (simplified categorization)
  const getSubjectFromTopic = (topic: string) => {
    const lowerTopic = topic.toLowerCase();
    if (lowerTopic.includes('tree') || lowerTopic.includes('algorithm') || lowerTopic.includes('data structure') || lowerTopic.includes('programming')) {
      return 'Computer Science';
    } else if (lowerTopic.includes('math') || lowerTopic.includes('calculus') || lowerTopic.includes('algebra')) {
      return 'Mathematics';
    } else if (lowerTopic.includes('physics') || lowerTopic.includes('quantum') || lowerTopic.includes('mechanics')) {
      return 'Physics';
    }
    return 'General';
  };

  // Calculate progress data from actual user data
  const progressData = () => {
    const subjects: Record<string, { topics: number; quizzes: number; scores: number[]; }> = {};
    
    studySessions.forEach((session: any) => {
      const subject = getSubjectFromTopic(session.topic);
      if (!subjects[subject]) subjects[subject] = { topics: 0, quizzes: 0, scores: [] };
      subjects[subject].topics++;
    });
    
    quizResults.forEach((result: any) => {
      const subject = getSubjectFromTopic(result.topic);
      if (!subjects[subject]) subjects[subject] = { topics: 0, quizzes: 0, scores: [] };
      subjects[subject].quizzes++;
      subjects[subject].scores.push((result.score / result.totalQuestions) * 100);
    });
    
    return Object.entries(subjects).map(([subject, data]) => ({
      subject,
      topics: data.topics,
      quizzes: data.quizzes,
      avgScore: data.scores.length > 0 ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length) : 0,
      progress: Math.min(100, (data.topics + data.quizzes) * 10)
    }));
  };

  // Recent activity from actual user data
  const recentActivity = () => {
    const activities: any[] = [];
    
    studySessions.slice(0, 3).forEach((session: any) => {
      activities.push({
        date: new Date(session.createdAt.seconds * 1000).toLocaleDateString(),
        topic: session.topic,
        score: null,
        type: 'learn'
      });
    });
    
    quizResults.slice(0, 3).forEach((result: any) => {
      activities.push({
        date: new Date(result.completedAt.seconds * 1000).toLocaleDateString(),
        topic: result.topic,
        score: Math.round((result.score / result.totalQuestions) * 100),
        type: 'quiz'
      });
    });
    
    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) return null;

  const subjects = progressData();
  const activities = recentActivity();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Learning Progress</h1>
            <p className="text-gray-600 dark:text-gray-300">Track your learning journey and achievements</p>
          </div>

          {dataLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              {/* Overall Stats */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                      <span className="text-2xl">📚</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{userProfile?.totalTopics || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Topics Completed</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                      <span className="text-2xl">📝</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{userProfile?.totalQuizzes || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Quizzes Taken</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{userProfile?.averageScore || 0}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
                      <span className="text-2xl">🔥</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">-</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {!dataLoading && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Subject Progress */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Subject Progress</h2>
                {subjects.length > 0 ? (
                  <div className="space-y-6">
                    {subjects.map((subject, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">{subject.subject}</h3>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{subject.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${subject.progress}%` }}
                          ></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div>{subject.topics} topics</div>
                          <div>{subject.quizzes} quizzes</div>
                          <div>{subject.avgScore}% avg</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <span className="text-4xl mb-4 block">📚</span>
                    <p>No learning progress yet. Start learning to see your progress!</p>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className={`p-2 rounded-lg ${activity.type === 'quiz' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                          <span className="text-lg">{activity.type === 'quiz' ? '📝' : '📚'}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">{activity.topic}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{activity.date}</p>
                        </div>
                        {activity.score !== null && (
                          <div className={`text-sm font-medium px-2 py-1 rounded ${
                            activity.score >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            activity.score >= 80 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {activity.score}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <span className="text-4xl mb-4 block">📈</span>
                    <p>No recent activity. Start learning to see your activity!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}