'use client';
import { useState } from 'react';
import { useLearning } from './LearningProvider';

export default function TopicInput({ onGenerate }: { onGenerate: (topic: string) => void }) {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { clearLearningData } = useLearning();

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    await onGenerate(topic);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleGenerate();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          What would you like to learn today?
        </label>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g., Binary Trees, Photosynthesis, Machine Learning..."
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors text-lg"
          disabled={isLoading}
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleGenerate}
          disabled={!topic.trim() || isLoading}
          className="flex-1 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              Generating...
            </>
          ) : (
            <>
              🚀 Generate Content
            </>
          )}
        </button>
        <button
          onClick={() => {
            setTopic('');
            clearLearningData();
          }}
          className="px-6 py-3 rounded-lg border-2 border-gray-300 hover:border-gray-400 text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:border-gray-500 font-semibold transition-colors"
          disabled={isLoading}
        >
          New Topic
        </button>
      </div>
    </div>
  );
}