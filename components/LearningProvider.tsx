'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

interface LearningState {
  currentTopic: string;
  explanation: string;
  quiz: any;
  loading: boolean;
}

interface LearningContextType {
  learningState: LearningState;
  setCurrentTopic: (topic: string) => void;
  setExplanation: (explanation: string) => void;
  setQuiz: (quiz: any) => void;
  setLoading: (loading: boolean) => void;
  clearLearningData: () => void;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export function LearningProvider({ children }: { children: ReactNode }) {
  const [learningState, setLearningState] = useState<LearningState>({
    currentTopic: '',
    explanation: '',
    quiz: null,
    loading: false,
  });

  const setCurrentTopic = (topic: string) => {
    setLearningState(prev => ({ ...prev, currentTopic: topic }));
  };

  const setExplanation = (explanation: string) => {
    setLearningState(prev => ({ ...prev, explanation }));
  };

  const setQuiz = (quiz: any) => {
    setLearningState(prev => ({ ...prev, quiz }));
  };

  const setLoading = (loading: boolean) => {
    setLearningState(prev => ({ ...prev, loading }));
  };

  const clearLearningData = () => {
    setLearningState({
      currentTopic: '',
      explanation: '',
      quiz: null,
      loading: false,
    });
  };

  return (
    <LearningContext.Provider value={{
      learningState,
      setCurrentTopic,
      setExplanation,
      setQuiz,
      setLoading,
      clearLearningData,
    }}>
      {children}
    </LearningContext.Provider>
  );
}

export function useLearning() {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within LearningProvider');
  }
  return context;
}