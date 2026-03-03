'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useLearning } from '@/components/LearningProvider';
import { saveStudySession } from '@/lib/firestore';
import Sidebar from '@/components/Sidebar';
import TopicInput from '@/components/TopicInput';
import ExplanationCard from '@/components/ExplanationCard';
import QuizCard from '@/components/QuizCard';
import { FaBookOpen, FaLightbulb } from 'react-icons/fa';

export default function LearnPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const { learningState, setCurrentTopic, setExplanation, setQuiz, setLoading } = useLearning();
  const { currentTopic, explanation, quiz, loading } = learningState;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full glow"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const generate = async (topic: string) => {
    if (!topic.trim() || !user) return;
    setLoading(true);
    setExplanation('');
    setQuiz(null);
    setCurrentTopic(topic);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ topic }),
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('API Error:', data);
        throw new Error(data.error || 'Failed to generate content');
      }
      setExplanation(data.explanation ?? '');
      setQuiz(data.quiz ?? null);

      // Save study session to Firebase
      const sessionData = {
        userId: user.uid,
        topic: topic,
        explanation: data.explanation ?? '',
        createdAt: new Date(),
        completed: true
      };

      console.log('📚 Saving study session to Firebase:', sessionData);

      try {
        const sessionResult = await saveStudySession(sessionData);
        console.log('✅ Study session saved successfully:', sessionResult.id);
        // Refresh user profile to update stats
        await refreshProfile();
      } catch (sessionError) {
        console.error('❌ Failed to save study session:', sessionError);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="flex min-h-screen bg-transparent overflow-x-hidden relative animate-fade-in-up">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 lg:p-8 pt-16 md:pt-8 w-full max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-main mb-2 flex gap-3 items-center tracking-tight">
              <span className="text-primary text-4xl"><FaLightbulb /></span> Learn with AI
            </h1>
            <p className="text-text-muted font-medium ml-12">Get personalized explanations and practice with quizzes</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Topic Input */}
            <TopicInput onGenerate={generate} />

            {/* Loading State */}
            {loading && (
              <div className="glass-panel p-10 text-center animate-fade-in-up">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6 glow"></div>
                <h3 className="text-xl font-bold text-text-main mb-2">
                  Generating content for "{currentTopic}"...
                </h3>
                <p className="text-text-muted">This may take a few moments...</p>
              </div>
            )}

            {/* Content */}
            {!loading && (explanation || quiz) && (
              <div className="space-y-8">
                {/* Topic Header */}
                <div className="glass-panel p-6 border-l-4 border-l-primary flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-text-main flex items-center gap-3">
                    <span className="text-3xl">🎯</span> Learning: <span className="text-primary">{currentTopic}</span>
                  </h2>
                </div>

                {/* Explanation */}
                {explanation && (
                  <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <ExplanationCard text={explanation} />
                  </div>
                )}

                {/* Quiz */}
                {quiz && (
                  <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <QuizCard quiz={quiz} topic={currentTopic} />
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!loading && !explanation && !quiz && (
              <div className="glass-panel p-16 text-center">
                <div className="text-6xl mb-6 animate-bounce" style={{ animationDuration: '3s' }}>🚀</div>
                <h3 className="text-2xl font-bold text-text-main mb-3">
                  Ready to learn something new?
                </h3>
                <p className="text-text-muted max-w-md mx-auto line-height-relaxed">
                  Enter a topic above to get started with personalized explanations and quizzes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}