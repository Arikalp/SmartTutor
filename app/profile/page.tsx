'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Sidebar from '@/components/Sidebar';

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();
  const { user, userProfile, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (userProfile) {
      setFormData({ name: userProfile.name, email: userProfile.email });
    }
  }, [userProfile]);

  const handleSave = () => {
    console.log('Profile update:', formData);
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center animate-fade-in-up">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full glow"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-bg-main overflow-x-hidden relative animate-fade-in-up">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 lg:p-8 pt-16 md:pt-8 w-full max-w-5xl mx-auto">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-text-main mb-2 tracking-tight">Profile Settings</h1>
              <p className="text-text-muted font-medium">Manage your account information and preferences</p>
            </div>

            {/* Profile Card */}
            <div className="glass-panel p-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border-glass">
                <div className="w-20 h-20 rounded-full bg-btn-gradient flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary/20">
                  {(userProfile?.name || user?.email || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-main mb-1">{userProfile?.name || 'User'}</h2>
                  <p className="text-text-muted font-medium">{user?.email}</p>
                  <p className="text-sm text-primary font-semibold mt-2 bg-primary/10 inline-block px-3 py-1 rounded-lg border border-primary/20">
                    Member since {userProfile?.createdAt ? (
                      // createdAt may be a Firestore Timestamp or a JS Date; handle both
                      (userProfile.createdAt as any)?.seconds ?
                        new Date((userProfile.createdAt as any).seconds * 1000).toLocaleDateString() :
                        new Date(userProfile.createdAt).toLocaleDateString()
                    ) : 'Recently'}
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-text-muted mb-2">Full Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-bg-secondary border border-border-glass text-text-main rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-white/5 border border-border-glass rounded-xl text-text-main font-medium">{userProfile?.name || 'User'}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-muted mb-2">Email Address</label>
                  {editing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-bg-secondary border border-border-glass text-text-main rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-white/5 border border-border-glass rounded-xl text-text-main font-medium">{user?.email}</div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  {editing ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="btn-gradient px-6 py-2.5"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="btn-secondary px-6 py-2.5"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditing(true)}
                      className="btn-gradient px-6 py-2.5"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="glass-panel p-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <h3 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                <span>📊</span> Learning Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{userProfile?.totalTopics || 0}</div>
                  <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">Topics Learned</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-400 mb-1">{userProfile?.totalQuizzes || 0}</div>
                  <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">Quizzes Taken</div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-1">{userProfile?.averageScore || 0}%</div>
                  <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">Average Score</div>
                </div>
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-accent mb-1">-</div>
                  <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">Day Streak</div>
                </div>
              </div>
            </div>

            {/* Logout */}
            <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all duration-300 font-semibold"
              >
                <span className="text-xl">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="glass-panel p-8 max-w-sm w-full text-center relative z-10 animate-fade-in-up !hover:translate-y-0">
            <div className="text-5xl mb-4">👋</div>
            <h3 className="text-xl font-bold text-text-main mb-2">Confirm Logout</h3>
            <p className="text-text-muted mb-6">Are you sure you want to log out of your account?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={async () => { await logout(); router.push('/login'); }}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-xl font-semibold transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}