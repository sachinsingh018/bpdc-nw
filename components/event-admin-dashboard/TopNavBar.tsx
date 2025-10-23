import { Bell, ChevronDown, User } from 'lucide-react';

export default function TopNavBar() {
    return (
        <nav className="w-full flex items-center justify-between px-4 py-3 bg-purple-700 text-white shadow-md">
            <div className="flex items-center gap-4">
                <span className="font-bold text-lg">NetworkQY Event</span>
                <button type="button" className="flex items-center gap-1 bg-purple-800 px-2 py-1 rounded hover:bg-purple-900">
                    <span>Switch Event</span>
                    <ChevronDown size={16} />
                </button>
            </div>
            <div className="flex items-center gap-6">
                <button type="button" className="relative">
                    <Bell size={22} />
                    <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3 border-2 border-white" />
                </button>
                <div className="relative group">
                    <button type="button" className="flex items-center gap-2 bg-purple-800 px-2 py-1 rounded hover:bg-purple-900">
                        <User size={20} />
                        <span>Admin</span>
                        <ChevronDown size={16} />
                    </button>
                    {/* Dropdown placeholder */}
                    <div className="hidden group-hover:block absolute right-0 mt-2 w-40 bg-white text-purple-900 rounded shadow-lg z-10">
                        <a href="/profile" className="block px-4 py-2 hover:bg-purple-100">Profile</a>
                        <a href="/logout" className="block px-4 py-2 hover:bg-purple-100">Logout</a>
                    </div>
                </div>
            </div>
        </nav>
    );
} 