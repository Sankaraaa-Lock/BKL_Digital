import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  FileCheck, 
  TrendingUp, 
  MessageCircle,
  ArrowRight,
  Clock,
  Search,
  MessageSquare,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { cn } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';

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
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'documents');
    });
    
    // In a real app we'd fetch specific user's chat count
    const unsubRecent = onSnapshot(qRecent, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'upload'
      }));
      setStats(prev => ({ ...prev, recentActivity: activities }));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'documents');
    });

    return () => {
      unsubDocs();
      unsubRecent();
    };
  }, []);

  return (
    <div className="space-y-16 py-8">
      <header className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">
            Pusat <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-400">Kendali AI</span>.
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mt-6 leading-relaxed">
            Asisten cerdas Anda siap mengolah data operasional, prosedur perbankan, dan dokumen arsip secara instan.
          </p>
        </motion.div>
      </header>

      {/* Primary Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/chat" className="group relative p-1 leading-none flex items-center">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-full h-full bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between hover:border-blue-500/50 transition-all duration-500 overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <MessageCircle className="h-24 w-24" />
             </div>
             <div className="h-12 w-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <MessageSquare className="h-6 w-6" />
             </div>
             <div className="mt-16">
               <h3 className="text-2xl font-bold text-white mb-2">Diskusi Pintar</h3>
               <p className="text-sm text-slate-500 font-medium leading-snug">Tanyakan tentang prosedur, kebijakan, atau buat draft dokumen perbankan.</p>
             </div>
          </div>
        </Link>

        <Link to="/search" className="group relative p-1 leading-none flex items-center">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-full h-full bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-500 overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Search className="h-24 w-24" />
             </div>
             <div className="h-12 w-12 bg-emerald-600/20 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Search className="h-6 w-6" />
             </div>
             <div className="mt-16">
               <h3 className="text-2xl font-bold text-white mb-2">Pencarian AI</h3>
               <p className="text-sm text-slate-500 font-medium leading-snug">Temukan data spesifik di ribuan halaman arsip dokumen Anda secara instan.</p>
             </div>
          </div>
        </Link>

        <Link to="/documents" className="group relative p-1 leading-none flex items-center">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-orange-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-full h-full bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between hover:border-amber-500/50 transition-all duration-500 overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <FileCheck className="h-24 w-24" />
             </div>
             <div className="h-12 w-12 bg-amber-600/20 rounded-2xl flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <FileCheck className="h-6 w-6" />
             </div>
             <div className="mt-16">
               <h3 className="text-2xl font-bold text-white mb-2">Kelola Arsip</h3>
               <p className="text-sm text-slate-500 font-medium leading-snug">Unggah dokumen baru, verifikasi status, dan atur repositori pengetahuan Anda.</p>
             </div>
          </div>
        </Link>
      </div>

      {/* Activity Timeline Simplified */}
      <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 md:p-16 relative overflow-hidden backdrop-blur-3xl shadow-2xl">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
             <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                <Clock className="h-6 w-6 text-slate-400" />
             </div>
             <h2 className="text-3xl font-bold text-white tracking-tight">Timeline Kerja</h2>
          </div>
          <Link to="/documents" className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest border-b border-blue-500/30 pb-1">Lihat Semua</Link>
        </div>

        <div className="space-y-6">
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity, i) => (
              <motion.div 
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                <div className="flex items-center space-x-6">
                  <div className="h-14 w-14 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 rounded-2xl flex items-center justify-center border border-blue-500/10">
                    <FileCheck className="h-7 w-7 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{activity.title}</h4>
                    <p className="text-sm text-slate-500 font-medium">Internal System • AI Analytics Berhasil</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-full uppercase tracking-widest mb-1 italic">Tersimpan</span>
                   <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">Hari ini</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center opacity-40 italic font-medium text-slate-500">Timeline aktivitas masih kosong...</div>
          )}
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
