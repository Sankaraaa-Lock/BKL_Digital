import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Upload, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  FilePlus,
  ArrowLeft,
  ShieldCheck,
  File,
  CheckCircle2
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  orderBy, 
  query, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { parseFileText } from '../services/parser';
import { cn } from '../lib/utils';
import { OperationType, handleFirestoreError } from '../firebase/errorHandler';

const DocumentManagement = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  useEffect(() => {
    const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setDocuments(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'documents');
    });

    return () => unsubscribe();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    try {
      setIsUploading(true);
      setUploadStatus({ type: null, message: '' });

      const text = await parseFileText(file);
      const fileType = file.name.split('.').pop()?.toLowerCase() as 'pdf' | 'docx';
      
      const docData = {
        title: file.name,
        content: text,
        type: fileType,
        uploadedBy: auth.currentUser.uid,
        uploadedByEmail: auth.currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'documents'), docData);
      
      // Create notification
      await addDoc(collection(db, 'notifications'), {
        userId: auth.currentUser.uid,
        title: "Dokumen Baru",
        message: `Berhasil mengunggah: ${file.name}`,
        type: "success",
        read: false,
        createdAt: serverTimestamp()
      });

      setUploadStatus({ type: 'success', message: `Berhasil mengunggah ${file.name}` });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'documents or notifications');
      setUploadStatus({ type: 'error', message: error instanceof Error ? error.message : "Gagal mengunggah file." });
    } finally {
      setIsUploading(false);
      // Reset status after 5s
      setTimeout(() => setUploadStatus({ type: null, message: '' }), 5000);
    }
  };

  const handleDelete = async (id: string, uploadedBy: string) => {
    if (uploadedBy !== auth.currentUser?.uid) {
      alert("Anda hanya dapat menghapus dokumen yang Anda unggah.");
      return;
    }

    if (!window.confirm("Hapus dokumen ini?")) return;

    try {
      await deleteDoc(doc(db, 'documents', id));
    } catch (error) {
       handleFirestoreError(error, OperationType.DELETE, `documents/${id}`);
    }
  };

  return (
    <div className="space-y-16 py-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-6">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-6xl font-bold tracking-tighter text-white"
          >
            Arsip <span className="text-slate-600 italic font-medium">Digital</span>.
          </motion.h1>
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
            Kelola, atur, dan pantau seluruh aset pengetahuan perusahaan dalam satu repositori terpusat yang aman.
          </p>
        </div>

        <div className="relative group">
           <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
           <label className="relative flex flex-col items-center px-8 py-6 bg-slate-900 border border-white/10 text-white rounded-3xl cursor-pointer hover:border-blue-500/50 transition-all duration-500 shadow-2xl">
              <div className="flex items-center space-x-4">
                 <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                    <Upload className="h-5 w-5" />
                 </div>
                 <span className="text-base md:text-lg font-bold tracking-tight">Unggah Dokumen Baru</span>
              </div>
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} accept=".pdf,.docx,.txt" />
              {isUploading && (
                <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center rounded-3xl backdrop-blur-sm">
                   <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                   <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest animate-pulse">Menghubungkan ke Cloud...</p>
                </div>
              )}
           </label>
        </div>
      </header>

      <AnimatePresence>
        {uploadStatus.type && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] flex items-center space-x-5 backdrop-blur-xl shadow-2xl",
              uploadStatus.type === 'success' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
            )}
          >
            <div className={cn(
              "h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center border",
              uploadStatus.type === 'success' ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-red-500/20 border-red-500/30 text-red-400"
            )}>
              {uploadStatus.type === 'success' ? <CheckCircle className="h-5 w-5 md:h-6 md:w-6" /> : <AlertCircle className="h-5 w-5 md:h-6 md:w-6" />}
            </div>
            <span className="font-bold text-base md:text-lg">{uploadStatus.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document List */}
      <div className="bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[3rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
        <div className="p-8 md:p-12 border-b border-white/5 flex items-center justify-between bg-white/2 overflow-x-auto">
          <div className="flex items-center space-x-6 min-w-max">
             <div className="h-10 w-10 md:h-12 md:w-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                <FileText className="h-5 w-5 md:h-6 md:w-6 text-slate-500" />
             </div>
             <div>
                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">Daftar Dokumen</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Total {documents.length} File Tersimpan</p>
             </div>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 md:px-12 py-6 text-[10px] font-extrabold text-slate-600 uppercase tracking-[0.3em]">Judul Dokumen</th>
                <th className="px-6 md:px-12 py-6 text-[10px] font-extrabold text-slate-600 uppercase tracking-[0.3em]">Pengunggah</th>
                <th className="px-6 md:px-12 py-6 text-[10px] font-extrabold text-slate-600 uppercase tracking-[0.3em]">MIME Type</th>
                <th className="px-6 md:px-12 py-6 text-[10px] font-extrabold text-slate-600 uppercase tracking-[0.3em]">Timestamp</th>
                <th className="px-6 md:px-12 py-6 text-[10px] font-extrabold text-slate-600 uppercase tracking-[0.3em] text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/2">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-12 py-20 md:py-32 text-center text-slate-600 italic font-medium">
                    <div className="flex flex-col items-center">
                       <FilePlus className="h-16 w-16 md:h-20 md:w-20 mb-8 opacity-20" />
                       <p className="text-xl md:text-2xl font-light">Repositori masih kosong.</p>
                       <p className="text-xs md:text-sm mt-2">Tekan tombol diatas untuk mengunggah aset pertama Anda.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                documents.map((doc, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={doc.id} 
                    className="group hover:bg-white/5 transition-all cursor-default"
                  >
                    <td className="px-6 md:px-12 py-6 md:py-8">
                      <div className="flex items-center space-x-6">
                         <div className="h-12 w-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:border-blue-500/30 transition-colors relative shadow-inner">
                            <FileText className="h-5 w-5 text-slate-600" />
                            <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 border-2 border-slate-900" />
                         </div>
                         <div>
                            <p className="text-base md:text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">{doc.title}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">ID: {doc.id.slice(0, 8)}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 md:px-12 py-6 md:py-8">
                      <div className="flex items-center space-x-4">
                         <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-indigo-600/20 flex items-center justify-center text-xs md:text-sm font-bold text-blue-400 border border-blue-500/30">
                            {doc.uploadedByEmail?.[0].toUpperCase() || 'U'}
                         </div>
                         <span className="text-xs md:text-sm font-bold text-slate-400 truncate max-w-[120px] md:max-w-[150px]">{doc.uploadedByEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 md:px-12 py-6 md:py-8">
                       <span className="inline-flex items-center px-4 md:px-5 py-1.5 md:py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {doc.type}
                       </span>
                    </td>
                    <td className="px-6 md:px-12 py-6 md:py-8">
                      <div className="flex flex-col">
                        <span className="text-xs md:text-sm font-bold text-slate-400">{doc.createdAt?.toDate().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">Selesai Sinkron</span>
                      </div>
                    </td>
                    <td className="px-6 md:px-12 py-6 md:py-8 text-right">
                      <button 
                        onClick={() => handleDelete(doc.id, doc.uploadedBy)}
                        className="px-4 md:px-6 py-2 md:py-3 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-[1.2rem] transition-all font-bold text-[10px] uppercase tracking-widest border border-transparent hover:border-red-400/20 active:scale-95"
                      >
                         Hapus
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Footer */}
      <div className="flex items-center justify-center p-12 bg-white/2 border border-white/5 rounded-[3.5rem] backdrop-blur-3xl shadow-inner">
         <div className="flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-16">
            <div className="flex items-center space-x-6">
               <div className="h-14 w-14 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="h-8 w-8 text-blue-500 shadow-blue-500/20" />
               </div>
               <div>
                  <h4 className="text-white text-xl font-bold tracking-tight">Kemanan Tingkat Tinggi</h4>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">AES-256 Storage Encryption</p>
               </div>
            </div>
            <div className="h-10 w-px bg-white/10 hidden md:block" />
            <div className="flex items-center space-x-6 text-slate-600 text-xs font-bold uppercase tracking-[0.3em]">
               <div className="flex flex-col items-center">
                 <span>ISO 27001</span>
                 <span className="text-[8px] text-slate-700 mt-1">Security Std</span>
               </div>
               <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
               <div className="flex flex-col items-center">
                 <span>TIER 3</span>
                 <span className="text-[8px] text-slate-700 mt-1">Data Center</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DocumentManagement;
