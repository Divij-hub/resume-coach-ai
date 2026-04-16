import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SignInButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Rocket, ShieldCheck, Sparkles } from 'lucide-react';
// Use <Sparkles className="w-5 h-5 text-blue-500" /> near your headline


export default function LandingPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // This check prevents the 'client-side exception' hydration crash
  if (!isClient) {
    return <div className="min-h-screen bg-slate-50" />; 
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
          <span className="text-xl font-bold tracking-tight text-slate-800">Resume Coach AI</span>
        </div>
        
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-4">
              <Link href="/product" className="text-sm font-medium text-slate-600 hover:text-blue-600">
                Workspace
              </Link>
              <UserButton showName={true} />
            </div>
          </SignedIn>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-tight">
          Your Resume, <span className="text-blue-600 underline decoration-blue-200">Upgraded</span> by AI.
        </h1>
        <Link href="/product">
          <button className="px-8 py-4 text-lg font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-all shadow-xl">
            Start Analyzing Now
          </button>
        </Link>
      </main>
    </div>
  );
}