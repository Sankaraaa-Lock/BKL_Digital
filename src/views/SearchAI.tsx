import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Loader2, 
  Sparkles, 
  FileText, 
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { searchInDocuments } from '../services/ai';
import { cn } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import ReactMarkdown from 'react-markdown';

const SearchAI = () => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'documents'), (snapshot) => {
      setDocuments(snapshot.docs.map(d => d.data().content));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'documents');
    });
    return () => unsubscribe();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query || isSearching || documents.length === 0) return;

    try {
      setIsSearching(true);
      setResult(null);
      const answer = await searchInDocuments(query, documents);
      setResult(answer);
    } catch (err) {
      console.error("Search failed", err);
      setResult("Maaf, terjadi kesalahan saat melakukan pencarian.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-16">
      <header className="text-center space-y-8">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="inline-flex items-center px-6 py-2 bg-gradient-to-tr from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-widest backdrop-blur-3xl animate-pulse"
        >
          <Sparkles className="h-4 w-4 mr-3" />
          Neural Semantic Intelligence
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">
          Temukan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400 italic">Jawaban</span>.
        </h1>
        <p className="text-slate-500 text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed">
          Tanyakan apapun tentang basis data internal Anda. AI kami akan menganalisis ribuan baris dokumen secara instan.
        </p>
      </header>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        <form onSubmit={handleSearch} className="relative bg-slate-900/50 border border-white/10 p-3 rounded-[3rem] backdrop-blur-3xl flex items-center shadow-2xl">
          <div className="flex-1 flex items-center pl-4 md:pl-6">
            <Search className="h-6 w-6 md:h-8 md:w-8 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Misal: Prosedur pengajuan kredit..."
              className="w-full bg-transparent border-none focus:ring-0 text-xl md:text-2xl font-semibold text-white placeholder:text-slate-700 px-4 md:px-6 py-3 md:py-4"
            />
          </div>
          <button 
            disabled={isSearching || documents.length === 0}
            className="h-12 md:h-16 px-6 md:px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-bold transition-all shadow-2xl shadow-blue-500/30 flex items-center space-x-3 disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="h-6 w-6 animate-spin" /> : <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />}
            <span className="text-sm md:text-lg">Cari</span>
          </button>
        </form>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-16 relative overflow-hidden backdrop-blur-3xl shadow-2xl"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-6">
               <div className="flex items-center space-x-5">
                  <div className="h-12 w-12 md:h-14 md:w-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 md:h-7 md:w-7 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">Analisis Berbasis Pengetahuan</h3>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.3ch] mt-1">Verified Internal Source</p>
                  </div>
               </div>
               <div className="inline-block px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest w-fit">
                 Confidential
               </div>
            </div>

            <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:text-lg md:prose-p:text-xl font-medium text-slate-300">
               <ReactMarkdown>{result}</ReactMarkdown>
            </div>

            <div className="mt-16 pt-10 border-t border-white/5 flex items-center justify-between">
               <div className="flex items-center space-x-3 text-slate-600">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Repositori BPR Kreo Lestari</span>
               </div>
               <div className="text-[10px] text-slate-700 font-bold uppercase tracking-widest italic">
                  Sintesa Neural Engine v1.5
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {documents.length === 0 && (
        <div className="flex items-center justify-center p-12 bg-amber-500/5 border border-amber-500/10 rounded-[2.5rem]">
           <Info className="h-6 w-6 text-amber-500 mr-4" />
           <p className="text-amber-200/60 font-medium">Belum ada basis data terdeteksi. Harap unggah dokumen terlebih dahulu di menu Arsip.</p>
        </div>
      )}
    </div>
  );
};

export default SearchAI;
