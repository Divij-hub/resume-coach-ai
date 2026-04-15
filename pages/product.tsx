import { useState } from 'react';
import { UserButton } from "@clerk/nextjs";
import ReactMarkdown from 'react-markdown';

export default function ProductPage() {
  const [resume, setResume] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-8 py-4 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">Analysis Workspace</h2>
        <UserButton />
      </header>

      <main className="max-w-[1400px] mx-auto p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Input Panel */}
          <div className="flex-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Paste Resume Content</label>
              <textarea 
                className="w-full h-96 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                placeholder="Paste your current resume text here..."
                onChange={(e) => setResume(e.target.value)}
              />
              <button 
                className="w-full mt-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                disabled={loading || !resume}
              >
                {loading ? "AI is Coach is Thinking..." : "Analyze Resume"}
              </button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="flex-1">
            <div className="bg-white h-full min-h-[600px] p-8 rounded-2xl shadow-inner border border-slate-200 prose prose-slate max-w-none">
              {analysis ? (
                <ReactMarkdown>{analysis}</ReactMarkdown>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                   <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">✨</div>
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