"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  arrayRemove,
  getDocs,
  where,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import {
  Eye,
  Check,
  X,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ExternalLink,
  FileText,
  AlertCircle,
  Undo2,
} from "lucide-react";

interface DocumentData {
  id: string;
  docType: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: any;
  status?: "pending" | "verified" | "rejected";
  rejectionReason?: string;
  uploadedBy?: string;
  isExternal?: boolean; // True if loaded from parent array
}

interface DocumentListProps {
  entityId: string; // Lead ID or VisaApplication ID
  entityType: "leads" | "visaApplications";
  externalDocs?: string[]; // Raw URLs from parent array (for visa applications)
}

const DOCUMENT_TYPES = [
  "Passport Front",
  "Passport Back",
  "Emirates ID",
  "UAE Visa Page",
  "Bank Statement",
  "NOC Letter",
  "Photograph",
  "Other",
];

const getFileNameFromUrl = (url: string): string => {
  try {
    const decoded = decodeURIComponent(url);
    const parts = decoded.split("/");
    const lastPart = parts[parts.length - 1];
    return lastPart.split("?")[0];
  } catch (e) {
    return "Applicant Upload";
  }
};

export default function DocumentList({
  entityId,
  entityType,
  externalDocs = [],
}: DocumentListProps) {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Lightbox Preview State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState("");

  // Verification Actions UI state
  const [verifyingExternalId, setVerifyingExternalId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(DOCUMENT_TYPES[0]);
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (!entityId) return;

    const q = query(
      collection(db, entityType, entityId, "documents"),
      orderBy("uploadedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const subDocs = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        })) as DocumentData[];

        // Merge with externalDocs (from parent document) if they exist
        if (externalDocs && externalDocs.length > 0) {
          const unified: DocumentData[] = [...subDocs];

          externalDocs.forEach((url, idx) => {
            // Check if this URL is already recorded in the subcollection
            const recordedDoc = subDocs.find((d) => d.fileUrl === url);
            if (!recordedDoc) {
              // Virtual pending document
              unified.push({
                id: `external-${idx}`,
                docType: "Applicant Upload",
                fileName: getFileNameFromUrl(url),
                fileUrl: url,
                uploadedAt: null,
                status: "pending",
                isExternal: true,
                uploadedBy: "applicant",
              });
            }
          });

          // Sort unified list so verified/rejected subcollection docs appear, followed by remaining docs
          setDocuments(unified);
        } else {
          setDocuments(subDocs);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error reading documents subcollection:", err);
        setError("Failed to load documents from database.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [entityId, entityType, externalDocs]);

  // Document actions: Approve, Reject, Delete, Revert
  const handleApprove = async (docData: DocumentData) => {
    setError("");
    try {
      if (docData.isExternal) {
        // External docs need to be instantiated in the subcollection when verified
        setVerifyingExternalId(docData.id);
        setSelectedCategory(DOCUMENT_TYPES[0]);
      } else {
        // Already exists in subcollection, simply update status
        const docRef = doc(db, entityType, entityId, "documents", docData.id);
        await updateDoc(docRef, {
          status: "verified",
          rejectionReason: "",
        });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to verify document.");
    }
  };

  const handleConfirmVerifyExternal = async (docData: DocumentData) => {
    setError("");
    try {
      const docsCollectionRef = collection(db, entityType, entityId, "documents");
      await addDoc(docsCollectionRef, {
        docType: selectedCategory,
        fileName: docData.fileName,
        fileUrl: docData.fileUrl,
        uploadedAt: serverTimestamp(),
        status: "verified",
        uploadedBy: docData.uploadedBy || "applicant",
      });
      setVerifyingExternalId(null);
    } catch (err) {
      console.error(err);
      setError("Failed to save verification state.");
    }
  };

  const handleRejectClick = (docId: string) => {
    setRejectingDocId(docId);
    setRejectionReason("");
  };

  const handleConfirmReject = async (docData: DocumentData) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    setError("");
    try {
      if (docData.isExternal) {
        // Instantiate as rejected in subcollection
        const docsCollectionRef = collection(db, entityType, entityId, "documents");
        await addDoc(docsCollectionRef, {
          docType: "Applicant Upload",
          fileName: docData.fileName,
          fileUrl: docData.fileUrl,
          uploadedAt: serverTimestamp(),
          status: "rejected",
          rejectionReason: rejectionReason.trim(),
          uploadedBy: docData.uploadedBy || "applicant",
        });
      } else {
        const docRef = doc(db, entityType, entityId, "documents", docData.id);
        await updateDoc(docRef, {
          status: "rejected",
          rejectionReason: rejectionReason.trim(),
        });
      }
      setRejectingDocId(null);
    } catch (err) {
      console.error(err);
      setError("Failed to reject document.");
    }
  };

  const handleRevert = async (docData: DocumentData) => {
    setError("");
    try {
      if (!docData.isExternal) {
        const docRef = doc(db, entityType, entityId, "documents", docData.id);
        await updateDoc(docRef, {
          status: "pending",
          rejectionReason: "",
        });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to revert document status.");
    }
  };

  const handleDelete = async (docData: DocumentData) => {
    if (!confirm(`Are you sure you want to delete "${docData.fileName}"? This cannot be undone.`)) {
      return;
    }
    setError("");
    try {
      // 1. Delete from Firebase Storage if URL belongs to Firebase Storage
      if (docData.fileUrl.includes("firebasestorage.googleapis.com")) {
        try {
          const fileStorageRef = ref(storage, docData.fileUrl);
          await deleteObject(fileStorageRef);
        } catch (storageErr) {
          // If the file does not exist in Storage, proceed with DB delete
          console.warn("Storage file deletion skipped/failed:", storageErr);
        }
      }

      // 2. If it's a virtual/external doc, remove URL from parent array
      if (docData.isExternal) {
        const parentDocRef = doc(db, "visaApplications", entityId);
        await updateDoc(parentDocRef, {
          uploadedDocs: arrayRemove(docData.fileUrl),
        });
      } else {
        // 3. Otherwise, delete from subcollection
        const docRef = doc(db, entityType, entityId, "documents", docData.id);
        await deleteDoc(docRef);

        // 4. Also check if this URL was in parent array (for visaApplications) and clean it up
        if (entityType === "visaApplications") {
          const parentDocRef = doc(db, "visaApplications", entityId);
          await updateDoc(parentDocRef, {
            uploadedDocs: arrayRemove(docData.fileUrl),
          });
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete document.");
    }
  };

  const isImageFile = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "webp", "gif"].includes(ext || "");
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 py-6">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[#00C2FF]"></div>
        <span>Syncing document database...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-8 text-center">
          <p className="text-sm text-gray-400">No documents found for this account.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white">
              <thead className="border-b border-white/10 bg-black/40 text-xs font-semibold uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Document Details</th>
                  <th className="px-6 py-4 font-semibold">Uploader</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {documents.map((docItem) => {
                  const isImage = isImageFile(docItem.fileName);
                  const isPending = docItem.status === "pending" || !docItem.status;
                  const isVerified = docItem.status === "verified";
                  const isRejected = docItem.status === "rejected";

                  return (
                    <tr key={docItem.id} className="transition hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-white/5 p-2 text-gray-300">
                            <FileText size={18} />
                          </div>
                          <div className="max-w-[200px] sm:max-w-xs overflow-hidden">
                            <p className="font-semibold text-white truncate" title={docItem.fileName}>
                              {docItem.fileName}
                            </p>
                            <span className="mt-1 inline-block rounded bg-[#00C2FF]/10 px-1.5 py-0.5 text-2xs font-medium uppercase tracking-wider text-[#00C2FF]">
                              {docItem.docType}
                            </span>
                            {docItem.uploadedAt?.toDate && (
                              <p className="text-3xs text-gray-400 mt-1">
                                {docItem.uploadedAt.toDate().toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-300 font-medium truncate max-w-[120px] block">
                          {docItem.uploadedBy || "applicant"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {isVerified && (
                          <div className="flex items-center gap-1.5 text-green-400 font-medium text-xs bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full w-fit">
                            <ShieldCheck size={14} />
                            <span>Verified</span>
                          </div>
                        )}
                        {isRejected && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-red-400 font-medium text-xs bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full w-fit">
                              <ShieldAlert size={14} />
                              <span>Rejected</span>
                            </div>
                            {docItem.rejectionReason && (
                              <p className="text-3xs text-red-300 max-w-[150px] leading-tight">
                                Reason: {docItem.rejectionReason}
                              </p>
                            )}
                          </div>
                        )}
                        {isPending && (
                          <div className="flex items-center gap-1.5 text-yellow-400 font-medium text-xs bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-full w-fit">
                            <Clock size={14} />
                            <span>Pending Verify</span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {/* Inline Verify Category Selection for External Documents */}
                        {verifyingExternalId === docItem.id ? (
                          <div className="flex flex-col items-end gap-2 bg-black/60 p-2.5 rounded-xl border border-[#00C2FF]/20 mt-1 max-w-[200px] ml-auto text-left">
                            <label className="text-3xs font-semibold text-gray-400 uppercase tracking-wider block">
                              Select Category
                            </label>
                            <select
                              value={selectedCategory}
                              onChange={(e) => setSelectedCategory(e.target.value)}
                              className="w-full bg-[#071120] text-xs text-white border border-white/10 rounded p-1"
                            >
                              {DOCUMENT_TYPES.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleConfirmVerifyExternal(docItem)}
                                className="bg-green-500 hover:bg-green-600 text-black px-2 py-0.5 rounded text-3xs font-bold"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setVerifyingExternalId(null)}
                                className="bg-white/10 hover:bg-white/20 text-white px-2 py-0.5 rounded text-3xs"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : rejectingDocId === docItem.id ? (
                          <div className="flex flex-col items-end gap-2 bg-black/60 p-2.5 rounded-xl border border-red-500/20 mt-1 max-w-[200px] ml-auto text-left">
                            <label className="text-3xs font-semibold text-red-400 uppercase tracking-wider block">
                              Rejection Reason
                            </label>
                            <input
                              type="text"
                              value={rejectionReason}
                              placeholder="e.g. Blurry or incomplete"
                              onChange={(e) => setRejectionReason(e.target.value)}
                              className="w-full bg-[#071120] text-xs text-white border border-white/10 rounded p-1 outline-none focus:border-red-500"
                            />
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleConfirmReject(docItem)}
                                className="bg-red-500 hover:bg-red-600 text-white px-2 py-0.5 rounded text-3xs font-bold"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => setRejectingDocId(null)}
                                className="bg-white/10 hover:bg-white/20 text-white px-2 py-0.5 rounded text-3xs"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Preview Button */}
                            <button
                              onClick={() => {
                                setPreviewUrl(docItem.fileUrl);
                                setPreviewName(docItem.fileName);
                              }}
                              className="rounded-lg bg-white/5 p-2 text-gray-300 hover:bg-white/10 hover:text-white transition"
                              title="Preview inline"
                            >
                              <Eye size={15} />
                            </button>

                            {/* Verification Toggle Actions */}
                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleApprove(docItem)}
                                  className="rounded-lg bg-green-500/10 p-2 text-green-400 hover:bg-green-500/20 hover:text-green-300 transition"
                                  title="Approve / Verify"
                                >
                                  <Check size={15} />
                                </button>
                                <button
                                  onClick={() => handleRejectClick(docItem.id)}
                                  className="rounded-lg bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition"
                                  title="Reject"
                                >
                                  <X size={15} />
                                </button>
                              </>
                            )}

                            {/* Revert Action */}
                            {(isVerified || isRejected) && !docItem.isExternal && (
                              <button
                                onClick={() => handleRevert(docItem)}
                                className="rounded-lg bg-white/5 p-2 text-yellow-400 hover:bg-white/10 transition"
                                title="Revert verification status"
                              >
                                <Undo2 size={15} />
                              </button>
                            )}

                            {/* Delete Action */}
                            <button
                              onClick={() => handleDelete(docItem)}
                              className="rounded-lg bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 hover:text-red-500 transition"
                              title="Delete permanently"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Premium Lightbox Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 p-4 md:p-10 backdrop-blur-md">
          <div className="absolute top-4 right-4 flex gap-3">
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-sm font-semibold transition"
            >
              <ExternalLink size={16} />
              Open Original
            </a>
            <button
              onClick={() => {
                setPreviewUrl(null);
                setPreviewName("");
              }}
              className="rounded-xl bg-white/10 hover:bg-white/20 text-white p-2.5 transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="w-full max-w-4xl max-h-[80vh] flex flex-col items-center justify-center mt-10">
            <h4 className="text-white font-bold text-base mb-4 truncate max-w-xl text-center">
              {previewName}
            </h4>

            {isImageFile(previewName) ? (
              <img
                src={previewUrl}
                alt={previewName}
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl border border-white/10"
              />
            ) : (
              <iframe
                src={previewUrl}
                title={previewName}
                className="w-full h-[68vh] border-0 rounded-xl bg-white shadow-2xl"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
