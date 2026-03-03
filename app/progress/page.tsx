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
      <div className="min-h-screen bg-bg-main flex items-center justify-center animate-fade-in-up">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full glow"></div>
      </div>
    );
  }

  if (!user) return null;

  const subjects = progressData();
  const activities = recentActivity();

  return (
    <div className="flex min-h-screen bg-bg-main overflow-x-hidden relative animate-fade-in-up">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 lg:p-8 pt-16 md:pt-8 w-full max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-main mb-2 tracking-tight">Learning Progress</h1>
            <p className="text-text-muted font-medium">Track your learning journey and achievements</p>
          </div>

          {dataLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full glow"></div>
            </div>
          ) : (
            <>
              {/* Overall Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="glass-panel p-5">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl border border-primary/20">
                      <span className="text-2xl">📚</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{userProfile?.totalTopics || 0}</div>
                      <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">Topics</div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-5">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                      <span className="text-2xl">📝</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-400">{userProfile?.totalQuizzes || 0}</div>
                      <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">Quizzes</div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-5">
                  <div className="flex items-center gap-4">
                    <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">{userProfile?.averageScore || 0}%</div>
                      <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">Avg Score</div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-5">
                  <div className="flex items-center gap-4">
                    <div className="bg-accent/10 p-3 rounded-xl border border-accent/20">
                      <span className="text-2xl">🔥</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-accent">-</div>
                      <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">Day Streak</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {!dataLoading && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Subject Progress */}
              <div className="glass-panel p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <h2 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                  <span>📊</span> Subject Progress
                </h2>
                {subjects.length > 0 ? (
                  <div className="space-y-6">
                    {subjects.map((subject, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold text-text-main">{subject.subject}</h3>
                          <span className="text-sm text-primary font-bold">{subject.progress}%</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2.5 mb-3 border border-white/5">
                          <div
                            className="h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${subject.progress}%`, background: 'linear-gradient(135deg, #4F46E5, #3B82F6)' }}
                          ></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-xs font-medium text-text-muted">
                          <div>{subject.topics} topics</div>
                          <div>{subject.quizzes} quizzes</div>
                          <div>{subject.avgScore}% avg</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-text-muted">
                    <span className="text-4xl mb-4 block">📚</span>
                    <p>No learning progress yet. Start learning to see your progress!</p>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="glass-panel p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <h2 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                  <span>📈</span> Recent Activity
                </h2>
                {activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.map((activity, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-white/5 border border-border-glass rounded-xl transition-colors hover:bg-white/10">
                        <div className={`p-2 rounded-xl ${activity.type === 'quiz' ? 'bg-green-500/10 border border-green-500/20' : 'bg-primary/10 border border-primary/20'}`}>
                          <span className="text-lg">{activity.type === 'quiz' ? '📝' : '📚'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-text-main truncate">{activity.topic}</h3>
                          <p className="text-xs text-text-muted">{activity.date}</p>
                        </div>
                        {activity.score !== null && (
                          <div className={`text-xs font-bold px-2.5 py-1 rounded-lg ${activity.score >= 90 ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
                            activity.score >= 80 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20' :
                              'bg-red-500/20 text-red-400 border border-red-500/20'
                            }`}>
                            {activity.score}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-text-muted">
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