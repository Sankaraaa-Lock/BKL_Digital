import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  FileCheck, 
  TrendingUp, 
  MessageCircle,
  ArrowRight,
  Clock,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { cn } from '../lib/utils';

const Home = () => {
  const [stats, setStats] = useState({
    totalDocs: 0,
    totalChats: 0,
    recentActivity: [] as any[]
  });

  useEffect(() => {
    const qDocs = query(collection(db, 'documents'), limit(1));
    const qChats = query(collection(db, 'chats'), limit(1));
    const qRecent = query(collection(db, 'documents'), orderBy('createdAt', 'desc'), limit(5));

    const unsubDocs = onSnapshot(collection(db, 'documents'), (snapshot) => {
      setStats(prev => ({ ...prev, totalDocs: snapshot.size }));
    });
    
    // In a real app we'd fetch specific user's chat count
    const unsubRecent = onSnapshot(qRecent, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'upload'
      }));
      setStats(prev => ({ ...prev, recentActivity: activities }));
    });

    return () => {
      unsubDocs();
      unsubRecent();
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-400 mt-2 font-light">Pantau dokumen dan interaksi AI Anda secara real-time.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          title="Dokumen Terunggah" 
          value={stats.totalDocs.toString()} 
          icon={FileCheck} 
          trend="+5 minggu ini"
          color="blue"
        />
        <StatCard 
          title="Percakapan AI" 
          value="12" 
          icon={MessageCircle} 
          trend="Aktif"
          color="indigo"
        />
        <StatCard 
          title="Akurasi Search" 
          value="98%" 
          icon={TrendingUp} 
          trend="Stabil"
          color="emerald"
        />
        <StatCard 
          title="Pengguna Aktif" 
          value="8" 
          icon={Users} 
          trend="Online"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-10">
            <h3 className="text-2xl font-bold mb-8 flex items-center space-x-3 text-white">
              <Clock className="h-6 w-6 text-blue-400" />
              <span>Aktivitas Terbaru</span>
            </h3>
            <div className="space-y-4">
              {stats.recentActivity.length === 0 ? (
                <p className="text-slate-500 text-center py-12 italic font-light">Belum ada aktivitas dokumen.</p>
              ) : stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer group">
                  <div className="flex items-center space-x-5">
                    <div className="h-12 w-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                      <FileCheck className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">{activity.title}</p>
                      <p className="text-xs text-slate-500 font-medium">Diunggah oleh: {activity.uploadedByEmail}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full uppercase tracking-widest">{activity.type}</span>
                </div>
              ))}
            </div>
            {stats.recentActivity.length > 0 && (
              <Link to="/documents" className="mt-10 flex items-center justify-center space-x-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors py-4 rounded-xl border border-dashed border-white/10 hover:border-blue-400/50">
                <span>Lihat Semua Dokumen</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600/80 to-indigo-700/80 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">Butuh Bantuan?</h3>
              <p className="text-blue-100 text-sm mb-10 leading-relaxed font-light">
                Tanyakan apapun kepada asisten AI kami seputar dokumen dan prosedur BPR.
              </p>
              <Link 
                to="/chat" 
                className="inline-flex items-center space-x-3 px-8 py-4 bg-white text-blue-700 rounded-2xl text-sm font-bold hover:shadow-2xl transition-all active:scale-95"
              >
                <span>Mulai Chat AI</span>
                <MessageCircle className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-10">
            <h3 className="text-xl font-bold mb-4 text-white">Cari Informasi</h3>
            <p className="text-slate-400 text-sm mb-10 leading-relaxed font-light">
              Telusuri data dari file PDF/Word yang sudah terunggah dengan Semantic AI Search.
            </p>
            <Link 
              to="/search" 
              className="bg-white/10 border border-white/10 backdrop-blur-md hover:bg-white/20 transition-all active:scale-95 inline-flex items-center space-x-3 px-8 py-4 text-white rounded-2xl text-sm font-bold w-full justify-center"
            >
              <Search className="h-5 w-5 text-blue-400" />
              <span>Akses AI Search</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => {
  const colors: any = {
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/20",
    indigo: "bg-indigo-500/20 text-indigo-400 border-indigo-500/20",
    emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
    orange: "bg-orange-500/20 text-orange-400 border-orange-500/20",
  };

  return (
    <motion.div 
      whileHover={{ y: -6, scale: 1.02 }}
      className="bg-white/5 border border-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8"
    >
      <div className="flex justify-between items-start mb-6">
        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border shadow-inner", colors[color])}>
          <Icon className="h-6 w-6" />
        </div>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full uppercase tracking-wider">{trend}</span>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.1em]">{title}</p>
        <p className="text-4xl font-extrabold text-white mt-1">{value}</p>
      </div>
    </motion.div>
  );
};

export default Home;
