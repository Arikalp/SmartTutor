import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, addDoc, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  createdAt: Date;
  totalTopics: number;
  totalQuizzes: number;
  averageScore: number;
}

export interface StudySession {
  id?: string;
  userId: string;
  topic: string;
  explanation: string;
  createdAt: Date;
  completed: boolean;
}

export interface QuizResult {
  id?: string;
  userId: string;
  topic: string;
  questions: any[];
  answers: Record<string, string>;
  score: number;
  totalQuestions: number;
  completedAt: Date;
  isSection?: boolean;
  sectionTitle?: string;
}

// User Profile Functions
export const createUserProfile = async (uid: string, name: string, email: string) => {
  console.log('👤 Creating user profile for:', { uid, name, email });
  const userRef = doc(db, 'users', uid);
  const userData = {
    uid,
    name,
    email,
    createdAt: Timestamp.fromDate(new Date()),
    totalTopics: 0,
    totalQuizzes: 0,
    averageScore: 0
  };
  await setDoc(userRef, userData);
  console.log('✅ User profile created successfully');
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() as UserProfile : null;
};

// Study Session Functions
export const saveStudySession = async (session: Omit<StudySession, 'id'>) => {
  console.log('📚 Saving study session to Firestore:', session);
  const sessionsRef = collection(db, 'studySessions');
  
  // Convert createdAt to Firestore Timestamp
  const sessionData = {
    ...session,
    createdAt: session.createdAt instanceof Date ? Timestamp.fromDate(session.createdAt) : session.createdAt
  };
  
  const result = await addDoc(sessionsRef, sessionData);
  console.log('✅ Study session saved with ID:', result.id);
  
  // Update user stats in background (non-blocking)
  updateUserStats(session.userId).catch(err => {
    console.error('❌ Failed to update user stats:', err);
  });
  
  return result;
};

export const getUserStudySessions = async (userId: string) => {
  const sessionsRef = collection(db, 'studySessions');
  const q = query(sessionsRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  const sessions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  // Sort in JavaScript instead of Firestore. createdAt may be a Firestore Timestamp or a JS Date.
  const getTime = (item: any) => {
    const t = item?.createdAt;
    if (!t) return 0;
    if (typeof t === 'object' && 'seconds' in t) return t.seconds * 1000;
    return new Date(t).getTime();
  };
  return sessions.sort((a, b) => getTime(b) - getTime(a));
};

// Quiz Result Functions
export const saveQuizResult = async (result: Omit<QuizResult, 'id'>) => {
  console.log('📝 Saving quiz result to Firestore:', result);
  const resultsRef = collection(db, 'quizResults');
  
  // Convert completedAt to Firestore Timestamp
  const quizData = {
    ...result,
    completedAt: result.completedAt instanceof Date ? Timestamp.fromDate(result.completedAt) : result.completedAt
  };
  
  const docRef = await addDoc(resultsRef, quizData);
  console.log('✅ Quiz result saved with ID:', docRef.id);
  
  // Update user stats in background (non-blocking)
  updateUserStats(result.userId).catch(err => {
    console.error('❌ Failed to update user stats:', err);
  });
  
  return docRef;
};

export const getUserQuizResults = async (userId: string) => {
  const resultsRef = collection(db, 'quizResults');
  const q = query(resultsRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  // Sort in JavaScript instead of Firestore. completedAt may be a Firestore Timestamp or a JS Date.
  const getCompleteTime = (item: any) => {
    const t = item?.completedAt;
    if (!t) return 0;
    if (typeof t === 'object' && 'seconds' in t) return t.seconds * 1000;
    return new Date(t).getTime();
  };
  return results.sort((a, b) => getCompleteTime(b) - getCompleteTime(a));
};

// Update User Statistics
export const updateUserStats = async (userId: string) => {
  try {
    console.log('📈 Fetching user data for stats update:', userId);
    const userRef = doc(db, 'users', userId);
    
    // Check if user document exists first
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      console.log('⚠️ User document does not exist, cannot update stats');
      // Don't try to update non-existent document
      return;
    }
    
    const [sessions, results] = await Promise.all([
      getUserStudySessions(userId),
      getUserQuizResults(userId)
    ]);
    
    const totalTopics = sessions.length;
    const totalQuizzes = results.length;
    const averageScore = totalQuizzes > 0 
      ? results.reduce((sum, result) => sum + (((result as any).score / (result as any).totalQuestions) * 100), 0) / totalQuizzes 
      : 0;
    
    const statsData = {
      totalTopics,
      totalQuizzes,
      averageScore: Math.round(averageScore)
    };
    
    console.log('📈 Updating user stats:', statsData);
    await updateDoc(userRef, statsData);
    console.log('✅ User stats updated in Firestore');
  } catch (error) {
    console.error('❌ Error updating user stats:', error);
    // Don't throw - stats update should not block the main operation
  }
};