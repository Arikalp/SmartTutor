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
    <div className="glass-panel p-6 space-y-5">
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-text-muted">
          What would you like to learn today?
        </label>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g., Binary Trees, Photosynthesis, Machine Learning..."
          className="w-full p-4 bg-bg-secondary border border-border-glass text-text-main rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-lg shadow-inner"
          disabled={isLoading}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleGenerate}
          disabled={!topic.trim() || isLoading}
          className="flex-1 btn-gradient disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
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
          className="sm:w-auto w-full btn-secondary"
          disabled={isLoading}
        >
          New Topic
        </button>
      </div>
    </div>
  );
}