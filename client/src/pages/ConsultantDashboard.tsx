import { Search, Bell } from "lucide-react";
import ConsultantReportCard from "../components/ConsultantReportCard";

export const ConsultantDashboardPage = () => {
    return (
        <div className="min-h-screen bg-[#F8FAFC] w-full text-left">
            {/* Header */}
            <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-10">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Consultant Dashboard</h1>
                    <p className="text-xs text-gray-500 mt-1">Welcome back, Dr. Sarah Wilson</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative hidden md:block group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search patients..."
                            className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                        />
                    </div>

                    <button className="relative p-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>
                </div>
            </header>

            <div className="p-8 max-w-7xl mx-auto space-y-8">

                {/* 1. Alerts Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-gray-900">Priority Alerts</h2>
                            <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded border border-red-100">2 CRITICAL</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ConsultantReportCard
                            title="Chest X-Ray - PA"
                            subTitle="Possible Pneumonia"
                            patientName="Robert Chen"
                            patientId="#FE1243"
                            age={47}
                            gender="M"
                            requestedDate="04/01/26 | 12:42 pm"
                            uploadedDate="Today | 02:42 pm"
                            status="Critical"
                        />
                        <ConsultantReportCard
                            title="Blood Chemistry"
                            subTitle="High Potassium"
                            patientName="Amanda Knox"
                            patientId="#AK9921"
                            age={32}
                            gender="F"
                            requestedDate="04/01/26 | 10:00 am"
                            uploadedDate="Today | 11:15 am"
                            status="Critical"
                        />
                        <ConsultantReportCard
                            title="MRI Brain"
                            subTitle="Follow-up"
                            patientName="James Wilson"
                            patientId="#JW8821"
                            age={65}
                            gender="M"
                            requestedDate="03/01/26 | 09:30 am"
                            uploadedDate="Yesterday | 04:00 pm"
                            status="Pending"
                        />
                    </div>
                </section>

                {/* 2. Recent Section */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Recently Updated</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ConsultantReportCard
                            title="CT Scan - Abdomen"
                            subTitle="Routine Check"
                            patientName="Sarah Connor"
                            patientId="#SC5521"
                            age={29}
                            gender="F"
                            requestedDate="04/01/26 | 08:15 am"
                            uploadedDate="Today | 01:30 pm"
                            status="New"
                        />
                        <ConsultantReportCard
                            title="Blood Count (CBC)"
                            patientName="Mike Ross"
                            patientId="#MR1121"
                            age={35}
                            gender="M"
                            requestedDate="04/01/26 | 11:00 am"
                            uploadedDate="Today | 12:45 pm"
                            status="Completed"
                        />
                    </div>
                </section>

                {/* Info Box */}
                <div className="bg-blue-600 text-white rounded-2xl p-6 flex items-center justify-between shadow-lg shadow-blue-200">
                    <div>
                        <h3 className="font-bold text-lg mb-1">AI Clinical Assistant Active</h3>
                        <p className="text-blue-100 text-sm">The Neuro-Foundation Agent is monitoring incoming results in real-time.</p>
                    </div>
                    <button className="bg-white text-blue-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-sm">
                        Open Agent Drawer
                    </button>
                    {/* Note: This button is just visual here, the real trigger is in the Sidebar */}
                </div>

            </div>
        </div>
    );
};
