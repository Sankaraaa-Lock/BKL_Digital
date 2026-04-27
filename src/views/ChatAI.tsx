import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User as UserIcon,
  Loader2,
  Trash2,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  orderBy, 
  query, 
  serverTimestamp,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { chatWithAI } from '../services/ai';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

const ChatAI = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [chatId, setChatId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    // For this simple version, we'll use a single chat session per user 
    // or just listen to all for now. In production, we'd manage specific chatIds.
    const q = query(
      collection(db, `chats/global/messages`), // Simple global-user path
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || !auth.currentUser) return;

    const userText = input.trim();
    setInput("");
    
    try {
      setIsTyping(true);

      // Save user message to Firestore
      await addDoc(collection(db, `chats/global/messages`), {
        role: 'user',
        text: userText,
        uid: auth.currentUser.uid,
        timestamp: serverTimestamp()
      });

      // Get AI response
      const history = messages.map(m => ({ role: m.role as 'user' | 'model', text: m.text }));
      history.push({ role: 'user', text: userText });
      
      const aiResponse = await chatWithAI(history);

      // Save AI message to Firestore
      await addDoc(collection(db, `chats/global/messages`), {
        role: 'model',
        text: aiResponse,
        timestamp: serverTimestamp()
      });

    } catch (err) {
      console.error("Chat error", err);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = async () => {
    if (!window.confirm("Hapus seluruh riwayat percakapan?")) return;
    const q = query(collection(db, `chats/global/messages`));
    const snapshot = await getDocs(q);
    snapshot.docs.forEach(async (d) => {
      await deleteDoc(d.ref);
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 h-[calc(100vh-120px)] flex flex-col py-6 relative z-10">
      <header className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl rounded-b-none border-b-0 p-6 flex items-center justify-between border-white/5">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bold text-white text-lg tracking-tight">Kreo Virtual Concierge</h2>
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Live Assistant Agent</span>
            </div>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-3 text-slate-500 hover:text-white transition-colors bg-white/10 border border-white/10 backdrop-blur-md hover:bg-white/20 transition-all active:scale-95 rounded-xl"
          title="Hapus Percakapan"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 bg-white/5 border-x border-white/10 overflow-y-auto p-8 space-y-8 scroll-smooth"
      >
        {messages.length === 0 && !isTyping && (
          <div className="flex flex-col items-center justify-center h-full text-center py-20 px-10">
            <div className="h-24 w-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 border border-white/10 shadow-inner">
               <Sparkles className="h-10 w-10 text-blue-400" />
            </div>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">Halo! Saya Asisten Pintar Anda</h3>
            <p className="text-slate-400 mt-4 max-w-sm font-light leading-relaxed">
              Tanyakan apa saja seputar kebijakan, alur kerja, atau data operasional BPR Kreo Lestari.
            </p>
          </div>
        )}

        {messages.map((m) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={m.id} 
            className={cn(
              "flex w-full mb-6",
              m.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-[85%] sm:max-w-[70%] flex flex-col",
              m.role === 'user' ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "p-5 rounded-3xl relative shadow-2xl backdrop-blur-md border",
                m.role === 'user' 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none border-blue-400/20" 
                  : "bg-white/10 text-slate-200 rounded-tl-none border-white/10"
              )}>
                <div className="prose prose-invert prose-sm max-w-none markdown-body font-light leading-relaxed">
                   <ReactMarkdown>{m.text}</ReactMarkdown>
                </div>
              </div>
              <span className="text-[9px] text-slate-500 mt-2 uppercase font-bold tracking-[0.2em] px-2">
                {m.role === 'user' ? 'Internal Staff' : 'AI Assistant Agent'}
              </span>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 p-5 rounded-3xl rounded-tl-none shadow-xl flex items-center space-x-3 backdrop-blur-md">
              <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Memproses respon anda...</span>
            </div>
          </div>
        )}
      </div>

      <footer className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl rounded-t-none border-t-0 p-8 border-white/5">
        <form onSubmit={handleSend} className="relative flex items-center space-x-4">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder="Tanyakan sesuatu..."
            className="flex-1 px-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/30 focus:bg-white/10 transition-all outline-none text-white placeholder-slate-500 font-medium"
          />
          <button 
            disabled={!input.trim() || isTyping}
            className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-6 w-6" />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatAI;
