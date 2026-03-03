'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center animate-fade-in-up">
      <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full glow"></div>
    </div>
  );
}