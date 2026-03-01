"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, Landmark, Receipt, TrendingUp, PiggyBank, LogOut, ChevronsLeft, ChevronsRight, Heart, Users, X, Menu } from "lucide-react";
import { CurrencyProvider, useCurrency } from "@/lib/currency";
import { ImpersonationProvider, useImpersonation } from "@/lib/impersonation";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", color: "bg-gb-yellow" },
  { href: "/dashboard/loans", icon: Landmark, label: "Loans", color: "bg-gb-blue" },
  { href: "/dashboard/bills", icon: Receipt, label: "Bills", color: "bg-gb-orange" },
  { href: "/dashboard/income", icon: TrendingUp, label: "Income", color: "bg-gb-green" },
  { href: "/dashboard/savings", icon: PiggyBank, label: "Savings", color: "bg-gb-purple" },
] as const;

function CurrencyToggle({ collapsed }: { collapsed: boolean }) {
  const { currency, setCurrency } = useCurrency();
  const toggle = () => setCurrency(currency === "PHP" ? "USD" : "PHP");

  return (
    <button
      onClick={toggle}
      title={`Currency: ${currency}`}
      className={`flex items-center gap-3 rounded-md text-gb-bg3 hover:text-gb-bg0 transition-colors ${
        collapsed ? "w-10 h-10 justify-center" : "px-3 py-2"
      }`}
    >
      <span className="text-xs font-bold w-5 text-center">{currency === "PHP" ? "₱" : "$"}</span>
      {!collapsed && <span className="text-sm font-medium">{currency}</span>}
    </button>
  );
}

interface AdminUser {
  id: number;
  username: string;
  email: string | null;
}

function UserPicker({ collapsed, users, currentUserId }: { collapsed: boolean; users: AdminUser[]; currentUserId: number | null }) {
  const { impersonatingUserId, setImpersonating } = useImpersonation();

  return (
    <div className={collapsed ? "w-10" : "w-full px-2"}>
      <div className={`flex items-center gap-2 mb-1 ${collapsed ? "justify-center" : "px-1"}`}>
        <Users size={14} className="text-gb-bg3 shrink-0" />
        {!collapsed && <span className="text-[10px] font-bold text-gb-bg3 uppercase tracking-wide">View as</span>}
      </div>
      {collapsed ? (
        <select
          title="Impersonate user"
          value={impersonatingUserId ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            if (!val) {
              setImpersonating(null);
            } else {
              const u = users.find((u) => u.id === Number(val));
              setImpersonating(Number(val), u?.username);
            }
          }}
          className="w-10 h-8 bg-gb-fg1 text-gb-bg0 text-xs rounded-md border-0 cursor-pointer text-center"
        >
          <option value="">Me</option>
          {users.filter((u) => u.id !== currentUserId).map((u) => (
            <option key={u.id} value={u.id}>{u.username}</option>
          ))}
        </select>
      ) : (
        <select
          value={impersonatingUserId ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            if (!val) {
              setImpersonating(null);
            } else {
              const u = users.find((u) => u.id === Number(val));
              setImpersonating(Number(val), u?.username);
            }
          }}
          className="w-full bg-gb-fg1 text-gb-bg0 text-xs rounded-md px-2 py-1.5 border-0 cursor-pointer"
        >
          <option value="">My Dashboard</option>
          {users.filter((u) => u.id !== currentUserId).map((u) => (
            <option key={u.id} value={u.id}>{u.username}</option>
          ))}
        </select>
      )}
    </div>
  );
}

