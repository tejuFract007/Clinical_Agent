import React from 'react';

export interface PatientReport {
    id: string;
    patientName: string;
    age: number;
    testName: string;
    status: 'Pending' | 'In-progress' | 'Processed' | 'Failed';
    raw_data?: any;
    history?: any;
    aiAnalysis?: {
        riskLevel: string;
        policyLevel: string;
        summary: string;
        policyRule: string;
        childAnalogy?: string;
        findings?: string[];
    };
}

export const PatientCard: React.FC<{ report: PatientReport }> = ({ report }) => {
    return (
        <div className="p-4 border rounded shadow-sm">
            <h3 className="font-bold">{report.patientName}</h3>
            <p>{report.testName}</p>
            <p className="text-sm text-gray-500">{report.status}</p>
        </div>
    );
};

export default PatientCard;
