import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Brain, Activity, Phone, FileText, ArrowRight, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

export interface PatientReport {
    id: string;
    patientName: string;
    age: number;
    testName: string;
    status: "Pending" | "In-progress" | "Processed";
    aiAnalysis?: {
        riskLevel: "Routine" | "Urgent" | "Critical";
        policyLevel: "Level 1" | "Level 2" | "Level 3" | "Level 4" | "Level 5";
        summary: string;
        policyRule: string;
        childAnalogy: string;
        findings: string[];
    };
}

export interface PatientCardProps {
    report: PatientReport;
    onAction: (action: string, id: string) => void;
}

const RiskBadge = ({ level }: { level: string }) => {
    const styles = {
        Routine: "bg-neuro-success/10 text-neuro-success border-neuro-success/20",
        Urgent: "bg-neuro-warning/10 text-neuro-warning border-neuro-warning/20 animate-pulse",
        Critical: "bg-neuro-danger/10 text-neuro-danger border-neuro-danger/50 animate-pulse-glow",
    };

    const icons = {
        Routine: CheckCircle,
        Urgent: AlertTriangle,
        Critical: ShieldAlert,
    };

    const Icon = icons[level as keyof typeof icons] || Activity;

    return (
        <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-semibold uppercase tracking-wider", styles[level as keyof typeof styles])}>
            <Icon size={16} />
            <span>{level}</span>
        </div>
    );
};

export const PatientCard: React.FC<PatientCardProps> = ({ report, onAction }) => {
    const isCritical = report.aiAnalysis?.riskLevel === "Critical";

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={cn(
                "glass-panel rounded-2xl overflow-hidden w-full max-w-4xl mx-auto mb-6 relative group",
                isCritical ? "border-neuro-danger/60 shadow-[0_0_50px_rgba(239,68,68,0.2)]" : "hover:border-neuro-accent/50 transition-colors"
            )}
        >
            {/* Absolute Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-neuro-card/50 pointer-events-none" />
            {isCritical && <div className="absolute inset-0 bg-neuro-danger/5 animate-pulse pointer-events-none" />}

            {/* Header */}
            <div className="relative p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-white/10 shadow-inner">
                        <span className="text-xl font-bold text-gray-300">{report.patientName.charAt(0)}</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">{report.patientName}</h2>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <span>Age {report.age}</span>
                            <span>•</span>
                            <span className="text-neuro-accent">{report.testName}</span>
                            <span>•</span>
                            <span className="font-mono text-xs opacity-70">ID: {report.id}</span>
                        </div>
                    </div>
                </div>

                {report.aiAnalysis && <RiskBadge level={report.aiAnalysis.riskLevel} />}
            </div>

            {/* Main Content */}
            <div className="relative p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left Col: Clinical Data & Policy */}
                <div className="space-y-4">
                    <div className="glass-card p-4 rounded-xl border-l-2 border-neuro-primary">
                        <h3 className="text-neuro-primary text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                            <FileText size={14} /> Hospital Policy
                        </h3>
                        <div className="font-mono text-sm text-gray-300 bg-black/30 p-3 rounded-lg border border-white/5 relative overflow-hidden">
                            {/* "Code block" effect */}
                            <div className="absolute top-0 left-0 w-1 h-full bg-neuro-primary/50" />
                            "{report.aiAnalysis?.policyRule}"
                        </div>
                        <div className="mt-2 text-xs text-gray-500 text-right">
                            Matched: {report.aiAnalysis?.policyLevel}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Clinical Findings</h3>
                        <ul className="space-y-1">
                            {report.aiAnalysis?.findings.map((finding, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                                    <span className="text-neuro-accent mt-1">▹</span> {finding}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right Col: AI Reasoning (The "Brain") */}
                <div className="space-y-4">
                    <div className="glass-card p-5 rounded-xl border border-neuro-accent/20 bg-gradient-to-b from-neuro-accent/5 to-transparent">
                        <h3 className="text-neuro-accent text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Brain size={14} /> AI Analysis
                        </h3>
                        <p className="text-lg text-white font-medium leading-relaxed">
                            {report.aiAnalysis?.childAnalogy}
                        </p>
                        <div className="mt-4 pt-4 border-t border-white/5">
                            <p className="text-sm text-gray-400">
                                <span className="font-bold text-gray-200">Summary:</span> {report.aiAnalysis?.summary}
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Action Footer */}
            <div className="relative p-4 md:p-6 bg-black/20 border-t border-white/5 flex flex-wrap gap-3 justify-end">
                {isCritical && (
                    <button
                        onClick={() => onAction('call', report.id)}
                        className="px-6 py-2.5 rounded-lg bg-neuro-danger hover:bg-red-600 text-white font-bold shadow-lg shadow-red-900/20 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Phone size={18} /> Call Patient Now
                    </button>
                )}
                <button
                    onClick={() => onAction('escalate', report.id)}
                    className="px-6 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium border border-white/10 flex items-center gap-2 transition-all active:scale-95"
                >
                    Escalate Case
                </button>
                <button
                    onClick={() => onAction('approve', report.id)}
                    className="px-6 py-2.5 rounded-lg bg-neuro-primary hover:bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all active:scale-95"
                >
                    Approve Actions <ArrowRight size={18} />
                </button>
            </div>
        </motion.div>
    );
};
