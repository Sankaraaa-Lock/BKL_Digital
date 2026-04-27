import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useLocation,
  Link,
  useNavigate
} from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase/config';
import { handleFirestoreError, OperationType } from './firebase/errorHandler';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MessageSquare, 
  FileText, 
  LayoutDashboard, 
  LogOut, 
  LogIn, 
  Bell, 
  Menu, 
  X,
  CreditCard,
  Building2,
  ShieldCheck,
  ChevronRight,
  Zap
} from 'lucide-react';
import { cn } from './lib/utils';

// --- Lazy loaded Views ---
import Home from './views/Home';
import SearchAI from './views/SearchAI';
import ChatAI from './views/ChatAI';
import DocumentManagement from './views/DocumentManagement';
import Landing from './views/Landing';

const Navbar = ({ user, notificationCount }: { user: User | null, notificationCount: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Search', path: '/search', icon: Search },
    { name: 'AI Chat', path: '/chat', icon: MessageSquare },
    { name: 'Arsip', path: '/documents', icon: FileText },
  ];

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        alert("Popup login terblokir oleh browser. Silakan izinkan popup untuk situs ini dan coba lagi.");
      } else if (error.code !== 'auth/cancelled-popup-request') {
        console.error("Login failed", error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => signOut(auth);

  return (
    <nav className="fixed left-0 top-0 h-full w-20 md:w-64 bg-white/5 border-r border-white/5 backdrop-blur-3xl z-50 flex flex-col transition-all duration-500 overflow-hidden group/nav">
      <div className="flex-1 flex flex-col p-6 space-y-12">
        <div className="flex items-center space-x-4 mb-4">
          <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-emerald-400 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl shadow-blue-500/20">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight opacity-0 group-hover/nav:opacity-100 md:opacity-100 transition-opacity whitespace-nowrap">SintesaAI</span>
        </div>

        <div className="flex-1 space-y-2">
          {user && (
            <>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center space-x-5 p-4 rounded-2xl transition-all relative overflow-hidden group/item",
                      isActive 
                        ? "bg-white/10 text-blue-400 shadow-inner border border-white/5" 
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon className={cn("h-6 w-6 shrink-0 transition-transform group-hover/item:scale-110", isActive && "text-blue-500")} />
                    <span className="font-semibold opacity-0 group-hover/nav:opacity-100 md:opacity-100 transition-opacity whitespace-nowrap">{item.name}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="active-indicator"
                        className="absolute left-0 w-1 h-3/5 bg-blue-500 rounded-r-full"
                      />
                    )}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-5 p-4 rounded-2xl transition-all text-slate-400 hover:bg-red-500/10 hover:text-red-400 group/logout"
              >
                <LogOut className="h-6 w-6 shrink-0 transition-transform group-hover/logout:translate-x-1" />
                <span className="font-semibold opacity-0 group-hover/nav:opacity-100 md:opacity-100 transition-opacity whitespace-nowrap">Keluar Aplikasi</span>
              </button>
            </>
          )}
        </div>

        <div className="pt-8 border-t border-white/5 space-y-6">
          {notificationCount > 0 && user && (
            <div className="flex items-center space-x-5 p-4 rounded-2xl text-amber-500 bg-amber-500/5 border border-amber-500/10">
              <Bell className="h-6 w-6 shrink-0" />
              <span className="font-bold text-xs opacity-0 group-hover/nav:opacity-100 md:opacity-100 transition-opacity whitespace-nowrap">
                {notificationCount} NOTIFIKASI
              </span>
            </div>
          )}

          {user ? (
            <div className="flex items-center space-x-4 p-3 bg-white/5 rounded-2xl border border-white/5">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center font-bold shrink-0 text-white shadow-lg uppercase">
                {user.displayName?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0 opacity-0 group-hover/nav:opacity-100 md:opacity-100 transition-opacity">
                <p className="text-sm font-bold truncate text-white">{user.displayName}</p>
                <button 
                  onClick={handleLogout} 
                  className="text-[10px] uppercase tracking-widest font-bold text-slate-500 hover:text-red-400 transition-colors"
                >
                  Log Keluar
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center space-x-5 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-2xl shadow-blue-500/20 disabled:opacity-50"
            >
              <LogIn className="h-6 w-6 shrink-0" />
              <span className="font-bold opacity-0 group-hover/nav:opacity-100 md:opacity-100 transition-opacity whitespace-nowrap">Masuk</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

const ProtectedRoute = ({ user, children }: { user: User | null | undefined, children: React.ReactNode }) => {
  if (user === undefined) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setNotificationCount(0);
      return;
    }
    const q = query(
      collection(db, 'notifications'), 
      where('userId', '==', user.uid),
      where('read', '==', false)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotificationCount(snapshot.size);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'notifications');
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-blob"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[140px] animate-blob animation-delay-2000"></div>
          <div className="absolute top-[30%] right-[10%] w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
        </div>

        <Navbar user={user || null} notificationCount={notificationCount} />
        <main className="transition-all duration-500 pl-20 md:pl-64">
          <div className="max-w-6xl mx-auto py-8 md:py-12 px-4 md:px-8">
            <AnimatePresence mode="wait">
              <Routes>
              <Route path="/" element={<Landing user={user || null} />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute user={user}>
                    <Home />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/search" 
                element={
                  <ProtectedRoute user={user}>
                    <SearchAI />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute user={user}>
                    <ChatAI />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/documents" 
                element={
                  <ProtectedRoute user={user}>
                    <DocumentManagement />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </div>
      </main>
        
        <footer className="bg-black/40 border-t border-white/5 mt-20 py-12 relative z-10 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-emerald-400 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">KL</div>
                  <span className="text-xl font-bold text-white tracking-tight">PT. BPR Kreo Lestari</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Platform perbankan digital pintar yang mengintegrasikan kecerdasan buatan untuk pelayanan yang lebih responsif dan transparan.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-6 uppercase tracking-wider text-xs">Layanan Digital</h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li className="hover:text-blue-400 transition-colors cursor-pointer">AI Document Search</li>
                  <li className="hover:text-blue-400 transition-colors cursor-pointer">Interactive Assistant</li>
                  <li className="hover:text-blue-400 transition-colors cursor-pointer">Secure Data Portal</li>
                  <li className="hover:text-blue-400 transition-colors cursor-pointer">Smart Notifications</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-6 uppercase tracking-wider text-xs">Informasi Kontak</h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-blue-400" />
                    <span>Jl. Raya Kreo No. 123, Tangerang</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-emerald-400" />
                    <span>info@kreolestari.co.id</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-white/5 text-center text-[10px] text-slate-500 uppercase tracking-[0.2em]">
              © Copyright 2026 PT. BPR Kreo Lestari • Encrypted Data Protection
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
