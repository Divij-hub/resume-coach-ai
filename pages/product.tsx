import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from "@clerk/nextjs";

export default function ProductPage() {
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({
    cve_id: 'CVE-2024-',
    base_score: 7.5,
    affected_system: 'Linux',
    report_date: new Date().toISOString().split('T')[0],
    technical_text: ''
  });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      setResult(data.analysis);
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">CyberGuard AI Analyst</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-lg shadow-sm border">
        {/* Form fields stay the same */}
        <button 
          disabled={loading || formData.technical_text.length < 50}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
        >
          {loading ? 'Analyzing Bedrock Intelligence...' : 'Generate Analysis'}
        </button>
      </form>

      {result && (
        <div className="mt-8 p-6 bg-white border rounded-lg prose max-w-none shadow-inner">
          <ReactMarkdown>{result}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}