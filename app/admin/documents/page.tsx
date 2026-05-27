"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Search, FolderOpen, Download, CheckCircle, AlertCircle, FileText } from "lucide-react";

type DocumentRecord = {
    id: string;
    name: string;
    url: string;
    type: string;
    verified: boolean;
    uploadedAt: string;
    parentType: "leads" | "visaApplications";
    parentId: string;
    parentName: string;
};

export default function AdminDocumentsVaultPage() {
    const [documents, setDocuments] = useState<DocumentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");

    useEffect(() => {
        const fetchAllDocuments = async () => {
            try {
                const docRecords: DocumentRecord[] = [];

                // 1. Fetch leads
                const leadsSnap = await getDocs(collection(db, "leads"));
                const leadPromises = leadsSnap.docs.map(async (leadDoc) => {
                    const leadData = leadDoc.data();
                    const subCollSnap = await getDocs(collection(db, "leads", leadDoc.id, "documents"));
                    subCollSnap.forEach((subDoc) => {
                        const file = subDoc.data();
                        docRecords.push({
                            id: subDoc.id,
                            name: file.name || "Unnamed File",
                            url: file.url || "",
                            type: file.type || "General Document",
                            verified: !!file.verified,
                            uploadedAt: file.uploadedAt || new Date().toISOString(),
                            parentType: "leads",
                            parentId: leadDoc.id,
                            parentName: leadData.name || "Lead Client",
                        });
                    });
                });

                // 2. Fetch visa applications
                const visasSnap = await getDocs(collection(db, "visaApplications"));
                const visaPromises = visasSnap.docs.map(async (visaDoc) => {
                    const visaData = visaDoc.data();
                    const subCollSnap = await getDocs(collection(db, "visaApplications", visaDoc.id, "documents"));
                    subCollSnap.forEach((subDoc) => {
                        const file = subDoc.data();
                        docRecords.push({
                            id: subDoc.id,
                            name: file.name || "Unnamed File",
                            url: file.url || "",
                            type: file.type || "General Document",
                            verified: !!file.verified,
                            uploadedAt: file.uploadedAt || new Date().toISOString(),
                            parentType: "visaApplications",
                            parentId: visaDoc.id,
                            parentName: visaData.applicantName || "Visa Applicant",
                        });
                    });
                });

                await Promise.all([...leadPromises, ...visaPromises]);
                
                // Sort by uploadedAt descending
                docRecords.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
                setDocuments(docRecords);

            } catch (error) {
                console.error("Error fetching all documents:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllDocuments();
    }, []);

    const filteredDocs = documents.filter((docItem) => {
        const matchesSearch =
            docItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            docItem.parentName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === "All" || docItem.type.toLowerCase() === typeFilter.toLowerCase();
        return matchesSearch && matchesType;
    });

    const docTypes = ["All", "Passport", "Visa", "Ticket", "Insurance", "Invoice", "Photo"];

    return (
        <div className="space-y-8 font-sans">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    <FolderOpen className="text-[#e68932]" />
                    Central Documents Vault
                </h1>
                <p className="mt-2 text-gray-400">Search and audit all passport copies, embassy submission logs, flight tickets, and customer attachments.</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/10">
                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-4 top-3 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by file name, client name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-11 w-full rounded-2xl border-none bg-white/5 pl-11 pr-4 text-sm text-white outline-none focus:bg-white/10 transition"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    {docTypes.map((type) => (
                        <button
                            key={type}
                            onClick={() => setTypeFilter(type)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex-shrink-0 ${
                                typeFilter === type ? "bg-[#e68932] text-white" : "bg-white/5 text-gray-400 hover:text-white"
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Documents List */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <div className="col-span-full text-center text-white py-12 text-lg">Gathering vault documents...</div>
                ) : filteredDocs.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 py-12">No files found.</div>
                ) : (
                    filteredDocs.map((docItem) => (
                        <div key={docItem.id} className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col justify-between hover:border-white/20 transition gap-4">
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <FileText className="text-[#00C2FF] flex-shrink-0" size={24} />
                                        <h3 className="font-semibold text-sm text-white break-all line-clamp-1" title={docItem.name}>
                                            {docItem.name}
                                        </h3>
                                    </div>
                                    <span className={`inline-flex items-center gap-0.5 text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                                        docItem.verified ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                                    }`}>
                                        {docItem.verified ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                                        {docItem.verified ? "Verified" : "Pending"}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Type: <span className="text-[#e68932] font-semibold">{docItem.type}</span></p>
                                <div className="text-xs bg-white/5 p-3 rounded-2xl border border-white/5 space-y-1">
                                    <p className="text-gray-400">Attached to:</p>
                                    <p className="font-semibold text-white truncate">{docItem.parentName}</p>
                                    <p className="text-[9px] text-gray-500 font-mono">Module: {docItem.parentType}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-white/5 pt-3">
                                <span className="text-[10px] text-gray-500">
                                    Uploaded: {new Date(docItem.uploadedAt).toLocaleDateString()}
                                </span>
                                {docItem.url && (
                                    <a
                                        href={docItem.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 transition active:scale-95"
                                    >
                                        <Download size={12} />
                                        Download
                                    </a>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
