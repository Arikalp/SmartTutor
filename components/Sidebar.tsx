'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { getUserQuizResults } from '@/lib/firestore';
import ThemeToggle from './ThemeToggle';
import { FaBeer, FaBook, FaChartLine, FaHome, FaLightbulb, FaQuestion, FaUser, FaBars, FaTimes } from 'react-icons/fa'
import { FaBrain } from 'react-icons/fa6';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, logout } = useAuth();
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const fetchRecentQuizzes = async () => {
      if (user) {
        try {
          const quizResults = await getUserQuizResults(user.uid);
          setRecentQuizzes(quizResults);
        } catch (error) {
          console.error('Failed to fetch recent quizzes:', error);
        }
      }
    };

    fetchRecentQuizzes();
  }, [user, userProfile]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const menuItems = [
    { icon: <FaHome />, label: 'Dashboard', href: '/dashboard' },
    { icon: <FaBook />, label: 'Quick Learn', href: '/learn' },
    { icon: <FaBrain />, label: 'Deep Learn', href: '/deep-learn' },
    // { icon: <FaLightbulb/>, label: 'Quiz', href: '/quiz' },
    { icon: <FaChartLine/>, label: 'Progress', href: '/progress' },
    { icon: <FaUser/>, label: 'Profile', href: '/profile' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Hamburger Button - Fixed at top */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-[60] p-3 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-[45]"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`w-64 bg-white dark:bg-gray-900 shadow-lg min-h-screen flex flex-col border-r border-gray-200 dark:border-gray-700 fixed lg:sticky top-0 left-0 lg:left-auto z-[50] lg:top-0 lg:self-start transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl bg-white rounded-full max-w-12 aspect-square p-2"><img src="\deep-learning.png"/> </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white">Smart Tutor</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">AI Learning Platform</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* User Profile */}
      {user && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
              {(userProfile?.name || user.email || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">{userProfile?.name || 'User'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-2">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{userProfile?.totalTopics || 0}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Topics</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-2">
            <div className="text-lg font-bold text-green-600 dark:text-green-300">{userProfile?.totalQuizzes || 0}</div>
            <div className="text-xs text-gray-600 dark:text-gray-300">Quizzes</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-2">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{userProfile?.averageScore || 0}%</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Score</div>
          </div>
        </div>
      </div>

      {/* Recent Quizzes */}
      {user && recentQuizzes.length > 0 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent Quizzes</h3>
          <div className="space-y-2">
            {recentQuizzes.slice(0, 3).map((quiz: any, index: number) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                  {quiz.topic.length > 20 ? quiz.topic.substring(0, 20) + '...' : quiz.topic}
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(quiz.completedAt.seconds * 1000).toLocaleDateString()}
                  </div>
                  <div className={`text-xs font-semibold ${
                    (quiz.score / quiz.totalQuestions * 100) >= 80 ? 'text-green-600 dark:text-green-400' :
                    (quiz.score / quiz.totalQuestions * 100) >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {Math.round(quiz.score / quiz.totalQuestions * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <span className="text-lg">🚪</span>
          <span>Logout</span>
        </button>
      </div>
      </div>
    </>
  );
}