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
          const topics = sessions.slice(0, 3).map((session: any) => {
            // Find corresponding quiz result for this topic
            const quizResult = quizResults.find((quiz: any) => quiz.topic === session.topic);
            // quizResult comes from Firestore and may have an inferred narrow type; cast to any
            const score = quizResult ? Math.round(((quizResult as any).score / (quizResult as any).totalQuestions) * 100) : null;

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
      <div className="min-h-screen bg-transparent flex items-center justify-center animate-fade-in-up">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full glow"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-transparent overflow-x-hidden relative animate-fade-in-up">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 lg:p-8 pt-16 md:pt-8 w-full max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-main mb-2 tracking-tight">
              Welcome back, {userProfile?.name || user.email}! 👋
            </h1>
            <p className="text-text-muted font-medium">Ready to continue your learning journey?</p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link href="/learn" className="glass-panel p-6 flex flex-col justify-center">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-3 rounded-xl border border-primary/30">
                  <span className="text-2xl text-primary"><HiBookOpen /></span>
                </div>
                <div>
                  <h3 className="font-semibold text-text-main text-lg">Quick Learn</h3>
                  <p className="text-sm text-text-muted">Feed Your Curiosity</p>
                </div>
              </div>
            </Link>

            <Link href="/deep-learn" className="glass-panel p-6 flex flex-col justify-center">
              <div className="flex items-center gap-4">
                <div className="bg-accent/20 p-3 rounded-xl border border-accent/30">
                  <span className="text-2xl text-accent"><FaBrain /></span>
                </div>
                <div>
                  <h3 className="font-semibold text-text-main text-lg">Deep Learn</h3>
                  <p className="text-sm text-text-muted">Dive Deep into Your Topic</p>
                </div>
              </div>
            </Link>

            <Link href="/progress" className="glass-panel p-6 flex flex-col justify-center">
              <div className="flex items-center gap-4">
                <div className="bg-purple-500/20 p-3 rounded-xl border border-purple-500/30">
                  <span className="text-2xl text-purple-400"><HiChartBar /></span>
                </div>
                <div>
                  <h3 className="font-semibold text-text-main text-lg">View Progress</h3>
                  <p className="text-sm text-text-muted">Track your growth</p>
                </div>
              </div>
            </Link>

            <Link href="/profile" className="glass-panel p-6 flex flex-col justify-center">
              <div className="flex items-center gap-4">
                <div className="bg-pink-500/20 p-3 rounded-xl border border-pink-500/30">
                  <span className="text-2xl text-pink-400"><HiUser /></span>
                </div>
                <div>
                  <h3 className="font-semibold text-text-main text-lg">Profile</h3>
                  <p className="text-sm text-text-muted">Manage account</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="glass-panel p-6 md:p-8">
              <h2 className="text-xl font-bold text-text-main mb-6">Recent Topics</h2>
              {dataLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full glow"></div>
                </div>
              ) : recentTopics.length > 0 ? (
                <div className="space-y-4">
                  {recentTopics.map((topic) => (
                    <div key={topic.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl transition-colors hover:bg-white/10">
                      <div>
                        <h3 className="font-medium text-text-main truncate max-w-[200px] md:max-w-xs">{topic.title}</h3>
                        <p className="text-sm text-text-muted mt-1">{topic.date}</p>
                      </div>
                      <div className="text-right">
                        {topic.score !== null ? (
                          <div className={`text-sm font-bold px-3 py-1.5 rounded-lg ${topic.score >= 80 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            topic.score >= 60 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                              'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                            {topic.score}%
                          </div>
                        ) : (
                          <div className="text-sm text-text-muted bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                            No quiz
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-text-muted">
                  <span className="text-5xl mb-4 block opacity-50">📚</span>
                  <p>No topics learned yet.</p>
                  <Link href="/learn" className="text-primary hover:text-accent hover:underline mt-4 inline-block font-semibold transition-colors">
                    Start learning now!
                  </Link>
                </div>
              )}
            </div>

            <div className="glass-panel p-6 md:p-8">
              <h2 className="text-xl font-bold text-text-main mb-6">Learning Stats</h2>
              {dataLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full glow"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-text-muted font-medium">Total Topics</span>
                    <span className="font-bold text-text-main text-xl">{userProfile?.totalTopics || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-text-muted font-medium">Total Quizzes</span>
                    <span className="font-bold text-text-main text-xl">{userProfile?.totalQuizzes || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-text-muted font-medium">Average Score</span>
                    <span className="font-bold text-text-main text-xl">{userProfile?.averageScore || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                    <span className="text-orange-400/80 font-medium flex items-center gap-2">
                      Learning Streak
                    </span>
                    <span className="font-bold text-orange-400 text-xl flex items-center gap-1">
                      {learningStreak} <span className="text-orange-500">🔥</span>
                    </span>
                  </div>
                  <div className="pt-4 border-t border-border-glass mt-2">
                    <Link href="/progress" className="text-primary hover:text-accent font-semibold transition-colors hover:underline text-sm flex items-center gap-1">
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