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
    <div className="glass-panel overflow-hidden border border-border-glass transition-all duration-300">
      {/* Section Header */}
      <div
        className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="bg-primary/20 text-primary border border-primary/30 text-sm font-bold px-3 py-1 rounded-lg shadow-sm">
              Section {sectionIndex + 1}
            </span>
            <h3 className="text-xl font-bold text-text-main">{section.title}</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowQuiz(!showQuiz);
              }}
              className="px-4 py-1.5 text-sm bg-green-500/20 text-green-400 border border-green-500/30 font-semibold rounded-lg hover:bg-green-500/30 transition-all duration-300 shadow-sm"
            >
              📝 View Quiz
            </button>
            <span className={`text-2xl text-text-muted transition-transform duration-300 ${isExpanded ? 'rotate-180 text-primary' : ''}`}>
              ⌄
            </span>
          </div>
        </div>
      </div>

      {/* Section Content */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6 border-t border-border-glass">
            <div className="pt-6 prose prose-invert max-w-none text-text-muted leading-relaxed">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-2xl font-bold text-text-main mb-5 tracking-tight">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-bold text-text-main mb-4 tracking-tight">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-bold text-text-main mb-3 tracking-tight">{children}</h3>,
                  p: ({ children }) => <p className="mb-4 text-text-muted text-base">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-4 text-text-muted marker:text-primary">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-4 text-text-muted marker:text-primary">{children}</ol>,
                  li: ({ children }) => <li className="mb-2 pl-2">{children}</li>,
                  strong: ({ children }) => <strong className="font-bold text-text-main">{children}</strong>,
                  code: ({ children }) => <code className="bg-white/10 px-1.5 py-0.5 rounded-md text-sm text-primary border border-white/5">{children}</code>
                }}
              >
                {section.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* Section Quiz */}
      {showQuiz && (
        <div className="px-6 pb-6 border-t border-border-glass bg-bg-secondary/50">
          <div className="pt-6 animate-fade-in-up">
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