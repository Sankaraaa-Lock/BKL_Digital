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
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Search', path: '/search', icon: Search },
    { name: 'AI Chat', path: '/chat', icon: MessageSquare },
    { name: 'Documents', path: '/documents', icon: FileText },
  ];

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/5 border-b border-white/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-emerald-400 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">KL</div>
              <span className="text-xl font-bold text-white tracking-tight">Kreo Lestari <span className="text-blue-400">AI</span></span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {user && navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-1 text-sm font-medium transition-all hover:text-white",
                  location.pathname === item.path ? "text-white border-b-2 border-blue-500 pb-1" : "text-slate-400"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <button className="p-2 text-slate-400 hover:text-white relative transition-colors">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold animate-pulse">
                      {notificationCount}
                    </span>
                  )}
                </button>
                <div className="flex items-center space-x-3 pl-4 border-l border-white/10">
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/10">
                    <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-white hidden lg:block">{user.displayName?.split(' ')[0]}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    title="Keluar"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-sm font-bold hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95"
              >
                <LogIn className="h-4 w-4" />
                <span>Masuk</span>
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/10 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-slate-900/95 border-b border-white/10 backdrop-blur-xl"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {user && navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors",
                    location.pathname === item.path ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
              {!user ? (
                <button 
                  onClick={handleLogin}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-blue-400 hover:bg-white/5"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Masuk</span>
                </button>
              ) : (
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-white/5"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Keluar</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
        <main className="pt-20 pb-12 relative z-10">
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
              © 2026 PT. BPR Kreo Lestari • Powered by Gemini AI • Encrypted Data Protection
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
