import React, { useState, useEffect, useRef } from 'react';
import { type PatientReport } from './PatientCard';
import { Send, Bot, User, Activity, AlertCircle, ShieldAlert, CheckCircle, AlertTriangle, List, FileText, Download, Play, Zap } from 'lucide-react';
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

export const Dashboard: React.FC = () => {
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

            const getStatusColor = (status: string) => {
                const s = status.toLowerCase();
                if (s === 'pending') return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
                if (s.includes('progress')) return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
                return 'text-green-500 border-green-500/30 bg-green-500/10';
            };

            const PatientList = () => (
                <div className="flex flex-col gap-2 min-w-[280px] md:min-w-[600px] w-full mt-2">
                    {/* Header */}
                    <div className="grid grid-cols-[30px_1fr_100px_80px] gap-4 px-4 py-2 border-b border-gray-800 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                        <div>#</div>
                        <div>Patient Details</div>
                        <div>Status</div>
                        <div className="text-right">Action</div>
                    </div>

                    {queue.map((p) => (
                        <div key={p.id} className="grid grid-cols-[30px_1fr_100px_80px] gap-4 items-center bg-[#1a1a1a] p-3 rounded-lg border border-white/5 hover:bg-[#222] transition-colors group">

                            {/* Avatar/Initial */}
                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 group-hover:bg-gray-700 transition-colors">
                                {p.patientName.charAt(0)}
                            </div>

                            {/* Details */}
                            <div className="min-w-0">
                                <div className="font-bold text-gray-200 text-sm flex items-center gap-2">
                                    {p.patientName}
                                    {p.age > 60 && <span className="text-[9px] bg-red-900/40 text-red-400 px-1.5 rounded border border-red-900/50">HIGH RISK AGE</span>}
                                </div>
                                <div className="text-[11px] text-gray-500">{p.testName}</div>
                            </div>

                            {/* Status Badge */}
                            <div>
                                <span className={`text-[10px] font-mono px-2 py-1 rounded border inline-flex items-center gap-1.5 ${getStatusColor(p.status)}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'Pending' ? 'bg-yellow-500 animate-pulse' : 'bg-current'}`}></div>
                                    {p.status.toUpperCase()}
                                </span>
                            </div>

                            {/* ACTION BUTTON */}
                            <div className="text-right">
                                {p.status !== 'Processed' ? (
                                    <button
                                        onClick={() => handleAnalyzeSpecific(p.id, p.patientName)}
                                        className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-md shadow-lg shadow-blue-900/20 transition-all flex items-center gap-1 ml-auto"
                                    >
                                        <Play size={10} fill="currentColor" /> ANALYZE
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleDownload(p.id)}
                                        className="bg-[#222] hover:bg-[#333] text-gray-400 border border-gray-700 text-[10px] font-bold px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ml-auto"
                                    >
                                        <FileText size={10} /> VIEW
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            );

            // We need to render this component via state to React, but here we are in a text-based message flow.
            // We'll wrap it in a function we can call in the render loop or just pass the component node.
            // For this simple demo, we will pass the component directly.
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

        const color = risk === "Critical" ? "bg-red-500/10 border-red-500 text-red-400" : (risk === "Urgent" ? "bg-orange-500/10 border-orange-500 text-orange-400" : "bg-green-500/10 border-green-500 text-green-400");

        return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 min-w-[300px] md:min-w-[420px]">
                <div className={`p-5 rounded-xl border ${color} shadow-2xl relative overflow-hidden`}>
                    {/* Subtle Grid BG */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="flex items-center gap-2 font-bold uppercase tracking-wide text-sm">
                            {risk === "Critical" && <ShieldAlert size={20} className="animate-pulse" />}
                            {risk === "Urgent" && <AlertTriangle size={20} />}
                            {risk === "Routine" && <CheckCircle size={20} />}
                            {risk} Alert
                        </div>
                        <div className="bg-black/40 px-2 py-1 rounded text-[10px] font-mono border border-white/10">
                            {report.aiAnalysis?.policyLevel}
                        </div>
                    </div>

                    <p className="text-white text-base font-medium mb-4 leading-relaxed relative z-10">
                        {report.aiAnalysis?.summary}
                    </p>

                    <div className="bg-black/30 p-3 rounded-lg text-xs font-mono text-gray-400 border border-white/5 relative z-10">
                        <Zap size={10} className="inline mr-1 text-yellow-500" />
                        POLICY MATCH: "{report.aiAnalysis?.policyRule}"
                    </div>
                </div>

                <div className="bg-[#1a1a1a] p-4 rounded-xl text-sm text-gray-300 flex gap-3 items-start border border-[#333]">
                    <Bot size={18} className="text-blue-400 mt-1 shrink-0" />
                    <div>
                        <span className="font-bold text-gray-400 block mb-1 text-xs uppercase">Explained for Patient:</span>
                        "{report.aiAnalysis?.childAnalogy}"
                    </div>
                </div>

                <div className="flex gap-2 justify-end mt-1">
                    <button onClick={() => handleDownload(report.id)} className="flex items-center gap-2 px-4 py-2 bg-[#222] hover:bg-[#333] text-gray-200 rounded-lg text-xs font-bold transition-all border border-gray-700">
                        <Download size={14} /> Official Report
                    </button>
                    {risk === "Critical" && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-red-900/50 transition-all animate-pulse">
                            <Activity size={14} /> ESCLATE
                        </button>
                    )}
                </div>
            </motion.div>
        );
    }

    return (
        <div className="h-screen bg-[#050505] text-gray-200 flex flex-col font-sans selection:bg-blue-500/30 overflow-hidden">

            {/* Header */}
            <header className="h-16 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#222] flex items-center px-6 justify-between shrink-0 shadow-lg z-20">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-blue-900/20 shadow-lg">
                            <Bot size={24} />
                        </div>
                        <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                    </div>
                    <div>
                        <h1 className="font-bold text-white tracking-tight text-lg">Neuro-Foundation <span className="text-blue-500 font-light">Agent</span></h1>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-medium">
                            Live Clinical Triage
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 bg-[#111] px-3 py-1.5 rounded-full border border-[#222]">
                        <Activity size={12} className="text-green-500" />
                        <span>System Stable</span>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth custom-scrollbar" ref={scrollRef}>
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
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mr-4 mt-1 shrink-0 shadow-lg boader border-blue-400/20">
                                    <Bot size={16} />
                                </div>
                            )}

                            {/* Message Bubble */}
                            <div className={`
                        relative max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm
                        ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-sm shadow-blue-900/20' : ''}
                        ${msg.sender === 'agent' ? 'bg-[#151515] border border-[#333] rounded-tl-sm shadow-xl' : ''}
                        ${msg.type === 'log' ? 'bg-transparent border-0 !p-0 !max-w-full !shadow-none w-full flex justify-center my-2' : ''}
                    `}>
                                {msg.type === 'text' && <p className="leading-relaxed">{msg.text}</p>}

                                {msg.type === 'component' && (
                                    <div>
                                        <p className="mb-4 text-sm text-gray-400">{msg.text}</p>
                                        {msg.component}
                                    </div>
                                )}

                                {msg.type === 'log' && (
                                    <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono bg-[#111] px-3 py-1 rounded-full border border-[#222] opacity-70">
                                        <Activity size={10} className="text-blue-500 animate-spin" />
                                        <span>{msg.text}</span>
                                    </div>
                                )}

                                {msg.type === 'report' && msg.reportData && renderReport(msg.reportData)}
                            </div>

                            {/* Avatar for User */}
                            {msg.sender === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white ml-4 mt-1 shrink-0 border border-gray-700">
                                    <User size={16} />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full justify-start pl-14">
                        <div className="bg-[#151515] border border-[#333] rounded-full px-4 py-3 flex gap-1.5 items-center shadow-lg">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </motion.div>
                )}

                <div className="h-4"></div>
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-[#0a0a0a] border-t border-[#222] shrink-0 sticky bottom-0 z-30">

                {/* Quick Actions */}
                <div className="w-full max-w-7xl mx-auto flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                    <button onClick={() => handleSend("Show Queue")} className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] rounded-full text-xs text-gray-300 transition-colors whitespace-nowrap">
                        <List size={14} className="text-blue-500" /> Show Queue
                    </button>
                    <button onClick={() => handleSend("Start Analysis")} className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] rounded-full text-xs text-gray-300 transition-colors whitespace-nowrap">
                        <Play size={14} className="text-green-500" /> Start Analysis
                    </button>
                    <button disabled className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-[#333] rounded-full text-xs text-gray-600 cursor-not-allowed whitespace-nowrap">
                        <FileText size={14} /> Upload Report
                    </button>
                </div>

                <div className="w-full max-w-7xl mx-auto relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask the agent to scan database..."
                        className="relative w-full bg-[#111] border border-[#333] rounded-2xl py-4 pl-6 pr-14 text-white focus:outline-none focus:border-blue-500/50 focus:bg-[#151515] transition-all shadow-xl text-base placeholder-gray-600 z-10"
                        disabled={isTyping}
                        autoFocus
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!inputValue.trim() || isTyping}
                        className="absolute right-3 top-3 p-2 bg-blue-600 rounded-xl text-white hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-500/30 z-20"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <div className="text-center text-[10px] text-gray-600 mt-3 flex items-center justify-center gap-2">
                    <AlertCircle size={10} />
                    <span>AI Analysis based on Hospital Protocols v2024.2. Verify critical results manually.</span>
                </div>
            </div>

        </div>
    );
};
