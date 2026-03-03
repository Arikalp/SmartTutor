'use client';
import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { saveQuizResult, getUserProfile, createUserProfile } from '@/lib/firestore';

export default function QuizCard({ quiz, topic }: { quiz: any; topic?: string }) {
  const { user, refreshProfile } = useAuth();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [error, setError] = useState<string | null>(null);

  if (!quiz) return null;
  const questions = quiz.questions ?? [];
  if (questions.length === 0) return null;

  const normalizeAnswer = (value: unknown): string => {
    if (typeof value === 'string') return value.trim().toLowerCase();
    if (Array.isArray(value)) return value.map((item) => String(item)).join(' ').trim().toLowerCase();
    if (value == null) return '';
    return String(value).trim().toLowerCase();
  };

  const isAnswerCorrect = (q: any, userAnswerRaw: unknown) => {
    const userAnswer = normalizeAnswer(userAnswerRaw);
    const correctAnswer = normalizeAnswer(q?.answer);

    if (!userAnswer || !correctAnswer) return false;
    if (q?.type === 'mcq') return userAnswer === correctAnswer;
    if (q?.type === 'short') return correctAnswer.includes(userAnswer);
    return false;
  };

  const handleSelect = (id: string, val: string) => {
    try {
      setAnswers((s) => ({ ...s, [id]: val }));
    } catch (err) {
      console.error('Error selecting answer:', err);
      setError('Failed to select answer');
    }
  };

  const handleSubmit = async () => {
    try {
      if (!user || !topic) {
        console.log('❌ Quiz submit failed: Missing user or topic');
        setError('Cannot submit quiz. Please try again.');
        return;
      }

      setShowResult(true);
      setError(null);

      // Ensure user profile exists before saving quiz
      console.log('🔍 Checking if user profile exists...');
      let userProfile = await getUserProfile(user.uid);
      if (!userProfile && user.email) {
        console.log('⚠️ User profile not found, creating one...');
        const displayName = user.displayName || user.email.split('@')[0];
        await createUserProfile(user.uid, displayName, user.email);
        console.log('✅ User profile created');
      }

      // Save quiz result to Firebase
      const quizData = {
        userId: user.uid,
        topic: topic,
        questions: questions,
        answers: answers,
        score: score,
        totalQuestions: questions.length,
        completedAt: new Date()
      };

      console.log('📝 Saving quiz result to Firebase:', quizData);

      const result = await saveQuizResult(quizData);
      console.log('✅ Quiz result saved successfully:', result.id);

      // Refresh user profile to update stats
      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (error) {
      console.error('❌ Failed to save quiz result:', error);
      setError('Failed to save quiz results. Your answers are still shown below.');
      // Don't throw error to user - just log it and show error message
    }
  };

  const score = questions.reduce((acc: number, q: any) => {
    const a = answers[q.id];
    if (!a) return acc;
    return acc + (isAnswerCorrect(q, a) ? 1 : 0);
  }, 0);

  const getScoreColor = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreEmoji = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return '🎉';
    if (percentage >= 60) return '😊';
    return '😔';
  };

  return (
    <div className="glass-panel p-6 border-l-4 border-l-accent animate-fade-in-up">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl bg-white/5 p-2 rounded-xl border border-white/5">📝</span>
        <h3 className="text-2xl font-bold text-text-main tracking-tight">Interactive Quiz</h3>
        <span className="ml-auto text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
          {Object.keys(answers).length} / {questions.length} answered
        </span>
      </div>

      <div className="space-y-6">
        {questions.map((q: any, index: number) => (
          <div key={q.id} className="bg-white/5 rounded-xl p-6 border border-border-glass transition-all hover:bg-white/10">
            <div className="flex items-start gap-4 mb-5">
              <span className="bg-accent/20 text-accent border border-accent/30 text-sm font-bold px-3 py-1 rounded-lg shadow-sm">
                Q{index + 1}
              </span>
              <div className="font-semibold text-text-main text-lg leading-snug flex-1">{q.question}</div>
            </div>

            {q.type === 'mcq' && (
              <div className="space-y-3 ml-12">
                {q.options?.map((opt: string, optIndex: number) => (
                  <label key={opt} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/10 cursor-pointer transition-all duration-300 border border-transparent hover:border-white/10 hover:shadow-md hover:-translate-y-0.5 group">
                    <input
                      type="radio"
                      name={q.id}
                      onChange={() => handleSelect(q.id, opt)}
                      className="w-5 h-5 text-primary bg-bg-main border-border-glass focus:ring-primary focus:ring-offset-bg-main transition-colors"
                    />
                    <span className="text-text-muted font-medium group-hover:text-text-main transition-colors">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === 'short' && (
              <div className="ml-12 mt-4">
                <input
                  className="w-full p-4 bg-bg-secondary border border-border-glass text-text-main rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none shadow-inner"
                  placeholder="Type your answer here..."
                  onChange={(e) => handleSelect(q.id, e.target.value)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-sm font-medium text-red-400 flex items-center gap-2">
            <span>⚠️</span>
            {error}
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length === 0}
          className="flex-1 btn-gradient disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
        >
          <span className="text-xl">🎯</span> Submit Quiz
        </button>
        <button
          onClick={() => {
            setAnswers({});
            setShowResult(false);
            setError(null);
          }}
          className="sm:w-auto w-full btn-secondary"
        >
          Reset
        </button>
      </div>

      {showResult && (
        <div className="mt-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-8 border border-primary/20 animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4 animate-bounce">{getScoreEmoji()}</div>
            <div className={`text-4xl font-bold tracking-tight mb-2 ${getScoreColor()}`}>
              Score: {score} / {questions.length}
            </div>
            <div className="text-text-muted font-semibold text-lg">
              {Math.round((score / questions.length) * 100)}% Correct
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-text-main text-xl mb-4 flex items-center gap-2">
              <span>📊</span> Answer Review
            </h4>
            {questions.map((q: any, index: number) => {
              const userAnswer = answers[q.id];
              const isCorrect = isAnswerCorrect(q, userAnswer);

              return (
                <div key={q.id} className="bg-bg-secondary rounded-xl p-6 border border-border-glass transition-colors hover:bg-white/5">
                  <div className="flex items-start gap-4">
                    <span className={`text-2xl bg-white/5 p-2 rounded-lg border border-white/5 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                      {isCorrect ? '✓' : '✗'}
                    </span>
                    <div className="flex-1 space-y-2">
                      <div className="text-base font-semibold text-text-main"><span className="text-text-muted mr-2">Q{index + 1}:</span>{q.question}</div>
                      <div className="text-sm text-text-muted bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-lg inline-block font-medium">
                        <span className="text-green-400 mr-2">Correct answer:</span>{q.answer}
                      </div>
                      {userAnswer && (
                        <div className={`text-sm bg-white/5 border border-white/10 px-3 py-2 rounded-lg inline-block font-medium mt-2 flex items-center ${!isCorrect ? 'text-red-300' : 'text-text-muted'}`}>
                          <span className={`${!isCorrect ? 'text-red-400' : 'text-text-muted'} mr-2`}>Your answer:</span>{userAnswer}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
