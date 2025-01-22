import React, { useState } from 'react';
import axios from 'axios';

interface MediaResponse {
  id: string;
  url: string;
  href: string | null;
}

interface EmergencyContactResponse {
  id: string;
  name: string;
  phoneNumber: string;
  actionLabel: string;
}

interface GeneralInformationResponse {
  id: string;
  title: string;
  content: string;
  media: MediaResponse | null;
}

const BASE_URL = 'https://kong-gateway-hotel-dev.apps.inholland.hcs-lab.nl/content-service';

const ContentFlow: React.FC = () => {
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContactResponse[]>([]);
  const [generalInfoId, setGeneralInfoId] = useState('7d9c7f4f-5971-4c73-ab20-0103c9658486');
  const [generalInfo, setGeneralInfo] = useState<GeneralInformationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmergencyContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<EmergencyContactResponse[]>(
        `${BASE_URL}/emergency-contacts`,
        { withCredentials: true }
      );

      setEmergencyContacts(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching emergency contacts');
    } finally {
      setLoading(false);
    }
  };

  const fetchGeneralInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generalInfoId.trim()) {
      setError('Please enter a general information ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<GeneralInformationResponse>(
        `${BASE_URL}/general-information/${generalInfoId}`,
        { withCredentials: true }
      );

      setGeneralInfo(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching general information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-8 text-gray-800">Content Service Demo Flow</h1>

      <div className="space-y-8">
        {/* Step 1: Emergency Contacts */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-medium mb-4 text-gray-800">Step 1: Fetch Emergency Contacts</h2>
          <button
            onClick={fetchEmergencyContacts}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Fetching...' : 'Fetch Emergency Contacts'}
          </button>

          {emergencyContacts.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-800 mb-4">Emergency Contacts:</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {emergencyContacts.map(contact => (
                  <div key={contact.id} className="bg-gray-50 p-4 rounded-md border">
                    <h4 className="font-medium text-gray-800">{contact.name}</h4>
                    <div className="mt-2 space-y-1">
                      <p className="text-gray-600">Phone: {contact.phoneNumber}</p>
                      <p className="text-gray-600">Action: {contact.actionLabel}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step 2: General Information */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-medium mb-4 text-gray-800">Step 2: Fetch General Information</h2>
          <form onSubmit={fetchGeneralInfo} className="space-y-4">
            <div>
              <label htmlFor="generalInfoId" className="block text-sm font-medium text-gray-700 mb-1">
                General Information ID
              </label>
              <input
                type="text"
                id="generalInfoId"
                value={generalInfoId}
                onChange={(e) => setGeneralInfoId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
                placeholder="Enter ID"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Fetching...' : 'Fetch General Information'}
            </button>
          </form>

          {generalInfo && (
            <div className="mt-6">
              <div className="bg-gray-50 p-4 rounded-md border">
                <h3 className="text-xl font-medium text-gray-800 mb-2">{generalInfo.title}</h3>
                <p className="text-gray-700 whitespace-pre-wrap mb-4">{generalInfo.content}</p>
                {generalInfo.media && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-800 mb-2">Media:</h4>
                    <img 
                      src={generalInfo.media.url} 
                      alt={generalInfo.title}
                      className="rounded-md max-w-full h-auto"
                    />
                    {generalInfo.media.href && (
                      <a 
                        href={generalInfo.media.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
                      >
                        View Original
                      </a>
                    )}
                  </div>
                )}
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

export default ContentFlow;