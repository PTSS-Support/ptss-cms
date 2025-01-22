import React, { useState } from 'react';
import axios from 'axios';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  lastSeen: string | null;
  groupId: string | null;
}

const BASE_URL = 'https://kong-gateway-hotel-dev.apps.inholland.hcs-lab.nl/user-service';

const PatientLogin: React.FC = () => {
  // Patient Login States
  const [email, setEmail] = useState('semplaatsman@gmail.com');
  const [password, setPassword] = useState('PatientPass123!');
  const [showPassword, setShowPassword] = useState(false);
  const [patientInfo, setPatientInfo] = useState<UserResponse | null>(null);

  // Common States
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get<UserResponse>(
        `${BASE_URL}/users/me`,
        { withCredentials: true }
      );
      setPatientInfo(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching user info');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      await axios.post<LoginResponse>(
        `${BASE_URL}/users/login`,
        { 
          email,
          password 
        },
        { withCredentials: true }
      );

      await fetchUserInfo();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-8 text-gray-800">Patient Portal</h1>
      
      <div className="space-y-8">
        {/* Patient Login Form */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-medium mb-4 text-gray-800">Patient Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>

        {/* Patient Information Display */}
        {patientInfo && (
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-medium mb-4 text-gray-800">Patient Information</h2>
            <div className="bg-gray-50 p-4 rounded-md border">
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-500">Patient ID:</dt>
                  <dd className="text-sm font-mono text-gray-900">{patientInfo.id}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Name:</dt>
                  <dd className="text-gray-900">{patientInfo.firstName} {patientInfo.lastName}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientLogin;