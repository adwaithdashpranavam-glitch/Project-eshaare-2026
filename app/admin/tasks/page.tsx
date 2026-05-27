"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, addDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { Calendar as CalendarIcon, CheckSquare, Plus, Search, ChevronLeft, ChevronRight, User } from "lucide-react";

type Task = {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    priority: "High" | "Medium" | "Low";
    status: "Todo" | "In Progress" | "Done";
    assignee: string;
};

export default function AdminTasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"board" | "calendar">("board");

    // Calendar state
    const [currentDate, setCurrentDate] = useState(new Date());

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        dueDate: "",
        priority: "Medium" as Task["priority"],
        status: "Todo" as Task["status"],
        assignee: "",
    });

    useEffect(() => {
        const q = query(collection(db, "tasks"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: Task[] = [];
            snapshot.forEach((docSnap) => {
                const item = docSnap.data();
                data.push({
                    id: docSnap.id,
                    title: item.title || "",
                    description: item.description || "",
                    dueDate: item.dueDate || "",
                    priority: item.priority || "Medium",
                    status: item.status || "Todo",
                    assignee: item.assignee || "Unassigned",
                });
            });
            // Sort by dueDate
            data.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
            setTasks(data);
            setLoading(false);
        }, (error) => {
            console.error("Error reading tasks:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateTaskStatus = async (id: string, status: Task["status"]) => {
        try {
            await updateDoc(doc(db, "tasks", id), { status });
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.dueDate) {
            alert("Title and Due Date are required.");
            return;
        }

        try {
            await addDoc(collection(db, "tasks"), {
                ...formData,
                createdAt: new Date().toISOString(),
            });
            setShowModal(false);
            setFormData({
                title: "",
                description: "",
                dueDate: "",
                priority: "Medium",
                status: "Todo",
                assignee: "",
            });
            alert("Task added successfully!");
        } catch (error) {
            console.error("Error creating task:", error);
            alert("Failed to create task.");
        }
    };

    // Calendar Calculations
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handleMonthChange = (direction: "prev" | "next") => {
        const increment = direction === "next" ? 1 : -1;
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
    };

    const renderCalendarGrid = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysCount = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const gridCells = [];
        // Empty cells for alignment
        for (let i = 0; i < firstDay; i++) {
            gridCells.push(<div key={`empty-${i}`} className="h-28 border border-white/5 bg-transparent" />);
        }

        // Days cells
        for (let day = 1; day <= daysCount; day++) {
            const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayTasks = tasks.filter(t => t.dueDate === dateString);

            gridCells.push(
                <div key={day} className="h-28 border border-white/5 bg-white/5 p-2 flex flex-col justify-between hover:bg-white/10 transition">
                    <span className="text-xs font-bold text-gray-400">{day}</span>
                    <div className="flex-1 overflow-y-auto space-y-1 mt-1 pr-1 scrollbar-none">
                        {dayTasks.map(t => (
                            <div
                                key={t.id}
                                className={`text-[9px] px-1.5 py-0.5 rounded font-semibold truncate ${
                                    t.priority === "High" ? "bg-red-500/20 text-red-300" : t.priority === "Medium" ? "bg-yellow-500/20 text-yellow-300" : "bg-green-500/20 text-green-300"
                                }`}
                                title={t.title}
                            >
                                {t.title}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return gridCells;
    };

    const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const columns: Task["status"][] = ["Todo", "In Progress", "Done"];

    return (
        <div className="space-y-8 font-sans">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <CheckSquare className="text-[#e68932]" />
                        Tasks & Consultation Planner
                    </h1>
                    <p className="mt-2 text-gray-400">Schedule team follow-ups, coordinate visa appointments deadlines, and assign tasks.</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* View switcher */}
                    <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                        <button
                            onClick={() => setViewMode("board")}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${viewMode === "board" ? "bg-[#e68932] text-white" : "text-gray-400 hover:text-white"}`}
                        >
                            Board Checklist
                        </button>
                        <button
                            onClick={() => setViewMode("calendar")}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${viewMode === "calendar" ? "bg-[#e68932] text-white" : "text-gray-400 hover:text-white"}`}
                        >
                            Monthly Calendar
                        </button>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e68932] px-5 py-2.5 font-semibold text-white hover:opacity-90 transition active:scale-95 text-xs"
                    >
                        <Plus size={16} />
                        New Task
                    </button>
                </div>
            </div>

            {/* Main view area */}
            {viewMode === "board" ? (
                /* Board View */
                <div className="space-y-6">
                    <div className="relative max-w-sm bg-white/5 p-1 rounded-2xl border border-white/10">
                        <Search className="absolute left-4 top-3 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 w-full rounded-xl border-none bg-transparent pl-11 pr-4 text-xs text-white outline-none focus:bg-white/5 transition"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[500px]">
                        {columns.map((col) => {
                            const items = filteredTasks.filter(t => t.status === col);
                            return (
                                <div key={col} className="flex flex-col bg-black/45 rounded-3xl border border-white/5 p-5 space-y-4">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                        <h3 className="font-bold text-sm text-white uppercase tracking-wider">{col}</h3>
                                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-300 font-bold">{items.length}</span>
                                    </div>

                                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-1">
                                        {items.length === 0 ? (
                                            <div className="text-center py-16 text-xs text-gray-600 border-2 border-dashed border-white/5 rounded-2xl">
                                                No Tasks
                                            </div>
                                        ) : (
                                            items.map((task) => (
                                                <div key={task.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 hover:border-white/15 transition">
                                                    <div className="space-y-1">
                                                        <span className={`inline-block text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                                                            task.priority === "High" ? "bg-red-500/20 text-red-400" : task.priority === "Medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"
                                                        }`}>
                                                            {task.priority} Priority
                                                        </span>
                                                        <h4 className="font-bold text-xs text-white leading-5">{task.title}</h4>
                                                        {task.description && <p className="text-[10px] text-gray-400 leading-4">{task.description}</p>}
                                                    </div>

                                                    <div className="flex items-center justify-between border-t border-white/5 pt-2.5 text-[10px] text-gray-500">
                                                        <span className="flex items-center gap-1"><User size={10} /> {task.assignee}</span>
                                                        <span>Due: {task.dueDate}</span>
                                                    </div>

                                                    {/* Status advance toggles */}
                                                    <div className="flex gap-1 justify-end pt-1">
                                                        {columns.filter(c => c !== col).map((targetCol) => (
                                                            <button
                                                                key={targetCol}
                                                                onClick={() => updateTaskStatus(task.id, targetCol)}
                                                                className="text-[9px] bg-white/5 hover:bg-white/10 text-gray-400 px-2 py-0.5 rounded font-semibold uppercase"
                                                            >
                                                                {targetCol}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                /* Monthly Calendar View */
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <CalendarIcon className="text-[#e68932]" />
                            {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
                        </h2>
                        <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl">
                            <button
                                onClick={() => handleMonthChange("prev")}
                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => handleMonthChange("next")}
                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Grid labels */}
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                            <div key={day} className="py-2">{day}</div>
                        ))}
                    </div>

                    {/* Cells */}
                    <div className="grid grid-cols-7 gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
                        {renderCalendarGrid()}
                    </div>
                </div>
            )}

            {/* Task creation Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-[#071120] text-white w-full max-w-lg rounded-3xl p-8 border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6 text-[#e68932]">New Follow-up Task</h2>

                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Task Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="What needs follow-up?"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Description</label>
                                <textarea
                                    rows={2}
                                    placeholder="Task notes details..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="mt-1 w-full rounded-xl border-none bg-white/5 p-4 text-sm text-white outline-none focus:bg-white/10"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Due Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-xs text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Assignee Staff</label>
                                    <input
                                        type="text"
                                        placeholder="Assignee Name"
                                        value={formData.assignee}
                                        onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Task Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    >
                                        <option value="Low" className="bg-[#071120]">Low</option>
                                        <option value="Medium" className="bg-[#071120]">Medium</option>
                                        <option value="High" className="bg-[#071120]">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Initial Column Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    >
                                        <option value="Todo" className="bg-[#071120]">Todo</option>
                                        <option value="In Progress" className="bg-[#071120]">In Progress</option>
                                        <option value="Done" className="bg-[#071120]">Done</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="rounded-xl bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 font-semibold text-xs transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-[#e68932] text-white hover:opacity-90 px-5 py-2.5 font-semibold transition text-xs"
                                >
                                    Add Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
