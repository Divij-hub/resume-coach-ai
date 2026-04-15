import Link from 'next/link';
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";

export default function LandingPage() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
          <span className="text-xl font-bold tracking-tight text-slate-800">Resume Coach AI</span>
        </div>
        <div>
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all shadow-md shadow-blue-100">
                Sign In
              </button>
            </SignInButton>
          ) : (
            <UserButton />
          )}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-tight">
          Your Resume, <span className="text-blue-600 underline decoration-blue-200">Upgraded</span> by AI.
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Get instant feedback, STAR-method bullet points, and tailored cover letters to help you land your next role in tech.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/product">
            <button className="px-8 py-4 text-lg font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-all transform hover:-translate-y-1 shadow-xl">
              Start Analyzing Now
            </button>
          </Link>
          <button className="px-8 py-4 text-lg font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            View Sample Report
          </button>
        </div>
      </main>
    </div>
  );
}