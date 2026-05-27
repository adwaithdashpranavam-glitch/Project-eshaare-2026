"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, addDoc, onSnapshot } from "firebase/firestore";
import { MessageSquare, Mail, Send, CheckCheck, User, Sparkles } from "lucide-react";
import { AutomationService } from "@/lib/automation";

type MessageLog = {
    id: string;
    clientId: string;
    clientName: string;
    channel: "WhatsApp" | "Email";
    direction: "Inbound" | "Outbound";
    body: string;
    sender: string;
    recipient: string;
    status: string;
    sentAt: string;
};

const MESSAGE_TEMPLATES = [
    {
        name: "Welcome Onboarding",
        channel: "Email" as const,
        subject: "Welcome to ESHAARE TOUR!",
        body: "Dear {{client_name}}, thank you for submitting your visa and travel inquiry for {{destination}}! Our consultants are reviewing your details and will follow up shortly."
    },
    {
        name: "Payment Confirmation",
        channel: "WhatsApp" as const,
        subject: "",
        body: "Hi {{client_name}}, we have successfully received your payment of {{amount}} AED. Your application is now in progress. Thank you for choosing ESHAARE!"
    },
    {
        name: "Missing Documents Reminder",
        channel: "WhatsApp" as const,
        subject: "",
        body: "Hi {{client_name}}, we still need some documents to complete your application. Please check your dashboard or reply to this chat to upload."
    }
];

