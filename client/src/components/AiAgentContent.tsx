import React, { useState, useEffect, useRef } from 'react';
import type { PatientReport } from './PatientCard';
import { Send, Bot, User, Activity, AlertCircle, ShieldAlert, CheckCircle, AlertTriangle, FileText, Download, Play, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
    id: number;
    sender: 'user' | 'agent' | 'system';
    text: string;
    type: 'text' | 'log' | 'report' | 'component';
    reportData?: PatientReport;
    component?: React.ReactNode;
    style?: string;
}

export const AiAgentContent: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [queue, setQueue] = useState<PatientReport[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    // 1. Initial Welcome
    useEffect(() => {
        // Delay welcome slightly for effect
        setTimeout(() => {
            setMessages([
                { id: 1, sender: 'agent', text: "Hello Doctor 👋. I am your Clinical AI Assistant.", type: 'text' },
                { id: 2, sender: 'agent', text: "I have connected to the Hospital Database. There are new lab results waiting for review.", type: 'text' }
            ]);
        }, 500);
    }, []);

    // 2. Stream Listener
    useEffect(() => {
        const eventSource = new EventSource('http://localhost:8000/api/stream');
        eventSource.addEventListener('log', (e: MessageEvent) => {
            const data = JSON.parse(e.data);
            if (data.msg.includes("DEBUG") || data.msg.includes("search_tool") || data.msg.includes("reasoning_engine") || data.msg.includes("Processing")) {
                setMessages(prev => [...prev, { id: Date.now(), sender: 'system', text: data.msg.replace('DEBUG: ', ''), type: 'log', style: data.style }]);
            }
        });
        return () => eventSource.close();
    }, []);

    // 3. Data Sync & Initial Triage
    const loadData = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/reports');
            const data = await res.json();
            setQueue(data);
            return data;
        } catch (e) { return []; }
    };

    useEffect(() => {
        let isMounted = true;

        // Initial Load
        loadData().then((data) => {
            if (isMounted && data.length > 0) {
                setTimeout(() => {
                    if (!isMounted) return;
                    const urgentCount = data.filter((p: any) => p.status === 'Pending').length;
                    setMessages(prev => [
                        ...prev,
                        { id: Date.now(), sender: 'agent', text: `Good afternoon, Doctor. I've synced with the hospital database.`, type: 'text' },
                        { id: Date.now() + 1, sender: 'agent', text: `You have ${urgentCount} new reports pending review. I've prioritized the queue below based on clinical urgency:`, type: 'text' }
                    ]);
                    // Auto-show queue
                    handleSend("Show Queue", true);
                }, 800);
            }
        });

        const interval = setInterval(loadData, 5000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    // 4. Interaction Logic
    const handleSend = async (textOverride?: string, isSystemAction: boolean = false) => {
        const text = textOverride || inputValue.trim();
        if (!text) return;

        if (!isSystemAction) {
            setInputValue("");
            setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: text, type: 'text' }]);
        }

        setIsTyping(true);

        const lowerText = text.toLowerCase();

        // --- COMMAND: LIST PATIENTS (Interactive) ---
        if (lowerText.includes("list") || lowerText.includes("show") || lowerText.includes("queue")) {
            await new Promise(r => setTimeout(r, isSystemAction ? 1000 : 600));



            // Using simple HTML table structure for queue inside chat
            const PatientList = () => (
                <div className="flex flex-col gap-2 w-full mt-2 overflow-x-hidden">
                    {/* Header - Hidden on mobile, visible on md+ */}
                    <div className="hidden md:grid grid-cols-[30px_1fr_100px] gap-2 px-3 py-2 border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                        <div>#</div>
                        <div>Patient</div>
                        <div className="text-right">Action</div>
                    </div>

                    {queue.map((p) => (
                        <div key={p.id} className="flex flex-col md:grid md:grid-cols-[30px_1fr_100px] gap-3 md:gap-2 items-start md:items-center bg-white p-3 md:p-2 rounded-xl border border-gray-100 hover:bg-gray-50 hover:shadow-sm transition-all group">

                            {/* Mobile Top Row: Avatar + Name + ID */}
                            <div className="flex items-center gap-3 md:contents w-full">
                                {/* Avatar */}
                                <div className="w-8 h-8 md:w-8 md:h-8 rounded-full bg-gray-100 flex shrink-0 items-center justify-center text-[10px] font-bold text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-200">
                                    {p.patientName.charAt(0)}
                                </div>

                                <div className="min-w-0 flex-1 md:hidden">
                                    <div className="font-bold text-gray-800 text-sm">{p.patientName}</div>
                                </div>
                            </div>

                            {/* Details (Desktop Only - Repurposed for Mobile below) */}
                            <div className="min-w-0 hidden md:block">
                                <div className="font-bold text-gray-800 text-xs flex items-center gap-2 truncate">
                                    {p.patientName}
                                </div>
                                <div className="text-[10px] text-gray-400">{p.testName}</div>
                            </div>

                            {/* Mobile Details Row */}
                            <div className="md:hidden w-full pl-11 -mt-2">
                                <div className="text-xs text-gray-500">{p.testName}</div>
                            </div>

                            {/* ACTION BUTTON */}
                            <div className="w-full md:w-auto text-right mt-2 md:mt-0 pl-11 md:pl-0">
                                {p.status !== 'Processed' ? (
                                    <button
                                        onClick={() => handleAnalyzeSpecific(p.id, p.patientName)}
                                        className="w-full md:w-auto justify-center bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-2 md:py-1.5 rounded-lg shadow-blue-100 shadow-md transition-all flex items-center gap-1.5 ml-auto"
                                    >
                                        <Play size={10} fill="currentColor" /> ANALYZE
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleDownload(p.id)}
                                        className="w-full md:w-auto justify-center bg-white hover:bg-gray-50 text-gray-500 border border-gray-200 text-[10px] font-bold px-3 py-2 md:py-1.5 rounded-lg transition-all flex items-center gap-1.5 ml-auto hover:shadow-sm"
                                    >
                                        <FileText size={10} /> VIEW
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            );

            setMessages(prev => [...prev, { id: Date.now(), sender: 'agent', text: isSystemAction ? "Current Ward Queue:" : "Here is the updated list, Doctor:", type: 'component', component: <PatientList /> }]);
            setIsTyping(false);
            return;
        }

        // --- COMMAND: ANALYZE / SCAN (General) ---
        if (lowerText.includes("scan") || lowerText.includes("analyze") || lowerText.includes("start")) {
            // FIND NEXT PENDING
            const pending = queue.find(p => p.status === 'Pending' || p.status === 'In-progress');

            if (pending) {
                handleAnalyzeSpecific(pending.id, pending.patientName);
                return;
            } else {
                setMessages(prev => [...prev, { id: Date.now(), sender: 'agent', text: "All patients have been processed. The queue is clear, Doctor.", type: 'text' }]);
                setIsTyping(false);
                return;
            }
        }

        else {
            await new Promise(r => setTimeout(r, 1000));
            setMessages(prev => [...prev, { id: Date.now(), sender: 'agent', text: "I'm standing by. You can select a patient from the list or ask to 'Show Queue' again.", type: 'text' }]);
            setIsTyping(false);
        }
    };

    // New Specific Analysis Handler
    const handleAnalyzeSpecific = async (id: string, name: string) => {
        setIsTyping(true);
        setMessages(prev => [...prev,
        { id: Date.now(), sender: 'user', text: `Analyze report for ${name}`, type: 'text' },
        { id: Date.now() + 1, sender: 'agent', text: `Accessing secure records for ${name}...`, type: 'text' }
        ]);

        try {
            const res = await fetch(`http://localhost:8000/api/analyze/${id}`, { method: 'POST' });
            const report = await res.json();

            setMessages(prev => [...prev, { id: Date.now() + 2, sender: 'agent', text: `Analysis complete.`, type: 'report', reportData: report }]);
            setQueue(prev => prev.map(p => p.id === report.id ? report : p));

            // Contextual Follow-up
            setTimeout(() => {
                const risk = report.aiAnalysis?.riskLevel;
                if (risk === "Critical") {
                    setMessages(prev => [...prev, { id: Date.now() + 3, sender: 'agent', text: "⚠️ This is a CRITICAL result. I have flagged this for immediate review. Do you want me to alert the on-call specialist?", type: 'text' }]);
                } else if (risk === "Urgent") {
                    setMessages(prev => [...prev, { id: Date.now() + 3, sender: 'agent', text: "⚠️ Significant findings detected. Report saved for review.", type: 'text' }]);
                } else {
                    setMessages(prev => [...prev, { id: Date.now() + 3, sender: 'agent', text: "✅ Routine result. Report saved.", type: 'text' }]);
                }
                handleDownload(report.id);
            }, 1000);

        } catch (e) {
            setMessages(prev => [...prev, { id: Date.now(), sender: 'system', text: "Analysis Failed.", type: 'text' }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleDownload = (id: string) => {
        window.open(`http://localhost:8000/api/download/${id}`, '_blank');
    };

    const renderReport = (report: PatientReport) => {
        const risk = report.aiAnalysis?.riskLevel || "Routine";
        // Light mode colors for report card
        const color = risk === "Critical" ? "bg-red-50 border-red-200 text-red-700" : (risk === "Urgent" ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-green-50 border-green-200 text-green-700");
        const iconColor = risk === "Critical" ? "text-red-500" : (risk === "Urgent" ? "text-orange-500" : "text-green-500");

        return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 min-w-[260px] max-w-full">
                <div className={`p-4 rounded-xl border ${color} shadow-sm relative overflow-hidden bg-white`}>

                    <div className="flex justify-between items-start mb-3 relative z-10">
                        <div className={`flex items-center gap-2 font-bold uppercase tracking-wide text-xs ${iconColor}`}>
                            {risk === "Critical" && <ShieldAlert size={16} className="animate-pulse" />}
                            {risk === "Urgent" && <AlertTriangle size={16} />}
                            {risk === "Routine" && <CheckCircle size={16} />}
                            {risk} Alert
                        </div>
                        <div className="bg-white px-2 py-1 rounded text-[9px] font-mono border border-gray-100 text-gray-500 shadow-sm">
                            {report.aiAnalysis?.policyLevel}
                        </div>
                    </div>

                    <p className="text-gray-700 text-sm font-medium mb-3 leading-relaxed relative z-10">
                        {report.aiAnalysis?.summary}
                    </p>

                    <div className="bg-gray-50 p-2 rounded-lg text-[10px] font-mono text-gray-500 border border-gray-100 relative z-10">
                        <Zap size={10} className="inline mr-1 text-yellow-500" />
                        POLICY: "{report.aiAnalysis?.policyRule.substring(0, 50)}..."
                    </div>
                </div>

                <div className="flex gap-2 justify-end mt-1">
                    <button onClick={() => handleDownload(report.id)} className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-600 rounded-lg text-[10px] font-bold transition-all border border-gray-200 hover:shadow-sm">
                        <Download size={12} /> Detailed Report
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="h-full bg-[#F8FAFC] text-gray-800 flex flex-col font-sans selection:bg-blue-100 overflow-hidden">

            {/* Header */}
            <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center px-6 justify-between shrink-0 z-20 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-blue-200 shadow-lg">
                            <Bot size={24} />
                        </div>
                        <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900 tracking-tight text-lg">Neuro-Foundation <span className="text-blue-600 font-light">Agent</span></h1>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                            Live Clinical Triage
                        </div>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth custom-scrollbar-light" ref={scrollRef}>
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={msg.id}
                            className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >

                            {/* Avatar for Agent */}
                            {msg.sender === 'agent' && (
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 mr-4 mt-1 shrink-0 shadow-md border border-gray-100">
                                    <Bot size={18} />
                                </div>
                            )}

                            {/* Message Bubble */}
                            <div className={`
                        relative max-w-[85%] md:max-w-[80%] rounded-2xl p-4 shadow-sm
                        ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-sm shadow-blue-200 shadow-md' : ''}
                        ${msg.sender === 'agent' ? 'bg-white border border-gray-200 rounded-tl-sm text-gray-700 shadow-sm' : ''}
                        ${msg.type === 'log' ? 'bg-transparent border-0 !p-0 !max-w-full !shadow-none w-full flex justify-center my-2' : ''}
                    `}>
                                {msg.type === 'text' && <p className="leading-relaxed">{msg.text}</p>}

                                {msg.type === 'component' && (
                                    <div>
                                        <p className="mb-4 text-sm text-gray-500">{msg.text}</p>
                                        {msg.component}
                                    </div>
                                )}

                                {msg.type === 'log' && (
                                    <div className="flex items-center gap-3 text-[10px] text-gray-400 font-mono bg-gray-100 px-3 py-1 rounded-full border border-gray-200 opacity-90">
                                        <Activity size={10} className="text-blue-500 animate-spin" />
                                        <span>{msg.text}</span>
                                    </div>
                                )}

                                {msg.type === 'report' && msg.reportData && renderReport(msg.reportData)}
                            </div>

                            {/* Avatar for User */}
                            {msg.sender === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 ml-4 mt-1 shrink-0 border border-gray-200 shadow-sm">
                                    <User size={16} />
                                </div>
                            )}

                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full justify-start pl-14">
                        <div className="bg-white border border-gray-100 rounded-full px-4 py-3 flex gap-1.5 items-center shadow-md">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0 sticky bottom-0 z-30">
                <div className="relative group">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>

                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask the agent to scan database..."
                        className="relative w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-6 pr-14 text-gray-900 focus:outline-none focus:border-blue-300 focus:bg-white transition-all shadow-inner focus:shadow-lg focus:shadow-blue-50 text-base placeholder-gray-400 z-10"
                        disabled={isTyping}
                        autoFocus
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!inputValue.trim() || isTyping}
                        className="absolute right-3 top-3 p-2 bg-blue-600 rounded-xl text-white hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-md hover:shadow-lg shadow-blue-200 z-20"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <div className="text-center text-[10px] text-gray-400 mt-3 flex items-center justify-center gap-2">
                    <AlertCircle size={10} />
                    <span>AI Analysis based on Hospital Protocols v2024.2. Verify critical results manually.</span>
                </div>
            </div>

        </div>
    );
};
