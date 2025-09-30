import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if current path matches for active styling
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gray-100 w-16 h-screen items-center flex flex-col shadow-lg border-b">
      <div className="w-full h-full">
        <div className="flex justify-between items-center flex-col h-full py-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
              <img src="/OXBLOGLOGO.png" className="object-contain" alt="OXBlog Logo" />
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex flex-col w-full justify-between items-center space-y-6">
            <Link
              to="/search"
              className={`p-2 rounded-md transition-colors duration-200 ${
                isActive('/search') ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-200'
              }`}
            >
              <img src="/icons8-search-50.png" alt="Search" className='w-6 h-6' />
            </Link>
            
            <Link
              to="/"
              className={`p-2 rounded-md transition-colors duration-200 ${
                isActive('/') ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-200'
              }`}
            >
              <img src="/icons8-home-48.png" alt="Home" className='w-6 h-6'/>
            </Link>

            <Link
              to="/create-post"
              className={`p-2 rounded-md transition-colors duration-200 ${
                isActive('/create-post') ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-200'
              }`}
            >
              <img src="/icons8-plus-64.png" alt="Create Post" className='w-6 h-6'/>
            </Link>

            <Link
              to="/notifications"
              className={`p-2 rounded-md transition-colors duration-200 ${
                isActive('/notifications') ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-200'
              }`}
            >
              <img src="/icons8-notification-48.png" alt="Notifications" className='w-6 h-6'/>
            </Link>

            <Link
              to="/profile"
              className={`p-2 rounded-md transition-colors duration-200 ${
                isActive('/profile') ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-200'
              }`}
            >
              <img src="/icons8-profile-64.png" alt="Profile" className='w-6 h-6'/>
            </Link>
          </div>

          {/* Bottom Section - Logout */}
          <div className="flex flex-col items-center space-y-4">
            {user ? (
              <button
                onClick={handleLogout}
                className="p-2 rounded-md text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
                title="Logout"
              >
                <img src="/icons8-logout-64.png" alt="Logout" className='w-6 h-6'/>
              </button>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  to="/login"
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    isActive('/login') ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-200'
                  }`}
                >
                  <img src="/icons8-login-64.png" alt="Login" className='w-6 h-6'/>
                </Link>
                <Link
                  to="/register"
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    isActive('/register') ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-200'
                  }`}
                >
                  <img src="/icons8-register-64.png" alt="Register" className='w-6 h-6'/>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;