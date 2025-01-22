import React, { useState } from 'react';
import axios from 'axios';

interface MessageResponse {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  isPinned: boolean;
}

interface PaginationResponse {
  nextCursor?: string;
  previousCursor?: string;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface PaginatedResponse {
  data: MessageResponse[];
  pagination: PaginationResponse;
}

const BASE_URL = 'https://kong-gateway-hotel-dev.apps.inholland.hcs-lab.nl/groupchat-service';

const GroupchatFlow: React.FC = () => {
  // State for sending message
  const [messageContent, setMessageContent] = useState('');
  const [sentMessage, setSentMessage] = useState<MessageResponse | null>(null);
  
  // State for pagination query parameters
  const [pageSize, setPageSize] = useState('10');
  const [cursor, setCursor] = useState('');
  const [direction, setDirection] = useState('next');
  const [search, setSearch] = useState('');
  
  // State for messages list
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [pagination, setPagination] = useState<PaginationResponse | null>(null);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post<MessageResponse>(
        `${BASE_URL}/groups/messages`,
        { content: messageContent },
        { withCredentials: true }
      );

      setSentMessage(response.data);
      setMessageContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error sending message');
    } finally {
      setLoading(false);
    }
  };

  const pinMessage = async (messageId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put<MessageResponse>(
        `${BASE_URL}/groups/messages/${messageId}/pin`,
        {},
        { withCredentials: true }
      );

      // Update the message in the list if it exists
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId ? response.data : msg
        )
      );

      // Update the sent message if it was the one that was pinned
      if (sentMessage?.id === messageId) {
        setSentMessage(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error pinning message');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (pageSize) params.append('pageSize', pageSize);
      if (cursor) params.append('cursor', cursor);
      if (direction) params.append('direction', direction);
      if (search) params.append('search', search);

      const response = await axios.get<PaginatedResponse>(
        `${BASE_URL}/groups/messages?${params.toString()}`,
        { withCredentials: true }
      );

      setMessages(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching messages');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-8 text-gray-800">Groupchat Service Demo Flow</h1>
      
      <div className="space-y-8">
        {/* Step 1: Send Message */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-medium mb-4 text-gray-800">Step 1: Send Message</h2>
          <form onSubmit={sendMessage} className="space-y-4">
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Message Content
              </label>
              <textarea
                id="content"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
                rows={3}
                required
                maxLength={1000}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !messageContent.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
          {sentMessage && (
            <div className="mt-4">
              <div className="bg-gray-50 p-4 rounded-md border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium text-gray-800">{sentMessage.senderName}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {new Date(sentMessage.sentAt).toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => pinMessage(sentMessage.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {sentMessage.isPinned ? 'Unpin' : 'Pin'}
                  </button>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{sentMessage.content}</p>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Fetch Messages */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-medium mb-4 text-gray-800">Step 2: Fetch Messages</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page Size (1-50)
              </label>
              <input
                type="number"
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                min="1"
                max="50"
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cursor
              </label>
              <input
                type="text"
                value={cursor}
                onChange={(e) => setCursor(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Direction
              </label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
              >
                <option value="next">Next</option>
                <option value="previous">Previous</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
                placeholder="Optional"
                maxLength={100}
              />
            </div>
          </div>

          <button
            onClick={fetchMessages}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Fetching...' : 'Fetch Messages'}
          </button>

          {messages.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-800 mb-4">Messages:</h3>
              <div className="space-y-4">
                {messages.map(message => (
                  <div key={message.id} className="bg-gray-50 p-4 rounded-md border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-medium text-gray-800">{message.senderName}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {new Date(message.sentAt).toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => pinMessage(message.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {message.isPinned ? 'Unpin' : 'Pin'}
                      </button>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
                  </div>
                ))}
              </div>
              
              {pagination && (
                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={() => {
                      if (pagination.previousCursor) {
                        setCursor(pagination.previousCursor);
                        setDirection('previous');
                      }
                    }}
                    disabled={!pagination.hasPrevious}
                    className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                  >
                    Previous Page
                  </button>
                  <button
                    onClick={() => {
                      if (pagination.nextCursor) {
                        setCursor(pagination.nextCursor);
                        setDirection('next');
                      }
                    }}
                    disabled={!pagination.hasNext}
                    className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                  >
                    Next Page
                  </button>
                </div>
              )}
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

export default GroupchatFlow;