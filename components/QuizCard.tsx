'use client';
import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { saveQuizResult } from '@/lib/firestore';

export default function QuizCard({ quiz, topic }: { quiz: any; topic?: string }) {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  if (!quiz) return null;
  const questions = quiz.questions ?? [];
  if (questions.length === 0) return null;

  const handleSelect = (id: string, val: string) =>
    setAnswers((s) => ({ ...s, [id]: val }));

  const handleSubmit = async () => {
    if (!user || !topic) {
      console.log('❌ Quiz submit failed: Missing user or topic');
      return;
    }
    
    setShowResult(true);
    
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
    
    try {
      const result = await saveQuizResult(quizData);
      console.log('✅ Quiz result saved successfully:', result.id);
    } catch (error) {
      console.error('❌ Failed to save quiz result:', error);
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
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">📝</span>
        <h3 className="text-xl font-bold text-gray-800">Interactive Quiz</h3>
        <span className="ml-auto text-sm text-gray-500">
          {Object.keys(answers).length} / {questions.length} answered
        </span>
      </div>

      <div className="space-y-6">
        {questions.map((q: any, index: number) => (
          <div key={q.id} className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <div className="flex items-start gap-3 mb-4">
              <span className="bg-indigo-100 text-indigo-800 text-sm font-semibold px-2 py-1 rounded-full">
                Q{index + 1}
              </span>
              <div className="font-medium text-gray-800 flex-1">{q.question}</div>
            </div>
            
            {q.type === 'mcq' && (
              <div className="space-y-2 ml-8">
                {q.options?.map((opt: string, optIndex: number) => (
                  <label key={opt} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white cursor-pointer transition-colors border border-transparent hover:border-indigo-200">
                    <input 
                      type="radio" 
                      name={q.id} 
                      onChange={() => handleSelect(q.id, opt)}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            )}
            
            {q.type === 'short' && (
              <div className="ml-8">
                <input 
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors" 
                  placeholder="Type your answer here..."
                  onChange={(e) => handleSelect(q.id, e.target.value)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-6">
        <button 
          onClick={handleSubmit} 
          disabled={Object.keys(answers).length === 0}
          className="flex-1 px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold transition-colors flex items-center justify-center gap-2"
        >
          🎯 Submit Quiz
        </button>
        <button 
          onClick={() => { setAnswers({}); setShowResult(false); }} 
          className="px-6 py-3 rounded-lg border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold transition-colors"
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