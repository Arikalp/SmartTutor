'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useLearning } from '@/components/LearningProvider';
import { saveStudySession } from '@/lib/firestore';
import Sidebar from '@/components/Sidebar';
import TopicInput from '@/components/TopicInput';
import DeepSectionCard from '@/components/DeepSectionCard';

export default function DeepLearnPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const { learningState, setCurrentTopic, setExplanation, setQuiz, setLoading } = useLearning();
  const { currentTopic, explanation, quiz, loading } = learningState;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const generate = async (topic: string) => {
    if (!topic.trim() || !user) return;
    setLoading(true);
    setExplanation('');
    setQuiz(null);
    setCurrentTopic(topic);

    try {
      const res = await fetch('/api/deep-generate', { 
        method: 'POST', 
        body: JSON.stringify({ topic }), 
        headers: { 'Content-Type': 'application/json' } 
      });
      
      if (!res.ok) throw new Error('Failed to generate content');
      
      const data = await res.json();
      setQuiz(data); // Store the entire sections data in quiz state

      // Save study session to Firebase
      const sessionData = {
        userId: user.uid,
        topic: topic,
        explanation: `Deep Learning: ${data.sections?.length || 0} sections`,
        createdAt: new Date(),
        completed: true
      };
      
      try {
        const sessionResult = await saveStudySession(sessionData);
        console.log('✅ Deep study session saved:', sessionResult.id);
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🧠 Deep Learn with AI
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Comprehensive learning with structured sections and detailed quizzes</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Topic Input */}
            <TopicInput onGenerate={generate} />

            {/* Loading State */}
            {loading && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Generating deep content for "{currentTopic}"...
                </h3>
                <p className="text-gray-600 dark:text-gray-300">Creating comprehensive sections and quizzes</p>
              </div>
            )}

            {/* Content */}
            {!loading && quiz?.sections && (
              <div className="space-y-8">
                {/* Topic Header */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    🎯 Deep Learning: <span className="text-indigo-600 dark:text-indigo-400">{currentTopic}</span>
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    {quiz.sections.length} comprehensive sections with individual quizzes
                  </p>
                </div>

                {/* Sections */}
                <div className="space-y-6">
                  {quiz.sections.map((section: any, index: number) => (
                    <div key={section.id} className="animate-fade-in">
                      <DeepSectionCard 
                        section={section} 
                        topic={currentTopic}
                        sectionIndex={index}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !quiz?.sections && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🧠</div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Ready for deep learning?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Enter a topic to get comprehensive sections with detailed explanations and targeted quizzes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}