export default function AdminCommunicationsHubPage() {
    const [messages, setMessages] = useState<MessageLog[]>([]);
    const [loading, setLoading] = useState(true);

    // Composer State
    const [recipient, setRecipient] = useState("");
    const [clientName, setClientName] = useState("");
    const [channel, setChannel] = useState<"WhatsApp" | "Email">("WhatsApp");
    const [subject, setSubject] = useState("");
    const [messageBody, setMessageBody] = useState("");
    const [activeClient, setActiveClient] = useState<string>("All");

    useEffect(() => {
        const q = query(collection(db, "communications"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: MessageLog[] = [];
            snapshot.forEach((docSnap) => {
                const item = docSnap.data();
                data.push({
                    id: docSnap.id,
                    clientId: item.clientId || "",
                    clientName: item.clientName || "Unknown Client",
                    channel: item.channel || "WhatsApp",
                    direction: item.direction || "Outbound",
                    body: item.body || "",
                    sender: item.sender || "System",
                    recipient: item.recipient || "",
                    status: item.status || "Sent",
                    sentAt: item.sentAt || new Date().toISOString(),
                });
            });
            // Sort by sentAt ascending (for chat scroll) or descending. Let's sort by descending for lists
            data.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
            setMessages(data);
            setLoading(false);
        }, (error) => {
            console.error("Error reading communications:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSendTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!recipient || !messageBody) {
            alert("Recipient details and message body are required.");
            return;
        }

        try {
            let sentOk = false;

            if (channel === "Email") {
                sentOk = await AutomationService.sendEmail({
                    to: recipient,
                    subject: subject || "ESHAARE TOUR Update",
                    html: `<div style="font-family: sans-serif; padding: 20px;">${messageBody}</div>`
                });
            } else {
                sentOk = await AutomationService.sendWhatsAppNotification(recipient, messageBody);
            }

            if (sentOk) {
                await addDoc(collection(db, "communications"), {
                    clientId: activeClient === "All" ? "" : activeClient,
                    clientName: clientName || "Client Profile",
                    channel,
                    direction: "Outbound",
                    body: messageBody,
                    sender: "CRM Admin",
                    recipient,
                    status: "Delivered",
                    sentAt: new Date().toISOString(),
                });

                alert("Message dispatched successfully!");
                setRecipient("");
                setClientName("");
                setSubject("");
                setMessageBody("");
            } else {
                alert("Failed to send message.");
            }
        } catch (error) {
            console.error("Error sending communication:", error);
        }
    };

    const handleApplyTemplate = (tpl: typeof MESSAGE_TEMPLATES[0]) => {
        setChannel(tpl.channel);
        setSubject(tpl.subject);
        
        let processedBody = tpl.body
            .replace("{{client_name}}", clientName || "Client")
            .replace("{{destination}}", "Dubai, UAE")
            .replace("{{amount}}", "1,200");

        setMessageBody(processedBody);
    };

    // Filter threads
    const clients = Array.from(new Set(messages.map(m => m.clientName).filter(Boolean)));
    const filteredMessages = messages.filter(m => activeClient === "All" || m.clientName === activeClient);

    return (
        <div className="space-y-8 font-sans">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    <MessageSquare className="text-[#e68932]" />
                    Omnichannel Communications Hub
                </h1>
                <p className="mt-2 text-gray-400">Review real-time WhatsApp templates delivery logs, dispatch transactional client emails, and track logs history.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Panel: Active Client Contacts */}
                <div className="rounded-3xl bg-white/5 border border-white/10 p-6 space-y-4 max-h-[600px] overflow-y-auto">
                    <h3 className="text-sm font-bold uppercase text-gray-400 tracking-wider">Active Conversations</h3>
                    <div className="space-y-2">
                        <button
                            onClick={() => setActiveClient("All")}
                            className={`w-full text-left p-4 rounded-2xl text-xs font-semibold transition ${
                                activeClient === "All" ? "bg-[#e68932] text-white" : "bg-white/5 text-gray-300 hover:bg-white/10"
                            }`}
                        >
                            All Messages
                        </button>
                        {clients.map((c) => (
                            <button
                                key={c}
                                onClick={() => setActiveClient(c)}
                                className={`w-full text-left p-4 rounded-2xl text-xs font-semibold transition ${
                                    activeClient === c ? "bg-[#e68932] text-white" : "bg-white/5 text-gray-300 hover:bg-white/10"
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <User size={14} />
                                    <span className="truncate">{c}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Middle: Chat bubble log */}
                <div className="lg:col-span-2 flex flex-col bg-white/5 border border-white/10 rounded-3xl p-6 min-h-[500px] max-h-[600px] justify-between">
                    {/* Chat view */}
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-6 scrollbar-thin scrollbar-thumb-white/10">
                        {loading ? (
                            <div className="text-center py-20 text-gray-400 text-sm">Loading message histories...</div>
                        ) : filteredMessages.length === 0 ? (
                            <div className="text-center py-20 text-gray-500 text-sm">No messages exchanged yet. Use the composer below.</div>
                        ) : (
                            [...filteredMessages].reverse().map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col max-w-[80%] p-4 rounded-3xl ${
                                        msg.direction === "Inbound"
                                            ? "bg-white/10 text-white self-start"
                                            : "bg-[#e68932]/10 text-white self-end border border-[#e68932]/20"
                                    } ${msg.direction === "Inbound" ? "" : "ml-auto"}`}
                                >
                                    <div className="flex items-center gap-2 mb-1.5 justify-between">
                                        <span className="text-[10px] font-bold text-[#00C2FF] flex items-center gap-1">
                                            {msg.channel === "WhatsApp" ? <MessageSquare size={10} /> : <Mail size={10} />}
                                            {msg.channel}
                                        </span>
                                        <span className="text-[9px] text-gray-500">{new Date(msg.sentAt).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-xs leading-5 break-all whitespace-pre-wrap">{msg.body}</p>
                                    <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-white/5 text-[9px] text-gray-500">
                                        <span>To: {msg.recipient}</span>
                                        <span className="flex items-center gap-0.5 text-green-400"><CheckCheck size={10} /> {msg.status}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Quick template helper */}
                    <div className="border-t border-white/10 pt-4 space-y-4">
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1 flex-shrink-0">
                                <Sparkles size={12} className="text-yellow-400" /> Auto templates:
                            </span>
                            {MESSAGE_TEMPLATES.map((tpl) => (
                                <button
                                    key={tpl.name}
                                    onClick={() => handleApplyTemplate(tpl)}
                                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] text-white font-semibold transition flex-shrink-0"
                                >
                                    {tpl.name}
                                </button>
                            ))}
                        </div>

                        {/* Interactive Composer */}
                        <form onSubmit={handleSendTemplate} className="space-y-4">
                            <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
                                <input
                                    type="text"
                                    required
                                    placeholder="Recipient Email or WhatsApp Number"
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    className="h-10 rounded-xl bg-white/5 px-3 text-xs text-white border-none outline-none focus:bg-white/10"
                                />
                                <input
                                    type="text"
                                    placeholder="Client Name (for variables)"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    className="h-10 rounded-xl bg-white/5 px-3 text-xs text-white border-none outline-none focus:bg-white/10"
                                />
                                <select
                                    value={channel}
                                    onChange={(e) => setChannel(e.target.value as any)}
                                    className="h-10 rounded-xl bg-white/5 px-3 text-xs text-white border-none outline-none focus:bg-white/10"
                                >
                                    <option value="WhatsApp" className="bg-[#071120]">WhatsApp</option>
                                    <option value="Email" className="bg-[#071120]">Email</option>
                                </select>
                            </div>
                            {channel === "Email" && (
                                <input
                                    type="text"
                                    placeholder="Email Subject Line"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="h-10 w-full rounded-xl bg-white/5 px-3 text-xs text-white border-none outline-none focus:bg-white/10"
                                />
                            )}
                            <div className="flex gap-2">
                                <textarea
                                    required
                                    rows={2}
                                    placeholder={`Type your custom ${channel} content...`}
                                    value={messageBody}
                                    onChange={(e) => setMessageBody(e.target.value)}
                                    className="flex-1 rounded-xl bg-white/5 p-3 text-xs text-white border-none outline-none focus:bg-white/10"
                                />
                                <button
                                    type="submit"
                                    className="h-12 w-12 rounded-xl bg-[#e68932] text-white hover:opacity-90 transition active:scale-95 flex items-center justify-center flex-shrink-0"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
