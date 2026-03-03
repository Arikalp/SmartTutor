'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useLearning } from '@/components/LearningProvider';
import { saveStudySession } from '@/lib/firestore';
import Sidebar from '@/components/Sidebar';
import TopicInput from '@/components/TopicInput';
import DeepSectionCard from '@/components/DeepSectionCard';
import { FaBrain } from 'react-icons/fa';

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
      <div className="min-h-screen bg-bg-main flex items-center justify-center animate-fade-in-up">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full glow"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-bg-main overflow-x-hidden relative animate-fade-in-up">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 lg:p-8 pt-16 md:pt-8 w-full max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-main mb-2 flex gap-3 items-center tracking-tight">
              <span className="text-accent text-4xl"><FaBrain /></span> Deep Learn with AI
            </h1>
            <p className="text-text-muted font-medium ml-12">Comprehensive learning with structured sections and detailed quizzes</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Topic Input */}
            <TopicInput onGenerate={generate} />

            {/* Loading State */}
            {loading && (
              <div className="glass-panel p-10 text-center animate-fade-in-up">
                <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full mx-auto mb-6 glow"></div>
                <h3 className="text-xl font-bold text-text-main mb-2">
                  Generating deep content for "{currentTopic}"...
                </h3>
                <p className="text-text-muted">Creating comprehensive sections and quizzes...</p>
              </div>
            )}

            {/* Content */}
            {!loading && quiz?.sections && (
              <div className="space-y-8">
                {/* Topic Header */}
                <div className="glass-panel p-6 border-l-4 border-l-accent flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-text-main flex items-center gap-3">
                      <span className="text-3xl">🎯</span> Deep Learning: <span className="text-accent">{currentTopic}</span>
                    </h2>
                    <p className="text-text-muted mt-2 font-medium">
                      {quiz.sections.length} comprehensive sections with individual quizzes
                    </p>
                  </div>
                </div>

                {/* Sections */}
                <div className="space-y-6">
                  {quiz.sections.map((section: any, index: number) => (
                    <div key={section.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
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
              <div className="glass-panel p-16 text-center">
                <div className="text-6xl mb-6 animate-pulse" style={{ animationDuration: '3s' }}>🧠</div>
                <h3 className="text-2xl font-bold text-text-main mb-3">
                  Ready for deep learning?
                </h3>
                <p className="text-text-muted max-w-md mx-auto line-height-relaxed">
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