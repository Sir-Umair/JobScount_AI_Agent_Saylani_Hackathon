'use client';

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  TrendingUp, 
  Settings, 
  LogOut,
  BrainCircuit,
  Bell,
  ChevronRight
} from "lucide-react";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const handleExit = () => {
    localStorage.removeItem('jobscout_cvText');
    localStorage.removeItem('jobscout_profile');
    localStorage.removeItem('jobscout_cvId');
    localStorage.removeItem('jobscout_step');
    localStorage.removeItem('jobscout_dashboard_stats');
  };

  const getBreadcrumb = () => {
    if (pathname === '/dashboard') return 'Intelligence Center';
    if (pathname === '/dashboard/jobs') return 'Scout Agent';
    if (pathname === '/dashboard/resume') return 'Resume Auditor';
    if (pathname === '/dashboard/saved') return 'Saved Matches';
    if (pathname === '/dashboard/settings') return 'Agent Configuration';
    return 'Dashboard';
  };

  const navLinks = [
    { href: '/dashboard', label: 'Intelligence', icon: LayoutDashboard },
    { href: '/dashboard/jobs', label: 'Scout', icon: Search },
    { href: '/dashboard/resume', label: 'Auditor', icon: FileText },
    { href: '/dashboard/saved', label: 'Saved', icon: TrendingUp },
  ];

  return (
    <AuthGuard>
      <div className="flex h-screen bg-[#0A0A0A] text-neutral-400 overflow-hidden relative">
        {/* Enterprise Sidebar (Desktop only) */}
        <aside className="w-64 border-r border-white/5 flex-col hidden md:flex flex-shrink-0">
          <div className="p-6 mb-8 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BrainCircuit size={18} className="text-white" />
            </div>
            <span className="font-bold text-white tracking-tighter">JobScout</span>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all group ${
                    isActive ? 'bg-white/10 text-white' : 'text-neutral-500 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <link.icon size={18} className={isActive ? 'text-blue-500' : ''} /> {link.label === 'Intelligence' ? 'Intelligence Center' : link.label === 'Auditor' ? 'Resume Auditor' : link.label === 'Saved' ? 'Saved Jobs' : 'Scout Agent'}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/5 space-y-1">
            <Link 
              href="/dashboard/settings" 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                pathname === '/dashboard/settings' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Settings size={18} /> Settings
            </Link>
            <Link href="/" onClick={handleExit} className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all text-neutral-500">
              <LogOut size={18} /> Exit Dashboard
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0">
          {/* Navbar */}
          <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-neutral-900/10 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-white">
              <span className="text-neutral-500 hidden sm:inline">Dashboard</span>
              <ChevronRight size={14} className="text-neutral-600 hidden sm:inline" />
              <span>{getBreadcrumb()}</span>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <div className="flex items-center gap-2 pl-2">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/10" />
                <div className="block">
                  <div className="text-[9px] md:text-[11px] font-black text-white leading-none mb-1">SMIT STUDENT</div>
                  <div className="text-[8px] md:text-[10px] font-bold text-neutral-500 tracking-wider">PREMIUM PLAN</div>
                </div>
              </div>
            </div>
          </header>

          {/* Scrollable Viewport */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar">
            {children}
          </div>
        </main>

        {/* Sleek Glassy Bottom Navigation Bar for Mobile Devices */}
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-lg border-t border-white/5 flex items-center justify-around px-2 z-50 md:hidden">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${
                  isActive ? 'text-blue-500' : 'text-neutral-500'
                }`}
              >
                <link.icon size={20} className={isActive ? 'scale-110' : ''} />
                <span className="text-[9px] font-bold uppercase tracking-wider">{link.label}</span>
              </Link>
            );
          })}
          <Link 
            href="/dashboard/settings" 
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${
              pathname === '/dashboard/settings' ? 'text-blue-500' : 'text-neutral-500'
            }`}
          >
            <Settings size={20} className={pathname === '/dashboard/settings' ? 'scale-110' : ''} />
            <span className="text-[9px] font-bold uppercase tracking-wider">Settings</span>
          </Link>
        </nav>
      </div>
    </AuthGuard>
  );
}
