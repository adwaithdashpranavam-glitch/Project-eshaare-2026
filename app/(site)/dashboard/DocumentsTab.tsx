"use client";
import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { 
  Lock, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Eye, 
  Trash2 
} from "lucide-react";

const DOCUMENT_TYPES = [
  "Passport Front",
  "Passport Back",
  "Emirates ID",
  "UAE Visa Page",
  "Bank Statement",
  "NOC Letter",
  "Flight Ticket",
  "Hotel Voucher",
  "Other"
];

export default function DocumentsTab({ currentUser, t }: { currentUser: any; t: any }) {
  const [loading, setLoading] = useState(true);
  const [travelDocs, setTravelDocs] = useState<any[]>([]);

  // Travel Documents Form States
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docType, setDocType] = useState(DOCUMENT_TYPES[0]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  useEffect(() => {
    async function loadDocuments() {
      if (!currentUser) return;
      try {
        setLoading(true);
        const docsQuery = query(
          collection(db, "users", currentUser.uid, "documents")
        );
        const docsSnap = await getDocs(docsQuery);
        const docsList = docsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        docsList.sort((a: any, b: any) => {
          const tA = a.uploadedAt?.toDate ? a.uploadedAt.toDate().getTime() : 0;
          const tB = b.uploadedAt?.toDate ? b.uploadedAt.toDate().getTime() : 0;
          return tB - tA;
        });
        setTravelDocs(docsList);
      } catch (err) {
        console.error("Error fetching documents:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDocuments();
  }, [currentUser]);

  const handleDocUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile || !currentUser) {
      setUploadError(t("Please select a file to upload."));
      return;
    }

    try {
      setUploadingDoc(true);
      setUploadError("");
      setUploadSuccess("");

      const sanitizedFileName = docFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const uniqueFileName = `${Date.now()}_${sanitizedFileName}`;
      const storageRef = ref(storage, `documents/users/${currentUser.uid}/${uniqueFileName}`);

      const uploadTask = uploadBytesResumable(storageRef, docFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progressPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progressPercent);
        },
        (err) => {
          console.error("Storage upload failed:", err);
          setUploadError(t("Failed to upload file to storage."));
          setUploadingDoc(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Add metadata to subcollection
            const docsCollectionRef = collection(db, "users", currentUser.uid, "documents");
            const newDocRef = await addDoc(docsCollectionRef, {
              docType,
              fileName: docFile.name,
              fileUrl: downloadURL,
              uploadedAt: serverTimestamp(),
              status: "pending",
              uploadedBy: currentUser.email,
            });

            // Update local state
            setTravelDocs((prev) => [
              {
                id: newDocRef.id,
                docType,
                fileName: docFile.name,
                fileUrl: downloadURL,
                uploadedAt: { toDate: () => new Date() },
                status: "pending",
                uploadedBy: currentUser.email,
              },
              ...prev,
            ]);

            setUploadSuccess(t("Document uploaded successfully!"));
            setDocFile(null);
            setUploadProgress(0);
          } catch (dbErr) {
            console.error("Firestore document metadata save failed:", dbErr);
            setUploadError(t("File uploaded, but failed to save metadata."));
          } finally {
            setUploadingDoc(false);
          }
        }
      );
    } catch (err: any) {
      console.error(err);
      setUploadError(t("Something went wrong. Please try again."));
      setUploadingDoc(false);
    }
  };

  const handleDeleteDoc = async (docData: any) => {
    if (!confirm(t("Are you sure you want to delete this document?"))) return;
    try {
      if (docData.fileUrl.includes("firebasestorage.googleapis.com")) {
        const fileStorageRef = ref(storage, docData.fileUrl);
        await deleteObject(fileStorageRef);
      }
      await deleteDoc(doc(db, "users", currentUser.uid, "documents", docData.id));
      setTravelDocs(prev => prev.filter(d => d.id !== docData.id));
    } catch (err) {
      console.error("Delete doc failed", err);
      alert(t("Failed to delete document."));
    }
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#00C2FF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="text-left rtl:text-right space-y-8">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Lock className="text-[#00C2FF]" />
        {t("Travel Documents")}
      </h2>

      {/* Upload Form */}
      <form onSubmit={handleDocUpload} className="p-6 rounded-3xl border border-white/10 bg-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <UploadCloud size={16} className="text-[#00C2FF]" />
          {t("Upload Document")}
        </h3>

        {uploadSuccess && (
          <div className="p-3.5 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {uploadError && (
          <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{uploadError}</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-3xs text-gray-400 uppercase font-bold tracking-wider">{t("Select Document Type")}</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="h-12 rounded-xl bg-black/45 border border-white/10 px-4 text-xs text-white focus:border-[#00C2FF] outline-none"
            >
              {DOCUMENT_TYPES.map(type => (
                <option key={type} value={type} className="bg-[#071120]">
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-3xs text-gray-400 uppercase font-bold tracking-wider">Select File</label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setDocFile(e.target.files[0]);
                }
              }}
              className="file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 text-xs text-gray-400 cursor-pointer pt-1"
            />
          </div>
        </div>

        {uploadingDoc && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-2xs text-gray-400">
              <span>Uploading file...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#00C2FF]" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={uploadingDoc || !docFile}
          className="h-12 bg-[#00C2FF] hover:bg-[#00a2d5] text-black font-bold px-6 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
        >
          {uploadingDoc ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
          <span>{t("Upload Document")}</span>
        </button>
      </form>

      {/* List Table */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Uploaded Files</h3>
        
        {travelDocs.length === 0 ? (
          <div className="text-center py-10 border border-white/5 rounded-2xl bg-black/10 text-gray-500">
            <p className="text-xs">No documents uploaded yet. Upload your passport or visa copies above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/35">
            <table className="w-full text-left text-xs text-white border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="px-5 py-3">File Category</th>
                  <th className="px-5 py-3">File Name</th>
                  <th className="px-5 py-3">Verification</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {travelDocs.map((docData) => (
                  <tr key={docData.id} className="hover:bg-white/5 transition">
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-[#00C2FF]/10 text-[#00C2FF] text-2xs uppercase tracking-wide">
                        {docData.docType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 max-w-[200px] truncate" title={docData.fileName}>
                      {docData.fileName}
                    </td>
                    <td className="px-5 py-3.5">
                      {docData.status === "verified" ? (
                        <span className="text-green-400 flex items-center gap-1"><ShieldCheck size={14} /> Verified</span>
                      ) : docData.status === "rejected" ? (
                        <span className="text-red-400 flex items-center gap-1"><ShieldAlert size={14} /> Rejected</span>
                      ) : (
                        <span className="text-yellow-400 flex items-center gap-1"><Clock size={14} /> Pending</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <a
                          href={docData.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 transition"
                          title="View / Download"
                        >
                          <Eye size={13} />
                        </a>
                        <button
                          onClick={() => handleDeleteDoc(docData)}
                          className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition cursor-pointer"
                          title="Delete File"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
