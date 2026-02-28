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
              { step: "1", title: "Sign up", desc: "Create an account with email. Takes 10 seconds." },
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
