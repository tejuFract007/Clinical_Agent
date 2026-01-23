import type { FC } from "react";
import {
    LayoutDashboard,
    CalendarDays,
    ClipboardList,
    UsersRound,
    Calendar,
    Settings,
    Bot,
    type LucideIcon
} from "lucide-react";

interface MenuItem {
    icon: LucideIcon;
    label: string;
    path: string;
    action?: () => void;
}

interface SidebarProps {
    onOpenAgent?: () => void;
}

export const Sidebar: FC<SidebarProps> = ({ onOpenAgent }) => {

    // Using current pathname for active state
    const pathname = window.location.pathname;

    const menuItems: MenuItem[] = [
        {
            icon: LayoutDashboard,
            label: "Dashboard",
            path: "/",
        },
        {
            icon: UsersRound,
            label: "Patients",
            path: "/patients",
        },
        {
            icon: CalendarDays,
            label: "Appts",
            path: "/appointments",
        },
        {
            icon: ClipboardList,
            label: "Reports",
            path: "/investigation",
        },
        {
            icon: Calendar,
            label: "Calendar",
            path: "/calendar",
        },
    ];

    return (
        <aside className="w-[90px] h-screen bg-white border-r border-gray-100 flex flex-col items-center py-6 sticky left-0 top-0 z-10 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">

            {/* Logo Placeholder */}
            <div className="mb-10 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-blue-200 shadow-lg">
                N
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-6 w-full items-center">
                {menuItems.map(({ icon: Icon, label, path }) => {
                    const isActive = pathname === path;

                    return (
                        <div
                            key={label}
                            className="flex flex-col items-center gap-1.5 group cursor-pointer w-full"
                        >
                            <div
                                className={`p-2.5 rounded-xl transition-all duration-200 ${isActive
                                    ? "bg-gray-900 text-white shadow-lg shadow-gray-200"
                                    : "text-gray-400 group-hover:bg-gray-50 group-hover:text-gray-600"
                                    }`}
                            >
                                <Icon size={22} className={isActive ? "stroke-[2px]" : "stroke-[1.5px]"} />
                            </div>

                            <span
                                className={`text-[10px] font-medium text-center px-1 leading-tight ${isActive
                                    ? "text-gray-900"
                                    : "text-gray-400 group-hover:text-gray-600"
                                    }`}
                            >
                                {label}
                            </span>
                        </div>
                    );
                })}

                {/* AI Agent Button */}
                <div className="w-full h-px bg-gray-100 my-2" />

                <div
                    onClick={onOpenAgent}
                    className="flex flex-col items-center gap-1.5 group cursor-pointer w-full"
                >
                    <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all hover:-translate-y-0.5">
                        <Bot size={22} className="stroke-[2px]" />
                    </div>
                    <span className="text-[10px] font-bold text-blue-600">AI Agent</span>
                </div>

            </nav>

            {/* Profile */}
            <div className="mt-auto pt-6 flex flex-col gap-4 items-center">
                <div className="text-gray-300 hover:text-gray-500 cursor-pointer">
                    <Settings size={20} />
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
                    <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=100&h=100" className="w-full h-full rounded-full object-cover" alt="Doctor" />
                </div>
            </div>
        </aside>
    );
};
