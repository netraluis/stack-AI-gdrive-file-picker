'use client';
import { AuthProvider, useAuth } from './context/authContext';
import FilePicker from './components/FilePicker';

// Login Form Component
const LoginForm = () => {
  const { 
    email, setEmail, 
    password, setPassword, 
    loading, error, 
    login 
  } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Stack AI File Picker
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access your Google Drive files
          </p>
        </div>
        
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Login Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={login}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="text-sm text-center text-gray-600">
            <p className="mt-1">Use the test account:</p>
            <p className="font-semibold">stackaitest@gmail.com</p>
            <p className="font-semibold">!z4ZnxkyLYs#vR</p>
          </div>
        </form>
      </div>
    </div>
  );
};

// Connection Error Component
const ConnectionError = () => {
  const { logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">Connection Error</h2>
        <p className="text-gray-700 mb-6">
          No Google Drive connection found. Please connect your Google Drive in Stack AI first.
        </p>
        <button
          onClick={logout}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const { email, logout, connectionId } = useAuth();
  
  if (!connectionId) {
    return <ConnectionError />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Stack AI Knowledge Base Manager</h1>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-4">
              {email}
            </span>
            <button
              onClick={logout}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign Out
            </button>
          </div>
        </div>
        
        <FilePicker />
      </div>
    </div>
  );
};

// Main Application Component with Auth Context
const AppContent = () => {
  const { isLoggedIn } = useAuth();
  
  if (!isLoggedIn) {
    return <LoginForm />;
  }
  
  return <Dashboard />;
};

// Wrapper component with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}