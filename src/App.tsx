import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './Navigation';
import UserFlow from './pages/UserFlow';
import ToolFlow from './pages/ToolFlow';
import ContentFlow from './pages/ContentFlow';
import GroupchatFlow from './pages/GroupchatFlow';
import AgendaFlow from './pages/AgendaFlow';

function App() {
  return (
    <Router>
      <div className="min-h-screen w-full bg-gray-100">
        <Navigation />
        <main className="container mx-auto">
          <Routes>
            <Route path="/" element={
              <div className="p-8 bg-white rounded-lg shadow-sm mt-6">
                <h1 className="text-3xl font-semibold mb-4 text-gray-800">Welcome to PTSS CMS Demo</h1>
                <p className="text-gray-600">
                  This demo application showcases the various service flows in our backend system.
                  Navigate to different services using the menu above.
                </p>
              </div>
            } />
            <Route path="/user-service" element={<UserFlow />} />
            <Route path="/tool-service" element={<ToolFlow />} />
            <Route path="/content-service" element={<ContentFlow />} />
            <Route path="/groupchat-service" element={<GroupchatFlow />} />
            <Route path="/agenda-service" element={<AgendaFlow />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;