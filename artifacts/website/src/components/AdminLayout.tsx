import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetAdminMe, useAdminLogout } from "@workspace/api-client-react";
import {
  LayoutDashboard, FileText, Users, Newspaper, Calendar,
  Trophy, Briefcase, FileCheck, FolderOpen, Calculator,
  MessageSquare, Settings, LogOut, ChevronRight, Menu, X
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
  const [navOpen, setNavOpen] = useState(false);

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
    <div className="min-h-screen flex bg-ink">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between bg-panel border-b border-line px-4 py-3">
        <p className="text-brand text-xs uppercase tracking-widest">NP Inc Admin</p>
        <button onClick={() => setNavOpen(o => !o)} aria-label={navOpen ? "Close menu" : "Open menu"} className="text-fog hover:text-paper p-1">
          {navOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar — drawer on mobile, fixed column on lg+ */}
      {navOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setNavOpen(false)} />
      )}
      <aside
        className={`bg-panel border-r border-line flex-col shrink-0 z-50 flex
          fixed inset-y-0 left-0 w-64 transform transition-transform lg:static lg:transform-none
          ${navOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        data-testid="admin-sidebar"
      >
        <div className="px-6 py-6 border-b border-line">
          <p className="text-brand text-xs uppercase tracking-widest mb-1">NP Inc Admin</p>
          {me && <p className="text-fog text-sm">{me.username}</p>}
        </div>

        <nav className="flex-1 py-4 overflow-y-auto" onClick={() => setNavOpen(false)}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location === href || (href !== "/admin" && location.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                data-testid={`link-admin-${label.toLowerCase().replace(/\s+/g, "-")}`}
                className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  active
                    ? "bg-brand/10 text-brand border-r-2 border-brand"
                    : "text-fog hover:text-paper hover:bg-line/50"
                }`}
              >
                <Icon size={16} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-line">
          <Link
            href="/"
            className="flex items-center gap-3 px-2 py-2 text-sm text-fog hover:text-paper transition-colors mb-2"
          >
            ← View Public Site
          </Link>
          <button
            onClick={handleLogout}
            data-testid="button-logout"
            className="flex items-center gap-3 w-full px-2 py-2 text-sm text-fog hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-auto pt-14 lg:pt-0">
        {children}
      </div>
    </div>
  );
}
