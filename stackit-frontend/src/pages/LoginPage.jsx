import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
    // If login is successful, the AuthContext will update and we can navigate
    // A better approach would be to use useEffect to watch for isAuthenticated change
    // For now, we'll navigate away if there's no error after the attempt.
    if (!error) {
        // A small delay to allow state to propagate, not ideal but simple.
        setTimeout(() => navigate('/'), 100);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Sign In'}
          </button>
          <Link to="/register" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
            Don't have an account? Register
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
