import Link from "next/link";
import { Landmark, Receipt, PiggyBank, CalendarDays, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gb-bg0 flex flex-col">
      {/* Navbar */}
      <nav className="border-b-2 border-gb-fg0 bg-gb-bg0">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-gb-fg0">FinTrack</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="nb-btn rounded-sm bg-gb-bg0 px-4 py-2 text-sm font-bold text-gb-fg0 hover:nb-btn-press"
            >
              Sign In
            </Link>
            <Link
              href="/login?register=1"
              className="nb-btn rounded-sm bg-gb-fg0 px-4 py-2 text-sm font-bold text-gb-bg0 hover:nb-btn-press"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gb-fg0 leading-tight mb-6">
            Take control of your{" "}
            <span className="bg-gb-yellow px-2 inline-block -rotate-1">finances</span>
          </h1>
          <p className="text-lg text-gb-fg2 mb-10 max-w-xl mx-auto">
            Track loans, bills, income, and savings in one place.
            See everything on a calendar. Know exactly where your money goes.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/login?register=1"
              className="nb-btn rounded-sm bg-gb-blue px-6 py-3 text-base font-bold text-gb-bg0 hover:nb-btn-press inline-flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/api/auth/google"
              className="nb-btn rounded-sm bg-gb-bg0 px-6 py-3 text-base font-bold text-gb-fg0 hover:nb-btn-press inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gb-bg1">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gb-fg0 text-center mb-12">
            Everything you need to manage your money
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Landmark, title: "Loans", desc: "Track balances, payments, and schedules for all your loans.", color: "bg-gb-blue" },
              { icon: Receipt, title: "Bills", desc: "Never miss a bill. Track recurring expenses and one-time payments.", color: "bg-gb-orange" },
              { icon: PiggyBank, title: "Savings", desc: "Monitor your savings accounts and watch your balance grow.", color: "bg-gb-purple" },
              { icon: CalendarDays, title: "Calendar", desc: "See all your financial obligations on a single calendar view.", color: "bg-gb-green" },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="nb-card rounded-sm bg-gb-bg0 p-6">
                <div className={`${color} w-10 h-10 flex items-center justify-center mb-4 border-2 border-gb-fg0`}>
                  <Icon size={20} className="text-gb-bg0" />
                </div>
                <h3 className="font-bold text-gb-fg0 text-lg mb-2">{title}</h3>
                <p className="text-sm text-gb-fg2">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gb-fg0 text-center mb-12">
            How it works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Sign up", desc: "Create an account with email or Google. Takes 10 seconds." },
              { step: "2", title: "Add your finances", desc: "Add your loans, bills, income sources, and savings accounts." },
              { step: "3", title: "Track everything", desc: "View your financial calendar, mark payments, and stay on top of it all." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="nb-card inline-flex items-center justify-center w-12 h-12 bg-gb-yellow font-bold text-xl text-gb-fg0 rounded-sm mb-4">
                  {step}
                </div>
                <h3 className="font-bold text-gb-fg0 text-lg mb-2">{title}</h3>
                <p className="text-sm text-gb-fg2">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gb-fg0">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gb-bg0 mb-4">
            Start tracking for free
          </h2>
          <p className="text-gb-bg3 mb-8">
            No credit card required. Set up your finances in minutes.
          </p>
          <Link
            href="/login?register=1"
            className="nb-btn rounded-sm bg-gb-yellow px-8 py-3 text-base font-bold text-gb-fg0 hover:nb-btn-press inline-flex items-center gap-2 border-gb-bg0"
          >
            Get Started
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-gb-fg0 py-6 px-4 bg-gb-bg0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-sm font-bold text-gb-fg0">FinTrack</span>
          <Link href="/login" className="text-sm text-gb-fg3 hover:text-gb-fg0 font-medium">
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
}
