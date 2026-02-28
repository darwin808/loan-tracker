"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, Landmark, Receipt, TrendingUp, PiggyBank, LogOut, ChevronsLeft, ChevronsRight } from "lucide-react";
import { CurrencyProvider, useCurrency } from "@/lib/currency";

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

function MobileCurrencyToggle() {
  const { currency, setCurrency } = useCurrency();
  const toggle = () => setCurrency(currency === "PHP" ? "USD" : "PHP");

  return (
    <button
      onClick={toggle}
      className="flex flex-col items-center justify-center gap-0.5 text-gb-bg3"
    >
      <span className="text-sm font-bold">{currency === "PHP" ? "₱" : "$"}</span>
      <span className="text-[10px]">{currency}</span>
    </button>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebar-collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }, [router]);

  return (
    <div className="h-screen bg-gb-bg1 flex flex-col md:flex-row overflow-hidden">
      {/* Desktop Sidebar — hidden on mobile */}
      <nav
        className={`hidden md:flex bg-gb-fg0 flex-col items-center py-4 shrink-0 transition-all duration-200 ${
          collapsed ? "w-[60px]" : "w-[180px]"
        }`}
      >
        <Link href="/dashboard" className={`mb-6 flex items-center gap-2 ${collapsed ? "" : "w-full px-4"}`}>
          <Image src="/favicon-32x32.png" alt="FinTrack" width={28} height={28} />
          {!collapsed && <span className="text-sm font-bold text-gb-bg0 truncate">FinTrack</span>}
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

        <div className={`flex flex-col gap-1 ${collapsed ? "items-center" : "w-full px-2"}`}>
          <CurrencyToggle collapsed={collapsed} />
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
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {children}
      </div>

      {/* Mobile Bottom Nav — hidden on desktop */}
      <nav className="md:hidden bg-gb-fg0 border-t-2 border-gb-fg1 shrink-0 safe-bottom">
        <div className="flex items-stretch justify-around px-1 py-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label, color }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-md min-w-0 ${
                  isActive
                    ? `${color} text-gb-bg0`
                    : "text-gb-bg3"
                }`}
              >
                <Icon size={18} />
                <span className="text-[10px] font-medium truncate">{label}</span>
              </Link>
            );
          })}
          <MobileCurrencyToggle />
        </div>
      </nav>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CurrencyProvider>
      <DashboardShell>{children}</DashboardShell>
    </CurrencyProvider>
  );
}
