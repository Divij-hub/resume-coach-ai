import { useState } from 'react';
import { UserButton, useAuth } from "@clerk/nextjs";
import ReactMarkdown from 'react-markdown';

export default function ProductPage() {
  const [resume, setResume] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize the Clerk Auth hook to get the security token
  const { getToken } = useAuth();

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setAnalysis('');

    try {
      // 1. Get the secure JWT token from Clerk
      const token = await getToken();
      
      if (!token) {
        throw new Error("You must be signed in to perform this action.");
      }

      // 2. Point this to your FastAPI backend URL (from .env.local)
      // Note: Ensure NEXT_PUBLIC_API_URL is set to your AWS API Gateway or Vercel backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Send the security token to Python
        },
        body: JSON.stringify({ 
          resume_text: resume, 
          job_description: "General professional review",
          target_role: "Candidate",
          years_experience: 0
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze resume. Please check your connection.');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      console.error("Analysis Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header / Navigation */}
      <header className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 bg-blue-600 rounded"></div>
           <h2 className="text-lg font-bold text-slate-800">Analysis Workspace</h2>
        </div>
        <UserButton afterSignOutUrl="/" />
      </header>

      <main className="max-w-[1400px] mx-auto p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Input Panel (Left Side) */}
          <div className="flex-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Paste Resume Content
              </label>
              <textarea 
                className="w-full h-96 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none text-slate-800"
                placeholder="Paste your current resume text here..."
                value={resume}
                onChange={(e) => setResume(e.target.value)}
              />
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">⚠️ {error}</p>
                </div>
              )}

              <button 
                onClick={handleAnalyze}
                className="w-full mt-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !resume}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    AI Coach is Thinking...
                  </span>
                ) : "Analyze Resume"}
              </button>
            </div>
          </div>

          {/* Output Panel (Right Side) */}
          <div className="flex-1">
            <div className="bg-white h-full min-h-[600px] p-8 rounded-2xl shadow-inner border border-slate-200 prose prose-slate max-w-none overflow-y-auto">
              {analysis ? (
                <ReactMarkdown>{analysis}</ReactMarkdown>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                   <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-2xl">✨</div>
                   <p className="italic">Your professional critique will appear here...</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}