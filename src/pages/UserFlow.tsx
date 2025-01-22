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

interface GroupResponse {
  id: string;
  patientId: string | null;
  healthcareProfessionalId: string;
  primaryCaregiverId: string | null;
}

const BASE_URL = 'https://kong-gateway-hotel-dev.apps.inholland.hcs-lab.nl/user-service';

const UserFlow: React.FC = () => {
  // HCP Login States
  const [hcpEmail, setHcpEmail] = useState('test4321@example.com');
  const [hcpPassword, setHcpPassword] = useState('SecurePass123!');
  const [showHcpPassword, setShowHcpPassword] = useState(false);
  const [hcpInfo, setHcpInfo] = useState<UserResponse | null>(null);
  
  // Shared Patient States
  const [patientEmail, setPatientEmail] = useState('patient@example.com');
  const [invitationCode, setInvitationCode] = useState('');
  
  // Group Creation States
  const [createdGroup, setCreatedGroup] = useState<GroupResponse | null>(null);
  
  // Patient Registration States
  const [firstName, setFirstName] = useState('Daan');
  const [lastName, setLastName] = useState('Tol');
  const [patientPassword, setPatientPassword] = useState('PatientPass123!');
  const [showPatientPassword, setShowPatientPassword] = useState(false);

  // Verification Success State
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  
  // Patient Login States
  const [patientInfo, setPatientInfo] = useState<UserResponse | null>(null);
  
  // Common States
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      await axios.post<LoginResponse>(
        `${BASE_URL}/users/login`,
        { email: hcpEmail, password: hcpPassword },
        { withCredentials: true }
      );

      setCurrentStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async (setUserInfo: (info: UserResponse) => void) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<UserResponse>(
        `${BASE_URL}/users/me`,
        { withCredentials: true }
      );

      setUserInfo(response.data);
      if (setUserInfo === setHcpInfo) {
        setCurrentStep(3);
      } else {
        setCurrentStep(8);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching user info');
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post<GroupResponse>(
        `${BASE_URL}/groups`,
        {
          healthcareProfessionalId: hcpInfo?.id,
          patientEmail: patientEmail
        },
        { withCredentials: true }
      );

      setCreatedGroup(response.data);
      setCurrentStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating group');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      await axios.post(
        `${BASE_URL}/users/me/logout`,
        {},
        { withCredentials: true }
      );

      setCurrentStep(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during logout');
    } finally {
      setLoading(false);
    }
  };

  const verifyInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      await axios.post(
        `${BASE_URL}/users/invite/verify`,
        {
          email: patientEmail,
          invitationCode: invitationCode
        },
        { withCredentials: true }
      );

      setVerificationSuccess(true);
      setCurrentStep(6);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      await axios.post(
        `${BASE_URL}/users/register`,
        {
          firstName,
          lastName,
          password: patientPassword,
          invitationCode: invitationCode
        },
        { withCredentials: true }
      );

      setCurrentStep(7);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const patientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      await axios.post<LoginResponse>(
        `${BASE_URL}/users/login`,
        { 
          email: patientEmail,
          password: patientPassword 
        },
        { withCredentials: true }
      );

      fetchUserInfo(setPatientInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during patient login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-8 text-gray-800">User Service Demo Flow</h1>
      
      <div className="space-y-8">
        {/* Step 1: HCP Login */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-medium mb-4 text-gray-800">
            Step 1: Healthcare Professional Login
          </h2>
          <form onSubmit={login} className="space-y-4">
            <div>
              <label htmlFor="hcpEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="hcpEmail"
                value={hcpEmail}
                onChange={(e) => setHcpEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
                required
              />
            </div>
            <div>
              <label htmlFor="hcpPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showHcpPassword ? "text" : "password"}
                  id="hcpPassword"
                  value={hcpPassword}
                  onChange={(e) => setHcpPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowHcpPassword(!showHcpPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  {showHcpPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || currentStep !== 1}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>

        {/* Step 2: Fetch HCP Info */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-medium mb-4 text-gray-800">Step 2: Fetch HCP Information</h2>
          <button
            onClick={() => fetchUserInfo(setHcpInfo)}
            disabled={loading || currentStep !== 2}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Fetching...' : 'Fetch HCP Info'}
          </button>
          {hcpInfo && (
            <div className="mt-4">
              <div className="bg-gray-50 p-4 rounded-md border">
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-500">HCP ID:</dt>
                    <dd className="text-sm font-mono text-gray-900">{hcpInfo.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Name:</dt>
                    <dd className="text-gray-900">{hcpInfo.firstName} {hcpInfo.lastName}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Create Group */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-medium mb-4 text-gray-800">Step 3: Create Group</h2>
        <form onSubmit={createGroup} className="space-y-4">
          <div>
            <label htmlFor="patientEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Patient Email
            </label>
            <input
              type="email"
              id="patientEmail"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || currentStep !== 3 || !hcpInfo}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </form>
        {createdGroup && (
          <div className="mt-4">
            <div className="bg-gray-50 p-4 rounded-md border">
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-500">Group ID:</dt>
                  <dd className="text-sm font-mono text-gray-900">{createdGroup.id}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>

        {/* Step 4: HCP Logout */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-medium mb-4 text-gray-800">Step 4: HCP Logout</h2>
          <button
            onClick={logout}
            disabled={loading || currentStep !== 4}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>

        {/* Step 5: Verify Patient Invitation */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-medium mb-4 text-gray-800">Step 5: Verify Patient Invitation</h2>
        <form onSubmit={verifyInvitation} className="space-y-4">
          <div>
            <label htmlFor="verificationEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="verificationEmail"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
              required
            />
          </div>
          <div>
            <label htmlFor="invitationCode" className="block text-sm font-medium text-gray-700 mb-1">
              Invitation Code
            </label>
            <input
              type="text"
              id="invitationCode"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || currentStep !== 5}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Verifying...' : 'Verify Invitation'}
          </button>
        </form>
        {verificationSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
            Invitation verified successfully!
          </div>
        )}
      </div>

        {/* Step 6: Patient Registration */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-medium mb-4 text-gray-800">Step 6: Patient Registration</h2>
        <form onSubmit={register} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
              required
              pattern="^[a-zA-Z]+$"
              maxLength={100}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
              required
              pattern="^[a-zA-Z]+$"
              maxLength={100}
            />
          </div>
          <div>
            <label htmlFor="patientPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPatientPassword ? "text" : "password"}
                id="patientPassword"
                value={patientPassword}
                onChange={(e) => setPatientPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
                required
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{9,}$"
                title="Password must be at least 9 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
              />
              <button
                type="button"
                onClick={() => setShowPatientPassword(!showPatientPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                {showPatientPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="invitationCodeReg" className="block text-sm font-medium text-gray-700 mb-1">
              Invitation Code
            </label>
            <input
              type="text"
              id="invitationCodeReg"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || currentStep !== 6}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>

        {/* Step 7: Patient Login */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-medium mb-4 text-gray-800">Step 7: Patient Login</h2>
        <form onSubmit={patientLogin} className="space-y-4">
          <div>
            <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="loginEmail"
              value={patientEmail}
              className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
              disabled
            />
          </div>
          <div>
            <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPatientPassword ? "text" : "password"}
                id="loginPassword"
                value={patientPassword}
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white"
                disabled
              />
              <button
                type="button"
                onClick={() => setShowPatientPassword(!showPatientPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                {showPatientPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || currentStep !== 7}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>

        {/* Step 8: Fetch Patient Info */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-medium mb-4 text-gray-800">Step 8: Patient Information</h2>
          {patientInfo && (
            <div className="mt-4">
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
                  <div>
                    <dt className="text-sm text-gray-500">Group ID:</dt>
                    <dd className="text-sm font-mono text-gray-900">{patientInfo.groupId || 'N/A'}</dd>
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

export default UserFlow;