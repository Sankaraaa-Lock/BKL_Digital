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
  getDocs,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { chatWithAI } from '../services/ai';
import { cn } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import ReactMarkdown from 'react-markdown';

const ChatAI = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [chatId, setChatId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const chatRef = doc(db, 'chats', userId);
    
    // Ensure chat session document exists for the user
    const ensureChatSession = async () => {
      try {
        const docSnap = await getDoc(chatRef);
        if (!docSnap.exists()) {
          await setDoc(chatRef, {
            userId: userId,
            lastMessage: "Sesi dimulai",
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp()
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `chats/${userId}`);
      }
    };
    ensureChatSession();

    const q = query(
      collection(db, `chats/${userId}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `chats/${userId}/messages`);
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
      const userId = auth.currentUser.uid;
      const messagesRef = collection(db, `chats/${userId}/messages`);
      
      await addDoc(messagesRef, {
        role: 'user',
        text: userText,
        timestamp: serverTimestamp()
      });

      // Update parent session
      await setDoc(doc(db, 'chats', userId), {
        userId: userId,
        lastMessage: userText.substring(0, 500),
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Get AI response
      const history = messages.map(m => ({ role: m.role as 'user' | 'model', text: m.text }));
      history.push({ role: 'user', text: userText });
      
      const aiResponse = await chatWithAI(history);

      // Save AI message to Firestore
      await addDoc(messagesRef, {
        role: 'model',
        text: aiResponse,
        timestamp: serverTimestamp()
      });

    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `chats/${auth.currentUser?.uid}/messages`);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = async () => {
    if (!window.confirm("Hapus seluruh riwayat percakapan?")) return;
    if (!auth.currentUser) return;
    
    const userId = auth.currentUser.uid;
    const q = query(collection(db, `chats/${userId}/messages`));
    try {
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deletePromises);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `chats/${userId}/messages`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-3xl">
      <header className="p-8 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center space-x-5">
          <div className="h-14 w-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/30">
            <Bot className="text-white h-7 w-7" />
          </div>
          <div>
            <h2 className="font-bold text-2xl tracking-tighter">Diskusi Pintar</h2>
            <p className="text-[10px] text-blue-400 mt-1 font-bold uppercase tracking-widest animate-pulse">Neural Assistant Agent</p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-4 text-slate-500 hover:text-white transition-colors bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 group"
          title="Bersihkan Percakapan"
        >
          <RotateCcw className="h-5 w-5 group-hover:rotate-[-45deg] transition-transform" />
        </button>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide"
      >
        {messages.length === 0 && !isTyping && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-40">
            <div className="h-24 w-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center border border-white/10">
               <Sparkles className="h-10 w-10 text-blue-500/50" />
            </div>
            <div className="space-y-4">
              <h3 className="text-4xl font-bold tracking-tighter text-white">Butuh Bantuan?</h3>
              <p className="text-slate-500 max-w-sm mx-auto font-medium text-lg">Tanyakan tentang prosedur operasional, draf dokumen, atau analisis data internal Anda.</p>
            </div>
          </div>
        )}

        {messages.map((m) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={m.id} 
            className={cn(
              "flex w-full group",
              m.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-[85%] p-8 rounded-[2.5rem] relative shadow-2xl border",
              m.role === 'user' 
                ? "bg-blue-600 text-white rounded-tr-none border-blue-400/20 shadow-blue-500/20" 
                : "bg-white/5 text-slate-200 rounded-tl-none border-white/10 backdrop-blur-md"
            )}>
              <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:text-xl font-medium">
                 <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
              <span className={cn(
                "absolute bottom-[-2rem] opacity-0 group-hover:opacity-100 transition-opacity text-[10px] uppercase tracking-widest font-extrabold text-slate-600 px-6",
                m.role === 'user' ? "right-0" : "left-0"
              )}>
                {m.role === 'user' ? 'Internal Staff' : 'SintesaAI Intelligence'}
              </span>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] rounded-tl-none shadow-xl flex items-center space-x-6 backdrop-blur-3xl">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" />
              </div>
              <span className="text-xs font-extrabold text-slate-600 uppercase tracking-[0.3em]">Processing Logic...</span>
            </div>
          </div>
        )}
      </div>

      <footer className="p-8 bg-white/5 border-t border-white/10">
        <form onSubmit={handleSend} className="relative group">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder="Tulis pesan atau pertanyaan Anda..."
            className="w-full bg-white/5 border border-white/10 focus:border-blue-500 focus:bg-white/10 outline-none p-8 rounded-[2.5rem] transition-all pr-32 text-2xl font-semibold placeholder:text-slate-800"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-4 top-4 bottom-4 px-12 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.8rem] transition-all shadow-2xl shadow-blue-500/40 flex items-center justify-center disabled:opacity-50 disabled:scale-95"
          >
            <Send className="h-8 w-8" />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatAI;
