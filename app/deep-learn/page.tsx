'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopicInput from '@/components/TopicInput';
import ExplanationCard from '@/components/ExplanationCard';
import QuizCard from '@/components/QuizCard';

export default function LearnPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [quiz, setQuiz] = useState<any>(null);
  const [currentTopic, setCurrentTopic] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const generate = async (topic: string) => {
    if (!topic.trim()) return;
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
    } catch (e) {
      console.error(e);
      alert('Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📚 Learn with AI
            </h1>
            <p className="text-gray-600">Get personalized explanations and practice with quizzes</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Topic Input */}
            <TopicInput onGenerate={generate} />

            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
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
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
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
                    <QuizCard quiz={quiz} />
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!loading && !explanation && !quiz && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
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