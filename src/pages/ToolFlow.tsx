import React, { useState } from 'react';
import axios from 'axios';

interface ToolSummaryResponse {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

interface CategoryResponse {
  category: string;
  createdAt: string;
  groupId: string;
  tools: ToolSummaryResponse[];
}

interface MediaInfoResponse {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
}

interface ToolResponse {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  media: MediaInfoResponse | null;
}

const BASE_URL = 'https://kong-gateway-hotel-dev.apps.inholland.hcs-lab.nl/tool-service';

const ToolFlow: React.FC = () => {
  // State for category creation
  const [categoryName, setCategoryName] = useState('');
  const [createdCategory, setCreatedCategory] = useState<CategoryResponse | null>(null);
  
  // State for category listing
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  
  // State for tool creation
  const [toolName, setToolName] = useState('');
  const [toolDescription, setToolDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [createdTool, setCreatedTool] = useState<ToolResponse | null>(null);
  
  // State for tool fetching
  const [fetchedTool, setFetchedTool] = useState<ToolResponse | null>(null);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post<CategoryResponse>(
        `${BASE_URL}/tools/categories`,
        { category: categoryName },
        { withCredentials: true }
      );
      
      setCreatedCategory(response.data);
      setCategoryName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating category');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get<CategoryResponse[]>(
        `${BASE_URL}/tools/categories`,
        { withCredentials: true }
      );
      
      setCategories(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching categories');
    } finally {
      setLoading(false);
    }
  };

  const createTool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post<ToolResponse>(
        `${BASE_URL}/tools`,
        {
          name: toolName,
          description: toolDescription,
          category: selectedCategories
        },
        { withCredentials: true }
      );
      
      setCreatedTool(response.data);
      setToolName('');
      setToolDescription('');
      setSelectedCategories([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating tool');
    } finally {
      setLoading(false);
    }
  };

  const fetchTool = async () => {
    if (!createdTool?.id) {
      setError('No tool ID available to fetch');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get<ToolResponse>(
        `${BASE_URL}/tools/${createdTool.id}`,
        { withCredentials: true }
      );
      
      setFetchedTool(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching tool');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-8 text-gray-800">Tool Service Demo Flow</h1>
      
      <div className="space-y-8">
        {/* Step 1: Create Category */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-medium mb-4 text-gray-800">Step 1: Create Category</h2>
          <form onSubmit={createCategory} className="space-y-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category Name
              </label>
              <input
                type="text"
                id="category"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Creating...' : 'Create Category'}
            </button>
          </form>
          {createdCategory && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-medium text-green-800 mb-2">Category Created:</h3>
              <pre className="text-sm text-green-700 whitespace-pre-wrap">
                {JSON.stringify(createdCategory, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Step 2: Fetch Categories */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-medium mb-4 text-gray-800">Step 2: Fetch Categories</h2>
          <button
            onClick={fetchCategories}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Fetching...' : 'Fetch Categories'}
          </button>
          {categories.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-800 mb-2">Available Categories:</h3>
              <div className="bg-gray-50 p-4 rounded-md border">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(categories, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Create Tool */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-medium mb-4 text-gray-800">Step 3: Create Tool</h2>
          <form onSubmit={createTool} className="space-y-4">
            <div>
              <label htmlFor="toolName" className="block text-sm font-medium text-gray-700 mb-1">
                Tool Name
              </label>
              <input
                type="text"
                id="toolName"
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
                required
              />
            </div>
            <div>
              <label htmlFor="toolDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="toolDescription"
                value={toolDescription}
                onChange={(e) => setToolDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categories
              </label>
              <div className="space-y-2">
                {categories.map(cat => (
                  <label key={cat.category} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.category)}
                      onChange={() => toggleCategory(cat.category)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-gray-700">{cat.category}</span>
                  </label>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || selectedCategories.length === 0}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Creating...' : 'Create Tool'}
            </button>
          </form>
          {createdTool && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-medium text-green-800 mb-2">Tool Created:</h3>
              <pre className="text-sm text-green-700 whitespace-pre-wrap">
                {JSON.stringify(createdTool, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Step 4: Fetch Tool */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-medium mb-4 text-gray-800">Step 4: Fetch Tool</h2>
          <button
            onClick={fetchTool}
            disabled={loading || !createdTool}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Fetching...' : 'Fetch Created Tool'}
          </button>
          {fetchedTool && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-800 mb-2">Tool Details:</h3>
              <div className="bg-gray-50 p-4 rounded-md border">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(fetchedTool, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolFlow;