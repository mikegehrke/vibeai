import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ModelManager = () => {
  const [models, setModels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  const API_BASE = 'http://127.0.0.1:8006';

  // Lade verfügbare Modelle
  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/models/available`);
      setModels(response.data);
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchModels = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      
      const response = await axios.get(`${API_BASE}/models/search?${params}`);
      setModels(response.data);
    } catch (error) {
      console.error('Error searching models:', error);
    } finally {
      setLoading(false);
    }
  };

  const testModel = async (modelId) => {
    try {
      setTestResults(prev => ({ ...prev, [modelId]: { loading: true } }));
      
      const response = await axios.post(`${API_BASE}/models/test`, {
        model_id: modelId,
        test_prompt: "Generate a simple function to add two numbers"
      });
      
      setTestResults(prev => ({ 
        ...prev, 
        [modelId]: { 
          loading: false, 
          ...response.data 
        } 
      }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [modelId]: { 
          loading: false, 
          available: false, 
          error: error.message 
        } 
      }));
    }
  };

  const getBestModel = async (task) => {
    try {
      const response = await axios.get(`${API_BASE}/models/best-for/${task}`);
      setRecommendation(response.data);
    } catch (error) {
      console.error('Error getting recommendation:', error);
    }
  };

  const categories = [...new Set(models.map(m => m.category))];

  return (
    <div className="model-manager">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">🤖 Model Manager - VibeAI</h1>
        
        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔍 Model Search & Filter</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border rounded px-3 py-2"
            />
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <button
              onClick={searchModels}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Search
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => getBestModel('coding')}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm"
            >
              Best for Coding
            </button>
            <button
              onClick={() => getBestModel('writing')}
              className="bg-purple-500 text-white px-3 py-1 rounded text-sm"
            >
              Best for Writing
            </button>
            <button
              onClick={() => getBestModel('fast')}
              className="bg-orange-500 text-white px-3 py-1 rounded text-sm"
            >
              Fastest
            </button>
            <button
              onClick={() => getBestModel('cheap')}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
            >
              Cheapest
            </button>
          </div>
        </div>

        {/* Recommendation */}
        {recommendation && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <h3 className="font-semibold text-green-800">
              🎯 Recommendation for {recommendation.task}:
            </h3>
            <p className="text-green-700">
              <strong>{recommendation.recommended_model.name}</strong> - {recommendation.reason}
            </p>
            <p className="text-sm text-green-600">
              Max Tokens: {recommendation.recommended_model.max_tokens} | 
              Cost: ${recommendation.recommended_model.cost_per_token}/token
            </p>
          </div>
        )}

        {/* Models List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading models...</p>
            </div>
          ) : models.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No models found matching your criteria
            </div>
          ) : (
            models.map(model => (
              <div key={model.id} className="bg-white rounded-lg shadow-md p-6 border">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg">{model.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    model.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {model.available ? '✅ Available' : '❌ Unavailable'}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{model.description}</p>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div>
                    <strong>Type:</strong> {model.type}
                  </div>
                  <div>
                    <strong>Category:</strong> {model.category}
                  </div>
                  <div>
                    <strong>Max Tokens:</strong> {model.max_tokens?.toLocaleString() || 'N/A'}
                  </div>
                  <div>
                    <strong>Cost:</strong> ${model.cost_per_token}/token
                  </div>
                </div>

                {/* Test Button & Results */}
                <button
                  onClick={() => testModel(model.id)}
                  disabled={testResults[model.id]?.loading}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mb-3"
                >
                  {testResults[model.id]?.loading ? 'Testing...' : 'Test Model'}
                </button>

                {/* Test Results */}
                {testResults[model.id] && !testResults[model.id].loading && (
                  <div className={`p-3 rounded text-sm ${
                    testResults[model.id].available 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    {testResults[model.id].available ? (
                      <div>
                        <p className="font-semibold text-green-800">✅ Test Successful</p>
                        <p className="text-green-700">Response Time: {testResults[model.id].response_time}s</p>
                        <p className="text-green-600 mt-1">
                          <strong>Preview:</strong> {testResults[model.id].response_preview}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-red-800">❌ Test Failed</p>
                        <p className="text-red-700">{testResults[model.id].error}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold mb-3">📊 Model Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{models.length}</div>
              <div className="text-gray-600">Total Models</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {models.filter(m => m.available).length}
              </div>
              <div className="text-gray-600">Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
              <div className="text-gray-600">Categories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Object.keys(testResults).filter(k => testResults[k].available).length}
              </div>
              <div className="text-gray-600">Tested OK</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .model-manager {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
          max-width: 1200px;
        }
      `}</style>
    </div>
  );
};

export default ModelManager;