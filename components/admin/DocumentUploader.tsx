"use client";

import { useState, useRef } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db, auth } from "@/lib/firebase";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X } from "lucide-react";

interface DocumentUploaderProps {
  entityId: string; // Lead ID or VisaApplication ID
  entityType: "leads" | "visaApplications";
  onUploadComplete?: () => void;
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

const MAX_FILE_SIZE_MB = 5;

export default function DocumentUploader({
  entityId,
  entityType,
  onUploadComplete,
}: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<string>(DOCUMENT_TYPES[0]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (selectedFile: File) => {
    setError("");
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      setError(`File is too large. Maximum size allowed is ${MAX_FILE_SIZE_MB}MB.`);
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearSelectedFile = () => {
    setFile(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select or drop a file first.");
      return;
    }

    setUploading(true);
    setError("");

    // Create unique path: documents/{entityType}/{entityId}/{timestamp}_{filename}
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const uniqueFileName = `${Date.now()}_${sanitizedFileName}`;
    const storageRef = ref(storage, `documents/${entityType}/${entityId}/${uniqueFileName}`);
    
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progressPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progressPercent);
      },
      (err) => {
        console.error("Firebase upload failure:", err);
        setError("Storage upload failed. Please ensure Firebase Storage is enabled and rules are configured.");
        setUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Add to subcollection: /{entityType}/{entityId}/documents
          const docsCollectionRef = collection(db, entityType, entityId, "documents");
          await addDoc(docsCollectionRef, {
            docType,
            fileName: file.name,
            fileUrl: downloadURL,
            uploadedAt: serverTimestamp(),
            status: "pending",
            uploadedBy: auth.currentUser?.email || "staff",
          });

          // Reset upload state
          setFile(null);
          setProgress(0);
          setUploading(false);
          
          if (onUploadComplete) {
            onUploadComplete();
          }
        } catch (err) {
          console.error("Firestore document metadata save failure:", err);
          setError("File was uploaded successfully, but database metadata could not be saved.");
          setUploading(false);
        }
      }
    );
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md shadow-lg text-white">
      <h3 className="text-lg font-bold mb-4 tracking-wide flex items-center gap-2">
        <UploadCloud size={20} className="text-[#00C2FF]" />
        Upload Document
      </h3>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Document Type Dropdown */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
            Document Category
          </label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white focus:border-[#00C2FF] focus:ring-1 focus:ring-[#00C2FF] outline-none transition disabled:opacity-50"
            disabled={uploading}
          >
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type} className="bg-[#071120] text-white">
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Drag & Drop Zone */}
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-300 ${
              isDragOver
                ? "border-[#00C2FF] bg-[#00C2FF]/10 scale-[0.99]"
                : "border-white/20 bg-black/20 hover:border-white/40 hover:bg-black/30"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg"
              disabled={uploading}
            />
            <UploadCloud size={36} className={`mb-3 transition-colors ${isDragOver ? "text-[#00C2FF]" : "text-gray-400"}`} />
            <p className="text-sm font-semibold text-center">
              Drag & Drop file here or <span className="text-[#00C2FF] hover:underline">browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-1 text-center">
              Supports PDF, PNG, JPG, JPEG (Max {MAX_FILE_SIZE_MB}MB)
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-[#00C2FF]/20 bg-[#00C2FF]/5 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="rounded-lg bg-[#00C2FF]/10 p-2.5 text-[#00C2FF] shrink-0">
                <FileText size={20} />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate pr-2">{file.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            {!uploading && (
              <button
                onClick={clearSelectedFile}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition shrink-0"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* Progress Bar */}
        {uploading && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Uploading to secure vault...</span>
              <span className="font-semibold text-white">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#00C2FF] to-[#0092ff] h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#00C2FF] px-4 py-3 font-semibold text-black hover:bg-[#33d0ff] active:scale-[0.99] disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed disabled:scale-100 transition-all shadow-md shadow-[#00C2FF]/10"
        >
          {uploading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
              <span>Uploading...</span>
            </>
          ) : (
            <span>Upload Document</span>
          )}
        </button>
      </div>
    </div>
  );
}
