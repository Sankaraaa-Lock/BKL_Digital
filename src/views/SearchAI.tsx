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
import ReactMarkdown from 'react-markdown';

const SearchAI = () => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'documents'), (snapshot) => {
      setDocuments(snapshot.docs.map(d => d.data().content));
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
      <header className="text-center mb-16">
        <div className="inline-flex items-center px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase bg-blue-500/10 text-blue-400 mb-6 border border-blue-500/20 backdrop-blur-md animate-pulse">
          <Sparkles className="h-3 w-3 mr-2" />
          Powered by Gemini 1.5 Flash
        </div>
        <h1 className="text-5xl font-extrabold text-white tracking-tighter italic">AI Semantic Search</h1>
        <p className="text-slate-400 mt-4 max-w-xl mx-auto font-light leading-relaxed">
          Cari jawaban cerdas dari seluruh basis data kebijakan, prosedur, dan dokumen operasional internal secara instan.
        </p>
      </header>

      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 mb-12 overflow-hidden relative border-white/5">
        <div className="absolute top-[-20%] right-[-10%] opacity-10 pointer-events-none rotate-12">
           <Search className="h-64 w-64 text-blue-400" />
        </div>

        <form onSubmit={handleSearch} className="relative z-10">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Apa syarat pengajuan kredit modal kerja UMKM?"
                className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/30 focus:bg-white/10 transition-all outline-none text-white placeholder-slate-500 font-medium"
              />
            </div>
            <button 
              disabled={isSearching || documents.length === 0}
              className="px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            >
              {isSearching ? <Loader2 className="h-6 w-6 animate-spin" /> : <ChevronRight className="h-6 w-6" />}
              <span>{isSearching ? 'Mencari...' : 'Cari Jawaban'}</span>
            </button>
          </div>
          
          {documents.length === 0 && (
            <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center text-orange-400 text-sm">
              <Info className="h-4 w-4 mr-3" />
              <span>Belum ada dokumen yang diunggah sebagai basis pengetahuan. Silahkan unggah di menu Documents.</span>
            </div>
          )}
        </form>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-10 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/20 shadow-inner">
                  <ShieldCheck className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-bold text-white text-lg tracking-tight">Analisis AI</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Verified Knowledge Base</p>
                </div>
              </div>
              <div className="text-[10px] font-bold text-slate-500 bg-white/5 py-1 px-3 rounded-full border border-white/10">CONFIDENTIAL</div>
            </div>
            
            <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed font-light text-lg">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
            
            <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
              <span className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span>Source: Internal Company Repository</span>
              </span>
              <span>Gemini Pro Vision • AES-256 Secured</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchAI;
