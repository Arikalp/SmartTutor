'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Sidebar from '@/components/Sidebar';

export default function QuizPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center animate-fade-in-up">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full glow"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-transparent animate-fade-in-up">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8 w-full max-w-5xl mx-auto pt-16 lg:pt-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-main mb-2 tracking-tight">
              <span className="text-primary text-4xl mr-3">📝</span>Quick Quiz
            </h1>
            <p className="text-text-muted font-medium ml-12">Test your knowledge with instant quizzes</p>
          </div>

          <div className="glass-panel p-16 text-center">
            <div className="text-6xl mb-6 animate-pulse" style={{ animationDuration: '3s' }}>🚧</div>
            <h3 className="text-2xl font-bold text-text-main mb-3">
              Quiz Feature Coming Soon!
            </h3>
            <p className="text-text-muted mb-8 max-w-md mx-auto line-height-relaxed">
              We're working on standalone quiz functionality. For now, you can take quizzes after learning topics.
            </p>
            <button
              onClick={() => router.push('/learn')}
              className="btn-gradient inline-flex"
            >
              Go to Learn Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}