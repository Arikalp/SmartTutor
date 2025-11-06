'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import QuizCard from './QuizCard';

interface DeepSectionProps {
  section: {
    id: string;
    title: string;
    content: string;
    quiz: any;
  };
  topic: string;
  sectionIndex: number;
}

export default function DeepSectionCard({ section, topic, sectionIndex }: DeepSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg border border-gray-300 dark:border-gray-700">
      {/* Section Header */}
      <div 
        className="p-6 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-t-xl"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-sm font-semibold px-3 py-1 rounded-full">
              Section {sectionIndex + 1}
            </span>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{section.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowQuiz(!showQuiz);
              }}
              className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
            >
              📝 Quiz
            </button>
            <span className={`text-2xl transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              ⌄
            </span>
          </div>
        </div>
      </div>

      {/* Section Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-600">
          <div className="pt-4 prose prose-gray dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
            <ReactMarkdown 
              components={{
                h1: ({children}) => <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{children}</h1>,
                h2: ({children}) => <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{children}</h2>,
                h3: ({children}) => <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{children}</h3>,
                p: ({children}) => <p className="mb-3 text-gray-700 dark:text-gray-300">{children}</p>,
                ul: ({children}) => <ul className="list-disc list-inside mb-3 text-gray-700 dark:text-gray-300">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal list-inside mb-3 text-gray-700 dark:text-gray-300">{children}</ol>,
                li: ({children}) => <li className="mb-1">{children}</li>,
                strong: ({children}) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                code: ({children}) => <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">{children}</code>
              }}
            >
              {section.content}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Section Quiz */}
      {showQuiz && (
        <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-600">
          <div className="pt-4">
            <QuizCard 
              quiz={section.quiz} 
              topic={`${topic} - ${section.title}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}