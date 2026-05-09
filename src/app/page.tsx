"use client";
import { useState } from "react";

export default function HRPolicyBot() {
  const [question, setQuestion] = useState("");
  const [policies, setPolicies] = useState("");
  const [result, setResult] = useState<{ answer: string; followUpQuestions?: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ask-hr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, policies }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-indigo-900 mb-3">HR Policy Answer Bot</h1>
          <p className="text-indigo-600 text-lg">Get instant answers to your HR policy questions</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Your Question *</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., How many vacation days do I get? What is the parental leave policy?"
              rows={3}
              className="w-full border border-gray-300 rounded-xl p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Company Policies (optional)</label>
            <textarea
              value={policies}
              onChange={(e) => setPolicies(e.target.value)}
              placeholder="Paste relevant company policy text here for more accurate answers..."
              rows={4}
              className="w-full border border-gray-300 rounded-xl p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? "Getting Answer..." : "Ask HR Bot"}
          </button>
        </form>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">{error}</div>}
        {result && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-indigo-900 mb-4">Answer</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{result.answer}</p>
            {result.followUpQuestions && result.followUpQuestions.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Questions</h3>
                <div className="space-y-2">
                  {result.followUpQuestions.map((q, i) => (
                    <button key={i} onClick={() => { setQuestion(q); setResult(null); }} className="block w-full text-left text-indigo-600 hover:text-indigo-800 text-sm py-1">&#8594; {q}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
