import React from "react";
import { FileText } from "lucide-react";
import { cn } from "../lib/utils";

interface ConsultantReportCardProps {
    title: string;
    subTitle?: string;
    patientName: string;
    patientId: string;
    age: number;
    gender: string;
    requestedDate: string;
    uploadedDate: string;
    status: "Critical" | "New" | "Completed" | "Pending";
    onViewReport?: () => void;
}

const ConsultantReportCard: React.FC<ConsultantReportCardProps> = ({
    title,
    subTitle,
    patientName,
    patientId,
    age,
    gender,
    requestedDate,
    uploadedDate,
    status,
    onViewReport,
}) => {
    // Map status to widget status colors
    const getStatusColor = (s: string) => {
        switch (s) {
            case "Critical": return "bg-red-50 text-red-600 border-red-200";
            case "New": return "bg-green-50 text-green-600 border-green-200";
            case "Completed": return "bg-green-50 text-green-600 border-green-200";
            case "Pending": return "bg-yellow-50 text-yellow-600 border-yellow-200";
            default: return "bg-gray-50 text-gray-600 border-gray-200";
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col w-full group">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 flex-1">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-100 transition-colors">
                        <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                        <h3 className="font-bold text-gray-900 leading-tight text-sm truncate">
                            {title}
                        </h3>
                        {subTitle && (
                            <p className="text-xs font-medium text-gray-500 mt-1 truncate">
                                {subTitle}
                            </p>
                        )}
                    </div>
                </div>
                <div className="shrink-0">
                    <span className={cn("px-2 py-1 rounded text-[10px] uppercase font-bold border", getStatusColor(status))}>
                        {status}
                    </span>
                </div>
            </div>

            {/* Patient Info */}
            <div className="mb-4">
                <h4 className="font-bold text-gray-900 text-sm">{patientName}</h4>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 font-medium bg-gray-100 px-1.5 py-0.5 rounded">{patientId}</span>
                    <span className="text-xs text-gray-500 border-l border-gray-200 pl-2">{age} yrs / {gender}</span>
                </div>
            </div>

            <hr className="border-gray-50 mb-3 mt-auto" />

            {/* Dates */}
            <div className="space-y-2 mb-5">
                <div className="flex justify-between text-[11px] items-center">
                    <span className="text-gray-400 font-medium">Requested</span>
                    <span className="text-gray-600 font-semibold">{requestedDate}</span>
                </div>
                <div className="flex justify-between text-[11px] items-center">
                    <span className="text-gray-400 font-medium">Uploaded</span>
                    <span className="text-gray-600 font-semibold">{uploadedDate}</span>
                </div>
            </div>

            {/* Action Button */}
            <div>
                <button
                    onClick={onViewReport}
                    className="w-full py-2 rounded-lg border border-blue-500 text-blue-600 text-xs font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                    View report
                </button>
            </div>
        </div>
    );
};

export default ConsultantReportCard;
