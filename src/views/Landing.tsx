import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ShieldCheck, Zap, Globe, Building2, User, MessageSquare } from 'lucide-react';
import { User as FirebaseUser, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

const Landing = ({ user }: { user: FirebaseUser | null }) => {
  const navigate = useNavigate();

  const handleStart = async () => {
    if (user) {
      navigate('/dashboard');
    } else {
      try {
        await signInWithPopup(auth, googleProvider);
        navigate('/dashboard');
      } catch (err) {
        console.error("Auth error", err);
      }
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase bg-white/5 border border-white/10 text-blue-400 mb-8 backdrop-blur-md">
                <Zap className="h-3 w-3 mr-2 fill-blue-400" />
                Masa Depan Perbankan Digital
              </div>
              <h1 className="text-6xl md:text-8xl font-extrabold text-white tracking-tighter mb-8 italic">
                Portal Pintar <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 non-italic">
                  Kreo Lestari
                </span>
              </h1>
              <p className="max-w-2xl mx-auto text-xl text-slate-400 mb-12 leading-relaxed font-light">
                Otomatisasi alur kerja perbankan dengan integrasi Gemini AI untuk analisis dokumen dan bantuan nasabah secara real-time.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <button
                  onClick={handleStart}
                  className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-blue-500/30 transition-all flex items-center justify-center space-x-3 active:scale-95"
                >
                  <span>Mulai Sekarang</span>
                  <ChevronRight className="h-6 w-6" />
                </button>
                <button className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-2xl text-lg font-bold hover:bg-white/10 transition-all flex items-center justify-center space-x-3">
                  <span>Pelajari Layanan</span>
                </button>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-24 relative px-4"
          >
            <div className="max-w-5xl mx-auto bg-white/5 border border-white/20 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex aspect-video">
              <div className="flex-1 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 p-12 flex flex-col justify-center items-center text-center backdrop-blur-3xl">
                 <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-emerald-400 rounded-3xl flex items-center justify-center shadow-2xl mb-8">
                   <Building2 className="h-12 w-12 text-white" />
                 </div>
                 <h3 className="text-3xl font-bold text-white">Sistem Terintegrasi</h3>
                 <p className="text-slate-400 mt-4 leading-relaxed font-light">Dashboard aman untuk pengelolaan data operasional dan basis data dokumen perusahaan.</p>
              </div>
              <div className="flex-1 hidden md:flex items-center justify-center p-12 bg-black/20">
                <div className="space-y-6 w-full">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-4 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500/40 w-2/3 animate-pulse"></div>
                    </div>
                  ))}
                  <div className="pt-6 flex justify-between">
                     <div className="h-10 w-24 bg-white/10 rounded-xl"></div>
                     <div className="h-10 w-24 bg-blue-600/40 rounded-xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Zap} 
              title="AI Searching" 
              desc="Gunakan kecerdasan buatan untuk mencari jawaban langsung dari ribuan dokumen operasional perusahaan."
              color="blue"
            />
            <FeatureCard 
              icon={MessageSquare} 
              title="Chat Interaktif" 
              desc="Asisten virtual yang siap membantu menjawab pertanyaan seputar kebijakan dan prosedur bank 24/7."
              color="emerald"
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Akses Aman" 
              desc="Sistem autentikasi enkripsi tingkat tinggi untuk memastikan rahasia data perusahaan tetap terjaga."
              color="indigo"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, color }: any) => {
  const colors: any = {
    blue: "from-blue-600/20 to-blue-400/10 text-blue-400",
    emerald: "from-emerald-600/20 to-emerald-400/10 text-emerald-400",
    indigo: "from-indigo-600/20 to-indigo-400/10 text-indigo-400",
  };

  return (
    <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all group shadow-xl">
      <div className={cn("h-16 w-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-8 shadow-inner", colors[color])}>
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{title}</h3>
      <p className="text-slate-400 leading-relaxed font-light">{desc}</p>
    </div>
  );
};

export default Landing;
