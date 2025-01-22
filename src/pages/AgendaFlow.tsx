import React, { useState } from 'react';
import axios from 'axios';

enum ItemType {
  EVENT = "Event",
  LOG = "Log"
}

interface TimeSlotRequest {
  startTime: string; // ISO string
  endTime: string;   // ISO string
}

interface CreateAgendaItemRequest {
  summary: string;
  description?: string;
  location?: string;
  itemType: ItemType;
  timeSlot: TimeSlotRequest;
}

interface TimeSlot {
  start: string;  // ISO string
  end: string;    // ISO string
}

interface AgendaResponse {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  itemType: ItemType;
  created: string;   // ISO string
  updated: string;   // ISO string
  timeSlot: TimeSlot;
}

const BASE_URL = 'https://kong-gateway-hotel-dev.apps.inholland.hcs-lab.nl/agenda-service';

const AgendaFlow: React.FC = () => {
  const [formData, setFormData] = useState<CreateAgendaItemRequest>({
    summary: '',
    description: '',
    location: '',
    itemType: ItemType.EVENT,
    timeSlot: {
      startTime: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:mm
      endTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16), // 1 hour later
    }
  });
  
  const [createdItem, setCreatedItem] = useState<AgendaResponse | null>(null);
  const [fetchedItem, setFetchedItem] = useState<AgendaResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: parent === 'timeSlot' ? {
          ...prev.timeSlot,
          [child]: value
        } : value
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const createAgendaItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post<AgendaResponse>(
        `${BASE_URL}/agenda/items`,
        formData,
        { withCredentials: true }
      );

      setCreatedItem(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating agenda item');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgendaItem = async () => {
    if (!createdItem?.id) {
      setError('No agenda item ID available');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<AgendaResponse>(
        `${BASE_URL}/agenda/items/${createdItem.id}`,
        { withCredentials: true }
      );

      setFetchedItem(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching agenda item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-8 text-gray-800">Agenda Service Demo Flow</h1>

      <div className="space-y-8">
        {/* Step 1: Create Agenda Item */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-medium mb-4 text-gray-800">Step 1: Create Agenda Item</h2>
          <form onSubmit={createAgendaItem} className="space-y-4">
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
                Summary
              </label>
              <input
                type="text"
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
              />
            </div>

            <div>
              <label htmlFor="itemType" className="block text-sm font-medium text-gray-700 mb-1">
                Item Type
              </label>
              <select
                id="itemType"
                name="itemType"
                value={formData.itemType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
                required
              >
                <option value={ItemType.EVENT}>Event</option>
                <option value={ItemType.LOG}>Log</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="timeSlot.startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  id="timeSlot.startTime"
                  name="timeSlot.startTime"
                  value={formData.timeSlot.startTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="timeSlot.endTime" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  id="timeSlot.endTime"
                  name="timeSlot.endTime"
                  value={formData.timeSlot.endTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Creating...' : 'Create Agenda Item'}
            </button>
          </form>

          {createdItem && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-medium text-green-800 mb-2">Agenda Item Created:</h3>
              <pre className="text-sm text-green-700 whitespace-pre-wrap">
                {JSON.stringify(createdItem, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Step 2: Fetch Agenda Item */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-medium mb-4 text-gray-800">Step 2: Fetch Agenda Item</h2>
          <button
            onClick={fetchAgendaItem}
            disabled={loading || !createdItem}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Fetching...' : 'Fetch Created Agenda Item'}
          </button>

          {fetchedItem && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-800 mb-2">Agenda Item Details:</h3>
              <div className="bg-gray-50 p-4 rounded-md border">
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-500">Summary:</dt>
                    <dd className="text-gray-900">{fetchedItem.summary}</dd>
                  </div>
                  {fetchedItem.description && (
                    <div>
                      <dt className="text-sm text-gray-500">Description:</dt>
                      <dd className="text-gray-900">{fetchedItem.description}</dd>
                    </div>
                  )}
                  {fetchedItem.location && (
                    <div>
                      <dt className="text-sm text-gray-500">Location:</dt>
                      <dd className="text-gray-900">{fetchedItem.location}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm text-gray-500">Type:</dt>
                    <dd className="text-gray-900">{fetchedItem.itemType}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Time Slot:</dt>
                    <dd className="text-gray-900">
                      {new Date(fetchedItem.timeSlot.start).toLocaleString()} - {new Date(fetchedItem.timeSlot.end).toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Created:</dt>
                    <dd className="text-gray-900">{new Date(fetchedItem.created).toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Updated:</dt>
                    <dd className="text-gray-900">{new Date(fetchedItem.updated).toLocaleString()}</dd>
                  </div>
                </dl>
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

export default AgendaFlow;