function ImpersonationBanner() {
  const { impersonatingUsername, setImpersonating } = useImpersonation();
  if (!impersonatingUsername) return null;

  return (
    <div className="bg-gb-yellow text-gb-bg0 px-4 py-2 flex items-center justify-between shrink-0">
      <span className="text-sm font-bold">
        Viewing as: {impersonatingUsername}
      </span>
      <button
        onClick={() => setImpersonating(null)}
        className="flex items-center gap-1 text-sm font-bold hover:opacity-80 transition-opacity"
      >
        <X size={14} />
        Stop
      </button>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [role, setRole] = useState<string>("user");
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const isSuperadmin = role === "superadmin";

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebar-collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.ok ? r.json() : null).then((data) => {
      if (data) {
        setRole(data.role ?? "user");
        setCurrentUserId(data.id);
      }
    });
  }, []);

  useEffect(() => {
    if (!isSuperadmin) return;
    fetch("/api/admin/users").then((r) => r.ok ? r.json() : []).then(setAdminUsers);
  }, [isSuperadmin]);

  const handleLogout = useCallback(() => {
    fetch("/api/auth/logout", { method: "POST" });
    localStorage.setItem("logout", String(Date.now()));
    router.push("/");
  }, [router]);

  // Sync logout across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "logout") router.push("/login");
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        fetch("/api/auth/me").then((res) => {
          if (res.status === 401) router.push("/login");
        });
      }
    };
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  return (
    <div className="h-dvh bg-gb-bg1 flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 bg-gb-fg0 flex items-center justify-between px-4 h-12">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/favicon-32x32.png" alt="FinTrak" width={24} height={24} />
          <span className="text-sm font-bold text-gb-bg0">FinTrak</span>
        </Link>
        <button onClick={() => setDrawerOpen(true)} className="text-gb-bg3 hover:text-gb-bg0 transition-colors">
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-50 bg-black/50 transition-opacity duration-200 ${
          drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Mobile Drawer */}
      <nav
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-[240px] bg-gb-fg0 flex flex-col py-4 overflow-y-auto transition-transform duration-200 ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 mb-6">
          <Link href="/dashboard" onClick={() => setDrawerOpen(false)} className="flex items-center gap-2">
            <Image src="/favicon-32x32.png" alt="FinTrak" width={28} height={28} />
            <span className="text-sm font-bold text-gb-bg0">FinTrak</span>
          </Link>
          <button onClick={() => setDrawerOpen(false)} className="text-gb-bg3 hover:text-gb-bg0 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-1 flex-1 w-full px-2">
          {NAV_ITEMS.map(({ href, icon: Icon, label, color }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                  isActive
                    ? `${color} text-gb-bg0`
                    : "text-gb-bg3 hover:text-gb-bg0"
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            );
          })}
        </div>

        {isSuperadmin && (
          <div className="mb-2">
            <UserPicker collapsed={false} users={adminUsers} currentUserId={currentUserId} />
          </div>
        )}

        <div className="flex flex-col gap-1 w-full px-2">
          <CurrencyToggle collapsed={false} />
          <a
            href="https://ko-fi.com/darwinapolinario"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-md text-gb-red hover:text-gb-red-dim transition-colors px-3 py-2"
          >
            <Heart size={20} className="animate-pulse" fill="currentColor" />
            <span className="text-sm font-medium">Donate</span>
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-md text-gb-bg3 hover:text-gb-bg0 transition-colors px-3 py-2"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </nav>

      {/* Desktop Sidebar — hidden on mobile */}
      <nav
        className={`hidden md:flex bg-gb-fg0 flex-col items-center py-4 shrink-0 transition-all duration-200 ${
          collapsed ? "w-[60px]" : "w-[180px]"
        }`}
      >
        <Link href="/dashboard" className={`mb-6 flex items-center gap-2 ${collapsed ? "" : "w-full px-4"}`}>
          <Image src="/favicon-32x32.png" alt="FinTrak" width={28} height={28} />
          {!collapsed && <span className="text-sm font-bold text-gb-bg0 truncate">FinTrak</span>}
        </Link>

        <div className={`flex flex-col gap-1 flex-1 ${collapsed ? "items-center" : "w-full px-2"}`}>
          {NAV_ITEMS.map(({ href, icon: Icon, label, color }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 rounded-md transition-colors ${
                  collapsed ? "w-10 h-10 justify-center" : "px-3 py-2"
                } ${
                  isActive
                    ? `${color} text-gb-bg0`
                    : "text-gb-bg3 hover:text-gb-bg0"
                }`}
              >
                <Icon size={20} />
                {!collapsed && <span className="text-sm font-medium truncate">{label}</span>}
              </Link>
            );
          })}
        </div>

        {isSuperadmin && (
          <div className={`mb-2 ${collapsed ? "flex justify-center" : ""}`}>
            <UserPicker collapsed={collapsed} users={adminUsers} currentUserId={currentUserId} />
          </div>
        )}

        <div className={`flex flex-col gap-1 ${collapsed ? "items-center" : "w-full px-2"}`}>
          <CurrencyToggle collapsed={collapsed} />
          <a
            href="https://ko-fi.com/darwinapolinario"
            target="_blank"
            rel="noopener noreferrer"
            title="Support FinTrak"
            className={`flex items-center gap-3 rounded-md text-gb-red hover:text-gb-red-dim transition-colors ${
              collapsed ? "w-10 h-10 justify-center" : "px-3 py-2"
            }`}
          >
            <Heart size={20} className="animate-pulse" fill="currentColor" />
            {!collapsed && <span className="text-sm font-medium">Donate</span>}
          </a>
          <button
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`flex items-center gap-3 rounded-md text-gb-bg3 hover:text-gb-bg0 transition-colors ${
              collapsed ? "w-10 h-10 justify-center" : "px-3 py-2"
            }`}
          >
            {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
            {!collapsed && <span className="text-sm font-medium">Collapse</span>}
          </button>
          <button
            onClick={handleLogout}
            title="Logout"
            className={`flex items-center gap-3 rounded-md text-gb-bg3 hover:text-gb-bg0 transition-colors ${
              collapsed ? "w-10 h-10 justify-center" : "px-3 py-2"
            }`}
          >
            <LogOut size={20} />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </nav>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 pt-12 md:pt-0">
        <ImpersonationBanner />
        {children}
      </div>

    </div>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <ImpersonationProvider>
      <CurrencyProvider>
        <Shell>{children}</Shell>
      </CurrencyProvider>
    </ImpersonationProvider>
  );
}
