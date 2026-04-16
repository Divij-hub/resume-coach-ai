import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SignInButton, UserButton, SignedIn, SignedOut } from "@clerk/clerk-react";

export default function LandingPage() {
  const [isClient, setIsClient] = useState(false);

  // This ensures Clerk components only render on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg shadow-inner"></div>
          <span className="text-xl font-bold tracking-tight text-slate-800">Resume Coach AI</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Only render auth buttons if we are on the client */}
          {isClient && (
            <>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all shadow-md shadow-blue-100">
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
            </>
          )}
        </div>
      </nav>
      {/* ... rest of your hero section ... */}
    </div>
  );
}