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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
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
      
      if (!res.ok) throw new Error('Failed to generate content');
      
      const data = await res.json();
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
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              📚 Learn with AI
            </h1>
            <p className="text-gray-600">Get personalized explanations and practice with quizzes</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Topic Input */}
            <TopicInput onGenerate={generate} />

            {/* Loading State */}
            {loading && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Generating content for "{currentTopic}"...
                </h3>
                <p className="text-gray-600">This may take a few moments</p>
              </div>
            )}

            {/* Content */}
            {!loading && (explanation || quiz) && (
              <div className="space-y-8">
                {/* Topic Header */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    🎯 Learning: <span className="text-indigo-600">{currentTopic}</span>
                  </h2>
                </div>

                {/* Explanation */}
                {explanation && (
                  <div className="animate-fade-in">
                    <ExplanationCard text={explanation} />
                  </div>
                )}

                {/* Quiz */}
                {quiz && (
                  <div className="animate-fade-in">
                    <QuizCard quiz={quiz} topic={currentTopic} />
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!loading && !explanation && !quiz && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Ready to learn something new?
                </h3>
                <p className="text-gray-600">
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