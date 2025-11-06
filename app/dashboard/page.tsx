'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

export default function DashboardPage() {
  const [recentTopics] = useState([
    { id: 1, title: 'Binary Trees', date: '2024-01-15', score: 85 },
    { id: 2, title: 'Machine Learning', date: '2024-01-14', score: 92 },
    { id: 3, title: 'React Hooks', date: '2024-01-13', score: 78 },
  ]);
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();

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
                  <span className="text-2xl">📚</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Start Learning</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Explore new topics</p>
                </div>
              </div>
            </Link>

            <Link href="/quiz" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Take Quiz</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Test your knowledge</p>
                </div>
              </div>
            </Link>

            <Link href="/progress" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                  <span className="text-2xl">📊</span>
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
                  <span className="text-2xl">👤</span>
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
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Topics</h2>
              <div className="space-y-4">
                {recentTopics.map((topic) => (
                  <div key={topic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{topic.title}</h3>
                      <p className="text-sm text-gray-600">{topic.date}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${topic.score >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {topic.score}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Streak</h2>
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-600 mb-2">7</div>
                <p className="text-gray-600 mb-4">Days in a row</p>
                <div className="flex justify-center gap-1">
                  {[1,2,3,4,5,6,7].map((day) => (
                    <div key={day} className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-xs text-indigo-600">✓</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}