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
  ArrowLeft
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
      console.error("Firestore list error", error);
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
      console.error("Upload error", error);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
      <header className="mb-12 lg:flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight italic">Knowledge Repository</h1>
          <p className="text-slate-400 mt-2 font-light">Unggah PDF atau Word untuk melatih basis pengetahuan AI perusahaan.</p>
        </div>
        
        <div className="mt-8 lg:mt-0">
          <label className={cn(
            "relative inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl text-sm font-bold cursor-pointer hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-95",
            isUploading && "opacity-50 cursor-not-allowed pointer-events-none"
          )}>
            <input type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileUpload} disabled={isUploading} />
            {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            <span>{isUploading ? 'Menyinkronkan...' : 'Sinkronkan Dokumen'}</span>
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
              "mb-10 p-5 rounded-2xl flex items-center space-x-4 backdrop-blur-md",
              uploadStatus.type === 'success' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
            )}
          >
            {uploadStatus.type === 'success' ? <CheckCircle className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
            <span className="font-bold">{uploadStatus.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 italic font-bold text-[10px] text-slate-500 uppercase tracking-[0.2em]">
                <th className="px-10 py-6">ID & Judul Dokumen</th>
                <th className="px-10 py-6">MIME Type</th>
                <th className="px-10 py-6">Uploader Identity</th>
                <th className="px-10 py-6">Timestamp</th>
                <th className="px-10 py-6 text-right">Opsi Pengelolaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center text-slate-500 italic">
                    <div className="flex flex-col items-center">
                      <FilePlus className="h-16 w-16 mb-6 text-slate-700" />
                      <p className="text-xl font-light">Belum ada basis pengetahuan terdeteksi.</p>
                      <p className="text-sm mt-1">Silahkan unggah dokumen internal pertama Anda.</p>
                    </div>
                  </td>
                </tr>
              ) : documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-white/5 transition-all group">
                  <td className="px-10 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-blue-500/20 transition-colors">
                        <FileText className="h-5 w-5 text-blue-400" />
                      </div>
                      <span className="font-bold text-white text-base group-hover:text-blue-400 transition-colors line-clamp-1 max-w-sm">{doc.title}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="px-3 py-1 bg-white/5 border border-white/10 text-slate-400 rounded-full text-[10px] font-bold uppercase tracking-widest">{doc.type}</span>
                  </td>
                  <td className="px-10 py-6 text-sm text-slate-500 font-medium">
                    {doc.uploadedByEmail}
                  </td>
                  <td className="px-10 py-6 text-sm text-slate-500">
                    {doc.createdAt?.toDate().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button 
                      onClick={() => handleDelete(doc.id, doc.uploadedBy)}
                      className="p-3 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
                      title="Hapus Dokumen"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentManagement;
