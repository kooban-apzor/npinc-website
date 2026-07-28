import { useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useGetAdminMe, useAdminLogout } from "@workspace/api-client-react";
import {
  LayoutDashboard, FileText, Users, Newspaper, Calendar,
  Trophy, Briefcase, FileCheck, FolderOpen, Calculator,
  MessageSquare, Settings, LogOut, ChevronRight
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/site-settings", label: "Site Settings", icon: Settings },
  { href: "/admin/services", label: "Practice Areas", icon: Briefcase },
  { href: "/admin/people", label: "People", icon: Users },
  { href: "/admin/articles", label: "Insights", icon: Newspaper },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/awards", label: "Awards", icon: Trophy },
  { href: "/admin/vacancies", label: "Vacancies", icon: FileText },
  { href: "/admin/cv-submissions", label: "CV Submissions", icon: FileCheck },
  { href: "/admin/documents", label: "Documents", icon: FolderOpen },
  { href: "/admin/calculator-rates", label: "Calculator Rates", icon: Calculator },
  { href: "/admin/enquiries", label: "Enquiries", icon: MessageSquare },
];

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { data: me, isError } = useGetAdminMe({ query: { queryKey: ['admin-me'], retry: false, staleTime: Infinity, refetchOnWindowFocus: false } });
  const logout = useAdminLogout();
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Silently go home when the server says the session is no longer valid
  useEffect(() => {
    if (isError) {
      window.location.replace("/");
    }
  }, [isError]);

  // 30-minute idle timer — reset on any user activity, redirect home silently when it fires
  useEffect(() => {
    const resetTimer = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        window.location.replace("/");
      }, IDLE_TIMEOUT_MS);
    };

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
    events.forEach(ev => window.addEventListener(ev, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      events.forEach(ev => window.removeEventListener(ev, resetTimer));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => { window.location.replace("/"); }
    });
  };

  return (
    <div className="min-h-screen flex bg-[#0E0E0E]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#151515] border-r border-[#2A2A2A] flex flex-col shrink-0" data-testid="admin-sidebar">
        <div className="px-6 py-6 border-b border-[#2A2A2A]">
          <p className="text-[#C6A15B] text-xs uppercase tracking-widest font-semibold mb-1">NP Inc Admin</p>
          {me && <p className="text-[#B8B8B8] text-sm">{me.username}</p>}
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location === href || (href !== "/admin" && location.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                data-testid={`link-admin-${label.toLowerCase().replace(/\s+/g, "-")}`}
                className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  active
                    ? "bg-[#C6A15B]/10 text-[#C6A15B] border-r-2 border-[#C6A15B]"
                    : "text-[#B8B8B8] hover:text-[#F7F4EE] hover:bg-[#2A2A2A]/50"
                }`}
              >
                <Icon size={16} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#2A2A2A]">
          <Link
            href="/"
            className="flex items-center gap-3 px-2 py-2 text-sm text-[#B8B8B8] hover:text-[#F7F4EE] transition-colors mb-2"
          >
            ← View Public Site
          </Link>
          <button
            onClick={handleLogout}
            data-testid="button-logout"
            className="flex items-center gap-3 w-full px-2 py-2 text-sm text-[#B8B8B8] hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
