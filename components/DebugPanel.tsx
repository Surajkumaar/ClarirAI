import React, { useState } from 'react';
import { clariraiAPI } from '../lib/api';

interface DebugPanelProps {
  analysisId?: string;
  className?: string;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ analysisId, className }) => {
  const [question, setQuestion] = useState('');
  const [debugResult, setDebugResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Use the stored analysis ID if none is provided
  const getAnalysisId = () => {
    if (analysisId) return analysisId;
    return localStorage.getItem('lastAnalysisId') || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const currentAnalysisId = getAnalysisId();
      if (!currentAnalysisId) {
        setError('No analysis ID available. Please analyze an image first.');
        setLoading(false);
        return;
      }
      
      // Call the API with debug mode enabled
      const result = await clariraiAPI.getConsultation(currentAnalysisId, question, true);
      setDebugResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to get consultation');
      console.error('Debug consultation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-4 border rounded-lg ${className || ''}`}>
      <h2 className="text-xl font-semibold mb-4">AI Response Debugger</h2>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-3">
          <label htmlFor="question" className="block text-sm font-medium mb-1">
            Question
          </label>
          <input
            type="text"
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter your question here"
            required
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="analysisId" className="block text-sm font-medium mb-1">
            Analysis ID
          </label>
          <input
            type="text"
            id="analysisId"
            value={getAnalysisId()}
            readOnly
            className="w-full p-2 border rounded bg-gray-100"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Loading...' : 'Test AI Response'}
        </button>
      </form>
      
      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {debugResult && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Debug Results</h3>
          
          <div className="mb-4">
            <h4 className="font-medium">Processed Answer:</h4>
            <div className="p-3 bg-gray-100 rounded">
              {debugResult.answer}
            </div>
          </div>
          
          {debugResult.debug && (
            <>
              <div className="mb-4">
                <h4 className="font-medium">Source Field: <span className="font-mono">{debugResult.debug.sourceField}</span></h4>
                <p className="text-sm">
                  {debugResult.debug.isFallback ? 
                    '⚠️ Using fallback response (no valid response from backend)' : 
                    '✅ Using actual backend response'}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">Raw Response:</h4>
                <pre className="p-3 bg-gray-100 rounded overflow-auto max-h-60 text-xs">
                  {JSON.stringify(debugResult.debug.rawResponse, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
