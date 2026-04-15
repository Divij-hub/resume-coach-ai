import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function ProductPage() {
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
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    setResult(data.analysis);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">CyberGuard AI Analyst</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <input 
            value={formData.cve_id} 
            onChange={e => setFormData({...formData, cve_id: e.target.value})}
            className="border p-2" placeholder="CVE-YYYY-NNNN" required 
          />
          <select 
            value={formData.affected_system}
            onChange={e => setFormData({...formData, affected_system: e.target.value})}
            className="border p-2"
          >
            <option>Windows</option><option>Linux</option><option>Cloud</option><option>IoT</option>
          </select>
        </div>
        <textarea 
          placeholder="Paste technical logs or CVE description here..."
          className="w-full border p-2 h-32"
          onChange={e => setFormData({...formData, technical_text: e.target.value})}
        />
        <button 
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Analyzing Threats...' : 'Generate Analysis'}
        </button>
      </form>

      {result && (
        <div className="mt-8 prose lg:prose-xl max-w-none">
          <ReactMarkdown>{result}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}