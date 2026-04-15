// Update this line in pages/index.tsx
import { 
  SignInButton, 
  UserButton, 
  ClerkLoaded,
  // If SignedIn still fails, we will use ClerkLoaded logic below
} from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs"; 
import Link from 'next/link';

export default function LandingPage() {
  const { isSignedIn } = useAuth(); // Using the hook is more reliable in Next 16

  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between p-6 border-b">
        <h1 className="text-xl font-bold text-blue-600">Resume Coach AI</h1>
        <div>
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">Sign In</button>
            </SignInButton>
          ) : (
            <UserButton showName={true} />
          )}
        </div>
      </nav>
      {/* Rest of your hero and feature code... */}
    </div>
  );
}