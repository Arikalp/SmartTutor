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
    if (q.type === 'mcq') return acc + (a.trim().toLowerCase() === q.answer.trim().toLowerCase() ? 1 : 0);
    if (q.type === 'short') return acc + (q.answer.toLowerCase().includes(a.trim().toLowerCase()) ? 1 : 0);
    return acc;
  }, 0);

  const getScoreColor = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreEmoji = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return '🎉';
    if (percentage >= 60) return '😊';
    return '😔';
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500 border border-gray-300 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">📝</span>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Interactive Quiz</h3>
        <span className="ml-auto text-sm text-gray-500 dark:text-gray-300">
          {Object.keys(answers).length} / {questions.length} answered
        </span>
      </div>

      <div className="space-y-6">
        {questions.map((q: any, index: number) => (
          <div key={q.id} className="bg-white dark:bg-gray-700 rounded-lg p-5 border border-gray-300 dark:border-gray-600">
            <div className="flex items-start gap-3 mb-4">
              <span className="bg-indigo-100 text-indigo-800 text-sm font-semibold px-2 py-1 rounded-full">
                Q{index + 1}
              </span>
              <div className="font-medium text-gray-800 dark:text-gray-200 flex-1">{q.question}</div>
            </div>
            
            {q.type === 'mcq' && (
              <div className="space-y-2 ml-8">
                {q.options?.map((opt: string, optIndex: number) => (
                  <label key={opt} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-all duration-200 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-400 hover:shadow-sm transform hover:scale-[1.02]">
                    <input 
                      type="radio" 
                      name={q.id} 
                      onChange={() => handleSelect(q.id, opt)}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-gray-700 dark:text-gray-200">{opt}</span>
                  </label>
                ))}
              </div>
            )}
            
            {q.type === 'short' && (
              <div className="ml-8">
                <input 
                  className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg focus:border-indigo-500 focus:outline-none transition-colors" 
                  placeholder="Type your answer here..."
                  onChange={(e) => handleSelect(q.id, e.target.value)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
            <span>⚠️</span>
            {error}
          </p>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button 
          onClick={handleSubmit} 
          disabled={Object.keys(answers).length === 0}
          className="flex-1 px-6 py-3 rounded-lg bg-green-700 hover:bg-green-800 disabled:bg-blue-300 disabled:hover:bg-blue-300 text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg transform hover:scale-105"
        >
          🎯 Submit Quiz
        </button>
        <button 
          onClick={() => { 
            setAnswers({}); 
            setShowResult(false); 
            setError(null);
          }} 
          className="px-6 py-3 rounded-lg border-2 border-gray-300 hover:border-gray-400 text-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:border-gray-500 font-semibold transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md transform hover:scale-105"
        >
          Reset
        </button>
      </div>

      {showResult && (
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <div className="text-center mb-4">
            <div className="text-3xl mb-2">{getScoreEmoji()}</div>
            <div className={`text-2xl font-bold ${getScoreColor()}`}>
              Score: {score} / {questions.length}
            </div>
            <div className="text-gray-600">
              {Math.round((score / questions.length) * 100)}% Correct
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800 mb-3">Answer Review:</h4>
            {questions.map((q: any, index: number) => {
              const userAnswer = answers[q.id];
              const isCorrect = q.type === 'mcq' 
                ? userAnswer?.trim().toLowerCase() === q.answer.trim().toLowerCase()
                : q.answer.toLowerCase().includes(userAnswer?.trim().toLowerCase() || '');
              
              return (
                <div key={q.id} className="bg-white rounded-lg p-4 border">
                  <div className="flex items-start gap-2">
                    <span className={`text-lg ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                      {isCorrect ? '✓' : '✗'}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">Q{index + 1}: {q.question}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Correct answer:</span> {q.answer}
                      </div>
                      {userAnswer && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Your answer:</span> {userAnswer}
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