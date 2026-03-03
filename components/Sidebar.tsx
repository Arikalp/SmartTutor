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
    { icon: <FaChartLine />, label: 'Progress', href: '/progress' },
    { icon: <FaUser />, label: 'Profile', href: '/profile' },
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
        className="md:hidden fixed top-4 left-4 z-[60] p-3 rounded-lg shadow-lg text-white border border-white/10 hover:scale-105 active:scale-95 transition-all duration-300"
        style={{ background: 'linear-gradient(135deg, #4F46E5, #3B82F6)' }}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[45]"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={`w-64 bg-black/70 backdrop-blur-xl shadow-2xl min-h-screen flex flex-col border-r border-white/10 fixed md:sticky top-0 left-0 md:left-auto z-[50] md:top-0 md:self-start transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Header */}
        <div className="p-6 border-b border-border-glass">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl bg-white/15 rounded-xl p-2 border border-white/10 relative z-10 shadow-[0_0_12px_#4F46E540]"><img src="\deep-learning.png" className="max-w-8 brightness-110 drop-shadow-[0_0_6px_#4F46E5]" /> </div>
              <div>
                <h1 className="font-bold text-text-main tracking-tight">Smart Tutor</h1>
                <p className="text-xs text-primary font-medium">AI Learning Platform</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* User Profile */}
        {user && (
          <div className="p-4 border-b border-border-glass">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-btn-gradient flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                {(userProfile?.name || user.email || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-main truncate">{userProfile?.name || 'User'}</p>
                <p className="text-sm text-text-muted truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="p-4 border-b border-border-glass">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-primary/10 rounded-xl p-2 border border-primary/20">
              <div className="text-lg font-bold text-primary">{userProfile?.totalTopics || 0}</div>
              <div className="text-xs text-text-muted font-medium">Topics</div>
            </div>
            <div className="bg-green-500/10 rounded-xl p-2 border border-green-500/20">
              <div className="text-lg font-bold text-green-400">{userProfile?.totalQuizzes || 0}</div>
              <div className="text-xs text-text-muted font-medium">Quizzes</div>
            </div>
            <div className="bg-purple-500/10 rounded-xl p-2 border border-purple-500/20">
              <div className="text-lg font-bold text-purple-400">{userProfile?.averageScore || 0}%</div>
              <div className="text-xs text-text-muted font-medium">Score</div>
            </div>
          </div>
        </div>

        {/* Recent Quizzes */}
        {user && recentQuizzes.length > 0 && (
          <div className="p-4 border-b border-border-glass">
            <h3 className="text-sm font-bold text-text-main mb-3 uppercase tracking-wider text-xs">Recent Quizzes</h3>
            <div className="space-y-2">
              {recentQuizzes.slice(0, 3).map((quiz: any, index: number) => (
                <div key={index} className="bg-white/5 rounded-xl p-3 border border-border-glass transition-colors hover:bg-white/10">
                  <div className="text-xs font-semibold text-text-main truncate">
                    {quiz.topic.length > 20 ? quiz.topic.substring(0, 20) + '...' : quiz.topic}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-text-muted">
                      {new Date(quiz.completedAt.seconds * 1000).toLocaleDateString()}
                    </div>
                    <div className={`text-xs font-bold px-2 py-0.5 rounded-md ${(quiz.score / quiz.totalQuestions * 100) >= 80 ? 'bg-green-500/20 text-green-400' :
                      (quiz.score / quiz.totalQuestions * 100) >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
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
        <nav className="flex-1 p-4 overflow-y-auto overflow-x-hidden">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${pathname === item.href
                    ? 'bg-btn-gradient text-white shadow-lg shadow-primary/25 font-semibold'
                    : 'text-text-muted hover:bg-white/5 hover:text-text-main font-medium'
                    }`}
                >
                  <span className={`text-xl ${pathname === item.href ? 'text-white' : 'text-primary'}`}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}